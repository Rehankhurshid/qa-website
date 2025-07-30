"use client"

import { useEffect, useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { AlertCircle, CheckCircle, Globe, ExternalLink } from "lucide-react"
import { formatDistanceToNow } from "date-fns"
import { createClient } from "@/lib/supabase-client"

interface Scan {
  id: string
  project_id: string
  page_url: string
  started_at: string
  completed_at: string | null
  triggered_by: string
  user_email: string | null
}

interface ScanResult {
  id: string
  scan_id: string
  issue_type: string
  severity: string | null
  element_selector: string | null
  issue_description: string | null
  suggested_fix: string | null
  metadata: any
}

interface ScanWithResults extends Scan {
  results: ScanResult[]
}

interface ScanResultsProps {
  projectId: string
}

export function ScanResults({ projectId }: ScanResultsProps) {
  const [scans, setScans] = useState<ScanWithResults[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function fetchScanResults() {
      try {
        const supabase = createClient()
        
        // First, fetch all scans for this project
        const { data: scansData, error: scansError } = await supabase
          .from("scans")
          .select("*")
          .eq("project_id", projectId)
          .order("started_at", { ascending: false })
          .limit(10)

        if (scansError) throw scansError

        if (!scansData || scansData.length === 0) {
          setScans([])
          setLoading(false)
          return
        }

        // Then fetch all scan results for these scans
        const scanIds = scansData.map(scan => scan.id)
        const { data: resultsData, error: resultsError } = await supabase
          .from("scan_results")
          .select("*")
          .in("scan_id", scanIds)

        if (resultsError) throw resultsError

        // Combine scans with their results
        const scansWithResults = scansData.map(scan => ({
          ...scan,
          results: resultsData?.filter(result => result.scan_id === scan.id) || []
        }))

        setScans(scansWithResults)
      } catch (error) {
        console.error("Error fetching scan results:", error)
      } finally {
        setLoading(false)
      }
    }

    fetchScanResults()
  }, [projectId])

  if (loading) {
    return <div className="text-center py-8">Loading scan results...</div>
  }

  if (scans.length === 0) {
    return (
      <Card>
        <CardContent className="text-center py-8">
          <p className="text-muted-foreground">No scan results yet. Embed the widget on your website to start scanning.</p>
        </CardContent>
      </Card>
    )
  }

  const getSeverityColor = (severity: string | null) => {
    switch (severity?.toLowerCase()) {
      case 'critical':
      case 'error':
        return 'text-red-600'
      case 'warning':
        return 'text-orange-600'
      case 'info':
        return 'text-blue-600'
      default:
        return 'text-gray-600'
    }
  }

  const getIssueTypeLabel = (issueType: string) => {
    switch (issueType) {
      case 'missing_alt_text':
        return 'Missing Alt Text'
      case 'spelling_error':
        return 'Spelling Error'
      case 'html_validation':
        return 'HTML Validation'
      case 'broken_link':
        return 'Broken Link'
      default:
        return issueType.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase())
    }
  }

  return (
    <div className="space-y-4">
      {scans.map((scan) => {
        const issueCount = scan.results.length
        const criticalCount = scan.results.filter(r => r.severity?.toLowerCase() === 'critical' || r.severity?.toLowerCase() === 'error').length
        const warningCount = scan.results.filter(r => r.severity?.toLowerCase() === 'warning').length
        
        return (
          <Card key={scan.id}>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle className="text-lg flex items-center gap-2">
                    <Globe className="h-4 w-4" />
                    <a href={scan.page_url} target="_blank" rel="noopener noreferrer" className="hover:underline flex items-center gap-1">
                      {scan.page_url}
                      <ExternalLink className="h-3 w-3" />
                    </a>
                  </CardTitle>
                  <CardDescription>
                    Scanned {formatDistanceToNow(new Date(scan.started_at), { addSuffix: true })}
                    {scan.user_email && ` by ${scan.user_email}`}
                  </CardDescription>
                </div>
                <div className="flex gap-2">
                  {issueCount === 0 ? (
                    <Badge variant="outline" className="text-green-600">
                      <CheckCircle className="h-3 w-3 mr-1" />
                      No Issues
                    </Badge>
                  ) : (
                    <>
                      <Badge variant="outline" className="text-orange-600">
                        <AlertCircle className="h-3 w-3 mr-1" />
                        {issueCount} Issue{issueCount !== 1 ? 's' : ''}
                      </Badge>
                      {criticalCount > 0 && (
                        <Badge variant="destructive">
                          {criticalCount} Critical
                        </Badge>
                      )}
                      {warningCount > 0 && (
                        <Badge variant="secondary">
                          {warningCount} Warning{warningCount !== 1 ? 's' : ''}
                        </Badge>
                      )}
                    </>
                  )}
                </div>
              </div>
            </CardHeader>
            {scan.results.length > 0 && (
              <CardContent>
                <div className="space-y-3">
                  {scan.results.map((result) => (
                    <div key={result.id} className="border rounded-lg p-3">
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-1">
                            <span className="font-medium text-sm">
                              {getIssueTypeLabel(result.issue_type)}
                            </span>
                            {result.severity && (
                              <span className={`text-xs font-medium ${getSeverityColor(result.severity)}`}>
                                {result.severity.toUpperCase()}
                              </span>
                            )}
                          </div>
                          {result.issue_description && (
                            <p className="text-sm text-muted-foreground mb-1">
                              {result.issue_description}
                            </p>
                          )}
                          {result.element_selector && (
                            <code className="text-xs bg-gray-100 dark:bg-gray-800 px-1 py-0.5 rounded">
                              {result.element_selector}
                            </code>
                          )}
                          {result.suggested_fix && (
                            <p className="text-sm text-green-600 dark:text-green-400 mt-1">
                              Fix: {result.suggested_fix}
                            </p>
                          )}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            )}
          </Card>
        )
      })}
    </div>
  )
}
