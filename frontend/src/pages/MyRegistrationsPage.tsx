import { useState, useEffect } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { registrationsApi } from '@/api'
import { useAuthContext } from '@/context/AuthContext'
import type { Registration } from '@/types'
import { RegistrationStatus } from '@/types'

function formatDate(iso: string): string {
  return new Date(iso).toLocaleDateString(undefined, {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  })
}

function statusBadgeClass(status: RegistrationStatus): string {
  switch (status) {
    case RegistrationStatus.CONFIRMED: return 'badge badge-success'
    case RegistrationStatus.CANCELLED: return 'badge badge-danger'
    default: return 'badge'
  }
}

export default function MyRegistrationsPage() {
  const { user } = useAuthContext()
  const navigate = useNavigate()

  const [registrations, setRegistrations] = useState<Registration[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [cancellingId, setCancellingId] = useState<number | null>(null)

  useEffect(() => {
    if (!user) return
    let cancelled = false
    async function load() {
      try {
        const data = await registrationsApi.getUserRegistrations(user!.id)
        if (!cancelled) setRegistrations(data)
      } catch {
        if (!cancelled) setError('Failed to load registrations.')
      } finally {
        if (!cancelled) setLoading(false)
      }
    }
    load()
    return () => { cancelled = true }
  }, [user])

  async function handleCancel(regId: number) {
    if (!window.confirm('Are you sure you want to cancel this registration?')) return
    setCancellingId(regId)
    try {
      await registrationsApi.cancelRegistration(regId)
      setRegistrations((prev) =>
        prev.map((r) => (r.id === regId ? { ...r, status: RegistrationStatus.CANCELLED } : r)),
      )
    } catch {
      setError('Failed to cancel registration. Please try again.')
    } finally {
      setCancellingId(null)
    }
  }

  const activeRegistrations = registrations.filter((r) => r.status === RegistrationStatus.CONFIRMED)
  const cancelledRegistrations = registrations.filter((r) => r.status === RegistrationStatus.CANCELLED)

  if (loading) {
    return (
      <div className="app">
        <p className="loading-text">Loading registrations…</p>
      </div>
    )
  }

  if (error) {
    return (
      <div className="app">
        <div className="alert-error">{error}</div>
      </div>
    )
  }

  return (
    <div className="app">
      <div className="page-header">
        <h1>My Registrations</h1>
        <Link to="/events" className="btn btn-secondary">
          Browse Events
        </Link>
      </div>

      {registrations.length === 0 ? (
        <div className="empty-state-card">
          <p className="empty-state">You haven&apos;t registered for any events yet.</p>
          <Link to="/events" className="btn btn-primary" style={{ marginTop: '0.5rem' }}>
            Find Events
          </Link>
        </div>
      ) : (
        <>
          {activeRegistrations.length > 0 && (
            <section className="reg-section">
              <h2 className="reg-section-title">Upcoming ({activeRegistrations.length})</h2>
              <div className="reg-list">
                {activeRegistrations.map((reg) => (
                  <div key={reg.id} className="reg-card">
                    <div
                      className="reg-card-main"
                      onClick={() => navigate(`/events/${reg.eventId}`)}
                      role="button"
                      tabIndex={0}
                      onKeyDown={(e) => { if (e.key === 'Enter') navigate(`/events/${reg.eventId}`) }}
                    >
                      <div className="reg-card-info">
                        <h3>{reg.eventTitle}</h3>
                        <span className="reg-card-date">Registered {formatDate(reg.registeredAt)}</span>
                      </div>
                      <span className={statusBadgeClass(reg.status)}>
                        {reg.status.charAt(0) + reg.status.slice(1).toLowerCase()}
                      </span>
                    </div>
                    <div className="reg-card-actions">
                      <button
                        className="btn btn-secondary btn-sm"
                        onClick={() => void handleCancel(reg.id)}
                        disabled={cancellingId === reg.id}
                      >
                        {cancellingId === reg.id ? 'Cancelling…' : 'Cancel'}
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </section>
          )}

          {cancelledRegistrations.length > 0 && (
            <section className="reg-section">
              <h2 className="reg-section-title">Cancelled ({cancelledRegistrations.length})</h2>
              <div className="reg-list">
                {cancelledRegistrations.map((reg) => (
                  <div key={reg.id} className="reg-card reg-card-cancelled">
                    <div
                      className="reg-card-main"
                      onClick={() => navigate(`/events/${reg.eventId}`)}
                      role="button"
                      tabIndex={0}
                      onKeyDown={(e) => { if (e.key === 'Enter') navigate(`/events/${reg.eventId}`) }}
                    >
                      <div className="reg-card-info">
                        <h3>{reg.eventTitle}</h3>
                        <span className="reg-card-date">Registered {formatDate(reg.registeredAt)}</span>
                      </div>
                      <span className={statusBadgeClass(reg.status)}>
                        {reg.status.charAt(0) + reg.status.slice(1).toLowerCase()}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </section>
          )}
        </>
      )}
    </div>
  )
}
