export interface WaiterNotification {
  id: string;
  type: 'ORDER_UPDATE' | 'CUSTOMER_REQUEST' | 'KITCHEN_UPDATE' | 'MANAGER_ANNOUNCEMENT' | 'RESERVATION';
  title: string;
  message: string;
  orderId?: string;
  tableId?: string;
  waiterId?: string;
  read: boolean;
  createdAt: string;
}

const waiterNotifications: WaiterNotification[] = [];

export function getWaiterNotifications(userId?: string): WaiterNotification[] {
  return waiterNotifications
    .filter((notification) => !notification.waiterId || notification.waiterId === userId)
    .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
}

export function addWaiterNotification(notification: WaiterNotification): WaiterNotification {
  waiterNotifications.push(notification);
  return notification;
}

export function markWaiterNotificationRead(notificationId: string, userId?: string): WaiterNotification | null {
  const notification = waiterNotifications.find(
    (item) => item.id === notificationId && (!item.waiterId || item.waiterId === userId),
  );

  if (notification) {
    notification.read = true;
  }

  return notification ?? null;
}

export function markAllWaiterNotificationsRead(userId?: string): void {
  waiterNotifications.forEach((notification) => {
    if (!notification.waiterId || notification.waiterId === userId) {
      notification.read = true;
    }
  });
}
