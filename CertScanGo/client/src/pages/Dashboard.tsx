import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { 
  Shield, 
  AlertTriangle, 
  CheckCircle, 
  XCircle, 
  Server, 
  Clock,
  TrendingUp,
  Download,
  RefreshCw
} from "lucide-react"
import { CertificateChart } from "@/components/CertificateChart"
import { RecentScans } from "@/components/RecentScans"
import { ClusterStatus } from "@/components/ClusterStatus"
import { getCertificateStats, getRecentScans, getClusterStatus } from "@/api/certificates"
import { useToast } from "@/hooks/useToast"

export function Dashboard() {
  const [stats, setStats] = useState(null)
  const [recentScans, setRecentScans] = useState([])
  const [clusterStatus, setClusterStatus] = useState([])
  const [loading, setLoading] = useState(true)
  const { toast } = useToast()

  const loadDashboardData = async () => {
    try {
      setLoading(true)
      console.log("Loading dashboard data...")
      
      const [statsData, scansData, statusData] = await Promise.all([
        getCertificateStats(),
        getRecentScans(),
        getClusterStatus()
      ])
      
      setStats(statsData)
      setRecentScans(scansData.scans)
      setClusterStatus(statusData.clusters)
      
      console.log("Dashboard data loaded successfully")
    } catch (error) {
      console.error("Error loading dashboard data:", error)
      toast({
        title: "Error",
        description: "Failed to load dashboard data",
        variant: "destructive"
      })
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadDashboardData()
  }, [])

  const handleRefresh = () => {
    loadDashboardData()
    toast({
      title: "Refreshed",
      description: "Dashboard data has been updated"
    })
  }

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <h1 className="text-3xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
            Certificate Dashboard
          </h1>
          <Button disabled>
            <RefreshCw className="mr-2 h-4 w-4 animate-spin" />
            Loading...
          </Button>
        </div>
        
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
          {[...Array(4)].map((_, i) => (
            <Card key={i} className="animate-pulse">
              <CardHeader className="pb-2">
                <div className="h-4 bg-gray-200 rounded w-3/4"></div>
              </CardHeader>
              <CardContent>
                <div className="h-8 bg-gray-200 rounded w-1/2 mb-2"></div>
                <div className="h-3 bg-gray-200 rounded w-full"></div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
            Certificate Dashboard
          </h1>
          <p className="text-muted-foreground mt-1">
            Monitor SSL/TLS certificates across your OpenShift clusters
          </p>
        </div>
        
        <div className="flex gap-2">
          <Button variant="outline" onClick={handleRefresh}>
            <RefreshCw className="mr-2 h-4 w-4" />
            Refresh
          </Button>
          <Button className="bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700">
            <Download className="mr-2 h-4 w-4" />
            Export Report
          </Button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
        <Card className="bg-gradient-to-br from-green-50 to-emerald-50 dark:from-green-900/20 dark:to-emerald-900/20 border-green-200 dark:border-green-800">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-green-700 dark:text-green-300">
              Valid Certificates
            </CardTitle>
            <CheckCircle className="h-4 w-4 text-green-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-700 dark:text-green-300">
              {stats?.valid || 0}
            </div>
            <p className="text-xs text-green-600 dark:text-green-400">
              +2 from last scan
            </p>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-yellow-50 to-orange-50 dark:from-yellow-900/20 dark:to-orange-900/20 border-yellow-200 dark:border-yellow-800">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-yellow-700 dark:text-yellow-300">
              Expiring Soon
            </CardTitle>
            <AlertTriangle className="h-4 w-4 text-yellow-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-yellow-700 dark:text-yellow-300">
              {stats?.warning || 0}
            </div>
            <p className="text-xs text-yellow-600 dark:text-yellow-400">
              Within 30 days
            </p>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-red-50 to-pink-50 dark:from-red-900/20 dark:to-pink-900/20 border-red-200 dark:border-red-800">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-red-700 dark:text-red-300">
              Expired
            </CardTitle>
            <XCircle className="h-4 w-4 text-red-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-700 dark:text-red-300">
              {stats?.expired || 0}
            </div>
            <p className="text-xs text-red-600 dark:text-red-400">
              Requires immediate attention
            </p>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-blue-50 to-indigo-50 dark:from-blue-900/20 dark:to-indigo-900/20 border-blue-200 dark:border-blue-800">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-blue-700 dark:text-blue-300">
              Total Clusters
            </CardTitle>
            <Server className="h-4 w-4 text-blue-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-blue-700 dark:text-blue-300">
              {stats?.clusters || 0}
            </div>
            <p className="text-xs text-blue-600 dark:text-blue-400">
              Active monitoring
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Charts and Status */}
      <div className="grid gap-6 lg:grid-cols-2">
        <CertificateChart />
        <ClusterStatus clusters={clusterStatus} />
      </div>

      {/* Recent Scans */}
      <RecentScans scans={recentScans} />
    </div>
  )
}