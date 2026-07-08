import { io, Socket } from 'socket.io-client';

const SOCKET_URL = process.env.NEXT_PUBLIC_SOCKET_URL || 'http://localhost:3001';

let kitchenSocket: Socket | null = null;

export const getKitchenSocket = () => {
  if (!kitchenSocket) {
    const token = localStorage.getItem('token');
    kitchenSocket = io(SOCKET_URL, {
      auth: {
        token,
        role: 'kitchen',
      },
      transports: ['websocket', 'polling'],
    });

    kitchenSocket.on('connect_error', (error) => {
      console.error('Kitchen socket connection error:', error);
    });

    kitchenSocket.on('disconnect', () => {
      console.log('Kitchen socket disconnected');
    });
  }

  return kitchenSocket;
};

export const disconnectKitchenSocket = () => {
  if (kitchenSocket) {
    kitchenSocket.disconnect();
    kitchenSocket = null;
  }
};

export const joinKitchenRoom = (station?: string) => {
  const socket = getKitchenSocket();
  socket.emit('join-kitchen', { station });
};

export const leaveKitchenRoom = () => {
  const socket = getKitchenSocket();
  socket.emit('leave-kitchen');
};

// Socket event listeners
export const onNewOrder = (callback: (order: any) => void) => {
  const socket = getKitchenSocket();
  socket.on('new-order', callback);
  return () => socket.off('new-order', callback);
};

export const onOrderStatusUpdated = (callback: (order: any) => void) => {
  const socket = getKitchenSocket();
  socket.on('order-status-updated', callback);
  return () => socket.off('order-status-updated', callback);
};

export const onOrderCancelled = (callback: (order: any) => void) => {
  const socket = getKitchenSocket();
  socket.on('order-cancelled', callback);
  return () => socket.off('order-cancelled', callback);
};

export const onOrderModified = (callback: (order: any) => void) => {
  const socket = getKitchenSocket();
  socket.on('order-modified', callback);
  return () => socket.off('order-modified', callback);
};

export const onPriorityOrder = (callback: (order: any) => void) => {
  const socket = getKitchenSocket();
  socket.on('priority-order', callback);
  return () => socket.off('priority-order', callback);
};

export const onKitchenNotification = (callback: (notification: any) => void) => {
  const socket = getKitchenSocket();
  socket.on('kitchen-notification', callback);
  return () => socket.off('kitchen-notification', callback);
};

export const onManagerAnnouncement = (callback: (announcement: any) => void) => {
  const socket = getKitchenSocket();
  socket.on('manager-announcement', callback);
  return () => socket.off('manager-announcement', callback);
};

export const onWaiterMessage = (callback: (message: any) => void) => {
  const socket = getKitchenSocket();
  socket.on('waiter-message', callback);
  return () => socket.off('waiter-message', callback);
};

// Emit functions
export const notifyWaiter = (orderId: string, status: string) => {
  const socket = getKitchenSocket();
  socket.emit('notify-waiter', { orderId, status });
};

export const sendKitchenMessage = (orderId: string, message: string) => {
  const socket = getKitchenSocket();
  socket.emit('kitchen-message', { orderId, message });
};
