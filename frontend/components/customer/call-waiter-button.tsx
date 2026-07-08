"use client"

import { useEffect, useState } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { Button } from "@/components/ui/button"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Bell, Loader2 } from "lucide-react"
import { toast } from "sonner"
import { useSearchParams } from "next/navigation"
import axios from "axios"
import TableSelectionModal from "./table-selection-modal"

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3001/api"

export default function CallWaiterButton() {
  const [isOpen, setIsOpen] = useState(false)
  const [isCalling, setIsCalling] = useState(false)
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

  const handleCallWaiter = async () => {
    if (!resolvedTableId) {
      setShowTableSelection(true)
      return
    }

    setIsCalling(true)
    try {
      await axios.post(`${API_URL}/customer-requests/public`, {
        tableId: resolvedTableId,
        type: 'CALL_WAITER',
        notes: 'Customer is requesting waiter assistance'
      })
      toast.success("Waiter has been called. They will be with you shortly.")
      setIsOpen(false)
    } catch (error) {
      toast.error("Failed to call waiter. Please try again.")
    } finally {
      setIsCalling(false)
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
        className="fixed bottom-24 right-4 md:right-8 z-40"
      >
        <Button
          size="lg"
          className="rounded-full shadow-lg bg-amber-500 hover:bg-amber-600 h-16 w-16 md:h-auto md:w-auto md:px-6"
          onClick={() => setIsOpen(true)}
        >
          <Bell className="h-6 w-6 md:mr-2" />
          <span className="hidden md:inline">Call Waiter</span>
        </Button>
      </motion.div>

      <Dialog open={isOpen} onOpenChange={setIsOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Bell className="h-5 w-5 text-amber-500" />
              Call Waiter
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <p className="text-gray-600 dark:text-gray-400">
              Are you sure you want to call a waiter? They will be notified and will come to your table shortly.
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
                disabled={isCalling}
                className="flex-1"
              >
                Cancel
              </Button>
              <Button
                onClick={handleCallWaiter}
                disabled={isCalling}
                className="flex-1 bg-amber-600 hover:bg-amber-700"
              >
                {isCalling ? (
                  <>
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    Calling...
                  </>
                ) : (
                  <>
                    <Bell className="h-4 w-4 mr-2" />
                    Call Waiter
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
