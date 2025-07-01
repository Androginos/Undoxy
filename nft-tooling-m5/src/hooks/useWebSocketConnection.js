import { useCallback } from 'react'
import useWebSocket from 'react-use-websocket'

// WebSocket hook for blockchain data connection
export const useWebSocketConnection = (url = 'ws://localhost:8080', options = {}) => {
  const defaultOptions = {
    onOpen: () => console.log('🔗 WebSocket connected to blockchain data'),
    onClose: () => console.log('❌ WebSocket disconnected'),
    onError: (error) => console.error('🚨 WebSocket error:', error),
    shouldReconnect: () => true,
    reconnectAttempts: 10,
    reconnectInterval: 3000,
    ...options
  }

  const {
    sendMessage,
    lastMessage,
    readyState,
    getWebSocket
  } = useWebSocket(url, defaultOptions)

  // Parse incoming messages
  const parseMessage = useCallback((message) => {
    try {
      return JSON.parse(message.data)
    } catch (error) {
      console.error('Failed to parse WebSocket message:', error)
      return null
    }
  }, [])

  // Send formatted message
  const sendBlockchainMessage = useCallback((type, data) => {
    const message = JSON.stringify({
      type,
      data,
      timestamp: Date.now()
    })
    sendMessage(message)
  }, [sendMessage])

  // Connection status helpers
  const isConnected = readyState === 1
  const isConnecting = readyState === 0
  const isDisconnected = readyState === 3

  return {
    // Core WebSocket functions
    sendMessage: sendBlockchainMessage,
    lastMessage,
    readyState,
    getWebSocket,
    
    // Parsed data
    parsedMessage: lastMessage ? parseMessage(lastMessage) : null,
    
    // Connection status
    isConnected,
    isConnecting,
    isDisconnected,
    
    // Status text for UI
    connectionStatus: isConnected ? 'Connected' : isConnecting ? 'Connecting...' : 'Disconnected'
  }
}

// WebSocket ready states for reference
export const WEBSOCKET_STATES = {
  CONNECTING: 0,
  OPEN: 1,
  CLOSING: 2,
  CLOSED: 3
}

// Example usage (commented out for future reference):
/*
function MyComponent() {
  const { 
    sendMessage, 
    parsedMessage, 
    isConnected, 
    connectionStatus 
  } = useWebSocketConnection('ws://localhost:8080')

  useEffect(() => {
    if (parsedMessage) {
      console.log('Received blockchain data:', parsedMessage)
      // Handle the data (update state, trigger animations, etc.)
    }
  }, [parsedMessage])

  const requestLatestBlocks = () => {
    sendMessage('getLatestBlocks', { count: 10 })
  }

  return (
    <div>
      <div>Status: {connectionStatus}</div>
      <button onClick={requestLatestBlocks} disabled={!isConnected}>
        Get Latest Blocks
      </button>
    </div>
  )
}
*/ 