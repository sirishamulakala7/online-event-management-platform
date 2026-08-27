import { useState, useEffect, useCallback, useRef } from 'react'
import { Client } from '@stomp/stompjs'
import SockJS from 'sockjs-client'
import type { ChatMessage } from '@/types'

export type ConnectionStatus = 'connecting' | 'connected' | 'disconnected' | 'error'

interface UseWebSocketOptions {
  eventId: number
  enabled?: boolean
}

export function useWebSocket({ eventId, enabled = true }: UseWebSocketOptions) {
  const [messages, setMessages] = useState<ChatMessage[]>([])
  const [status, setStatus] = useState<ConnectionStatus>('disconnected')
  const clientRef = useRef<Client | null>(null)

  useEffect(() => {
    if (!enabled || !eventId) return

    const token = localStorage.getItem('accessToken')

    const client = new Client({
      webSocketFactory: () => new SockJS(`/ws?token=${token ?? ''}`),
      reconnectDelay: 5000,
      heartbeatIncoming: 10000,
      heartbeatOutgoing: 10000,

      onConnect: () => {
        setStatus('connected')
        client.subscribe(`/topic/event/${eventId}`, (message) => {
          try {
            const chatMessage = JSON.parse(message.body) as ChatMessage
            setMessages((prev) => [...prev, chatMessage])
          } catch {
            // Ignore malformed messages
          }
        })
      },

      onDisconnect: () => {
        setStatus('disconnected')
      },

      onStompError: (frame) => {
        console.error('STOMP error:', frame.headers['message'])
        setStatus('error')
      },

      onWebSocketClose: () => {
        setStatus('disconnected')
      },

      onWebSocketError: () => {
        setStatus('error')
      },
    })

    client.activate()
    clientRef.current = client

    return () => {
      if (client.active) {
        client.deactivate()
      }
      clientRef.current = null
    }
  }, [eventId, enabled])

  const sendMessage = useCallback((content: string) => {
    const client = clientRef.current
    if (!client || !client.active) return

    client.publish({
      destination: `/app/chat/${eventId}`,
      body: JSON.stringify({ content }),
    })
  }, [eventId])

  const clearMessages = useCallback(() => {
    setMessages([])
  }, [])

  return {
    messages,
    status,
    sendMessage,
    clearMessages,
  }
}
