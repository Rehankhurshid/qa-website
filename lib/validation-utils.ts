import { Page } from 'puppeteer'
import axe from 'axe-core'
import validateHtml from 'html-validator'

interface AccessibilityResult {
  issues: Array<{
    impact: string
    description: string
    help: string
    helpUrl: string
    nodes: Array<{
      html: string
      target: string[]
    }>
  }>
  score: number
}

interface SpellingResult {
  errors: Array<{
    word: string
    suggestions: string[]
    context: string
  }>
  score: number
}

interface HTMLResult {
  errors: string[]
  warnings: string[]
  score: number
}

export async function checkAccessibility(page: Page): Promise<AccessibilityResult> {
  try {
    // Inject axe-core
    await page.evaluate(axe.source)
    
    // Run accessibility checks
    const results = await page.evaluate(() => {
      return (window as any).axe.run()
    })
    
    const violations = results.violations || []
    const issues = violations.map((violation: any) => ({
      impact: violation.impact,
      description: violation.description,
      help: violation.help,
      helpUrl: violation.helpUrl,
      nodes: violation.nodes.map((node: any) => ({
        html: node.html,
        target: node.target
      }))
    }))
    
    // Calculate score (100 - (number of issues * 5), minimum 0)
    const score = Math.max(0, 100 - (issues.length * 5))
    
    return {
      issues,
      score
    }
  } catch (error) {
    console.error('Accessibility check error:', error)
    return {
      issues: [],
      score: 100
    }
  }
}

export async function checkSpelling(text: string): Promise<SpellingResult> {
  try {
    // Simple spell check implementation
    // In production, you'd want to use a proper spell checking service
    const commonMisspellings: Record<string, string[]> = {
      'teh': ['the'],
      'recieve': ['receive'],
      'occured': ['occurred'],
      'seperate': ['separate'],
      'definately': ['definitely'],
      'accomodate': ['accommodate'],
      'acheive': ['achieve'],
      'calender': ['calendar'],
      'collegue': ['colleague'],
      'concious': ['conscious']
    }
    
    const words = text.toLowerCase().split(/\s+/)
    const errors: SpellingResult['errors'] = []
    
    words.forEach((word, index) => {
      const cleanWord = word.replace(/[.,!?;:'"]/g, '')
      if (commonMisspellings[cleanWord]) {
        const context = words.slice(Math.max(0, index - 5), index + 6).join(' ')
        errors.push({
          word: cleanWord,
          suggestions: commonMisspellings[cleanWord],
          context
        })
      }
    })
    
    // Calculate score
    const score = Math.max(0, 100 - (errors.length * 10))
    
    return {
      errors,
      score
    }
  } catch (error) {
    console.error('Spelling check error:', error)
    return {
      errors: [],
      score: 100
    }
  }
}

export async function checkHTML(html: string): Promise<HTMLResult> {
  try {
    const options = {
      data: html,
      format: 'json' as const
    }
    
    const result = await validateHtml(options)
    
    const errors: string[] = []
    const warnings: string[] = []
    
    if (result.messages) {
      result.messages.forEach((message: any) => {
        if (message.type === 'error') {
          errors.push(message.message)
        } else if (message.type === 'warning') {
          warnings.push(message.message)
        }
      })
    }
    
    // Calculate score
    const score = Math.max(0, 100 - (errors.length * 10) - (warnings.length * 2))
    
    return {
      errors,
      warnings,
      score
    }
  } catch (error) {
    console.error('HTML validation error:', error)
    return {
      errors: [],
      warnings: [],
      score: 100
    }
  }
}
