import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { DollarSign, FileText, CreditCard } from "lucide-react"
import type { Bill } from "@/types/cashier"
import { format } from "date-fns"

interface BillCardProps {
  bill: Bill
  onViewDetails: (bill: Bill) => void
  onGenerateInvoice: (bill: Bill) => void
  onProcessPayment: (bill: Bill) => void
}

export function BillCard({ bill, onViewDetails, onGenerateInvoice, onProcessPayment }: BillCardProps) {
  const getStatusColor = (status: string) => {
    switch (status) {
      case "pending":
        return "bg-yellow-500"
      case "paid":
        return "bg-green-500"
      case "refunded":
        return "bg-red-500"
      default:
        return "bg-gray-500"
    }
  }

  return (
    <Card className="border-l-4 border-l-yellow-500 hover:shadow-lg transition-shadow">
      <CardHeader>
        <div className="flex items-start justify-between">
          <div>
            <CardTitle className="text-xl">Table {bill.tableNumber}</CardTitle>
            <p className="text-sm text-muted-foreground mt-1">
              Order #{bill.orderNumber}
            </p>
          </div>
          <Badge className={getStatusColor(bill.paymentStatus)}>
            {bill.paymentStatus.toUpperCase()}
          </Badge>
        </div>
      </CardHeader>
      <CardContent>
        <div className="space-y-2 mb-4">
          <div className="flex justify-between text-sm">
            <span className="text-muted-foreground">Customer</span>
            <span className="font-medium">{bill.customerName || "Guest"}</span>
          </div>
          <div className="flex justify-between text-sm">
            <span className="text-muted-foreground">Waiter</span>
            <span className="font-medium">{bill.waiterName}</span>
          </div>
          <div className="flex justify-between text-sm">
            <span className="text-muted-foreground">Order Time</span>
            <span className="font-medium">{format(new Date(bill.orderTime), "HH:mm")}</span>
          </div>
        </div>

        <div className="border-t pt-3 space-y-1 mb-4">
          <div className="flex justify-between text-sm">
            <span>Subtotal</span>
            <span>${bill.subtotal.toFixed(2)}</span>
          </div>
          {bill.discount > 0 && (
            <div className="flex justify-between text-sm text-green-600">
              <span>Discount</span>
              <span>-${bill.discount.toFixed(2)}</span>
            </div>
          )}
          <div className="flex justify-between text-sm">
            <span>Tax</span>
            <span>${bill.tax.toFixed(2)}</span>
          </div>
          <div className="flex justify-between text-sm">
            <span>Service Charge</span>
            <span>${bill.serviceCharge.toFixed(2)}</span>
          </div>
          <div className="flex justify-between font-bold text-lg">
            <span>Total</span>
            <span>${bill.totalAmount.toFixed(2)}</span>
          </div>
        </div>

        <div className="flex gap-2">
          <Button
            variant="outline"
            size="sm"
            className="flex-1"
            onClick={() => onViewDetails(bill)}
          >
            <FileText className="h-4 w-4 mr-2" />
            View
          </Button>
          <Button
            variant="outline"
            size="sm"
            className="flex-1"
            onClick={() => onGenerateInvoice(bill)}
          >
            <FileText className="h-4 w-4 mr-2" />
            Invoice
          </Button>
          <Button
            size="sm"
            className="flex-1"
            onClick={() => onProcessPayment(bill)}
          >
            <DollarSign className="h-4 w-4 mr-2" />
            Pay
          </Button>
        </div>
      </CardContent>
    </Card>
  )
}
