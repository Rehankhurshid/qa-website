declare module 'html-validator' {
  interface ValidationOptions {
    data?: string
    url?: string
    format?: 'json' | 'html' | 'xhtml' | 'xml' | 'gnu' | 'text'
    validator?: string
    ignore?: string | string[]
    isLocal?: boolean
    isFragment?: boolean
  }

  interface ValidationResult {
    messages: Array<{
      type: 'error' | 'warning' | 'info'
      message: string
      extract?: string
      hiliteStart?: number
      hiliteLength?: number
    }>
  }

  const validateHtml: (options: ValidationOptions) => Promise<ValidationResult>
  
  export default validateHtml
}
