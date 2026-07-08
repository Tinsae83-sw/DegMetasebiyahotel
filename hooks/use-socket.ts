import { useEffect, useState } from 'react'
import { getSocket, disconnectSocket, joinRoom, leaveRoom } from '@/lib/socket'

export function useSocket(role?: string) {
  const [isConnected, setIsConnected] = useState(false)

  useEffect(() => {
    const socket = getSocket(role)

    socket.on('connect', () => {
      setIsConnected(true)
    })

    socket.on('disconnect', () => {
      setIsConnected(false)
    })

    return () => {
      if (role) {
        leaveRoom(role)
      }
    }
  }, [role])

  return { isConnected }
}

export function useOrderUpdates() {
  const [lastUpdate, setLastUpdate] = useState<Date | null>(null)

  useEffect(() => {
    const socket = getSocket()

    const handleOrderCreated = (order: any) => {
      setLastUpdate(new Date())
    }

    const handleOrderStatusUpdated = (order: any) => {
      setLastUpdate(new Date())
    }

    const handleOrderReady = (order: any) => {
      setLastUpdate(new Date())
    }

    const handlePaymentCompleted = (order: any) => {
      setLastUpdate(new Date())
    }

    socket.on('order-created', handleOrderCreated)
    socket.on('order-status-updated', handleOrderStatusUpdated)
    socket.on('order-ready', handleOrderReady)
    socket.on('payment-completed', handlePaymentCompleted)

    return () => {
      socket.off('order-created', handleOrderCreated)
      socket.off('order-status-updated', handleOrderStatusUpdated)
      socket.off('order-ready', handleOrderReady)
      socket.off('payment-completed', handlePaymentCompleted)
    }
  }, [])

  return { lastUpdate }
}
