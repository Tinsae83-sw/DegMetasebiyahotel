import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Wallet, CreditCard, DollarSign, Loader2 } from "lucide-react"

interface PaymentFormProps {
  totalAmount: number
  isProcessing: boolean
  onSubmit: (data: { paymentMethod: string; cashReceived?: number }) => void
  onCancel: () => void
}

export function PaymentForm({ totalAmount, isProcessing, onSubmit, onCancel }: PaymentFormProps) {
  const [paymentMethod, setPaymentMethod] = useState("cash")
  const [cashReceived, setCashReceived] = useState("")

  const calculateChange = () => {
    if (paymentMethod !== "cash") return 0
    const received = parseFloat(cashReceived) || 0
    return Math.max(0, received - totalAmount)
  }

  const handleSubmit = () => {
    if (paymentMethod === "cash" && parseFloat(cashReceived) < totalAmount) {
      return
    }
    onSubmit({
      paymentMethod,
      cashReceived: paymentMethod === "cash" ? parseFloat(cashReceived) : undefined,
    })
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Process Payment</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="text-center py-4 bg-gray-50 rounded-lg">
          <p className="text-sm text-muted-foreground">Total Amount</p>
          <p className="text-3xl font-bold">${totalAmount.toFixed(2)}</p>
        </div>

        <div className="space-y-2">
          <Label>Payment Method</Label>
          <Select value={paymentMethod} onValueChange={setPaymentMethod}>
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="cash">
                <div className="flex items-center gap-2">
                  <Wallet className="h-4 w-4" />
                  Cash
                </div>
              </SelectItem>
              <SelectItem value="credit_card">
                <div className="flex items-center gap-2">
                  <CreditCard className="h-4 w-4" />
                  Credit Card
                </div>
              </SelectItem>
              <SelectItem value="debit_card">
                <div className="flex items-center gap-2">
                  <CreditCard className="h-4 w-4" />
                  Debit Card
                </div>
              </SelectItem>
              <SelectItem value="chapa">
                <div className="flex items-center gap-2">
                  <DollarSign className="h-4 w-4" />
                  Chapa
                </div>
              </SelectItem>
            </SelectContent>
          </Select>
        </div>

        {paymentMethod === "cash" && (
          <div className="space-y-2">
            <Label>Cash Received</Label>
            <Input
              type="number"
              step="0.01"
              value={cashReceived}
              onChange={(e) => setCashReceived(e.target.value)}
              placeholder="Enter amount received"
            />
            {parseFloat(cashReceived) >= totalAmount && (
              <div className="text-green-600 font-semibold text-center py-2 bg-green-50 rounded-lg">
                Change: ${calculateChange().toFixed(2)}
              </div>
            )}
          </div>
        )}

        <div className="flex gap-2 pt-4">
          <Button variant="outline" onClick={onCancel} className="flex-1" disabled={isProcessing}>
            Cancel
          </Button>
          <Button
            onClick={handleSubmit}
            disabled={isProcessing || (paymentMethod === "cash" && parseFloat(cashReceived) < totalAmount)}
            className="flex-1"
          >
            {isProcessing && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
            Process Payment
          </Button>
        </div>
      </CardContent>
    </Card>
  )
}
