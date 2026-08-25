import { useState, useEffect } from 'react'
import { useParams, useNavigate, Link } from 'react-router-dom'
import { eventsApi } from '@/api'
import { useAuthContext } from '@/context/AuthContext'
import type { Event } from '@/types'

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

  const canEdit = user && event && (user.role === 'ADMIN' || user.id === event.organizerId)

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
            <span className={`badge badge-${event.status.toLowerCase()}`}>
              {event.status.charAt(0) + event.status.slice(1).toLowerCase()}
            </span>
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
      </div>
    </div>
  )
}
