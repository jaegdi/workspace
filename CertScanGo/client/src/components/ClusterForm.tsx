import { useState } from "react"
import { useForm } from "react-hook-form"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Switch } from "@/components/ui/switch"
import { Badge } from "@/components/ui/badge"
import { X, Plus } from "lucide-react"

interface ClusterFormData {
  name: string
  url: string
  token: string
  namespaces: string[]
  autoScan: boolean
  scanInterval: number
}

interface ClusterFormProps {
  cluster?: any
  onSubmit: (data: ClusterFormData) => void
  onCancel: () => void
}

export function ClusterForm({ cluster, onSubmit, onCancel }: ClusterFormProps) {
  const [namespaces, setNamespaces] = useState<string[]>(cluster?.namespaces || [])
  const [newNamespace, setNewNamespace] = useState("")

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
    watch
  } = useForm<ClusterFormData>({
    defaultValues: {
      name: cluster?.name || "",
      url: cluster?.url || "",
      token: cluster?.token || "",
      namespaces: cluster?.namespaces || [],
      autoScan: cluster?.autoScan || false,
      scanInterval: cluster?.scanInterval || 24
    }
  })

  const autoScan = watch("autoScan")

  const addNamespace = () => {
    if (newNamespace.trim() && !namespaces.includes(newNamespace.trim())) {
      setNamespaces([...namespaces, newNamespace.trim()])
      setNewNamespace("")
    }
  }

  const removeNamespace = (namespace: string) => {
    setNamespaces(namespaces.filter(ns => ns !== namespace))
  }

  const handleFormSubmit = (data: ClusterFormData) => {
    onSubmit({
      ...data,
      namespaces
    })
  }

  return (
    <form onSubmit={handleSubmit(handleFormSubmit)} className="space-y-6">
      <div className="grid gap-4 md:grid-cols-2">
        <div className="space-y-2">
          <Label htmlFor="name">Cluster Name *</Label>
          <Input
            id="name"
            {...register("name", { required: "Cluster name is required" })}
            placeholder="Production Cluster"
          />
          {errors.name && (
            <p className="text-sm text-red-600">{errors.name.message}</p>
          )}
        </div>

        <div className="space-y-2">
          <Label htmlFor="url">Cluster URL *</Label>
          <Input
            id="url"
            {...register("url", {
              required: "Cluster URL is required",
              pattern: {
                value: /^https?:\/\/.+/,
                message: "Please enter a valid URL"
              }
            })}
            placeholder="https://api.cluster.example.com:6443"
          />
          {errors.url && (
            <p className="text-sm text-red-600">{errors.url.message}</p>
          )}
        </div>
      </div>

      <div className="space-y-2">
        <Label htmlFor="token">Authentication Token *</Label>
        <Textarea
          id="token"
          {...register("token", { required: "Authentication token is required" })}
          placeholder="eyJhbGciOiJSUzI1NiIsImtpZCI6..."
          rows={3}
          className="font-mono text-sm"
        />
        {errors.token && (
          <p className="text-sm text-red-600">{errors.token.message}</p>
        )}
      </div>

      <div className="space-y-4">
        <Label>Namespaces (optional)</Label>
        <p className="text-sm text-muted-foreground">
          Leave empty to scan all namespaces, or specify specific namespaces to monitor
        </p>

        <div className="flex gap-2">
          <Input
            value={newNamespace}
            onChange={(e) => setNewNamespace(e.target.value)}
            placeholder="Enter namespace name"
            onKeyPress={(e) => {
              if (e.key === 'Enter') {
                e.preventDefault()
                addNamespace()
              }
            }}
          />
          <Button type="button" onClick={addNamespace} variant="outline">
            <Plus className="h-4 w-4" />
          </Button>
        </div>

        {namespaces.length > 0 && (
          <div className="flex flex-wrap gap-2">
            {namespaces.map((namespace) => (
              <Badge key={namespace} variant="secondary" className="flex items-center gap-1">
                {namespace}
                <button
                  type="button"
                  onClick={() => removeNamespace(namespace)}
                  className="ml-1 hover:text-red-600"
                >
                  <X className="h-3 w-3" />
                </button>
              </Badge>
            ))}
          </div>
        )}
      </div>

      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div className="space-y-1">
            <Label>Auto Scan</Label>
            <p className="text-sm text-muted-foreground">
              Automatically scan this cluster at regular intervals
            </p>
          </div>
          <Switch {...register("autoScan")} />
        </div>

        {autoScan && (
          <div className="space-y-2">
            <Label htmlFor="scanInterval">Scan Interval (hours)</Label>
            <Input
              id="scanInterval"
              type="number"
              min="1"
              max="168"
              {...register("scanInterval", {
                min: { value: 1, message: "Minimum interval is 1 hour" },
                max: { value: 168, message: "Maximum interval is 168 hours (1 week)" }
              })}
            />
            {errors.scanInterval && (
              <p className="text-sm text-red-600">{errors.scanInterval.message}</p>
            )}
          </div>
        )}
      </div>

      <div className="flex justify-end gap-2 pt-4">
        <Button type="button" variant="outline" onClick={onCancel}>
          Cancel
        </Button>
        <Button
          type="submit"
          disabled={isSubmitting}
          className="bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700"
        >
          {isSubmitting ? "Saving..." : cluster ? "Update Cluster" : "Add Cluster"}
        </Button>
      </div>
    </form>
  )
}