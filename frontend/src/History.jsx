import { useState, useEffect } from "react"
import { supabase } from "./supabase"

export default function History({ user, onBack }) {
  const [sessions, setSessions] = useState([])
  const [loading, setLoading] = useState(true)
  const [expandedSession, setExpandedSession] = useState(null)
  const [sessionResults, setSessionResults] = useState({})
  const [loadingResults, setLoadingResults] = useState(null)

  useEffect(() => {
    fetchSessions()
  }, [])

  async function fetchSessions() {
    setLoading(true)
    const { data, error } = await supabase
      .from("sessions")
      .select("*")
      .eq("user_id", user.id)
      .order("created_at", { ascending: false })

    if (!error) setSessions(data || [])
    setLoading(false)
  }

  async function fetchResults(sessionId) {
    if (sessionResults[sessionId]) {
      setExpandedSession(expandedSession === sessionId ? null : sessionId)
      return
    }
    setLoadingResults(sessionId)
    const { data, error } = await supabase
      .from("resume_results")
      .select("*")
      .eq("session_id", sessionId)
      .order("rank", { ascending: true })

    if (!error) {
      setSessionResults(prev => ({ ...prev, [sessionId]: data || [] }))
    }
    setLoadingResults(null)
    setExpandedSession(sessionId)
  }

  function formatDate(iso) {
    const d = new Date(iso)
    return d.toLocaleDateString("en-IN", {
      day: "numeric", month: "short", year: "numeric",
      hour: "2-digit", minute: "2-digit"
    })
  }

  const getScoreColor = (score) => {
    if (score >= 80) return "text-green-400 bg-green-900"
    if (score >= 60) return "text-amber-400 bg-amber-900"
    return "text-red-400 bg-red-900"
  }

  const getRankBadge = (rank) => {
    if (rank === 1) return "bg-yellow-400 text-yellow-900"
    if (rank === 2) return "bg-gray-300 text-gray-800"
    if (rank === 3) return "bg-amber-600 text-white"
    return "bg-blue-100 text-blue-800"
  }

  return (
    <div className="max-w-5xl mx-auto px-8 py-10">
      {/* Header */}
      <button
        onClick={onBack}
        className="text-slate-400 hover:text-white text-sm mb-6 flex items-center gap-2 transition-colors"
      >
        ← Back to home
      </button>

      <div className="flex items-center gap-4 mb-8">
        <div>
          <h2 className="text-3xl font-bold text-white">My Screenings</h2>
          <p className="text-slate-400 mt-1">All your past resume screening sessions</p>
        </div>
        <span className="ml-auto bg-blue-900 text-blue-300 text-sm px-4 py-1.5 rounded-full font-medium">
          {sessions.length} session{sessions.length !== 1 ? "s" : ""}
        </span>
      </div>

      {loading ? (
        <div className="flex flex-col items-center justify-center py-24">
          <svg className="animate-spin h-10 w-10 text-blue-500 mb-4" viewBox="0 0 24 24" fill="none">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/>
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z"/>
          </svg>
          <p className="text-slate-400">Loading your history...</p>
        </div>
      ) : sessions.length === 0 ? (
        <div className="text-center py-24 bg-slate-800 border border-slate-700 rounded-2xl">
          <div className="text-5xl mb-4">📋</div>
          <h3 className="text-white font-bold text-xl mb-2">No screenings yet</h3>
          <p className="text-slate-400 text-sm">Run your first resume screening to see history here.</p>
        </div>
      ) : (
        <div className="space-y-4">
          {sessions.map((session) => (
            <div
              key={session.id}
              className="bg-slate-800 border border-slate-700 rounded-2xl overflow-hidden transition-all"
            >
              {/* Session card header */}
              <div className="px-6 py-5 flex items-center justify-between">
                <div className="flex items-center gap-5">
                  <div className="w-12 h-12 bg-blue-900 rounded-xl flex items-center justify-center flex-shrink-0">
                    <span className="text-blue-300 text-xl">📄</span>
                  </div>
                  <div>
                    <p className="text-white font-semibold text-sm">
                      {session.job_title
                        ? session.job_title.length > 60
                          ? session.job_title.substring(0, 60) + "..."
                          : session.job_title
                        : "General Screening (No JD)"}
                    </p>
                    <div className="flex items-center gap-4 mt-1">
                      <span className="text-slate-500 text-xs">
                        🕒 {formatDate(session.created_at)}
                      </span>
                      <span className="text-slate-500 text-xs">
                        👥 {session.total_resumes} resume{session.total_resumes !== 1 ? "s" : ""}
                      </span>
                    </div>
                  </div>
                </div>

                <button
                  onClick={() => fetchResults(session.id)}
                  className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-xl text-sm font-medium transition-colors flex items-center gap-2"
                >
                  {loadingResults === session.id ? (
                    <>
                      <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24" fill="none">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z"/>
                      </svg>
                      Loading...
                    </>
                  ) : expandedSession === session.id ? (
                    "▲ Hide Results"
                  ) : (
                    "▼ View Results"
                  )}
                </button>
              </div>

              {/* Expanded results table */}
              {expandedSession === session.id && sessionResults[session.id] && (
                <div className="border-t border-slate-700 px-6 pb-6 pt-4">
                  {sessionResults[session.id].length === 0 ? (
                    <p className="text-slate-400 text-sm text-center py-4">No results found for this session.</p>
                  ) : (
                    <div className="overflow-hidden rounded-xl border border-slate-700">
                      <table className="w-full text-sm">
                        <thead>
                          <tr className="bg-slate-900 border-b border-slate-700">
                            <th className="text-left text-slate-400 font-medium px-4 py-3 text-xs">Rank</th>
                            <th className="text-left text-slate-400 font-medium px-4 py-3 text-xs">Candidate</th>
                            <th className="text-left text-slate-400 font-medium px-4 py-3 text-xs">Score</th>
                            <th className="text-left text-slate-400 font-medium px-4 py-3 text-xs">Role</th>
                            <th className="text-left text-slate-400 font-medium px-4 py-3 text-xs">Summary</th>
                          </tr>
                        </thead>
                        <tbody>
                          {sessionResults[session.id].map((r, i) => (
                            <tr
                              key={i}
                              className="border-b border-slate-700 last:border-0 hover:bg-slate-700 transition-colors"
                            >
                              <td className="px-4 py-3">
                                <span className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold ${getRankBadge(r.rank)}`}>
                                  {r.rank}
                                </span>
                              </td>
                              <td className="px-4 py-3">
                                <p className="text-white font-medium">{r.filename?.replace(".pdf", "")}</p>
                              </td>
                              <td className="px-4 py-3">
                                <span className={`px-2 py-0.5 rounded-full text-xs font-bold ${getScoreColor(r.score)}`}>
                                  {r.score}/100
                                </span>
                              </td>
                              <td className="px-4 py-3">
                                <span className="text-blue-400 text-xs">{r.detected_role || "—"}</span>
                              </td>
                              <td className="px-4 py-3">
                                <p className="text-slate-400 text-xs max-w-xs truncate">{r.summary}</p>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  )}
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
