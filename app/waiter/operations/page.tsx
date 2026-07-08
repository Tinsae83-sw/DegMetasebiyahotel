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
  ChefHat,
  AlertCircle,
  Truck,
} from "lucide-react";
import { toast } from "sonner";
import { useAuth } from "@/hooks/use-auth";
import { useOrders } from "@/hooks/use-orders";
import { useSocket } from "@/hooks/use-socket";
import { Order } from "@/types/waiter";
import { format, differenceInMinutes } from "date-fns";
import { motion } from "framer-motion";

type OrderStatus = "pending" | "preparing" | "ready" | "completed" | "confirmed" | "cancelled";

export default function WaiterOperationsPage() {
  const { user } = useAuth();
  const { orders, refetch } = useOrders();
  const { socket, connected } = useSocket();

  const [lastUpdate, setLastUpdate] = useState<Date>(new Date());
  const [statusFilter, setStatusFilter] = useState<OrderStatus | "all">("all");

  const ordersData = orders.data || [];

  // Filter orders for current waiter
  const waiterOrders = ordersData.filter(
    (order) => {
      // If no user, show all orders
      if (!user) return true;
      // Try multiple possible waiter field matches
      return (order as any).waiterId === user?.id || 
             (order as any).waiter?.id === user?.id ||
             order.waiter === user?.name ||
             (order as any).waiterName === user?.name;
    }
  );

  // Filter by status (case-insensitive and flexible)
  const filteredOrders = statusFilter === "all" 
    ? waiterOrders 
    : waiterOrders.filter((o) => {
        const orderStatus = (o.status || "").toLowerCase();
        const filterStatus = statusFilter.toLowerCase();
        
        if (filterStatus === "pending") {
          return orderStatus === "pending" || orderStatus === "confirmed";
        }
        return orderStatus === filterStatus;
      });

  // Count orders by status
  const statusCounts = {
    pending: waiterOrders.filter((o) => o.status === "pending" || o.status === "confirmed").length,
    preparing: waiterOrders.filter((o) => o.status === "preparing").length,
    ready: waiterOrders.filter((o) => o.status === "ready").length,
    completed: waiterOrders.filter((o) => o.status === "completed").length,
  };

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

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "pending":
        return <Badge className="bg-yellow-500">Pending</Badge>;
      case "preparing":
        return <Badge className="bg-blue-500">Preparing</Badge>;
      case "ready":
        return <Badge className="bg-green-500">Ready</Badge>;
      case "completed":
        return <Badge className="bg-emerald-600">Delivered</Badge>;
      case "cancelled":
        return <Badge className="bg-red-500">Cancelled</Badge>;
      default:
        return <Badge variant="outline">{status}</Badge>;
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "pending":
        return <AlertCircle className="h-5 w-5 text-yellow-600" />;
      case "preparing":
        return <ChefHat className="h-5 w-5 text-blue-600" />;
      case "ready":
        return <CheckCircle className="h-5 w-5 text-green-600" />;
      case "completed":
        return <Truck className="h-5 w-5 text-emerald-600" />;
      default:
        return <Clock className="h-5 w-5 text-gray-600" />;
    }
  };

  return (
    <WaiterLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold">Operations</h1>
            <p className="text-muted-foreground">Kitchen, Orders & Serving</p>
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

        {/* Statistics Cards */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium">Pending</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-yellow-600">{statusCounts.pending}</div>
              <p className="text-xs text-muted-foreground">Orders pending</p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium">Preparing</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-blue-600">{statusCounts.preparing}</div>
              <p className="text-xs text-muted-foreground">Orders in kitchen</p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium">Ready</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-green-600">{statusCounts.ready}</div>
              <p className="text-xs text-muted-foreground">Orders ready for delivery</p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium">Delivered</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-emerald-600">{statusCounts.completed}</div>
              <p className="text-xs text-muted-foreground">Orders delivered</p>
            </CardContent>
          </Card>
        </div>

        {/* Status Filter Buttons */}
        <div className="flex flex-wrap gap-2">
          <Button
            variant={statusFilter === "all" ? "default" : "outline"}
            size="sm"
            onClick={() => setStatusFilter("all")}
          >
            All ({waiterOrders.length})
          </Button>
          <Button
            variant={statusFilter === "pending" ? "default" : "outline"}
            size="sm"
            onClick={() => setStatusFilter("pending")}
          >
            Pending ({statusCounts.pending})
          </Button>
          <Button
            variant={statusFilter === "preparing" ? "default" : "outline"}
            size="sm"
            onClick={() => setStatusFilter("preparing")}
          >
            Preparing ({statusCounts.preparing})
          </Button>
          <Button
            variant={statusFilter === "ready" ? "default" : "outline"}
            size="sm"
            onClick={() => setStatusFilter("ready")}
          >
            Ready ({statusCounts.ready})
          </Button>
          <Button
            variant={statusFilter === "completed" ? "default" : "outline"}
            size="sm"
            onClick={() => setStatusFilter("completed")}
          >
            Delivered ({statusCounts.completed})
          </Button>
        </div>

        {/* Orders List */}
        <div className="space-y-4 mt-4">
          {filteredOrders.length === 0 ? (
            <div className="text-center py-12 text-muted-foreground">
              <UtensilsCrossed className="h-12 w-12 mx-auto mb-4 opacity-50" />
              <p>No orders found.</p>
            </div>
          ) : (
            filteredOrders.map((order: any) => (
              <OrderCard
                key={order.id}
                order={order}
                onConfirmDelivery={() => handleConfirmDelivery(order)}
                getTime={getOrderTime}
                getStatusBadge={getStatusBadge}
                getStatusIcon={getStatusIcon}
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

interface OrderCardProps {
  order: any;
  onConfirmDelivery: () => void;
  getTime: (order: any) => string;
  getStatusBadge: (status: string) => React.ReactNode;
  getStatusIcon: (status: string) => React.ReactNode;
}

function OrderCard({ order, onConfirmDelivery, getTime, getStatusBadge, getStatusIcon }: OrderCardProps) {
  const isReady = order.status === "ready";
  const isCompleted = order.status === "completed";

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.2 }}
    >
      <Card className={`${isReady ? "border-green-500 border-2" : isCompleted ? "border-emerald-500 border-2" : ""}`}>
        <CardContent className="p-4">
          <div className="flex items-start justify-between mb-4">
            <div className="flex items-center gap-3">
              <div className={`p-2 rounded-full ${
                isReady ? "bg-green-100 text-green-600" : 
                isCompleted ? "bg-emerald-100 text-emerald-600" :
                order.status === "preparing" ? "bg-blue-100 text-blue-600" :
                "bg-yellow-100 text-yellow-600"
              }`}>
                {getStatusIcon(order.status)}
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h3 className="font-semibold">Order #{(order as any).orderNumber || order.id}</h3>
                  {getStatusBadge(order.status)}
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
            {isReady && (
              <Button size="lg" className="bg-green-600 hover:bg-green-700" onClick={onConfirmDelivery}>
                <CheckCircle className="h-4 w-4 mr-2" />
                Confirm as Delivered
              </Button>
            )}
            {isCompleted && (
              <Badge className="bg-emerald-600 text-white">
                <CheckCircle className="h-3 w-3 mr-1" />
                Delivered
              </Badge>
            )}
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
                <span className="text-muted-foreground">${(item.price * item.quantity).toFixed(2)}</span>
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
            <div className="font-bold text-lg">${order.total.toFixed(2)}</div>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
}