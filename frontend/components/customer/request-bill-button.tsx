"use client"

import { useEffect, useState } from "react"
import { motion } from "framer-motion"
import { Button } from "@/components/ui/button"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Receipt, Loader2 } from "lucide-react"
import { toast } from "sonner"
import { useSearchParams } from "next/navigation"
import axios from "axios"
import TableSelectionModal from "./table-selection-modal"

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3001/api"

export default function RequestBillButton() {
  const [isOpen, setIsOpen] = useState(false)
  const [isRequesting, setIsRequesting] = useState(false)
  const [showTableSelection, setShowTableSelection] = useState(false)
  const searchParams = useSearchParams()
  const [resolvedTableId, setResolvedTableId] = useState<string | null>(null)

  useEffect(() => {
    const fromQuery = searchParams.get("tableId") || searchParams.get("table")
    const fromStorage = typeof window !== "undefined" ? window.localStorage.getItem("tableId") : null
    const nextTableId = fromQuery || fromStorage
    
    // If tableId is in query, save it to storage
    if (fromQuery) {
      window.localStorage.setItem("tableId", fromQuery)
      setResolvedTableId(fromQuery)
    } else if (fromStorage) {
      setResolvedTableId(fromStorage)
    } else {
      setResolvedTableId(null)
    }
  }, [searchParams])

  const handleRequestBill = async () => {
    if (!resolvedTableId) {
      setShowTableSelection(true)
      return
    }

    setIsRequesting(true)
    try {
      await axios.post(`${API_URL}/customer-requests/public`, {
        tableId: resolvedTableId,
        type: 'REQUEST_BILL',
        notes: 'Customer is requesting the bill'
      })
      toast.success("Bill request sent to cashier. They will bring it shortly.")
      setIsOpen(false)
    } catch (error) {
      toast.error("Failed to request bill. Please try again.")
    } finally {
      setIsRequesting(false)
    }
  }

  const handleTableSelected = (tableId: string) => {
    setResolvedTableId(tableId)
  }

  return (
    <>
      <motion.div
        initial={{ scale: 0 }}
        animate={{ scale: 1 }}
        transition={{ delay: 0.1 }}
        className="fixed bottom-8 right-4 md:right-8 z-40"
      >
        <Button
          size="lg"
          className="rounded-full shadow-lg bg-green-500 hover:bg-green-600 h-16 w-16 md:h-auto md:w-auto md:px-6"
          onClick={() => setIsOpen(true)}
        >
          <Receipt className="h-6 w-6 md:mr-2" />
          <span className="hidden md:inline">Request Bill</span>
        </Button>
      </motion.div>

      <Dialog open={isOpen} onOpenChange={setIsOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Receipt className="h-5 w-5 text-green-500" />
              Request Bill
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <p className="text-gray-600 dark:text-gray-400">
              Are you sure you want to request the bill? The cashier will be notified and will bring it to your table shortly.
            </p>
            {resolvedTableId && (
              <p className="text-sm text-gray-500 dark:text-gray-500">
                Table ID: {resolvedTableId}
              </p>
            )}
            <div className="flex gap-3 pt-4">
              <Button
                variant="outline"
                onClick={() => setIsOpen(false)}
                disabled={isRequesting}
                className="flex-1"
              >
                Cancel
              </Button>
              <Button
                onClick={handleRequestBill}
                disabled={isRequesting}
                className="flex-1 bg-green-600 hover:bg-green-700"
              >
                {isRequesting ? (
                  <>
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    Requesting...
                  </>
                ) : (
                  <>
                    <Receipt className="h-4 w-4 mr-2" />
                    Request Bill
                  </>
                )}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      <TableSelectionModal
        isOpen={showTableSelection}
        onClose={() => setShowTableSelection(false)}
        onTableSelected={handleTableSelected}
      />
    </>
  )
}
