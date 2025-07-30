"use client"

import { useEffect } from "react"
import { useRouter, useSearchParams } from "next/navigation"

export function OAuthHandler() {
  const router = useRouter()
  const searchParams = useSearchParams()
  
  useEffect(() => {
    const code = searchParams.get("code")
    const error = searchParams.get("error")
    const error_description = searchParams.get("error_description")
    
    if (code) {
      // Redirect to the callback route with the code
      const callbackUrl = `/api/auth/callback?code=${code}`
      const next = searchParams.get("next")
      if (next) {
        callbackUrl + `&next=${next}`
      }
      router.replace(callbackUrl)
    } else if (error) {
      // Handle OAuth errors
      console.error("OAuth error:", error, error_description)
      router.replace(`/login?error=${error}`)
    }
  }, [router, searchParams])
  
  return null
}
