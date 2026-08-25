import { useState, useEffect } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { eventsApi } from '@/api'
import { useAuthContext } from '@/context/AuthContext'
import { UserRole } from '@/types'
import type { Event } from '@/types'

const CAN_CREATE: UserRole[] = [UserRole.ADMIN, UserRole.ORGANIZER]

function formatDate(iso: string): string {
  return new Date(iso).toLocaleDateString(undefined, {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  })
}

function statusBadgeClass(status: string): string {
  switch (status) {
    case 'PUBLISHED': return 'badge badge-success'
    case 'DRAFT': return 'badge badge-secondary'
    case 'CANCELLED': return 'badge badge-danger'
    case 'COMPLETED': return 'badge badge-warning'
    default: return 'badge'
  }
}

export default function EventsPage() {
  const { user } = useAuthContext()
  const navigate = useNavigate()

  const [events, setEvents] = useState<Event[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    let cancelled = false
    async function load() {
      try {
        const data = await eventsApi.getAllEvents()
        if (!cancelled) setEvents(data)
      } catch {
        if (!cancelled) setError('Failed to load events.')
      } finally {
        if (!cancelled) setLoading(false)
      }
    }
    load()
    return () => { cancelled = true }
  }, [])

  if (loading) {
    return (
      <div className="app">
        <p className="loading-text">Loading events…</p>
      </div>
    )
  }

  if (error) {
    return (
      <div className="app">
        <div className="auth-error">{error}</div>
      </div>
    )
  }

  return (
    <div className="app">
      <div className="page-header">
        <h1>Events</h1>
        <div className="page-header-actions">
          <Link to="/my-registrations" className="btn btn-secondary btn-inline">
            My Registrations
          </Link>
          {user && CAN_CREATE.includes(user.role) && (
            <Link to="/events/new" className="btn btn-primary btn-inline">
              + New Event
            </Link>
          )}
        </div>
      </div>

      {events.length === 0 ? (
        <p className="empty-state">No events yet. {user && CAN_CREATE.includes(user.role) && 'Create one to get started!'}</p>
      ) : (
        <div className="event-grid">
          {events.map((event) => (
            <div
              key={event.id}
              className="event-card"
              onClick={() => navigate(`/events/${event.id}`)}
              role="button"
              tabIndex={0}
              onKeyDown={(e) => { if (e.key === 'Enter') navigate(`/events/${event.id}`) }}
            >
              <div className="event-card-header">
                <h3>{event.title}</h3>
                <span className={statusBadgeClass(event.status)}>
                  {event.status.charAt(0) + event.status.slice(1).toLowerCase()}
                </span>
              </div>
              {event.description && (
                <p className="event-card-desc">{event.description.length > 120
                  ? event.description.slice(0, 120) + '…'
                  : event.description}</p>
              )}
              <div className="event-card-meta">
                {event.location && <span>📍 {event.location}</span>}
                <span>📅 {formatDate(event.startDate)}</span>
                {event.organizerName && <span>👤 {event.organizerName}</span>}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
