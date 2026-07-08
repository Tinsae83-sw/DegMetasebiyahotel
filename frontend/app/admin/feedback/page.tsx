"use client"

import { useState } from "react"
import { motion } from "framer-motion"
import { AdminLayout } from "@/components/layout/admin-layout"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Badge } from "@/components/ui/badge"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Search, Star, MessageSquare, Check, User, Filter } from "lucide-react"

interface Feedback {
  id: string
  customerName: string
  rating: number
  comment: string
  type: "review" | "complaint" | "suggestion"
  status: "pending" | "resolved"
  date: Date
  assignedTo?: string
}

const feedbackData: Feedback[] = [
  {
    id: "1",
    customerName: "John Smith",
    rating: 5,
    comment: "Excellent service! The food was delicious and the staff was very attentive. Will definitely come back.",
    type: "review",
    status: "pending",
    date: new Date("2024-01-15T14:30:00")
  },
  {
    id: "2",
    customerName: "Sarah Wilson",
    rating: 4,
    comment: "Great atmosphere and food. The only issue was the wait time for our main course.",
    type: "review",
    status: "pending",
    date: new Date("2024-01-15T13:15:00")
  },
  {
    id: "3",
    customerName: "Robert Brown",
    rating: 2,
    comment: "The food was cold when it arrived. The waiter seemed overwhelmed and forgot our drinks.",
    type: "complaint",
    status: "pending",
    date: new Date("2024-01-15T12:00:00")
  },
  {
    id: "4",
    customerName: "Lisa Anderson",
    rating: 5,
    comment: "Perfect dining experience! The steak was cooked to perfection and the wine selection was excellent.",
    type: "review",
    status: "resolved",
    date: new Date("2024-01-14T19:45:00"),
    assignedTo: "Mike Johnson"
  },
  {
    id: "5",
    customerName: "David Martinez",
    rating: 3,
    comment: "Suggestion: Add more vegetarian options to the menu. The current selection is limited.",
    type: "suggestion",
    status: "pending",
    date: new Date("2024-01-14T18:30:00")
  },
  {
    id: "6",
    customerName: "Emily Davis",
    rating: 1,
    comment: "Terrible experience. The manager was rude when we complained about the wrong order.",
    type: "complaint",
    status: "resolved",
    date: new Date("2024-01-13T20:00:00"),
    assignedTo: "Manager"
  }
]

const staffMembers = [
  { id: "1", name: "Mike Johnson" },
  { id: "2", name: "Emily Davis" },
  { id: "3", name: "Chris Lee" },
  { id: "4", name: "Sarah Wilson" }
]

