import { useState, useEffect } from 'react'
import { useParams, useNavigate, Link } from 'react-router-dom'
import { eventsApi } from '@/api'
import { useAuthContext } from '@/context/AuthContext'
import EventForm from '@/components/EventForm'
import type { Event, EventRequest } from '@/types'

export default function EditEventPage() {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const { user } = useAuthContext()

  const [event, setEvent] = useState<Event | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

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

  async function handleSubmit(values: EventRequest) {
    const payload: EventRequest = {
      ...values,
      organizerId: event!.organizerId,
    }
    await eventsApi.updateEvent(Number(id), payload)
    navigate(`/events/${id}`)
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
        <div className="alert-error">{error ?? 'Event not found.'}</div>
        <Link to="/events" className="btn btn-secondary" style={{ marginTop: '1rem' }}>
          ← Back to events
        </Link>
      </div>
    )
  }

  // Only the owner or admin can edit
  const canEdit = user && (user.role === 'ADMIN' || user.id === event.organizerId)
  if (!canEdit) {
    return (
      <div className="app">
        <div className="alert-error">You don&apos;t have permission to edit this event.</div>
        <Link to={`/events/${id}`} className="btn btn-secondary" style={{ marginTop: '1rem' }}>
          ← Back to event
        </Link>
      </div>
    )
  }

  return (
    <div className="app">
      <Link to={`/events/${id}`} className="back-link">← Back to event</Link>
      <h1>Edit Event</h1>
      <div className="form-card">
        <EventForm
          initialValues={{
            title: event.title,
            description: event.description,
            location: event.location,
            startDate: event.startDate,
            endDate: event.endDate,
            maxAttendees: event.maxAttendees,
            status: event.status,
          }}
          onSubmit={handleSubmit}
          submitLabel="Save Changes"
        />
      </div>
    </div>
  )
}
