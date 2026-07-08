"use client";

import { useState, useEffect } from "react";
import { WaiterLayout } from "@/components/layout/waiter-layout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Clock,
  Users,
  CheckCircle,
  RefreshCw,
  UtensilsCrossed,
} from "lucide-react";
import { toast } from "sonner";
import { useAuth } from "@/hooks/use-auth";
import { useOrders } from "@/hooks/use-orders";
import { useSocket } from "@/hooks/use-socket";
import { Order } from "@/types/waiter";
import { format, differenceInMinutes } from "date-fns";
import { motion } from "framer-motion";

export default function ActiveOrdersPage() {
  const { user } = useAuth();
  const { orders, refetch } = useOrders();
  const { socket, connected } = useSocket();

  const [lastUpdate, setLastUpdate] = useState<Date>(new Date());

  const ordersData = orders.data || [];

  // Filter orders for current waiter
  const waiterOrders = ordersData.filter(
    (order) => order.waiter?.id === user?.id || (order as any).waiterId === user?.id
  );

  // Only show ready orders
  const readyOrders = waiterOrders.filter((o) => o.status === "ready");

  // Socket.IO real-time updates
  useEffect(() => {
    if (!socket) return;

    const handleOrderUpdate = (data: any) => {
      console.log("Order update received:", data);
      refetch();
      setLastUpdate(new Date());
    };

    const handleOrderStatusChange = (data: any) => {
      console.log("Order status changed:", data);
      refetch();
      setLastUpdate(new Date());
    };

    socket.on("order:updated", handleOrderUpdate);
    socket.on("order:status:changed", handleOrderStatusChange);

    return () => {
      socket.off("order:updated", handleOrderUpdate);
      socket.off("order:status:changed", handleOrderStatusChange);
    };
  }, [socket, refetch]);

  const getOrderTime = (order: Order) => {
    const created = new Date(order.createdAt);
    const now = new Date();
    const minutes = differenceInMinutes(now, created);

    if (minutes < 1) return "Just now";
    if (minutes < 60) return `${minutes}m ago`;
    return format(created, "HH:mm");
  };

  // Confirm delivery (complete order directly)
  const handleConfirmDelivery = (order: any) => {
    fetch(`/api/orders/${order.id}/status`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ status: "COMPLETED" }),
    })
      .then((res) => {
        if (!res.ok) throw new Error("Failed to confirm delivery");
        toast.success(`Order for Table ${order.tableNumber} delivered successfully`);
        refetch();
      })
      .catch((error) => {
        toast.error("Failed to confirm delivery");
        console.error(error);
      });
  };

  return (
    <WaiterLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold">Active Orders</h1>
            <p className="text-muted-foreground">Ready for delivery</p>
          </div>
          <div className="flex items-center gap-2">
            <div
              className={`flex items-center gap-2 px-3 py-1 rounded-full text-sm ${
                connected ? "bg-green-100 text-green-700" : "bg-red-100 text-red-700"
              }`}
            >
              <div className={`w-2 h-2 rounded-full ${connected ? "bg-green-500" : "bg-red-500"}`} />
              {connected ? "Connected" : "Disconnected"}
            </div>
            <Button variant="outline" size="sm" onClick={() => refetch()}>
              <RefreshCw className="h-4 w-4 mr-2" />
              Refresh
            </Button>
          </div>
        </div>

        {/* Statistics */}
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Ready to Deliver</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">{readyOrders.length}</div>
            <p className="text-xs text-muted-foreground">Orders ready for delivery</p>
          </CardContent>
        </Card>

        {/* Ready Orders */}
        <div className="space-y-4 mt-4">
          {readyOrders.length === 0 ? (
            <div className="text-center py-12 text-muted-foreground">
              <UtensilsCrossed className="h-12 w-12 mx-auto mb-4 opacity-50" />
              <p>No orders ready to deliver.</p>
            </div>
          ) : (
            readyOrders.map((order) => (
              <DeliveryOrderCard
                key={order.id}
                order={order}
                onConfirmDelivery={() => handleConfirmDelivery(order)}
                getTime={getOrderTime}
              />
            ))
          )}
        </div>

        {/* Last Update */}
        <div className="text-center text-sm text-muted-foreground">
          Last updated: {format(lastUpdate, "PPp")}
        </div>
      </div>
    </WaiterLayout>
  );
}

// ========== Subcomponents ==========

interface DeliveryOrderCardProps {
  order: any;
  onConfirmDelivery: () => void;
  getTime: (order: any) => string;
}

function DeliveryOrderCard({ order, onConfirmDelivery, getTime }: DeliveryOrderCardProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.2 }}
    >
      <Card className="border-green-500 border-2">
        <CardContent className="p-4">
          <div className="flex items-start justify-between mb-4">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-full bg-green-100 text-green-600">
                <UtensilsCrossed className="h-5 w-5" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h3 className="font-semibold">Order #{(order as any).orderNumber || order.id}</h3>
                  <Badge className="bg-green-500">READY</Badge>
                </div>
                <div className="flex items-center gap-4 text-sm text-muted-foreground mt-1">
                  <div className="flex items-center gap-1">
                    <Users className="h-4 w-4" />
                    <span>Table {order.tableNumber}</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <Clock className="h-4 w-4" />
                    <span>{getTime(order)}</span>
                  </div>
                </div>
              </div>
            </div>
            <Button size="lg" className="bg-green-600 hover:bg-green-700" onClick={onConfirmDelivery}>
              <CheckCircle className="h-4 w-4 mr-2" />
              Confirm as Delivered
            </Button>
          </div>

          <div className="space-y-2 mb-4">
            {order.items.map((item: any) => (
              <div key={item.id} className="flex justify-between items-center text-sm">
                <div className="flex items-center gap-2">
                  <span className="font-medium">{item.quantity}x</span>
                  <span>{item.name}</span>
                  {item.specialInstructions && (
                    <Badge variant="outline" className="text-xs">
                      Special
                    </Badge>
                  )}
                </div>
                <span className="text-muted-foreground">Br{(item.price * item.quantity).toFixed(2)}</span>
              </div>
            ))}
          </div>

          {order.notes && (
            <div className="p-2 bg-muted rounded text-sm mb-4">
              <span className="font-medium">Note:</span> {order.notes}
            </div>
          )}

          <div className="flex items-center justify-between pt-3 border-t">
            <div className="text-sm text-muted-foreground">{order.items.length} items</div>
            <div className="font-bold text-lg">Br{order.total.toFixed(2)}</div>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
}
