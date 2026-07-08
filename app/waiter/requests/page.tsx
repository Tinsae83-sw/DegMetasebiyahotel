"use client"

import { useState, useEffect } from "react"
import { WaiterLayout } from "@/components/layout/waiter-layout"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { 
  Bell, 
  Clock, 
  Users, 
  Check, 
  X, 
  Eye, 
  AlertCircle,
  RefreshCw,
  Filter
} from "lucide-react"
import { toast } from "sonner"
import { useCustomerRequests } from "@/hooks/waiter/use-customer-requests"
import { useTables } from "@/hooks/use-tables"
import { useSocket } from "@/hooks/use-socket"
import { CustomerRequestCard } from "@/components/waiter/customer-request-card"
import { CustomerRequest, RequestType, RequestStatus } from "@/types/waiter"
import { format, differenceInMinutes } from "date-fns"

export default function CustomerRequestsPage() {
  const { requests, acceptRequest, completeRequest, ignoreRequest, refetch } = useCustomerRequests()
  const { tables } = useTables()
  const { socket, connected } = useSocket()
  
  const [searchQuery, setSearchQuery] = useState("")
  const [typeFilter, setTypeFilter] = useState<RequestType | "all">("all")
  const [statusFilter, setStatusFilter] = useState<RequestStatus | "all">("all")
  const [selectedRequest, setSelectedRequest] = useState<CustomerRequest | null>(null)

  const requestsData = requests.data || []
  const tablesData = tables.data || []

  // Socket.IO real-time updates
  useEffect(() => {
    if (!socket) return

    const handleNewRequest = (data: CustomerRequest) => {
      console.log('New customer request:', data)
      refetch()
      toast.success(`New request from Table ${data.tableNumber}`)
    }

    const handleRequestUpdate = (data: CustomerRequest) => {
      console.log('Request updated:', data)
      refetch()
    }

    socket.on('customer-request:new', handleNewRequest)
    socket.on('customer-request:updated', handleRequestUpdate)

    return () => {
      socket.off('customer-request:new', handleNewRequest)
      socket.off('customer-request:updated', handleRequestUpdate)
    }
  }, [socket, refetch])

  // Filter requests
  const filteredRequests = requestsData.filter(request => {
    const matchesSearch = 
      request.tableNumber.toString().includes(searchQuery) ||
      request.notes?.toLowerCase().includes(searchQuery.toLowerCase())
    
    const matchesType = typeFilter === 'all' || request.type === typeFilter
    const matchesStatus = statusFilter === 'all' || request.status === statusFilter

    return matchesSearch && matchesType && matchesStatus
  })

  // Group requests by status
  const pendingRequests = filteredRequests.filter(r => r.status === 'pending')
  const acceptedRequests = filteredRequests.filter(r => r.status === 'accepted')
  const completedRequests = filteredRequests.filter(r => r.status === 'completed')
  const ignoredRequests = filteredRequests.filter(r => r.status === 'ignored')

  const getRequestTime = (request: CustomerRequest) => {
    const created = new Date(request.createdAt)
    const now = new Date()
    const minutes = differenceInMinutes(now, created)
    
    if (minutes < 1) return 'Just now'
    if (minutes < 60) return `${minutes}m ago`
    return format(created, 'HH:mm')
  }

  const handleAccept = (request: CustomerRequest) => {
    acceptRequest.mutate(request.id)
  }

  const handleComplete = (request: CustomerRequest) => {
    completeRequest.mutate(request.id)
    setSelectedRequest(null)
  }

  const handleIgnore = (request: CustomerRequest) => {
    ignoreRequest.mutate(request.id)
  }

  const handleViewTable = (request: CustomerRequest) => {
    window.location.href = `/waiter/tables`
  }

  return (
    <WaiterLayout>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold">Customer Requests</h1>
            <p className="text-muted-foreground">Manage customer requests in real-time</p>
          </div>
          <div className="flex items-center gap-2">
            <div className={`flex items-center gap-2 px-3 py-1 rounded-full text-sm ${
              connected ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'
            }`}>
              <div className={`w-2 h-2 rounded-full ${connected ? 'bg-green-500' : 'bg-red-500'}`} />
              {connected ? 'Connected' : 'Disconnected'}
            </div>
            <Button variant="outline" size="sm" onClick={() => refetch()}>
              <RefreshCw className="h-4 w-4 mr-2" />
              Refresh
            </Button>
          </div>
        </div>

        {/* Connection Status */}
        {!connected && (
          <Card className="border-red-500 bg-red-50">
            <CardContent className="p-4 flex items-center gap-2">
              <AlertCircle className="h-5 w-5 text-red-500" />
              <span className="text-sm text-red-700">
                Real-time connection lost. New requests may be delayed.
              </span>
            </CardContent>
          </Card>
        )}

        {/* Search and Filter */}
        <Card>
          <CardContent className="p-4">
            <div className="flex gap-4">
              <div className="flex-1 relative">
                <Bell className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search requests..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10"
                />
              </div>
              <Select value={typeFilter} onValueChange={(value: any) => setTypeFilter(value)}>
                <SelectTrigger className="w-[180px]">
                  <Filter className="h-4 w-4 mr-2" />
                  <SelectValue placeholder="Request Type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Types</SelectItem>
                  <SelectItem value="CALL_WAITER">Call Waiter</SelectItem>
                  <SelectItem value="REQUEST_BILL">Request Bill</SelectItem>
                  <SelectItem value="WATER_REQUEST">Water Request</SelectItem>
                  <SelectItem value="EXTRA_CUTLERY">Extra Cutlery</SelectItem>
                  <SelectItem value="COMPLAINT">Complaint</SelectItem>
                  <SelectItem value="SPECIAL_ASSISTANCE">Special Assistance</SelectItem>
                </SelectContent>
              </Select>
              <Select value={statusFilter} onValueChange={(value: any) => setStatusFilter(value)}>
                <SelectTrigger className="w-[180px]">
                  <SelectValue placeholder="Status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Status</SelectItem>
                  <SelectItem value="pending">Pending</SelectItem>
                  <SelectItem value="accepted">Accepted</SelectItem>
                  <SelectItem value="completed">Completed</SelectItem>
                  <SelectItem value="ignored">Ignored</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </CardContent>
        </Card>

        {/* Request Statistics */}
        <div className="grid gap-4 md:grid-cols-4">
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium">Pending</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-yellow-600">{pendingRequests.length}</div>
              <p className="text-xs text-muted-foreground">Awaiting response</p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium">Accepted</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-blue-600">{acceptedRequests.length}</div>
              <p className="text-xs text-muted-foreground">In progress</p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium">Completed</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-green-600">{completedRequests.length}</div>
              <p className="text-xs text-muted-foreground">Resolved</p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium">Ignored</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-gray-600">{ignoredRequests.length}</div>
              <p className="text-xs text-muted-foreground">Dismissed</p>
            </CardContent>
          </Card>
        </div>

        {/* Urgent Requests Alert */}
        {pendingRequests.length > 0 && (
          <Card className="border-red-500 bg-red-50">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-red-700">
                <AlertCircle className="h-5 w-5" />
                Urgent Requests ({pendingRequests.length})
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                {pendingRequests.slice(0, 6).map(request => (
                  <CustomerRequestCard
                    key={request.id}
                    request={request}
                    onAccept={() => handleAccept(request)}
                    onComplete={() => handleComplete(request)}
                    onIgnore={() => handleIgnore(request)}
                    onView={() => handleViewTable(request)}
                  />
                ))}
              </div>
            </CardContent>
          </Card>
        )}

        {/* Requests by Status Tabs */}
        <Tabs defaultValue="pending" className="space-y-4">
          <TabsList>
            <TabsTrigger value="pending">Pending ({pendingRequests.length})</TabsTrigger>
            <TabsTrigger value="accepted">Accepted ({acceptedRequests.length})</TabsTrigger>
            <TabsTrigger value="completed">Completed ({completedRequests.length})</TabsTrigger>
            <TabsTrigger value="ignored">Ignored ({ignoredRequests.length})</TabsTrigger>
          </TabsList>

          <TabsContent value="pending" className="space-y-4">
            {pendingRequests.length === 0 ? (
              <Card>
                <CardContent className="p-8 text-center text-muted-foreground">
                  <Bell className="h-12 w-12 mx-auto mb-4 opacity-50" />
                  <p>No pending requests</p>
                </CardContent>
              </Card>
            ) : (
              <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                {pendingRequests.map(request => (
                  <CustomerRequestCard
                    key={request.id}
                    request={request}
                    onAccept={() => handleAccept(request)}
                    onComplete={() => handleComplete(request)}
                    onIgnore={() => handleIgnore(request)}
                    onView={() => handleViewTable(request)}
                  />
                ))}
              </div>
            )}
          </TabsContent>

          <TabsContent value="accepted" className="space-y-4">
            {acceptedRequests.length === 0 ? (
              <Card>
                <CardContent className="p-8 text-center text-muted-foreground">
                  No accepted requests
                </CardContent>
              </Card>
            ) : (
              <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                {acceptedRequests.map(request => (
                  <CustomerRequestCard
                    key={request.id}
                    request={request}
                    onComplete={() => handleComplete(request)}
                    onView={() => handleViewTable(request)}
                  />
                ))}
              </div>
            )}
          </TabsContent>

          <TabsContent value="completed" className="space-y-4">
            {completedRequests.length === 0 ? (
              <Card>
                <CardContent className="p-8 text-center text-muted-foreground">
                  No completed requests
                </CardContent>
              </Card>
            ) : (
              <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                {completedRequests.map(request => (
                  <CustomerRequestCard
                    key={request.id}
                    request={request}
                    showActions={false}
                  />
                ))}
              </div>
            )}
          </TabsContent>

          <TabsContent value="ignored" className="space-y-4">
            {ignoredRequests.length === 0 ? (
              <Card>
                <CardContent className="p-8 text-center text-muted-foreground">
                  No ignored requests
                </CardContent>
              </Card>
            ) : (
              <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                {ignoredRequests.map(request => (
                  <CustomerRequestCard
                    key={request.id}
                    request={request}
                    showActions={false}
                  />
                ))}
              </div>
            )}
          </TabsContent>
        </Tabs>
      </div>
    </WaiterLayout>
  )
}
