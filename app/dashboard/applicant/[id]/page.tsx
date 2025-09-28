'use client'

import { useState, useEffect } from 'react'
import { useRouter, useParams } from 'next/navigation'
import Link from 'next/link'
import { 
  ArrowLeft, 
  User, 
  Mail, 
  Calendar, 
  FileText, 
  Download, 
  Image as ImageIcon,
  X,
  Plus,
  Check,
  Eye
} from 'lucide-react'
import { Applicant, Interaction } from '@/lib/airtable'

export default function ApplicantDetailPage() {
  const [applicant, setApplicant] = useState<Applicant | null>(null)
  const [interactions, setInteractions] = useState<Interaction[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [isAuthenticated, setIsAuthenticated] = useState(false)
  const [newNote, setNewNote] = useState('')
  const [isAddingNote, setIsAddingNote] = useState(false)
  const [selectedResume, setSelectedResume] = useState<string | null>(null)
  const [showExpandedNotes, setShowExpandedNotes] = useState(false)
  
  const router = useRouter()
  const params = useParams()

  useEffect(() => {
    checkAuth()
  }, [])

  useEffect(() => {
    if (isAuthenticated && params.id) {
      fetchApplicantData()
    }
  }, [isAuthenticated, params.id])

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

  const fetchApplicantData = async () => {
    try {
      const [applicantResponse, interactionsResponse] = await Promise.all([
        fetch(`/api/applicants/${params.id}`),
        fetch(`/api/interactions?applicantId=${params.id}`)
      ])

      if (applicantResponse.ok) {
        const applicantData = await applicantResponse.json()
        setApplicant(applicantData)
      }

      if (interactionsResponse.ok) {
        const interactionsData = await interactionsResponse.json()
        setInteractions(interactionsData)
      }
    } catch (error) {
      console.error('Error fetching applicant data:', error)
    } finally {
      setIsLoading(false)
    }
  }


  const handleAddNote = async () => {
    if (!newNote.trim()) return

    try {
      const response = await fetch('/api/interactions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          applicant_id: params.id,
          author_email: 'admin@rush.com',
          note: newNote,
        }),
      })

      if (response.ok) {
        const newInteraction = await response.json()
        setInteractions([newInteraction, ...interactions])
        setNewNote('')
        setIsAddingNote(false)
      }
    } catch (error) {
      console.error('Error adding note:', error)
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

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="w-8 h-8 border-4 border-primary-600 border-t-transparent rounded-full animate-spin" />
      </div>
    )
  }

  if (!applicant) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-900 mb-4">Applicant not found</h1>
          <Link href="/dashboard" className="btn-primary">
            Back to Dashboard
          </Link>
        </div>
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
            </div>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-8">
            {/* Basic Information */}
            <div className="card">
              <h2 className="text-xl font-semibold text-gray-900 mb-6">Basic Information</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Name</label>
                  <p className="text-gray-900">{applicant.applicant_name || 'Not provided'}</p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Email</label>
                  <p className="text-gray-900">{applicant.email || 'Not provided'}</p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Year</label>
                  <p className="text-gray-900">{applicant.year || 'Not provided'}</p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Major</label>
                  <p className="text-gray-900">{applicant.major || 'Not provided'}</p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Status</label>
                  <span className={`inline-flex px-2 py-1 rounded-full text-sm font-medium ${getStatusColor(applicant.status)}`}>
                    {applicant.status || 'Not set'}
                  </span>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Applied Date</label>
                  <p className="text-gray-900">{new Date(applicant.created_at).toLocaleDateString()}</p>
                </div>
              </div>
            </div>

            {/* AI Summary */}
            {applicant.notes_summary && (
              <div className="card">
                <h2 className="text-xl font-semibold text-gray-900 mb-6">AI Summary</h2>
                <div className="bg-blue-50 p-4 rounded-md">
                  <p className="text-gray-900 leading-relaxed">{applicant.notes_summary}</p>
                </div>
              </div>
            )}

            {/* Essays */}
            <div className="card">
              <h2 className="text-xl font-semibold text-gray-900 mb-6">Essays</h2>
              <div className="space-y-6">
                {applicant.essay_1 && (
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Essay 1</label>
                    <div className="bg-gray-50 p-4 rounded-md">
                      <p className="text-gray-900 whitespace-pre-wrap">{applicant.essay_1}</p>
                    </div>
                  </div>
                )}
                {applicant.essay_2 && (
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Essay 2</label>
                    <div className="bg-gray-50 p-4 rounded-md">
                      <p className="text-gray-900 whitespace-pre-wrap">{applicant.essay_2}</p>
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Rush Days */}
            <div className="card">
              <h2 className="text-xl font-semibold text-gray-900 mb-6">Rush Days</h2>
              <div className="grid grid-cols-1 sm:grid-cols-5 gap-4">
                {[1, 2, 3, 4, 5].map((day) => (
                  <div key={day} className="flex items-center space-x-3 p-3 border border-gray-200 rounded-lg">
                    <div className={`w-5 h-5 border-2 rounded flex items-center justify-center ${
                      applicant[`day_${day}` as keyof Applicant]
                        ? 'bg-primary-600 border-primary-600'
                        : 'border-gray-300'
                    }`}>
                      {applicant[`day_${day}` as keyof Applicant] && (
                        <Check className="w-3 h-3 text-white" />
                      )}
                    </div>
                    <span className="text-sm font-medium text-gray-900">
                      Day {day}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Sidebar */}
          <div className="space-y-8">
            {/* Photo */}
            {applicant.photo && (
              <div className="card">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Photo</h3>
                <img
                  src={applicant.photo}
                  alt={applicant.applicant_name}
                  className="w-full h-64 object-cover rounded-md"
                />
              </div>
            )}

            {/* Resume */}
            {applicant.resume && applicant.resume.length > 0 && (
              <div className="card">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Resume</h3>
                <div className="space-y-2">
                  {applicant.resume.map((file, index) => (
                    <div key={index} className="flex items-center space-x-2 p-3 bg-gray-50 rounded-md">
                      <FileText className="w-5 h-5 text-gray-600" />
                      <span className="text-sm text-gray-900 truncate flex-1">{file.filename}</span>
                      <div className="flex items-center space-x-2">
                        <button
                          onClick={() => setSelectedResume(file.url)}
                          className="flex items-center space-x-1 text-primary-600 hover:text-primary-700 text-sm"
                        >
                          <Eye className="w-4 h-4" />
                          <span>View</span>
                        </button>
                        <a
                          href={file.url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="flex items-center space-x-1 text-gray-600 hover:text-gray-700 text-sm"
                        >
                          <Download className="w-4 h-4" />
                          <span>Download</span>
                        </a>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Notes */}
            <div className="card">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold text-gray-900">Notes & Interactions</h3>
                <div className="flex items-center space-x-3">
                  {applicant.notes && (
                    <button
                      onClick={() => setShowExpandedNotes(!showExpandedNotes)}
                      className="flex items-center space-x-1 text-primary-600 hover:text-primary-700"
                    >
                      <Eye className="w-4 h-4" />
                      <span className="text-sm">{showExpandedNotes ? 'Hide' : 'See'} Full Notes</span>
                    </button>
                  )}
                  <button
                    onClick={() => setIsAddingNote(true)}
                    className="flex items-center space-x-1 text-primary-600 hover:text-primary-700"
                  >
                    <Plus className="w-4 h-4" />
                    <span className="text-sm">Add Note</span>
                  </button>
                </div>
              </div>


              {isAddingNote && (
                <div className="mb-4 p-4 bg-gray-50 rounded-md">
                  <textarea
                    value={newNote}
                    onChange={(e) => setNewNote(e.target.value)}
                    placeholder="Add a note about this applicant..."
                    className="w-full p-2 border border-gray-300 rounded-md resize-none"
                    rows={3}
                  />
                  <div className="flex justify-end space-x-2 mt-2">
                    <button
                      onClick={() => {
                        setIsAddingNote(false)
                        setNewNote('')
                      }}
                      className="btn-secondary text-sm"
                    >
                      Cancel
                    </button>
                    <button
                      onClick={handleAddNote}
                      className="btn-primary text-sm"
                    >
                      Add Note
                    </button>
                  </div>
                </div>
              )}

              <div className="space-y-4">
                {interactions.length > 0 && (
                  <div className="flex items-center justify-between">
                    <h4 className="text-sm font-medium text-gray-700">Individual Notes</h4>
                    <button
                      onClick={() => setShowExpandedNotes(!showExpandedNotes)}
                      className="text-sm text-primary-600 hover:text-primary-700 flex items-center space-x-1"
                    >
                      <span>{showExpandedNotes ? 'Hide' : 'Show'} Expanded Notes</span>
                      <span className="text-xs">({interactions.length} notes)</span>
                    </button>
                  </div>
                )}
                
                {showExpandedNotes ? (
                  <div className="space-y-3">
                    {interactions.map((interaction) => (
                      <div key={interaction.id} className="border-l-4 border-primary-200 pl-4 py-2">
                        <p className="text-gray-900 text-sm leading-relaxed">{interaction.note}</p>
                        <div className="flex items-center justify-between mt-2">
                          <p className="text-xs text-gray-500">
                            {new Date(interaction.created_at).toLocaleString()}
                          </p>
                          {interaction.author_email && (
                            <p className="text-xs text-gray-400">
                              by {interaction.author_email}
                            </p>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="space-y-2">
                    {interactions.slice(0, 2).map((interaction) => (
                      <div key={interaction.id} className="border-l-4 border-primary-200 pl-4">
                        <p className="text-gray-900 text-sm line-clamp-2">{interaction.note}</p>
                        <p className="text-xs text-gray-500 mt-1">
                          {new Date(interaction.created_at).toLocaleString()}
                        </p>
                      </div>
                    ))}
                    {interactions.length > 2 && (
                      <p className="text-xs text-gray-500 italic">
                        +{interactions.length - 2} more notes. Click "Show Expanded Notes" to see all.
                      </p>
                    )}
                  </div>
                )}
                
                {interactions.length === 0 && (
                  <p className="text-gray-500 text-sm">No notes yet</p>
                )}
                
                {/* Full Notes Display */}
                {showExpandedNotes && applicant.notes && (
                  <div className="mt-6 p-4 bg-gray-50 rounded-md">
                    <h4 className="text-sm font-medium text-gray-700 mb-2">Complete Notes</h4>
                    <p className="text-gray-900 whitespace-pre-wrap leading-relaxed">{applicant.notes}</p>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Resume Viewer Modal */}
        {selectedResume && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-lg max-w-4xl max-h-[90vh] w-full">
              <div className="flex items-center justify-between p-4 border-b">
                <h3 className="text-lg font-semibold text-gray-900">Resume Viewer</h3>
                <button
                  onClick={() => setSelectedResume(null)}
                  className="text-gray-400 hover:text-gray-600"
                >
                  <X className="w-6 h-6" />
                </button>
              </div>
              <div className="p-4">
                <iframe
                  src={selectedResume}
                  className="w-full h-[70vh] border-0"
                  title="Resume Preview"
                />
                <div className="flex justify-end space-x-2 mt-4">
                  <a
                    href={selectedResume}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="btn-primary"
                  >
                    <Download className="w-4 h-4 mr-2" />
                    Download
                  </a>
                  <button
                    onClick={() => setSelectedResume(null)}
                    className="btn-secondary"
                  >
                    Close
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
