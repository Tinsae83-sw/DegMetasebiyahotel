import { useEffect, useState } from 'react';
import { 
  getKitchenSocket, 
  disconnectKitchenSocket, 
  joinKitchenRoom,
  onNewOrder,
  onOrderStatusUpdated,
  onOrderCancelled,
  onOrderModified,
  onPriorityOrder,
  onKitchenNotification,
  onManagerAnnouncement,
  onWaiterMessage,
} from '@/lib/kitchen/socket';
import { toast } from 'sonner';

export function useKitchenSocket(station?: string) {
  const [isConnected, setIsConnected] = useState(false);

  useEffect(() => {
    const socket = getKitchenSocket();

    socket.on('connect', () => {
      setIsConnected(true);
      if (station) {
        joinKitchenRoom(station);
      }
    });

    socket.on('disconnect', () => {
      setIsConnected(false);
    });

    return () => {
      disconnectKitchenSocket();
    };
  }, [station]);

  return { isConnected };
}

export function useKitchenRealtimeOrders(onOrderUpdate?: (order: any) => void) {
  useEffect(() => {
    const cleanupNewOrder = onNewOrder((order) => {
      toast.success(`New order #${order.orderNumber} received`);
      onOrderUpdate?.(order);
    });

    const cleanupStatusUpdated = onOrderStatusUpdated((order) => {
      onOrderUpdate?.(order);
    });

    const cleanupCancelled = onOrderCancelled((order) => {
      toast.info(`Order #${order.orderNumber} was cancelled`);
      onOrderUpdate?.(order);
    });

    const cleanupModified = onOrderModified((order) => {
      toast.info(`Order #${order.orderNumber} was modified`);
      onOrderUpdate?.(order);
    });

    const cleanupPriority = onPriorityOrder((order) => {
      toast.error(`PRIORITY ORDER #${order.orderNumber}!`, {
        duration: 5000,
      });
      onOrderUpdate?.(order);
    });

    return () => {
      cleanupNewOrder();
      cleanupStatusUpdated();
      cleanupCancelled();
      cleanupModified();
      cleanupPriority();
    };
  }, [onOrderUpdate]);
}

export function useKitchenNotifications(onNotification?: (notification: any) => void) {
  useEffect(() => {
    const cleanupNotification = onKitchenNotification((notification) => {
      toast(notification.title, { description: notification.message });
      onNotification?.(notification);
    });

    const cleanupAnnouncement = onManagerAnnouncement((announcement) => {
      toast.info(announcement.message, { duration: 10000 });
      onNotification?.(announcement);
    });

    const cleanupWaiterMessage = onWaiterMessage((message) => {
      toast(`Message from waiter: ${message.message}`);
      onNotification?.(message);
    });

    return () => {
      cleanupNotification();
      cleanupAnnouncement();
      cleanupWaiterMessage();
    };
  }, [onNotification]);
}
