'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { Search, User, Mail, Calendar, FileText, LogOut, Plus, Filter, Check, RefreshCw, Trophy } from 'lucide-react'
import { Applicant } from '@/lib/airtable'

export default function DashboardPage() {
  const [applicants, setApplicants] = useState<Applicant[]>([])
  const [filteredApplicants, setFilteredApplicants] = useState<Applicant[]>([])
  const [searchTerm, setSearchTerm] = useState('')
  const [statusFilter, setStatusFilter] = useState<'all' | 'Ongoing' | 'Rejected'>('all')
  const [yearFilter, setYearFilter] = useState<'all' | '2024' | '2025' | '2026' | '2027' | '2028' | '2029'>('all')
  const [sortBy, setSortBy] = useState<'name' | 'year' | 'date' | 'elo'>('name')
  const [isLoading, setIsLoading] = useState(true)
  const [isAuthenticated, setIsAuthenticated] = useState(false)
  const [isRefreshing, setIsRefreshing] = useState(false)
  const [lastRefresh, setLastRefresh] = useState<Date | null>(null)
  const router = useRouter()

  useEffect(() => {
    checkAuth()
  }, [])

  useEffect(() => {
    if (isAuthenticated) {
      fetchApplicants()
    }
  }, [isAuthenticated])

  // Auto-refresh every 10 seconds
  useEffect(() => {
    if (!isAuthenticated) return

    const interval = setInterval(() => {
      console.log('Auto-refresh triggered')
      fetchApplicants(true) // Silent refresh
    }, 10000) // 10 seconds

    return () => clearInterval(interval)
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

  const fetchApplicants = async (silent = false) => {
    if (!silent) {
      setIsLoading(true)
    } else {
      setIsRefreshing(true)
    }

    try {
      // Add cache-busting parameter
      const timestamp = new Date().getTime()
      const response = await fetch(`/api/applicants?t=${timestamp}`, {
        cache: 'no-store',
        headers: {
          'Cache-Control': 'no-cache',
          'Pragma': 'no-cache'
        }
      })
      
      if (response.ok) {
        const data = await response.json()
        console.log(`Frontend: Received ${data.length} applicants from API at ${new Date().toLocaleTimeString()}`)
        console.log('Frontend: Sample applicant names:', data.slice(0, 3).map((a: any) => a.applicant_name))
        
        // Log ELO and weight statistics
        const eloCount = data.filter((a: any) => a.elo !== undefined && a.elo !== null).length
        const weightCount = data.filter((a: any) => a.weight !== undefined && a.weight !== null).length
        console.log(`Frontend: ELO ratings found: ${eloCount}/${data.length}`)
        console.log(`Frontend: Weight values found: ${weightCount}/${data.length}`)
        
        // Log sample data structure
        if (data.length > 0) {
          const sample = data[0]
          console.log('Frontend: Sample applicant data structure:', {
            has_elo: !!sample.elo,
            has_weight: !!sample.weight,
            elo: sample.elo,
            weight: sample.weight,
            availableFields: Object.keys(sample)
          })
        }
        
        setApplicants(data)
        setLastRefresh(new Date())
      } else {
        console.error('API response not ok:', response.status, response.statusText)
        const errorData = await response.json().catch(() => ({}))
        console.error('API error details:', errorData)
      }
    } catch (error) {
      console.error('Error fetching applicants:', error)
    } finally {
      setIsLoading(false)
      setIsRefreshing(false)
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
        case 'elo':
          return (b.elo || 0) - (a.elo || 0) // Highest ELO first
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


  const getStatusColor = (status?: string) => {
    switch (status) {
      case 'Rejected':
        return 'bg-red-100 text-red-800'
      case 'Ongoing':
        return 'bg-yellow-100 text-yellow-800'
      case 'Applied':
        return 'bg-green-100 text-green-800'
      default:
        return 'bg-red-100 text-red-800' // Not Applied or no status = red
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
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center py-4 sm:py-0 sm:h-16 gap-4">
            <div className="flex-1 min-w-0">
              <h1 className="text-xl sm:text-2xl font-bold text-gray-900 truncate">Rush Applicants Dashboard</h1>
              <p className="text-sm text-gray-600 hidden sm:block">Manage and review rush applicants</p>
            </div>
            <div className="flex items-center space-x-2 sm:space-x-4 w-full sm:w-auto">
              <Link
                href="/dashboard/leaderboard"
                className="flex items-center space-x-3 sm:space-x-4 text-gray-600 hover:text-gray-900 text-sm sm:text-base"
              >
                <Trophy className="w-4 h-4 sm:w-5 sm:h-5" />
                <span>Pre Lim Rankings</span>
              </Link>
              <button
                onClick={() => fetchApplicants()}
                disabled={isRefreshing}
                className="flex items-center space-x-3 sm:space-x-4 text-gray-600 hover:text-gray-900 disabled:opacity-50 text-sm sm:text-base"
              >
                <RefreshCw className={`w-4 h-4 sm:w-5 sm:h-5 ${isRefreshing ? 'animate-spin' : ''}`} />
                <span>Refresh</span>
              </button>
              <button
                onClick={handleLogout}
                className="flex items-center space-x-3 sm:space-x-4 text-gray-600 hover:text-gray-900 text-sm sm:text-base"
              >
                <LogOut className="w-4 h-4 sm:w-5 sm:h-5" />
                <span>Sign Out</span>
              </button>
            </div>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Search and Filters */}
        <div className="mb-8">
          <div className="flex flex-col gap-4">
            {/* Search Bar */}
            <div className="w-full">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                <input
                  type="text"
                  placeholder="Search by name, email, or major..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="input-field pl-10 w-full"
                />
              </div>
            </div>
            
            {/* Filters Row */}
            <div className="flex flex-col sm:flex-row gap-3">
              <div className="flex items-center space-x-2">
                <Filter className="w-5 h-5 text-gray-400 flex-shrink-0" />
                <select
                  value={statusFilter}
                  onChange={(e) => setStatusFilter(e.target.value as 'all' | 'Ongoing' | 'Rejected')}
                  className="input-field flex-1 sm:min-w-[120px]"
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
                  className="input-field flex-1 sm:min-w-[100px]"
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
                  onChange={(e) => setSortBy(e.target.value as 'name' | 'year' | 'date' | 'elo')}
                  className="input-field flex-1 sm:min-w-[120px]"
                >
                  <option value="name">Sort by Name</option>
                  <option value="year">Sort by Year</option>
                  <option value="date">Sort by Date</option>
                  <option value="elo">Sort by ELO</option>
                </select>
              </div>
            </div>
            
            {/* Stats Row */}
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 text-sm text-gray-600">
              <div className="flex items-center space-x-4">
                <span>Total: {applicants.length}</span>
                <span>Filtered: {filteredApplicants.length}</span>
              </div>
              <div className="flex flex-col sm:flex-row sm:items-center space-y-1 sm:space-y-0 sm:space-x-4">
                {lastRefresh && (
                  <span className="text-xs text-gray-500">
                    Last updated: {lastRefresh.toLocaleTimeString()}
                  </span>
                )}
                {isRefreshing && (
                  <span className="text-xs text-primary-600 flex items-center">
                    <RefreshCw className="w-3 h-3 animate-spin mr-1" />
                    Checking for updates...
                  </span>
                )}
              </div>
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
                {/* Centered Image */}
                <div className="flex justify-center mb-6">
                  {applicant.photo ? (
                    <img
                      src={applicant.photo}
                      alt={applicant.applicant_name}
                      className="w-48 h-48 rounded-full object-cover"
                    />
                  ) : (
                    <div className="w-48 h-48 bg-primary-100 rounded-full flex items-center justify-center">
                      <User className="w-24 h-24 text-primary-600" />
                    </div>
                  )}
                </div>

                {/* All Information Below Image */}
                <div className="text-center space-y-3">
                  {/* Name and Status */}
                  <div className="space-y-1">
                    <h3 className="font-semibold text-gray-900 text-lg">
                      {applicant.applicant_name || 'Unknown'}
                    </h3>
                    <p className="text-sm text-gray-600">Class of {applicant.year}</p>
                    {applicant.status && (
                      <span className={`inline-block px-3 py-1 rounded-full text-xs font-medium ${getStatusColor(applicant.status)}`}>
                        {applicant.status}
                      </span>
                    )}
                  </div>

                  {/* Contact and Details */}
                  <div className="space-y-2 text-left">
                    {applicant.email && (
                      <div className="flex items-center text-sm text-gray-600">
                        <Mail className="w-4 h-4 mr-2 flex-shrink-0" />
                        <span className="truncate">{applicant.email}</span>
                      </div>
                    )}
                    {applicant.major && (
                      <div className="flex items-center text-sm text-gray-600">
                        <FileText className="w-4 h-4 mr-2 flex-shrink-0" />
                        <span>{applicant.major}</span>
                      </div>
                    )}
                    <div className="flex items-center text-sm text-gray-600">
                      <Calendar className="w-4 h-4 mr-2 flex-shrink-0" />
                      <span>Applied {new Date(applicant.created_at).toLocaleDateString()}</span>
                    </div>
                    {applicant.notes && (
                      <div className="mt-3 p-3 bg-gray-50 rounded-md">
                        <div className="flex items-start space-x-2">
                          <FileText className="w-4 h-4 text-gray-500 mt-0.5 flex-shrink-0" />
                          <div>
                            <p className="text-xs font-medium text-gray-700 mb-1">Notes</p>
                            <p className="text-sm text-gray-600 line-clamp-3">{applicant.notes}</p>
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                </div>

              </Link>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
