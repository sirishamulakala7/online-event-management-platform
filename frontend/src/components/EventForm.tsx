import { useState, type FormEvent } from 'react'
import { EventStatus } from '@/types'
import type { EventRequest } from '@/types'

interface EventFormProps {
  initialValues?: Partial<EventRequest>
  onSubmit: (values: EventRequest) => Promise<void>
  submitLabel: string
}

const STATUS_OPTIONS = [EventStatus.DRAFT, EventStatus.PUBLISHED, EventStatus.CANCELLED, EventStatus.COMPLETED] as const

function toDatetimeLocal(value?: string): string {
  if (!value) return ''
  // Convert ISO string to "YYYY-MM-DDTHH:MM" for <input type="datetime-local">
  return value.slice(0, 16)
}

export default function EventForm({ initialValues, onSubmit, submitLabel }: EventFormProps) {
  const [title, setTitle] = useState(initialValues?.title ?? '')
  const [description, setDescription] = useState(initialValues?.description ?? '')
  const [location, setLocation] = useState(initialValues?.location ?? '')
  const [startDate, setStartDate] = useState(toDatetimeLocal(initialValues?.startDate))
  const [endDate, setEndDate] = useState(toDatetimeLocal(initialValues?.endDate))
  const [maxAttendees, setMaxAttendees] = useState(
    initialValues?.maxAttendees != null ? String(initialValues.maxAttendees) : '',
  )
  const [status, setStatus] = useState<EventStatus>(initialValues?.status ?? EventStatus.DRAFT)

  const [error, setError] = useState<string | null>(null)
  const [submitting, setSubmitting] = useState(false)

  async function handleSubmit(e: FormEvent) {
    e.preventDefault()
    setError(null)

    if (!title.trim()) {
      setError('Title is required.')
      return
    }
    if (!startDate) {
      setError('Start date is required.')
      return
    }
    if (!endDate) {
      setError('End date is required.')
      return
    }
    if (new Date(endDate) <= new Date(startDate)) {
      setError('End date must be after start date.')
      return
    }

    const payload: EventRequest = {
      title: title.trim(),
      description: description.trim() || undefined,
      location: location.trim() || undefined,
      startDate: new Date(startDate).toISOString(),
      endDate: new Date(endDate).toISOString(),
      maxAttendees: maxAttendees ? Number(maxAttendees) : undefined,
      organizerId: initialValues?.organizerId ?? 0, // set by caller
      status,
    }

    setSubmitting(true)
    try {
      await onSubmit(payload)
    } catch (err: unknown) {
      const message =
        (err as { response?: { data?: { message?: string } } }).response?.data?.message ??
        'Failed to save event. Please try again.'
      setError(message)
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <form onSubmit={handleSubmit}>
      {error && <div className="auth-error">{error}</div>}

      <div className="form-group">
        <label htmlFor="title">Title *</label>
        <input
          id="title"
          type="text"
          required
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          placeholder="Event title"
        />
      </div>

      <div className="form-group">
        <label htmlFor="description">Description</label>
        <textarea
          id="description"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          placeholder="Describe your event"
          rows={4}
        />
      </div>

      <div className="form-group">
        <label htmlFor="location">Location</label>
        <input
          id="location"
          type="text"
          value={location}
          onChange={(e) => setLocation(e.target.value)}
          placeholder="e.g. Convention Center"
        />
      </div>

      <div className="form-row">
        <div className="form-group form-group-half">
          <label htmlFor="startDate">Start date *</label>
          <input
            id="startDate"
            type="datetime-local"
            required
            value={startDate}
            onChange={(e) => setStartDate(e.target.value)}
          />
        </div>

        <div className="form-group form-group-half">
          <label htmlFor="endDate">End date *</label>
          <input
            id="endDate"
            type="datetime-local"
            required
            value={endDate}
            onChange={(e) => setEndDate(e.target.value)}
          />
        </div>
      </div>

      <div className="form-row">
        <div className="form-group form-group-half">
          <label htmlFor="maxAttendees">Max attendees</label>
          <input
            id="maxAttendees"
            type="number"
            min={1}
            value={maxAttendees}
            onChange={(e) => setMaxAttendees(e.target.value)}
            placeholder="Unlimited"
          />
        </div>

        <div className="form-group form-group-half">
          <label htmlFor="status">Status</label>
          <select id="status" value={status} onChange={(e) => setStatus(e.target.value as EventStatus)}>                {STATUS_OPTIONS.map((s) => (
                  <option key={s} value={s}>
                    {s.charAt(0) + s.slice(1).toLowerCase()}
                  </option>
                ))}
          </select>
        </div>
      </div>

      <button type="submit" className="btn btn-primary" disabled={submitting}>
        {submitting ? 'Saving…' : submitLabel}
      </button>
    </form>
  )
}
