export interface AIGrantAnalysis {
  has_direct_apply: boolean
  apply_url: string | null 
  apply_instructions: string | null 
  confidence: number 
  category: string | null 
  summary: string | null
}

export interface GrantAIProvider {
  analyze(input: {
    title: string
    description: string
    pageText: string
  }): Promise<AIGrantAnalysis | null>
}
