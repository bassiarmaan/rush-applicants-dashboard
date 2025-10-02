'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { ArrowLeft, Trophy, TrendingUp, TrendingDown, LogOut } from 'lucide-react'
import { Applicant } from '@/lib/airtable'

export default function RankingsPage() {
  const [applicants, setApplicants] = useState<Applicant[]>([])
  const [filteredApplicants, setFilteredApplicants] = useState<Applicant[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [isAuthenticated, setIsAuthenticated] = useState(false)
  const [sortBy, setSortBy] = useState<'elo' | 'name'>('elo')
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc')
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
    filterAndSortApplicants()
  }, [applicants, sortBy, sortOrder])

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
    setIsLoading(true)
    try {
        // Add cache-busting parameter and filter for Applied status only
        const timestamp = new Date().getTime()
        const FIELD_NAME = 'status'
        const FIELD_VALUE = 'Applied'
        const filterFormula = encodeURIComponent(`${FIELD_NAME}="${FIELD_VALUE}"`)
        console.log("Leaderboard: Fetching only Applied applicants with filter formula: ", filterFormula)
        const response = await fetch(`/api/applicants?filterByFormula=${filterFormula}&t=${timestamp}`, {
        cache: 'no-store',
        headers: {
          'Cache-Control': 'no-cache',
          'Pragma': 'no-cache'
        }
      })
      
      if (response.ok) {
        const data = await response.json()
        console.log("data: ", data)
        console.log(`Rankings: Received ${data.length} applicants`)
        
        // Log ELO statistics
        const eloCount = data.filter((a: any) => a.elo !== undefined && a.elo !== null).length
        console.log(`Rankings: ELO ratings found: ${eloCount}/${data.length}`)
        
        setApplicants(data)
      } else {
        console.error('Rankings API response not ok:', response.status, response.statusText)
      }
    } catch (error) {
      console.error('Error fetching applicants for rankings:', error)
    } finally {
      setIsLoading(false)
    }
  }

  const filterAndSortApplicants = () => {
    let filtered = applicants.filter(applicant => applicant.elo !== undefined && applicant.elo !== null)
    
    filtered.sort((a, b) => {
      if (sortBy === 'elo') {
        return sortOrder === 'desc' 
          ? (b.elo || 0) - (a.elo || 0)
          : (a.elo || 0) - (b.elo || 0)
      } else {
        return sortOrder === 'desc'
          ? (b.applicant_name || '').localeCompare(a.applicant_name || '')
          : (a.applicant_name || '').localeCompare(b.applicant_name || '')
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

  const toggleSort = (field: 'elo' | 'name') => {
    if (sortBy === field) {
      setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc')
    } else {
      setSortBy(field)
      setSortOrder('desc')
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
            <div className="flex items-center space-x-4">
              <Link href="/dashboard" className="flex items-center text-gray-600 hover:text-gray-900">
                <ArrowLeft className="w-5 h-5 mr-2" />
                Back to Dashboard
              </Link>
              <div>
                <h1 className="text-2xl font-bold text-gray-900">ELO Pre Lim Rankings</h1>
                <p className="text-sm text-gray-600">Rankings by ELO rating</p>
              </div>
            </div>
            <button
              onClick={handleLogout}
              className="flex items-center space-x-2 text-gray-600 hover:text-gray-900"
            >
              <LogOut className="w-5 h-5" />
              <span>Logout</span>
            </button>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">

        {/* Rankings Table */}
        {isLoading ? (
          <div className="flex justify-center items-center py-12">
            <div className="w-8 h-8 border-4 border-primary-600 border-t-transparent rounded-full animate-spin" />
          </div>
        ) : filteredApplicants.length === 0 ? (
          <div className="text-center py-12">
            <Trophy className="w-12 h-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">No ELO ratings found</h3>
            <p className="text-gray-600">No applicants have ELO ratings yet</p>
          </div>
        ) : (
          <div className="bg-white shadow-sm rounded-lg overflow-hidden">
            <div className="px-6 py-4 border-b border-gray-200">
              <h2 className="text-lg font-semibold text-gray-900">ELO Pre Lim Rankings</h2>
            </div>
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Rank
                    </th>
                    <th 
                      className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100"
                      onClick={() => toggleSort('name')}
                    >
                      <div className="flex items-center space-x-1">
                        <span>Name</span>
                        {sortBy === 'name' && (
                          sortOrder === 'desc' ? <TrendingDown className="w-4 h-4" /> : <TrendingUp className="w-4 h-4" />
                        )}
                      </div>
                    </th>
                    <th 
                      className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100"
                      onClick={() => toggleSort('elo')}
                    >
                      <div className="flex items-center space-x-1">
                        <span>ELO Rating</span>
                        {sortBy === 'elo' && (
                          sortOrder === 'desc' ? <TrendingDown className="w-4 h-4" /> : <TrendingUp className="w-4 h-4" />
                        )}
                      </div>
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      People Voted
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Year
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Major
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Status
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {filteredApplicants.map((applicant, index) => (
                    <tr key={applicant.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                        #{index + 1}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <Link 
                          href={`/dashboard/applicant/${applicant.id}`}
                          className="text-sm font-medium text-primary-600 hover:text-primary-700"
                        >
                          {applicant.applicant_name || 'Unknown'}
                        </Link>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-bold text-gray-900">
                        {applicant.elo}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {applicant.weight || 0}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {applicant.year}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {applicant.major || 'N/A'}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`inline-flex px-2 py-1 rounded-full text-xs font-medium ${
                          applicant.status === 'Applied'
                            ? 'bg-green-100 text-green-800'
                            : applicant.status === 'Rejected'
                            ? 'bg-red-100 text-red-800'
                            : applicant.status === 'Not Applied'
                            ? 'bg-red-100 text-red-800'
                            : 'bg-red-100 text-red-800' // No status = red (Not Applied)
                        }`}>
                          {applicant.status || 'Not set'}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
