import { Link } from 'react-router-dom'

export default function NotFound() {
  return (
    <div className="app">
      <div className="not-found">
        <h1>404</h1>
        <p>The page you&apos;re looking for doesn&apos;t exist.</p>
        <Link to="/events" className="btn btn-primary btn-block" style={{ maxWidth: '200px', margin: '0 auto' }}>
          Go to Events
        </Link>
      </div>
    </div>
  )
}
