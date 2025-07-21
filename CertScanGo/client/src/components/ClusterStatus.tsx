import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { Server, CheckCircle, AlertTriangle, XCircle, Clock } from "lucide-react"

interface Cluster {
  _id: string
  name: string
  url: string
  status: 'connected' | 'error' | 'unknown'
  lastScan: string
  certificateCount: number
  health: {
    valid: number
    warning: number
    expired: number
  }
}

interface ClusterStatusProps {
  clusters: Cluster[]
}

export function ClusterStatus({ clusters }: ClusterStatusProps) {
  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'connected':
        return <CheckCircle className="h-4 w-4 text-green-500" />
      case 'error':
        return <XCircle className="h-4 w-4 text-red-500" />
      default:
        return <AlertTriangle className="h-4 w-4 text-yellow-500" />
    }
  }

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'connected':
        return <Badge className="bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300">Connected</Badge>
      case 'error':
        return <Badge className="bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300">Error</Badge>
      default:
        return <Badge className="bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-300">Unknown</Badge>
    }
  }

  const getHealthPercentage = (health: { valid: number; warning: number; expired: number }) => {
    const total = health.valid + health.warning + health.expired
    if (total === 0) return 100
    return Math.round((health.valid / total) * 100)
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
          <Server className="h-5 w-5" />
          Cluster Status
        </CardTitle>
        <CardDescription>
          Health status of monitored OpenShift clusters
        </CardDescription>
      </CardHeader>
      <CardContent>
        {clusters.length === 0 ? (
          <div className="text-center py-8">
            <Server className="mx-auto h-12 w-12 text-muted-foreground mb-4" />
            <h3 className="text-lg font-semibold mb-2">No clusters configured</h3>
            <p className="text-muted-foreground">
              Add clusters to start monitoring certificate health
            </p>
          </div>
        ) : (
          <div className="space-y-4">
            {clusters.map((cluster) => (
              <div
                key={cluster._id}
                className="p-4 rounded-lg border bg-white/50 dark:bg-gray-800/50 hover:bg-white/70 dark:hover:bg-gray-800/70 transition-colors"
              >
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-3">
                    {getStatusIcon(cluster.status)}
                    <div>
                      <div className="font-medium">{cluster.name}</div>
                      <div className="text-sm text-muted-foreground">
                        {cluster.certificateCount} certificates
                      </div>
                    </div>
                  </div>
                  {getStatusBadge(cluster.status)}
                </div>

                {cluster.status === 'connected' && cluster.health && (
                  <div className="space-y-2">
                    <div className="flex items-center justify-between text-sm">
                      <span>Certificate Health</span>
                      <span className="font-medium">
                        {getHealthPercentage(cluster.health)}% healthy
                      </span>
                    </div>
                    <Progress 
                      value={getHealthPercentage(cluster.health)} 
                      className="h-2"
                    />
                    <div className="flex justify-between text-xs text-muted-foreground">
                      <span className="text-green-600 dark:text-green-400">
                        {cluster.health.valid} valid
                      </span>
                      <span className="text-yellow-600 dark:text-yellow-400">
                        {cluster.health.warning} warning
                      </span>
                      <span className="text-red-600 dark:text-red-400">
                        {cluster.health.expired} expired
                      </span>
                    </div>
                  </div>
                )}

                <div className="flex items-center gap-2 mt-3 text-xs text-muted-foreground">
                  <Clock className="h-3 w-3" />
                  Last scan: {cluster.lastScan ? formatDate(cluster.lastScan) : 'Never'}
                </div>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  )
}