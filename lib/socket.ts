import { io, Socket } from 'socket.io-client'

const SOCKET_URL = process.env.NEXT_PUBLIC_SOCKET_URL || 'http://localhost:3001'

let socket: Socket | null = null

export const getSocket = (role?: string) => {
  if (!socket) {
    socket = io(SOCKET_URL, {
      transports: ['websocket', 'polling'],
    })

    socket.on('connect', () => {
      console.log('Connected to Socket.IO server')
      if (role) {
        socket?.emit('join-room', role)
      }
    })

    socket.on('disconnect', () => {
      console.log('Disconnected from Socket.IO server')
    })
  }

  return socket
}

export const disconnectSocket = () => {
  if (socket) {
    socket.disconnect()
    socket = null
  }
}

export const joinRoom = (room: string) => {
  if (socket) {
    socket.emit('join-room', room)
  }
}

export const leaveRoom = (room: string) => {
  if (socket) {
    socket.emit('leave-room', room)
  }
}
