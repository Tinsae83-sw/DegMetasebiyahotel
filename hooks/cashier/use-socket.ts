import { useEffect, useState, useRef } from 'react'
import { io, Socket } from 'socket.io-client'
import { toast } from 'sonner'
import type { CashierNotification } from '@/types/cashier'

const SOCKET_URL = process.env.NEXT_PUBLIC_SOCKET_URL || 'http://localhost:3001'

export const useSocket = (cashierId?: string) => {
  const [isConnected, setIsConnected] = useState(false)
  const [notifications, setNotifications] = useState<CashierNotification[]>([])
  const socketRef = useRef<Socket | null>(null)

  useEffect(() => {
    if (!cashierId) return

    const token = localStorage.getItem('token')
    
    socketRef.current = io(SOCKET_URL, {
      auth: {
        token,
        role: 'cashier',
        userId: cashierId,
      },
    })

    socketRef.current.on('connect', () => {
      setIsConnected(true)
      console.log('Socket connected')
    })

    socketRef.current.on('disconnect', () => {
      setIsConnected(false)
      console.log('Socket disconnected')
    })

    socketRef.current.on('error', (error) => {
      console.error('Socket error:', error)
    })

    // Join cashier room
    socketRef.current.emit('join-room', 'cashiers')

    // Listen for bill requests
    socketRef.current.on('bill_request', (data: CashierNotification) => {
      setNotifications((prev) => [data, ...prev])
      toast.success(data.title, {
        description: data.message,
      })
      // Play sound alert
      playNotificationSound()
    })

    // Listen for order ready events
    socketRef.current.on('order-ready', (data: any) => {
      toast.success('Order Ready for Payment', {
        description: `Order #${data.orderNumber || data.id} for Table ${data.tableNumber} is ready`,
      })
      playNotificationSound()
    })

    // Listen for payment confirmations
    socketRef.current.on('payment_completed', (data: CashierNotification) => {
      setNotifications((prev) => [data, ...prev])
      toast.success(data.title, {
        description: data.message,
      })
    })

    // Listen for failed payments
    socketRef.current.on('payment_failed', (data: CashierNotification) => {
      setNotifications((prev) => [data, ...prev])
      toast.error(data.title, {
        description: data.message,
      })
      playNotificationSound()
    })

    // Listen for refund requests
    socketRef.current.on('refund_request', (data: CashierNotification) => {
      setNotifications((prev) => [data, ...prev])
      toast.info(data.title, {
        description: data.message,
      })
      playNotificationSound()
    })

    // Listen for manager announcements
    socketRef.current.on('manager_announcement', (data: CashierNotification) => {
      setNotifications((prev) => [data, ...prev])
      toast.info(data.title, {
        description: data.message,
      })
    })

    return () => {
      if (socketRef.current) {
        socketRef.current.disconnect()
      }
    }
  }, [cashierId])

  const playNotificationSound = () => {
    const audio = new Audio('/sounds/notification.mp3')
    audio.play().catch((error) => {
      console.error('Failed to play notification sound:', error)
    })
  }

  const emitPaymentCompleted = (data: { orderId: string; tableNumber: number; amount: number }) => {
    if (socketRef.current && isConnected) {
      socketRef.current.emit('payment_completed', data)
    }
  }

  const emitRefundRequested = (data: { transactionId: string; amount: number; reason: string }) => {
    if (socketRef.current && isConnected) {
      socketRef.current.emit('refund_requested', data)
    }
  }

  return {
    isConnected,
    notifications,
    emitPaymentCompleted,
    emitRefundRequested,
  }
}
