'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { Search, User, Mail, Calendar, FileText, LogOut, Plus, Filter, Check, Sparkles } from 'lucide-react'
import { Applicant } from '@/lib/airtable'

export default function DashboardPage() {
  const [applicants, setApplicants] = useState<Applicant[]>([])
  const [filteredApplicants, setFilteredApplicants] = useState<Applicant[]>([])
  const [searchTerm, setSearchTerm] = useState('')
  const [statusFilter, setStatusFilter] = useState<'all' | 'Ongoing' | 'Rejected'>('all')
  const [yearFilter, setYearFilter] = useState<'all' | '2024' | '2025' | '2026' | '2027' | '2028' | '2029'>('all')
  const [sortBy, setSortBy] = useState<'name' | 'year' | 'date'>('name')
  const [isLoading, setIsLoading] = useState(true)
  const [isAuthenticated, setIsAuthenticated] = useState(false)
  const [isGeneratingSummaries, setIsGeneratingSummaries] = useState(false)
  const router = useRouter()

  useEffect(() => {
    checkAuth()
  }, [])

  useEffect(() => {
    if (isAuthenticated) {
      fetchApplicants()
    }
  }, [isAuthenticated])

  useEffect(() => {
    filterApplicants()
  }, [searchTerm, statusFilter, yearFilter, sortBy, applicants])

  const checkAuth = async () => {
    try {
      const response = await fetch('/api/auth/verify')
      if (response.ok) {
        setIsAuthenticated(true)
      } else {
        router.push('/login')
      }
    } catch (error) {
      router.push('/login')
    }
  }

  const fetchApplicants = async () => {
    try {
      const response = await fetch('/api/applicants')
      if (response.ok) {
        const data = await response.json()
        setApplicants(data)
      }
    } catch (error) {
      console.error('Error fetching applicants:', error)
    } finally {
      setIsLoading(false)
    }
  }

  const filterApplicants = () => {
    let filtered = applicants

    // Filter by search term
    if (searchTerm) {
      filtered = filtered.filter(applicant =>
        applicant.applicant_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        applicant.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        applicant.major?.toLowerCase().includes(searchTerm.toLowerCase())
      )
    }

    // Filter by status
    if (statusFilter !== 'all') {
      filtered = filtered.filter(applicant => applicant.status === statusFilter)
    }

    // Filter by year
    if (yearFilter !== 'all') {
      filtered = filtered.filter(applicant => applicant.year?.toString() === yearFilter)
    }

    // Sort applicants
    filtered.sort((a, b) => {
      switch (sortBy) {
        case 'name':
          return (a.applicant_name || '').localeCompare(b.applicant_name || '')
        case 'year':
          return (b.year || 0) - (a.year || 0) // Newest first
        case 'date':
          return new Date(b.created_at).getTime() - new Date(a.created_at).getTime() // Newest first
        default:
          return 0
      }
    })

    setFilteredApplicants(filtered)
  }

  const handleLogout = async () => {
    try {
      await fetch('/api/auth/logout', { method: 'POST' })
      router.push('/login')
    } catch (error) {
      console.error('Logout error:', error)
    }
  }

  const generateSummaries = async () => {
    setIsGeneratingSummaries(true)
    try {
      const response = await fetch('/api/applicants/generate-summaries', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
      })

      if (response.ok) {
        const data = await response.json()
        alert(`Successfully generated ${data.successful} summaries out of ${data.total} applicants.`)
        // Refresh the applicants data
        fetchApplicants()
      } else {
        alert('Error generating summaries. Please try again.')
      }
    } catch (error) {
      console.error('Error generating summaries:', error)
      alert('Error generating summaries. Please try again.')
    } finally {
      setIsGeneratingSummaries(false)
    }
  }

  const getStatusColor = (status?: string) => {
    switch (status) {
      case 'Rejected':
        return 'bg-red-100 text-red-800'
      case 'Ongoing':
        return 'bg-yellow-100 text-yellow-800'
      default:
        return 'bg-gray-100 text-gray-800'
    }
  }

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="w-8 h-8 border-4 border-primary-600 border-t-transparent rounded-full animate-spin" />
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Rush Applicants Dashboard</h1>
              <p className="text-sm text-gray-600">Manage and review rush applicants</p>
            </div>
            <div className="flex items-center space-x-4">
              <button
                onClick={generateSummaries}
                disabled={isGeneratingSummaries}
                className="flex items-center space-x-2 btn-primary disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <Sparkles className="w-4 h-4" />
                <span>{isGeneratingSummaries ? 'Generating...' : 'Generate AI Summaries'}</span>
              </button>
              <button
                onClick={handleLogout}
                className="flex items-center space-x-2 text-gray-600 hover:text-gray-900"
              >
                <LogOut className="w-5 h-5" />
                <span>Logout</span>
              </button>
            </div>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Search and Filters */}
        <div className="mb-8">
          <div className="flex flex-col lg:flex-row gap-4 items-start lg:items-center justify-between">
            <div className="flex flex-col xl:flex-row gap-4 flex-1">
              <div className="flex-1 max-w-md">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                  <input
                    type="text"
                    placeholder="Search applicants by name, email, or major..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="input-field pl-10"
                  />
                </div>
              </div>
              <div className="flex flex-col sm:flex-row gap-3">
                <div className="flex items-center space-x-2">
                  <Filter className="w-5 h-5 text-gray-400" />
                  <select
                    value={statusFilter}
                    onChange={(e) => setStatusFilter(e.target.value as 'all' | 'Ongoing' | 'Rejected')}
                    className="input-field min-w-[120px]"
                  >
                    <option value="all">All Status</option>
                    <option value="Ongoing">Active</option>
                    <option value="Rejected">Rejected</option>
                  </select>
                </div>
                <div className="flex items-center space-x-2">
                  <select
                    value={yearFilter}
                    onChange={(e) => setYearFilter(e.target.value as 'all' | '2024' | '2025' | '2026' | '2027' | '2028' | '2029')}
                    className="input-field min-w-[100px]"
                  >
                    <option value="all">All Years</option>
                    <option value="2024">2024</option>
                    <option value="2025">2025</option>
                    <option value="2026">2026</option>
                    <option value="2027">2027</option>
                    <option value="2028">2028</option>
                    <option value="2029">2029</option>
                  </select>
                </div>
                <div className="flex items-center space-x-2">
                  <select
                    value={sortBy}
                    onChange={(e) => setSortBy(e.target.value as 'name' | 'year' | 'date')}
                    className="input-field min-w-[120px]"
                  >
                    <option value="name">Sort by Name</option>
                    <option value="year">Sort by Year</option>
                    <option value="date">Sort by Date</option>
                  </select>
                </div>
              </div>
            </div>
            <div className="flex items-center space-x-4 text-sm text-gray-600">
              <span>Total: {applicants.length}</span>
              <span>Filtered: {filteredApplicants.length}</span>
            </div>
          </div>
        </div>

        {/* Applicants Grid */}
        {isLoading ? (
          <div className="flex justify-center items-center py-12">
            <div className="w-8 h-8 border-4 border-primary-600 border-t-transparent rounded-full animate-spin" />
          </div>
        ) : filteredApplicants.length === 0 ? (
          <div className="text-center py-12">
            <User className="w-12 h-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">No applicants found</h3>
            <p className="text-gray-600">
              {searchTerm ? 'Try adjusting your search terms' : 'No applicants have been added yet'}
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredApplicants.map((applicant) => (
              <Link
                key={applicant.id}
                href={`/dashboard/applicant/${applicant.id}`}
                className="card hover:shadow-lg transition-shadow duration-200"
              >
                <div className="flex items-start justify-between mb-4">
                  <div className="flex items-center space-x-3">
                    {applicant.photo ? (
                      <img
                        src={applicant.photo}
                        alt={applicant.applicant_name}
                        className="w-12 h-12 rounded-full object-cover"
                      />
                    ) : (
                      <div className="w-12 h-12 bg-primary-100 rounded-full flex items-center justify-center">
                        <User className="w-6 h-6 text-primary-600" />
                      </div>
                    )}
                    <div>
                      <h3 className="font-semibold text-gray-900">
                        {applicant.applicant_name || 'Unknown'}
                      </h3>
                      <p className="text-sm text-gray-600">Class of {applicant.year}</p>
                    </div>
                  </div>
                  {applicant.status && (
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(applicant.status)}`}>
                      {applicant.status}
                    </span>
                  )}
                </div>

                <div className="space-y-2">
                  {applicant.email && (
                    <div className="flex items-center text-sm text-gray-600">
                      <Mail className="w-4 h-4 mr-2" />
                      <span className="truncate">{applicant.email}</span>
                    </div>
                  )}
                  {applicant.major && (
                    <div className="flex items-center text-sm text-gray-600">
                      <FileText className="w-4 h-4 mr-2" />
                      <span>{applicant.major}</span>
                    </div>
                  )}
                  <div className="flex items-center text-sm text-gray-600">
                    <Calendar className="w-4 h-4 mr-2" />
                    <span>Applied {new Date(applicant.created_at).toLocaleDateString()}</span>
                  </div>
                </div>

                {/* AI Summary */}
                {applicant.notes_summary && (
                  <div className="mt-4 pt-4 border-t border-gray-200">
                    <div className="flex items-start space-x-2">
                      <Sparkles className="w-4 h-4 text-primary-600 mt-0.5 flex-shrink-0" />
                      <div>
                        <p className="text-xs font-medium text-gray-700 mb-1">AI Summary</p>
                        <p className="text-sm text-gray-600 line-clamp-3">{applicant.notes_summary}</p>
                      </div>
                    </div>
                  </div>
                )}

              </Link>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
