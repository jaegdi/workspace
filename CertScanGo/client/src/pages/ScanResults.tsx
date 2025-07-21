import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Checkbox } from "@/components/ui/checkbox"
import {
  Search,
  Download,
  Filter,
  RefreshCw,
  CheckCircle,
  AlertTriangle,
  XCircle,
  Calendar,
  Server,
  FileText
} from "lucide-react"
import { getScanResults, exportResults, exportSingleCertificate } from "@/api/certificates"
import { useToast } from "@/hooks/useToast"

export function ScanResults() {
  const [results, setResults] = useState([])
  const [filteredResults, setFilteredResults] = useState([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState("")
  const [statusFilter, setStatusFilter] = useState("all")
  const [clusterFilter, setClusterFilter] = useState("all")
  const [selectedCertificates, setSelectedCertificates] = useState(new Set())
  const [exporting, setExporting] = useState(false)
  const { toast } = useToast()

  const loadResults = async () => {
    try {
      setLoading(true)
      console.log("Loading scan results...")
      const data = await getScanResults()
      setResults(data.certificates)
      setFilteredResults(data.certificates)
      console.log("Scan results loaded successfully")
    } catch (error) {
      console.error("Error loading scan results:", error)
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive"
      })
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadResults()
  }, [])

  useEffect(() => {
    let filtered = results

    if (searchTerm) {
      filtered = filtered.filter(cert =>
        cert.objectName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        cert.namespace.toLowerCase().includes(searchTerm.toLowerCase()) ||
        cert.clusterName.toLowerCase().includes(searchTerm.toLowerCase())
      )
    }

    if (statusFilter !== "all") {
      filtered = filtered.filter(cert => cert.status === statusFilter)
    }

    if (clusterFilter !== "all") {
      filtered = filtered.filter(cert => cert.clusterName === clusterFilter)
    }

    setFilteredResults(filtered)

    // Clear selected certificates that are no longer visible
    setSelectedCertificates(prev => {
      const newSelected = new Set()
      const visibleIds = new Set(filtered.map(cert => cert._id))
      prev.forEach(id => {
        if (visibleIds.has(id)) {
          newSelected.add(id)
        }
      })
      return newSelected
    })
  }, [results, searchTerm, statusFilter, clusterFilter])

  const handleBulkExport = async () => {
    try {
      if (selectedCertificates.size === 0) {
        toast({
          title: "No Selection",
          description: "Please select certificates to export",
          variant: "destructive"
        })
        return
      }

      setExporting(true)
      console.log("Exporting selected certificates...")

      await exportResults({
        format: "json",
        certificateIds: Array.from(selectedCertificates)
      })

      toast({
        title: "Success",
        description: `Exported ${selectedCertificates.size} certificates successfully`
      })
    } catch (error) {
      console.error("Error exporting certificates:", error)
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive"
      })
    } finally {
      setExporting(false)
    }
  }

  const handleExportAll = async () => {
    try {
      setExporting(true)
      console.log("Exporting all results...")

      await exportResults({
        format: "json",
        filters: {
          status: statusFilter !== "all" ? statusFilter : undefined,
          cluster: clusterFilter !== "all" ? clusterFilter : undefined,
          search: searchTerm || undefined
        }
      })

      toast({
        title: "Success",
        description: "All results exported successfully"
      })
    } catch (error) {
      console.error("Error exporting results:", error)
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive"
      })
    } finally {
      setExporting(false)
    }
  }

  const handleSingleExport = async (certificateId) => {
    try {
      console.log("Exporting single certificate:", certificateId)

      await exportSingleCertificate(certificateId)

      toast({
        title: "Success",
        description: "Certificate exported successfully"
      })
    } catch (error) {
      console.error("Error exporting certificate:", error)
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive"
      })
    }
  }

  const handleSelectAll = (checked) => {
    if (checked) {
      setSelectedCertificates(new Set(filteredResults.map(cert => cert._id)))
    } else {
      setSelectedCertificates(new Set())
    }
  }

  const handleSelectCertificate = (certificateId, checked) => {
    setSelectedCertificates(prev => {
      const newSelected = new Set(prev)
      if (checked) {
        newSelected.add(certificateId)
      } else {
        newSelected.delete(certificateId)
      }
      return newSelected
    })
  }

  const getStatusIcon = (status) => {
    switch (status) {
      case 'OK':
        return <CheckCircle className="h-4 w-4 text-green-500" />
      case 'WARNING':
        return <AlertTriangle className="h-4 w-4 text-yellow-500" />
      case 'EXPIRED':
        return <XCircle className="h-4 w-4 text-red-500" />
      default:
        return <AlertTriangle className="h-4 w-4 text-gray-500" />
    }
  }

  const getStatusBadge = (status) => {
    switch (status) {
      case 'OK':
        return <Badge className="bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300">OK</Badge>
      case 'WARNING':
        return <Badge className="bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-300">Warning</Badge>
      case 'EXPIRED':
        return <Badge className="bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300">Expired</Badge>
      default:
        return <Badge variant="secondary">Unknown</Badge>
    }
  }

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    })
  }

  const getDaysRemaining = (expiryDate) => {
    const now = new Date()
    const expiry = new Date(expiryDate)
    const diffTime = expiry - now
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24))
    return diffDays
  }

  const uniqueClusters = [...new Set(results.map(cert => cert.clusterName))]
  const allSelected = filteredResults.length > 0 && selectedCertificates.size === filteredResults.length
  const someSelected = selectedCertificates.size > 0 && selectedCertificates.size < filteredResults.length

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <h1 className="text-3xl font-bold">Scan Results</h1>
          <div className="flex gap-2">
            <Button disabled>
              <RefreshCw className="mr-2 h-4 w-4 animate-spin" />
              Loading...
            </Button>
          </div>
        </div>

        <Card className="animate-pulse">
          <CardHeader>
            <div className="h-6 bg-gray-200 rounded w-1/4"></div>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {[...Array(5)].map((_, i) => (
                <div key={i} className="h-12 bg-gray-200 rounded"></div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
            Scan Results
          </h1>
          <p className="text-muted-foreground mt-1">
            Certificate scan results from all monitored clusters
          </p>
        </div>

        <div className="flex gap-2">
          <Button variant="outline" onClick={loadResults} disabled={exporting}>
            <RefreshCw className="mr-2 h-4 w-4" />
            Refresh
          </Button>
          {selectedCertificates.size > 0 && (
            <Button
              onClick={handleBulkExport}
              disabled={exporting}
              className="bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700"
            >
              <Download className="mr-2 h-4 w-4" />
              Export Selected ({selectedCertificates.size})
            </Button>
          )}
          <Button
            onClick={handleExportAll}
            disabled={exporting}
            className="bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700"
          >
            <Download className="mr-2 h-4 w-4" />
            Export All
          </Button>
        </div>
      </div>

      {/* Filters */}
      <Card className="bg-white/50 dark:bg-gray-900/50 backdrop-blur-sm">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Filter className="h-5 w-5" />
            Filters
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 md:grid-cols-3">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                placeholder="Search certificates..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>

            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger>
                <SelectValue placeholder="Filter by status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Statuses</SelectItem>
                <SelectItem value="OK">OK</SelectItem>
                <SelectItem value="WARNING">Warning</SelectItem>
                <SelectItem value="EXPIRED">Expired</SelectItem>
              </SelectContent>
            </Select>

            <Select value={clusterFilter} onValueChange={setClusterFilter}>
              <SelectTrigger>
                <SelectValue placeholder="Filter by cluster" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Clusters</SelectItem>
                {uniqueClusters.map(cluster => (
                  <SelectItem key={cluster} value={cluster}>
                    {cluster}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Results Table */}
      <Card className="bg-white/50 dark:bg-gray-900/50 backdrop-blur-sm">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <FileText className="h-5 w-5" />
            Certificate Results ({filteredResults.length})
          </CardTitle>
          <CardDescription>
            Showing {filteredResults.length} of {results.length} certificates
          </CardDescription>
        </CardHeader>
        <CardContent>
          {filteredResults.length === 0 ? (
            <div className="text-center py-12">
              <FileText className="mx-auto h-12 w-12 text-muted-foreground mb-4" />
              <h3 className="text-lg font-semibold mb-2">No results found</h3>
              <p className="text-muted-foreground">
                {results.length === 0
                  ? "No certificate scans have been performed yet"
                  : "Try adjusting your filters to see more results"
                }
              </p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="w-12">
                      <Checkbox
                        checked={allSelected}
                        onCheckedChange={handleSelectAll}
                        ref={(ref) => {
                          if (ref) ref.indeterminate = someSelected
                        }}
                      />
                    </TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Type</TableHead>
                    <TableHead>Object Name</TableHead>
                    <TableHead>Namespace</TableHead>
                    <TableHead>Cluster</TableHead>
                    <TableHead>Certificate Key</TableHead>
                    <TableHead>Expires</TableHead>
                    <TableHead>Days Left</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredResults.map((cert, index) => (
                    <TableRow key={cert._id || index} className="hover:bg-gray-50 dark:hover:bg-gray-800/50">
                      <TableCell>
                        <Checkbox
                          checked={selectedCertificates.has(cert._id)}
                          onCheckedChange={(checked) => handleSelectCertificate(cert._id, checked)}
                        />
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          {getStatusIcon(cert.status)}
                          {getStatusBadge(cert.status)}
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge variant="outline">
                          {cert.objectType}
                        </Badge>
                      </TableCell>
                      <TableCell className="font-medium">
                        {cert.objectName}
                      </TableCell>
                      <TableCell>{cert.namespace}</TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <Server className="h-4 w-4 text-muted-foreground" />
                          {cert.clusterName}
                        </div>
                      </TableCell>
                      <TableCell className="font-mono text-sm">
                        {cert.certificateKey}
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <Calendar className="h-4 w-4 text-muted-foreground" />
                          {formatDate(cert.notValidAfter)}
                        </div>
                      </TableCell>
                      <TableCell>
                        <span className={`font-medium ${
                          getDaysRemaining(cert.notValidAfter) < 0
                            ? 'text-red-600'
                            : getDaysRemaining(cert.notValidAfter) < 30
                            ? 'text-yellow-600'
                            : 'text-green-600'
                        }`}>
                          {getDaysRemaining(cert.notValidAfter)} days
                        </span>
                      </TableCell>
                      <TableCell>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleSingleExport(cert._id)}
                          disabled={exporting}
                        >
                          <Download className="h-4 w-4" />
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}