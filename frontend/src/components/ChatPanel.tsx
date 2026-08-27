import { useState, useRef, useEffect, type KeyboardEvent } from 'react'
import { useWebSocket, type ConnectionStatus } from '@/hooks/useWebSocket'
import { useAuthContext } from '@/context/AuthContext'

interface ChatPanelProps {
  eventId: number
}

function formatTime(iso: string): string {
  try {
    return new Date(iso).toLocaleTimeString(undefined, {
      hour: '2-digit',
      minute: '2-digit',
    })
  } catch {
    return ''
  }
}

function StatusIndicator({ status }: { status: ConnectionStatus }) {
  const labels: Record<ConnectionStatus, string> = {
    connected: 'Connected',
    connecting: 'Connecting…',
    disconnected: 'Disconnected',
    error: 'Connection error',
  }
  const colors: Record<ConnectionStatus, string> = {
    connected: '#16a34a',
    connecting: '#f59e0b',
    disconnected: '#94a3b8',
    error: '#dc2626',
  }

  return (
    <span className="chat-status">
      <span className="chat-status-dot" style={{ backgroundColor: colors[status] }} />
      {labels[status]}
    </span>
  )
}

export default function ChatPanel({ eventId }: ChatPanelProps) {
  const { user } = useAuthContext()
  const { messages, status, sendMessage } = useWebSocket({ eventId, enabled: true })

  const [input, setInput] = useState('')
  const [sending, setSending] = useState(false)
  const messagesEndRef = useRef<HTMLDivElement>(null)
  const inputRef = useRef<HTMLInputElement>(null)

  // Auto-scroll to bottom on new messages
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages])

  function handleSend() {
    const trimmed = input.trim()
    if (!trimmed || status !== 'connected') return

    setSending(true)
    sendMessage(trimmed)
    setInput('')
    // Brief delay so the user sees the input clear
    setTimeout(() => setSending(false), 150)
    inputRef.current?.focus()
  }

  function handleKeyDown(e: KeyboardEvent<HTMLInputElement>) {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      handleSend()
    }
  }

  return (
    <div className="chat-panel">
      <div className="chat-header">
        <h2 className="chat-title">Event Chat</h2>
        <StatusIndicator status={status} />
      </div>

      <div className="chat-messages">
        {messages.length === 0 && status === 'connected' && (
          <p className="chat-empty">No messages yet. Start the conversation!</p>
        )}
        {messages.length === 0 && status !== 'connected' && status !== 'error' && (
          <p className="chat-empty">Waiting for connection…</p>
        )}
        {status === 'error' && (
          <p className="chat-empty chat-error-text">Unable to connect to chat.</p>
        )}

        {messages.map((msg) => {
          const isOwn = msg.senderId === user?.id
          return (
            <div
              key={msg.id}
              className={`chat-msg ${isOwn ? 'chat-msg-own' : 'chat-msg-other'}`}
            >
              {!isOwn && <span className="chat-msg-name">{msg.senderName}</span>}
              <div className="chat-msg-bubble">
                <p className="chat-msg-text">{msg.content}</p>
                <span className="chat-msg-time">{formatTime(msg.sentAt)}</span>
              </div>
            </div>
          )
        })}
        <div ref={messagesEndRef} />
      </div>

      <div className="chat-input-row">
        <input
          ref={inputRef}
          type="text"
          className="chat-input"
          placeholder={status === 'connected' ? 'Type a message…' : 'Connecting…'}
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={handleKeyDown}
          disabled={status !== 'connected' || sending}
          maxLength={2000}
        />
        <button
          className="btn btn-primary chat-send-btn"
          onClick={handleSend}
          disabled={status !== 'connected' || !input.trim() || sending}
        >
          Send
        </button>
      </div>
    </div>
  )
}