export default function FeedbackPage() {
  const [search, setSearch] = useState("")
  const [typeFilter, setTypeFilter] = useState<string>("all")
  const [statusFilter, setStatusFilter] = useState<string>("all")
  const [selectedFeedback, setSelectedFeedback] = useState<Feedback | null>(null)
  const [showAssignDialog, setShowAssignDialog] = useState(false)
  const [assignedStaff, setAssignedStaff] = useState<string>("")

  const filteredFeedback = feedbackData.filter(feedback => {
    const matchesSearch = 
      feedback.customerName.toLowerCase().includes(search.toLowerCase()) ||
      feedback.comment.toLowerCase().includes(search.toLowerCase())
    const matchesType = typeFilter === "all" || feedback.type === typeFilter
    const matchesStatus = statusFilter === "all" || feedback.status === statusFilter
    return matchesSearch && matchesType && matchesStatus
  })

  const getTypeColor = (type: string) => {
    switch (type) {
      case "review":
        return "bg-green-500"
      case "complaint":
        return "bg-red-500"
      case "suggestion":
        return "bg-blue-500"
      default:
        return "bg-gray-500"
    }
  }

  const getStatusColor = (status: string) => {
    return status === "resolved" ? "bg-green-500" : "bg-yellow-500"
  }

  const formatDate = (date: Date) => {
    return date.toLocaleString("en-US", {
      month: "short",
      day: "numeric",
      hour: "numeric",
      minute: "2-digit",
      hour12: true
    })
  }

  const handleMarkResolved = (feedbackId: string) => {
    // In a real app, this would call the API
    console.log("Marking feedback as resolved:", feedbackId)
  }

  const handleAssignStaff = () => {
    // In a real app, this would call the API
    console.log("Assigning staff:", { feedbackId: selectedFeedback?.id, staffId: assignedStaff })
    setShowAssignDialog(false)
  }

  return (
    <AdminLayout>
      <div className="space-y-6">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
          Customer Feedback
        </h1>
        <p className="text-gray-600 dark:text-gray-400">
          Manage customer reviews, complaints, and suggestions
        </p>
      </motion.div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.1 }}
      >
        <Card>
          <CardHeader>
            <CardTitle>Feedback</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex flex-wrap gap-4 mb-6">
              <div className="flex-1 min-w-[200px]">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                  <Input
                    placeholder="Search feedback..."
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    className="pl-10"
                  />
                </div>
              </div>
              <Select value={typeFilter} onValueChange={setTypeFilter}>
                <SelectTrigger className="w-[180px]">
                  <SelectValue placeholder="Type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Types</SelectItem>
                  <SelectItem value="review">Reviews</SelectItem>
                  <SelectItem value="complaint">Complaints</SelectItem>
                  <SelectItem value="suggestion">Suggestions</SelectItem>
                </SelectContent>
              </Select>
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger className="w-[180px]">
                  <SelectValue placeholder="Status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Status</SelectItem>
                  <SelectItem value="pending">Pending</SelectItem>
                  <SelectItem value="resolved">Resolved</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Customer</TableHead>
                  <TableHead>Type</TableHead>
                  <TableHead>Rating</TableHead>
                  <TableHead>Comment</TableHead>
                  <TableHead>Date</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Assigned To</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredFeedback.map((feedback) => (
                  <TableRow key={feedback.id}>
                    <TableCell className="font-medium">{feedback.customerName}</TableCell>
                    <TableCell>
                      <Badge className={getTypeColor(feedback.type)}>
                        {feedback.type}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-1">
                        {[...Array(5)].map((_, i) => (
                          <Star
                            key={i}
                            className={`h-4 w-4 ${
                              i < feedback.rating
                                ? "fill-yellow-400 text-yellow-400"
                                : "text-gray-300"
                            }`}
                          />
                        ))}
                      </div>
                    </TableCell>
                    <TableCell className="max-w-xs truncate">
                      {feedback.comment}
                    </TableCell>
                    <TableCell>{formatDate(feedback.date)}</TableCell>
                    <TableCell>
                      <Badge className={getStatusColor(feedback.status)}>
                        {feedback.status}
                      </Badge>
                    </TableCell>
                    <TableCell>{feedback.assignedTo || "-"}</TableCell>
                    <TableCell className="text-right">
                      <div className="flex items-center justify-end gap-2">
                        {feedback.status === "pending" && (
                          <>
                            <Button
                              variant="ghost"
                              size="icon"
                              onClick={() => {
                                setSelectedFeedback(feedback)
                                setShowAssignDialog(true)
                              }}
                            >
                              <User className="h-4 w-4" />
                            </Button>
                            <Button
                              variant="ghost"
                              size="icon"
                              onClick={() => handleMarkResolved(feedback.id)}
                            >
                              <Check className="h-4 w-4 text-green-500" />
                            </Button>
                          </>
                        )}
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      </motion.div>

      {/* Assign Staff Dialog */}
      <Dialog open={showAssignDialog} onOpenChange={setShowAssignDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Assign Follow-up</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <p className="text-gray-600 dark:text-gray-400">
              Assign a staff member to follow up on this feedback from {selectedFeedback?.customerName}.
            </p>
            <Select value={assignedStaff} onValueChange={setAssignedStaff}>
              <SelectTrigger>
                <SelectValue placeholder="Select staff member" />
              </SelectTrigger>
              <SelectContent>
                {staffMembers.map((staff) => (
                  <SelectItem key={staff.id} value={staff.id}>
                    {staff.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <div className="flex justify-end gap-2">
              <Button variant="outline" onClick={() => setShowAssignDialog(false)}>
                Cancel
              </Button>
              <Button onClick={handleAssignStaff}>
                Assign
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
      </div>
    </AdminLayout>
  )
}
