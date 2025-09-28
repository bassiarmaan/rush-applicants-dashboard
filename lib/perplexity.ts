const PERPLEXITY_API_KEY = process.env.PERPLEXITY_API_KEY

export interface PerplexityResponse {
  choices: Array<{
    message: {
      content: string
    }
  }>
}

export class PerplexityAPI {
  private apiKey: string

  constructor() {
    this.apiKey = PERPLEXITY_API_KEY || ''
  }

  async generateSummary(notes: string[]): Promise<string> {
    if (!notes || notes.length === 0) {
      return "No notes available for this applicant."
    }

    if (!this.apiKey) {
      return "Perplexity API key not configured."
    }

    const combinedNotes = notes.join('\n\n')
    
    const prompt = `Please provide a concise three-sentence summary of the following notes about a fraternity rush applicant. Focus on key insights, personality traits, and important interactions. Keep it professional and informative:

${combinedNotes}

Summary:`

    try {
      const response = await fetch('https://api.perplexity.ai/chat/completions', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${this.apiKey}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          model: 'llama-3.1-sonar-small-128k-online',
          messages: [
            {
              role: 'user',
              content: prompt
            }
          ],
          max_tokens: 200,
          temperature: 0.3
        })
      })

      if (!response.ok) {
        throw new Error(`Perplexity API error: ${response.status}`)
      }

      const data: PerplexityResponse = await response.json()
      return data.choices[0]?.message?.content || "Unable to generate summary."
    } catch (error) {
      console.error('Error generating summary:', error)
      return "Error generating AI summary."
    }
  }
}
