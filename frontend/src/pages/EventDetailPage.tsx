import { useState, useEffect, useCallback } from 'react'
import { useParams, useNavigate, Link } from 'react-router-dom'
import { eventsApi, registrationsApi } from '@/api'
import { useAuthContext } from '@/context/AuthContext'
import type { Event, Registration } from '@/types'
import { EventStatus } from '@/types'

function formatDate(iso: string): string {
  return new Date(iso).toLocaleDateString(undefined, {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  })
}

export default function EventDetailPage() {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const { user } = useAuthContext()

  const [event, setEvent] = useState<Event | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [deleting, setDeleting] = useState(false)

  // Registration state
  const [myRegistration, setMyRegistration] = useState<Registration | null>(null)
  const [regLoading, setRegLoading] = useState(false)
  const [regError, setRegError] = useState<string | null>(null)
  const [regSuccess, setRegSuccess] = useState<string | null>(null)

  useEffect(() => {
    if (!id) return
    let cancelled = false
    async function load() {
      try {
        const data = await eventsApi.getEventById(Number(id))
        if (!cancelled) setEvent(data)
      } catch {
        if (!cancelled) setError('Failed to load event.')
      } finally {
        if (!cancelled) setLoading(false)
      }
    }
    load()
    return () => { cancelled = true }
  }, [id])

  // Check if user is already registered for this event
  const checkRegistration = useCallback(async () => {
    if (!user || !id) return
    try {
      const regs = await registrationsApi.getUserRegistrations(user.id)
      const match = regs.find((r) => r.eventId === Number(id) && r.status === 'CONFIRMED')
      setMyRegistration(match ?? null)
    } catch {
      // Silently fail — registration state is non-critical on load
    }
  }, [user, id])

  useEffect(() => {
    void checkRegistration()
  }, [checkRegistration])

  const canEdit = user && event && (user.role === 'ADMIN' || user.id === event.organizerId)

  const isEventClosed = event
    ? event.status === EventStatus.CANCELLED || event.status === EventStatus.COMPLETED
    : false

  const canRegister = user && event && !isEventClosed && !myRegistration && !canEdit

  async function handleRegister() {
    if (!event || !user) return
    setRegError(null)
    setRegSuccess(null)
    setRegLoading(true)
    try {
      const reg = await registrationsApi.registerForEvent(user.id, event.id)
      setMyRegistration(reg)
      setRegSuccess('Successfully registered!')
      setTimeout(() => setRegSuccess(null), 4000)
    } catch (err: unknown) {
      const message =
        (err as { response?: { data?: { message?: string } } }).response?.data?.message ??
        'Failed to register. Please try again.'
      setRegError(message)
    } finally {
      setRegLoading(false)
    }
  }

  async function handleCancelRegistration() {
    if (!myRegistration) return
    if (!window.confirm('Are you sure you want to cancel your registration?')) return
    setRegError(null)
    setRegSuccess(null)
    setRegLoading(true)
    try {
      await registrationsApi.cancelRegistration(myRegistration.id)
      setMyRegistration(null)
      setRegSuccess('Registration cancelled.')
      setTimeout(() => setRegSuccess(null), 4000)
    } catch (err: unknown) {
      const message =
        (err as { response?: { data?: { message?: string } } }).response?.data?.message ??
        'Failed to cancel registration. Please try again.'
      setRegError(message)
    } finally {
      setRegLoading(false)
    }
  }

  async function handleDelete() {
    if (!event || !window.confirm('Are you sure you want to delete this event?')) return
    setDeleting(true)
    try {
      await eventsApi.deleteEvent(event.id)
      navigate('/events')
    } catch {
      setError('Failed to delete event.')
      setDeleting(false)
    }
  }

  if (loading) {
    return (
      <div className="app">
        <p className="loading-text">Loading event…</p>
      </div>
    )
  }

  if (error || !event) {
    return (
      <div className="app">
        <div className="auth-error">{error ?? 'Event not found.'}</div>
        <Link to="/events" className="btn btn-secondary" style={{ marginTop: '1rem' }}>
          ← Back to events
        </Link>
      </div>
    )
  }

  return (
    <div className="app">
      <Link to="/events" className="back-link">← Back to events</Link>

      <div className="event-detail">
        <div className="event-detail-header">
          <div>
            <h1>{event.title}</h1>
            <div className="event-detail-badges">
              <span className={`badge badge-${event.status.toLowerCase()}`}>
                {event.status.charAt(0) + event.status.slice(1).toLowerCase()}
              </span>
              {myRegistration && (
                <span className="badge badge-success">Registered ✓</span>
              )}
            </div>
          </div>

          {canEdit && (
            <div className="event-detail-actions">
              <Link to={`/events/${event.id}/edit`} className="btn btn-secondary">
                Edit
              </Link>
              <button
                className="btn btn-danger"
                onClick={handleDelete}
                disabled={deleting}
              >
                {deleting ? 'Deleting…' : 'Delete'}
              </button>
            </div>
          )}
        </div>

        {event.description && (
          <p className="event-detail-desc">{event.description}</p>
        )}

        <div className="event-detail-meta">
          {event.location && (
            <div className="meta-item">
              <span className="meta-label">Location</span>
              <span>{event.location}</span>
            </div>
          )}
          <div className="meta-item">
            <span className="meta-label">Start</span>
            <span>{formatDate(event.startDate)}</span>
          </div>
          <div className="meta-item">
            <span className="meta-label">End</span>
            <span>{formatDate(event.endDate)}</span>
          </div>
          {event.maxAttendees && (
            <div className="meta-item">
              <span className="meta-label">Max attendees</span>
              <span>{event.maxAttendees}</span>
            </div>
          )}
          <div className="meta-item">
            <span className="meta-label">Organizer</span>
            <span>{event.organizerName}</span>
          </div>
        </div>

        {/* Registration section */}
        {!canEdit && user && (
          <div className="registration-section">
            {regError && <div className="auth-error">{regError}</div>}
            {regSuccess && <div className="reg-success">{regSuccess}</div>}

            {isEventClosed && !myRegistration && (
              <p className="reg-disabled-text">
                Registration is not available for {event.status.toLowerCase()} events.
              </p>
            )}

            {canRegister && (
              <button
                className="btn btn-primary btn-register"
                onClick={handleRegister}
                disabled={regLoading}
              >
                {regLoading ? 'Registering…' : 'Register for this event'}
              </button>
            )}

            {myRegistration && (
              <div className="reg-cancel-row">
                <button
                  className="btn btn-secondary"
                  onClick={handleCancelRegistration}
                  disabled={regLoading}
                >
                  {regLoading ? 'Cancelling…' : 'Cancel registration'}
                </button>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  )
}
