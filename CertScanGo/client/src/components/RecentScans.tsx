import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Clock, Server, CheckCircle, AlertTriangle, XCircle, Eye } from "lucide-react"

interface Scan {
  _id: string
  clusterName: string
  timestamp: string
  certificatesFound: number
  status: 'completed' | 'running' | 'failed'
  summary: {
    valid: number
    warning: number
    expired: number
  }
}

interface RecentScansProps {
  scans: Scan[]
}

export function RecentScans({ scans }: RecentScansProps) {
  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'completed':
        return <CheckCircle className="h-4 w-4 text-green-500" />
      case 'running':
        return <Clock className="h-4 w-4 text-blue-500 animate-spin" />
      case 'failed':
        return <XCircle className="h-4 w-4 text-red-500" />
      default:
        return <AlertTriangle className="h-4 w-4 text-yellow-500" />
    }
  }

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'completed':
        return <Badge className="bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300">Completed</Badge>
      case 'running':
        return <Badge className="bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300">Running</Badge>
      case 'failed':
        return <Badge className="bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300">Failed</Badge>
      default:
        return <Badge variant="secondary">Unknown</Badge>
    }
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleString('en-US', {
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    })
  }

  return (
    <Card className="bg-white/50 dark:bg-gray-900/50 backdrop-blur-sm">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Clock className="h-5 w-5" />
          Recent Scans
        </CardTitle>
        <CardDescription>
          Latest certificate scanning activity
        </CardDescription>
      </CardHeader>
      <CardContent>
        {scans.length === 0 ? (
          <div className="text-center py-8">
            <Clock className="mx-auto h-12 w-12 text-muted-foreground mb-4" />
            <h3 className="text-lg font-semibold mb-2">No scans yet</h3>
            <p className="text-muted-foreground">
              Certificate scans will appear here once you start monitoring clusters
            </p>
          </div>
        ) : (
          <div className="space-y-4">
            {scans.map((scan) => (
              <div
                key={scan._id}
                className="flex items-center justify-between p-4 rounded-lg border bg-white/50 dark:bg-gray-800/50 hover:bg-white/70 dark:hover:bg-gray-800/70 transition-colors"
              >
                <div className="flex items-center gap-4">
                  <div className="flex items-center gap-2">
                    {getStatusIcon(scan.status)}
                    <Server className="h-4 w-4 text-muted-foreground" />
                  </div>
                  
                  <div>
                    <div className="font-medium">{scan.clusterName}</div>
                    <div className="text-sm text-muted-foreground">
                      {formatDate(scan.timestamp)} • {scan.certificatesFound} certificates
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  {scan.status === 'completed' && (
                    <div className="flex gap-2 text-sm">
                      <span className="text-green-600 dark:text-green-400">
                        {scan.summary.valid} OK
                      </span>
                      <span className="text-yellow-600 dark:text-yellow-400">
                        {scan.summary.warning} Warning
                      </span>
                      <span className="text-red-600 dark:text-red-400">
                        {scan.summary.expired} Expired
                      </span>
                    </div>
                  )}
                  
                  {getStatusBadge(scan.status)}
                  
                  <Button variant="ghost" size="sm">
                    <Eye className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  )
}