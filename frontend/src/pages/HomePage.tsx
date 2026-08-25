import { useAuthContext } from '@/context/AuthContext'

export default function HomePage() {
  const { user, logout } = useAuthContext()

  return (
    <div className="app">
      <h1>Online Event Management Platform</h1>
      {user ? (
        <>
          <p>
            Welcome, <strong>{user.name}</strong> ({user.role})
          </p>
          <button className="btn btn-secondary" onClick={logout} style={{ marginTop: '1rem' }}>
            Logout
          </button>
        </>
      ) : (
        <p>Welcome to the event management platform.</p>
      )}
    </div>
  )
}
