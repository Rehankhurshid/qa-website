import { NextRequest, NextResponse } from 'next/server'
import { createServerSupabaseClient } from '@/lib/supabase-server'
import puppeteer from 'puppeteer'
import { checkAccessibility, checkHTML, checkSpelling } from '@/lib/validation-utils'

// Add CORS headers to response
function corsHeaders(response: NextResponse) {
  response.headers.set('Access-Control-Allow-Origin', '*')
  response.headers.set('Access-Control-Allow-Methods', 'POST, OPTIONS')
  response.headers.set('Access-Control-Allow-Headers', 'Content-Type, Authorization')
  return response
}

export async function OPTIONS() {
  return corsHeaders(new NextResponse(null, { status: 200 }))
}

export async function POST(request: NextRequest) {
  let browser;
  
  try {
    const { token, url } = await request.json()

    if (!token || !url) {
      return corsHeaders(
        NextResponse.json(
          { error: 'Token and URL are required' },
          { status: 400 }
        )
      )
    }

    // Create authenticated Supabase client
    const supabase = await createServerSupabaseClient()

    // Verify the token belongs to a valid project
    const { data: project, error: projectError } = await supabase
      .from('projects')
      .select('*, users!inner(*)')
      .eq('token', token)
      .single()

    if (projectError || !project) {
      return corsHeaders(
        NextResponse.json(
          { error: 'Invalid token' },
          { status: 401 }
        )
      )
    }

    // Validate URL domain against project domain
    try {
      const scanUrl = new URL(url)
      const projectDomain = new URL(`https://${project.domain}`)
      
      if (scanUrl.hostname !== projectDomain.hostname && 
          !scanUrl.hostname.endsWith(`.${projectDomain.hostname}`)) {
        return corsHeaders(
          NextResponse.json(
            { error: 'URL domain does not match project domain' },
            { status: 403 }
          )
        )
      }
    } catch (urlError) {
      return corsHeaders(
        NextResponse.json(
          { error: 'Invalid URL' },
          { status: 400 }
        )
      )
    }

    // Launch browser and navigate to URL
    browser = await puppeteer.launch({
      headless: true,
      args: ['--no-sandbox', '--disable-setuid-sandbox']
    })
    
    const page = await browser.newPage()
    await page.goto(url, { waitUntil: 'networkidle2', timeout: 30000 })
    
    // Get page content
    const content = await page.content()
    const text = await page.evaluate(() => document.body.innerText)

    // Run validations based on project settings
    const results = {
      url,
      timestamp: new Date().toISOString(),
      accessibility: project.settings.accessibility_enabled 
        ? await checkAccessibility(page) 
        : { issues: [], score: 100 },
      spelling: project.settings.spelling_enabled 
        ? await checkSpelling(text) 
        : { errors: [], score: 100 },
      html: project.settings.html_validation_enabled 
        ? await checkHTML(content) 
        : { errors: [], warnings: [], score: 100 }
    }

    // Calculate overall score
    const scores = [
      results.accessibility.score,
      results.spelling.score,
      results.html.score
    ].filter(score => score !== null)
    
    const overallScore = scores.length > 0
      ? Math.round(scores.reduce((a, b) => a + b, 0) / scores.length)
      : 100

    // Save scan result to database
    const { data: scanResult, error: scanError } = await supabase
      .from('scans')
      .insert({
        project_id: project.id,
        url,
        overall_score: overallScore,
        accessibility_score: results.accessibility.score,
        spelling_score: results.spelling.score,
        html_validation_score: results.html.score,
        accessibility_issues: results.accessibility.issues,
        spelling_errors: results.spelling.errors,
        html_errors: results.html.errors,
        html_warnings: results.html.warnings
      })
      .select()
      .single()

    if (scanError) {
      console.error('Error saving scan result:', scanError)
    }

    await browser.close()

    return corsHeaders(
      NextResponse.json({
        ...results,
        overallScore,
        scanId: scanResult?.id
      })
    )
  } catch (error) {
    console.error('Scan error:', error)
    if (browser) {
      await browser.close()
    }
    return corsHeaders(
      NextResponse.json(
        { error: 'Failed to scan URL' },
        { status: 500 }
      )
    )
  }
}
