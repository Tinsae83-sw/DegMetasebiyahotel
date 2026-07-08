import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Printer, Download, Mail } from "lucide-react"
import type { Receipt } from "@/types/cashier"
import { format } from "date-fns"

interface ReceiptViewerProps {
  receipt: Receipt
  onPrint: () => void
  onDownload: () => void
  onEmail: (email: string) => void
}

export function ReceiptViewer({ receipt, onPrint, onDownload, onEmail }: ReceiptViewerProps) {
  return (
    <Card className="max-w-md mx-auto">
      <CardContent className="p-6">
        <div className="text-center mb-6">
          {receipt.restaurantInfo.logo && (
            <img
              src={receipt.restaurantInfo.logo}
              alt={receipt.restaurantInfo.name}
              className="h-16 mx-auto mb-2"
            />
          )}
          <h2 className="text-xl font-bold">{receipt.restaurantInfo.name}</h2>
          <p className="text-sm text-muted-foreground">{receipt.restaurantInfo.address}</p>
          <p className="text-sm text-muted-foreground">{receipt.restaurantInfo.phone}</p>
        </div>

        <div className="border-t border-b py-4 mb-4 space-y-2">
          <div className="flex justify-between text-sm">
            <span className="text-muted-foreground">Receipt #</span>
            <span className="font-medium">{receipt.receiptNumber}</span>
          </div>
          <div className="flex justify-between text-sm">
            <span className="text-muted-foreground">Date</span>
            <span className="font-medium">{format(new Date(receipt.date), "PPP p")}</span>
          </div>
          <div className="flex justify-between text-sm">
            <span className="text-muted-foreground">Cashier</span>
            <span className="font-medium">{receipt.cashierName}</span>
          </div>
          <div className="flex justify-between text-sm">
            <span className="text-muted-foreground">Table</span>
            <span className="font-medium">{receipt.tableNumber}</span>
          </div>
          {receipt.customerName && (
            <div className="flex justify-between text-sm">
              <span className="text-muted-foreground">Customer</span>
              <span className="font-medium">{receipt.customerName}</span>
            </div>
          )}
        </div>

        <div className="mb-4">
          <h3 className="font-semibold mb-2">Items</h3>
          <div className="space-y-2">
            {receipt.items.map((item, index) => (
              <div key={index} className="flex justify-between text-sm">
                <div className="flex-1">
                  <span>{item.quantity}x </span>
                  <span>{item.name}</span>
                </div>
                <span className="font-medium">${item.total.toFixed(2)}</span>
              </div>
            ))}
          </div>
        </div>

        <div className="border-t pt-4 space-y-2">
          <div className="flex justify-between text-sm">
            <span>Subtotal</span>
            <span>${receipt.subtotal.toFixed(2)}</span>
          </div>
          <div className="flex justify-between text-sm">
            <span>Tax</span>
            <span>${receipt.tax.toFixed(2)}</span>
          </div>
          <div className="flex justify-between text-sm">
            <span>Service Charge</span>
            <span>${receipt.serviceCharge.toFixed(2)}</span>
          </div>
          {receipt.discount > 0 && (
            <div className="flex justify-between text-sm text-green-600">
              <span>Discount</span>
              <span>-${receipt.discount.toFixed(2)}</span>
            </div>
          )}
          <div className="flex justify-between font-bold text-lg pt-2 border-t">
            <span>Total</span>
            <span>${receipt.grandTotal.toFixed(2)}</span>
          </div>
        </div>

        <div className="border-t pt-4 mt-4 space-y-2">
          <div className="flex justify-between text-sm">
            <span className="text-muted-foreground">Payment Method</span>
            <span className="font-medium">{receipt.paymentMethod}</span>
          </div>
          <div className="flex justify-between text-sm">
            <span className="text-muted-foreground">Amount Paid</span>
            <span className="font-medium">${receipt.amountPaid.toFixed(2)}</span>
          </div>
          {receipt.changeReturned > 0 && (
            <div className="flex justify-between text-sm text-green-600">
              <span>Change</span>
              <span className="font-medium">${receipt.changeReturned.toFixed(2)}</span>
            </div>
          )}
        </div>

        <div className="flex gap-2 mt-6">
          <Button variant="outline" size="sm" className="flex-1" onClick={onPrint}>
            <Printer className="h-4 w-4 mr-2" />
            Print
          </Button>
          <Button variant="outline" size="sm" className="flex-1" onClick={onDownload}>
            <Download className="h-4 w-4 mr-2" />
            Download
          </Button>
          <Button variant="outline" size="sm" className="flex-1" onClick={() => onEmail("")}>
            <Mail className="h-4 w-4 mr-2" />
            Email
          </Button>
        </div>
      </CardContent>
    </Card>
  )
}
