import { Badge } from "@/components/ui/badge"
import { CheckCircle, XCircle, Clock, AlertCircle } from "lucide-react"

interface PaymentStatusBadgeProps {
  status: "completed" | "failed" | "pending" | "refunded"
}

export function PaymentStatusBadge({ status }: PaymentStatusBadgeProps) {
  const getStatusConfig = () => {
    switch (status) {
      case "completed":
        return {
          variant: "default" as const,
          className: "bg-green-500 hover:bg-green-600",
          icon: CheckCircle,
          label: "Completed",
        }
      case "failed":
        return {
          variant: "destructive" as const,
          className: "",
          icon: XCircle,
          label: "Failed",
        }
      case "pending":
        return {
          variant: "secondary" as const,
          className: "bg-yellow-500 hover:bg-yellow-600 text-white",
          icon: Clock,
          label: "Pending",
        }
      case "refunded":
        return {
          variant: "outline" as const,
          className: "border-red-500 text-red-600",
          icon: AlertCircle,
          label: "Refunded",
        }
      default:
        return {
          variant: "secondary" as const,
          className: "",
          icon: Clock,
          label: "Unknown",
        }
    }
  }

  const config = getStatusConfig()
  const Icon = config.icon

  return (
    <Badge variant={config.variant} className={config.className}>
      <Icon className="h-3 w-3 mr-1" />
      {config.label}
    </Badge>
  )
}
