import { useNavigate, Link } from 'react-router-dom'
import { eventsApi } from '@/api'
import { useAuthContext } from '@/context/AuthContext'
import EventForm from '@/components/EventForm'
import type { EventRequest } from '@/types'

export default function CreateEventPage() {
  const navigate = useNavigate()
  const { user } = useAuthContext()

  async function handleSubmit(values: EventRequest) {
    const payload = { ...values, organizerId: user!.id }
    const created = await eventsApi.createEvent(payload)
    navigate(`/events/${created.id}`)
  }

  return (
    <div className="app">
      <Link to="/events" className="back-link">← Back to events</Link>
      <h1>Create Event</h1>
      <div className="form-card">
        <EventForm
          onSubmit={handleSubmit}
          submitLabel="Create Event"
        />
      </div>
    </div>
  )
}
