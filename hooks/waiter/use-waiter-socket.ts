import { useEffect, useState } from 'react';
import { useAuth } from '@/hooks/use-auth';
import { 
  getWaiterSocket, 
  disconnectWaiterSocket,
  joinWaiterRoom,
  onCustomerRequest,
  onCustomerRequestUpdated,
  onOrderReady,
  onOrderStatusUpdated,
  onOrderCreated,
  onWaiterNotification,
  onManagerAnnouncement,
} from '@/lib/waiter/socket';
import { toast } from 'sonner';

export function useWaiterSocket() {
  const { user } = useAuth();
  const [isConnected, setIsConnected] = useState(false);

  useEffect(() => {
    const socket = getWaiterSocket();

    socket.on('connect', () => {
      setIsConnected(true);
      if (user?.id) {
        joinWaiterRoom(user.id);
      }
    });

    socket.on('disconnect', () => {
      setIsConnected(false);
    });

    return () => {
      disconnectWaiterSocket();
    };
  }, [user?.id]);

  return { isConnected };
}

export function useWaiterRealtimeNotifications() {
  const { user } = useAuth();

  useEffect(() => {
    // Customer request notifications (guest calls waiter)
    const cleanupCustomerRequest = onCustomerRequest((request) => {
      const requestType = request.type?.replace(/_/g, ' ') || 'request';
      toast.success(`Table ${request.tableNumber} is calling`, {
        description: `${requestType.charAt(0).toUpperCase() + requestType.slice(1)}`,
        duration: 5000,
        action: {
          label: 'View',
          onClick: () => window.location.href = `/waiter/requests`,
        },
      });
    });

    // Customer request updated
    const cleanupCustomerRequestUpdated = onCustomerRequestUpdated((request) => {
      if (request.status === 'pending') {
        toast.info(`Request updated for Table ${request.tableNumber}`);
      }
    });

    // Order ready to serve
    const cleanupOrderReady = onOrderReady((order) => {
      toast.success(`Order #${order.orderNumber || order.id} is ready to serve`, {
        description: `Table ${order.tableNumber}`,
        duration: 6000,
        action: {
          label: 'View',
          onClick: () => window.location.href = `/waiter/serving`,
        },
      });
    });

    // Order status updated
    const cleanupOrderStatusUpdated = onOrderStatusUpdated((order) => {
      const statusMessages: Record<string, string> = {
        'CONFIRMED': 'Order confirmed',
        'PREPARING': 'Order is being prepared',
        'READY': 'Order is ready',
        'SERVED': 'Order served',
        'COMPLETED': 'Order completed',
        'CANCELLED': 'Order cancelled',
      };

      const message = statusMessages[order.status] || `Order status: ${order.status}`;
      
      if (order.status === 'READY') {
        toast.success(`Order #${order.orderNumber || order.id} is ready`, {
          description: `Table ${order.tableNumber}`,
        });
      } else if (order.status === 'CANCELLED') {
        toast.error(`Order #${order.orderNumber || order.id} was cancelled`, {
          description: `Table ${order.tableNumber}`,
        });
      }
    });

    // New order created
    const cleanupOrderCreated = onOrderCreated((order) => {
      toast.info(`New order #${order.orderNumber || order.id} created`, {
        description: `Table ${order.tableNumber}`,
        duration: 4000,
      });
    });

    // General waiter notifications
    const cleanupNotification = onWaiterNotification((notification) => {
      toast(notification.title, {
        description: notification.message,
        duration: 5000,
      });
    });

    // Manager announcements
    const cleanupAnnouncement = onManagerAnnouncement((announcement) => {
      toast.info(announcement.message, {
        description: 'Manager Announcement',
        duration: 10000,
      });
    });

    return () => {
      cleanupCustomerRequest();
      cleanupCustomerRequestUpdated();
      cleanupOrderReady();
      cleanupOrderStatusUpdated();
      cleanupOrderCreated();
      cleanupNotification();
      cleanupAnnouncement();
    };
  }, [user?.id]);
}
