import { io, Socket } from 'socket.io-client'

const SOCKET_URL = process.env.NEXT_PUBLIC_SOCKET_URL || 'http://localhost:3001'

let socket: Socket | null = null

export const getWaiterSocket = () => {
  if (!socket) {
    socket = io(SOCKET_URL, {
      transports: ['websocket', 'polling'],
    })

    socket.on('connect', () => {
      console.log('Waiter connected to Socket.IO server')
      socket?.emit('join-room', 'waiter')
    })

    socket.on('disconnect', () => {
      console.log('Waiter disconnected from Socket.IO server')
    })
  }

  return socket
}

export const disconnectWaiterSocket = () => {
  if (socket) {
    socket.disconnect()
    socket = null
  }
}

export const joinWaiterRoom = (waiterId: string) => {
  if (socket) {
    socket.emit('join-room', `waiter-${waiterId}`)
  }
}

// Event listeners for customer requests
export const onCustomerRequest = (callback: (request: any) => void) => {
  const socket = getWaiterSocket()
  socket.on('customer-request-created', callback)
  
  return () => {
    socket.off('customer-request-created', callback)
  }
}

export const onCustomerRequestUpdated = (callback: (request: any) => void) => {
  const socket = getWaiterSocket()
  socket.on('customer-request-updated', callback)
  
  return () => {
    socket.off('customer-request-updated', callback)
  }
}

// Event listeners for order status changes
export const onOrderReady = (callback: (order: any) => void) => {
  const socket = getWaiterSocket()
  socket.on('order-ready', callback)
  
  return () => {
    socket.off('order-ready', callback)
  }
}

export const onOrderStatusUpdated = (callback: (order: any) => void) => {
  const socket = getWaiterSocket()
  socket.on('order-status-updated', callback)
  
  return () => {
    socket.off('order-status-updated', callback)
  }
}

export const onOrderCreated = (callback: (order: any) => void) => {
  const socket = getWaiterSocket()
  socket.on('order-created', callback)
  
  return () => {
    socket.off('order-created', callback)
  }
}

// Event listeners for notifications
export const onWaiterNotification = (callback: (notification: any) => void) => {
  const socket = getWaiterSocket()
  socket.on('waiter-notification', callback)
  
  return () => {
    socket.off('waiter-notification', callback)
  }
}

export const onManagerAnnouncement = (callback: (announcement: any) => void) => {
  const socket = getWaiterSocket()
  socket.on('manager-announcement', callback)
  
  return () => {
    socket.off('manager-announcement', callback)
  }
}
