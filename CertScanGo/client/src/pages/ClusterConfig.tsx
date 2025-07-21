import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Badge } from "@/components/ui/badge"
import { Textarea } from "@/components/ui/textarea"
import { Switch } from "@/components/ui/switch"
import { 
  Plus, 
  Server, 
  Edit, 
  Trash2, 
  TestTube,
  CheckCircle,
  XCircle,
  AlertCircle
} from "lucide-react"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { getClusters, addCluster, updateCluster, deleteCluster, testConnection } from "@/api/clusters"
import { useToast } from "@/hooks/useToast"
import { ClusterForm } from "@/components/ClusterForm"

export function ClusterConfig() {
  const [clusters, setClusters] = useState([])
  const [loading, setLoading] = useState(true)
  const [dialogOpen, setDialogOpen] = useState(false)
  const [editingCluster, setEditingCluster] = useState(null)
  const { toast } = useToast()

  const loadClusters = async () => {
    try {
      setLoading(true)
      console.log("Loading clusters...")
      const data = await getClusters()
      setClusters(data.clusters)
      console.log("Clusters loaded successfully")
    } catch (error) {
      console.error("Error loading clusters:", error)
      toast({
        title: "Error",
        description: "Failed to load clusters",
        variant: "destructive"
      })
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadClusters()
  }, [])

  const handleAddCluster = async (clusterData) => {
    try {
      console.log("Adding new cluster:", clusterData.name)
      await addCluster(clusterData)
      await loadClusters()
      setDialogOpen(false)
      toast({
        title: "Success",
        description: "Cluster added successfully"
      })
    } catch (error) {
      console.error("Error adding cluster:", error)
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive"
      })
    }
  }

  const handleUpdateCluster = async (clusterData) => {
    try {
      console.log("Updating cluster:", clusterData.name)
      await updateCluster(editingCluster._id, clusterData)
      await loadClusters()
      setDialogOpen(false)
      setEditingCluster(null)
      toast({
        title: "Success",
        description: "Cluster updated successfully"
      })
    } catch (error) {
      console.error("Error updating cluster:", error)
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive"
      })
    }
  }

  const handleDeleteCluster = async (clusterId) => {
    try {
      console.log("Deleting cluster:", clusterId)
      await deleteCluster(clusterId)
      await loadClusters()
      toast({
        title: "Success",
        description: "Cluster deleted successfully"
      })
    } catch (error) {
      console.error("Error deleting cluster:", error)
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive"
      })
    }
  }

  const handleTestConnection = async (clusterId) => {
    try {
      console.log("Testing connection for cluster:", clusterId)
      const result = await testConnection(clusterId)
      toast({
        title: result.success ? "Success" : "Error",
        description: result.message,
        variant: result.success ? "default" : "destructive"
      })
    } catch (error) {
      console.error("Error testing connection:", error)
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive"
      })
    }
  }

  const getStatusIcon = (status) => {
    switch (status) {
      case 'connected':
        return <CheckCircle className="h-4 w-4 text-green-500" />
      case 'error':
        return <XCircle className="h-4 w-4 text-red-500" />
      default:
        return <AlertCircle className="h-4 w-4 text-yellow-500" />
    }
  }

  const getStatusBadge = (status) => {
    switch (status) {
      case 'connected':
        return <Badge className="bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300">Connected</Badge>
      case 'error':
        return <Badge className="bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300">Error</Badge>
      default:
        return <Badge className="bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-300">Unknown</Badge>
    }
  }

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <h1 className="text-3xl font-bold">Cluster Configuration</h1>
          <Button disabled>
            <Plus className="mr-2 h-4 w-4" />
            Add Cluster
          </Button>
        </div>
        
        <div className="grid gap-6">
          {[...Array(3)].map((_, i) => (
            <Card key={i} className="animate-pulse">
              <CardHeader>
                <div className="h-6 bg-gray-200 rounded w-1/3"></div>
                <div className="h-4 bg-gray-200 rounded w-2/3"></div>
              </CardHeader>
              <CardContent>
                <div className="h-4 bg-gray-200 rounded w-full mb-2"></div>
                <div className="h-4 bg-gray-200 rounded w-3/4"></div>
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
            Cluster Configuration
          </h1>
          <p className="text-muted-foreground mt-1">
            Manage your OpenShift cluster connections
          </p>
        </div>
        
        <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
          <DialogTrigger asChild>
            <Button 
              className="bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700"
              onClick={() => setEditingCluster(null)}
            >
              <Plus className="mr-2 h-4 w-4" />
              Add Cluster
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-[600px] bg-white dark:bg-gray-900">
            <DialogHeader>
              <DialogTitle>
                {editingCluster ? "Edit Cluster" : "Add New Cluster"}
              </DialogTitle>
              <DialogDescription>
                {editingCluster 
                  ? "Update the cluster configuration details."
                  : "Configure a new OpenShift cluster for certificate monitoring."
                }
              </DialogDescription>
            </DialogHeader>
            <ClusterForm
              cluster={editingCluster}
              onSubmit={editingCluster ? handleUpdateCluster : handleAddCluster}
              onCancel={() => {
                setDialogOpen(false)
                setEditingCluster(null)
              }}
            />
          </DialogContent>
        </Dialog>
      </div>

      <div className="grid gap-6">
        {clusters.length === 0 ? (
          <Card className="text-center py-12">
            <CardContent>
              <Server className="mx-auto h-12 w-12 text-muted-foreground mb-4" />
              <h3 className="text-lg font-semibold mb-2">No clusters configured</h3>
              <p className="text-muted-foreground mb-4">
                Add your first OpenShift cluster to start monitoring certificates
              </p>
              <Button 
                onClick={() => setDialogOpen(true)}
                className="bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700"
              >
                <Plus className="mr-2 h-4 w-4" />
                Add Cluster
              </Button>
            </CardContent>
          </Card>
        ) : (
          clusters.map((cluster) => (
            <Card key={cluster._id} className="bg-white/50 dark:bg-gray-900/50 backdrop-blur-sm border-gray-200 dark:border-gray-700">
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <Server className="h-6 w-6 text-blue-600" />
                    <div>
                      <CardTitle className="text-xl">{cluster.name}</CardTitle>
                      <CardDescription className="flex items-center gap-2 mt-1">
                        {getStatusIcon(cluster.status)}
                        {cluster.url}
                      </CardDescription>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    {getStatusBadge(cluster.status)}
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <div className="grid gap-4 md:grid-cols-2">
                  <div>
                    <Label className="text-sm font-medium text-muted-foreground">
                      Namespaces
                    </Label>
                    <p className="text-sm">
                      {cluster.namespaces?.length > 0 
                        ? cluster.namespaces.join(", ") 
                        : "All namespaces"
                      }
                    </p>
                  </div>
                  <div>
                    <Label className="text-sm font-medium text-muted-foreground">
                      Last Scan
                    </Label>
                    <p className="text-sm">
                      {cluster.lastScan 
                        ? new Date(cluster.lastScan).toLocaleString()
                        : "Never"
                      }
                    </p>
                  </div>
                  <div>
                    <Label className="text-sm font-medium text-muted-foreground">
                      Auto Scan
                    </Label>
                    <p className="text-sm">
                      {cluster.autoScan ? "Enabled" : "Disabled"}
                    </p>
                  </div>
                  <div>
                    <Label className="text-sm font-medium text-muted-foreground">
                      Certificates Found
                    </Label>
                    <p className="text-sm">
                      {cluster.certificateCount || 0}
                    </p>
                  </div>
                </div>
                
                <div className="flex gap-2 mt-4">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleTestConnection(cluster._id)}
                  >
                    <TestTube className="mr-2 h-4 w-4" />
                    Test Connection
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => {
                      setEditingCluster(cluster)
                      setDialogOpen(true)
                    }}
                  >
                    <Edit className="mr-2 h-4 w-4" />
                    Edit
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleDeleteCluster(cluster._id)}
                    className="text-red-600 hover:text-red-700 hover:bg-red-50 dark:hover:bg-red-900/20"
                  >
                    <Trash2 className="mr-2 h-4 w-4" />
                    Delete
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))
        )}
      </div>
    </div>
  )
}