const AIRTABLE_API_KEY = process.env.AIRTABLE_API_KEY
const AIRTABLE_BASE_ID = process.env.AIRTABLE_BASE_ID

export interface Applicant {
  id: string
  applicant_name: string
  applicant_id: string
  email: string
  year: number
  major: string
  essay_1?: string
  essay_2?: string
  resume?: Array<{
    id: string
    url: string
    filename: string
    size: number
    type: string
  }>
  photo?: string
  notes?: string
  notes_summary?: string
  status?: 'Rejected' | 'Ongoing'
  day_1?: boolean
  day_2?: boolean
  day_3?: boolean
  day_4?: boolean
  day_5?: boolean
  created_at: string
}

export interface Interaction {
  id: string
  applicant_id: string
  author_email: string
  note: string
  created_at: string
  Dashboard?: string
}

export class AirtableAPI {
  private baseUrl: string
  private headers: Record<string, string>

  constructor() {
    if (!AIRTABLE_API_KEY || !AIRTABLE_BASE_ID) {
      throw new Error('Airtable API key and base ID must be configured in environment variables')
    }
    this.baseUrl = `https://api.airtable.com/v0/${AIRTABLE_BASE_ID}`
    this.headers = {
      'Authorization': `Bearer ${AIRTABLE_API_KEY}`,
      'Content-Type': 'application/json'
    }
  }

  async getApplicants(): Promise<Applicant[]> {
    try {
      const response = await fetch(`${this.baseUrl}/Applicants`, {
        headers: this.headers
      })
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`)
      }
      
      const data = await response.json()
      return data.records.map((record: any) => ({
        id: record.id,
        ...record.fields
      }))
    } catch (error) {
      console.error('Error fetching applicants:', error)
      throw error
    }
  }

  async getApplicantById(id: string): Promise<Applicant | null> {
    try {
      const response = await fetch(`${this.baseUrl}/Applicants/${id}`, {
        headers: this.headers
      })
      
      if (!response.ok) {
        if (response.status === 404) return null
        throw new Error(`HTTP error! status: ${response.status}`)
      }
      
      const data = await response.json()
      return {
        id: data.id,
        ...data.fields
      }
    } catch (error) {
      console.error('Error fetching applicant:', error)
      throw error
    }
  }

  async getInteractions(applicantId?: string): Promise<Interaction[]> {
    try {
      let url = `${this.baseUrl}/Interactions`
      if (applicantId) {
        url += `?filterByFormula={applicant_id}='${applicantId}'`
      }
      
      const response = await fetch(url, {
        headers: this.headers
      })
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`)
      }
      
      const data = await response.json()
      return data.records.map((record: any) => ({
        id: record.id,
        ...record.fields
      }))
    } catch (error) {
      console.error('Error fetching interactions:', error)
      throw error
    }
  }

  async createInteraction(interaction: Omit<Interaction, 'id' | 'created_at'>): Promise<Interaction> {
    try {
      const response = await fetch(`${this.baseUrl}/Interactions`, {
        method: 'POST',
        headers: this.headers,
        body: JSON.stringify({
          records: [{
            fields: interaction
          }]
        })
      })
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`)
      }
      
      const data = await response.json()
      const record = data.records[0]
      return {
        id: record.id,
        ...record.fields
      }
    } catch (error) {
      console.error('Error creating interaction:', error)
      throw error
    }
  }

  async updateApplicant(id: string, fields: Partial<Applicant>): Promise<Applicant> {
    try {
      const response = await fetch(`${this.baseUrl}/Applicants`, {
        method: 'PATCH',
        headers: this.headers,
        body: JSON.stringify({
          records: [{
            id,
            fields
          }]
        })
      })
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`)
      }
      
      const data = await response.json()
      const record = data.records[0]
      return {
        id: record.id,
        ...record.fields
      }
    } catch (error) {
      console.error('Error updating applicant:', error)
      throw error
    }
  }
}
