import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from "recharts"
import { TrendingUp } from "lucide-react"

const data = [
  { name: "Jan", valid: 45, warning: 8, expired: 2 },
  { name: "Feb", valid: 52, warning: 6, expired: 1 },
  { name: "Mar", valid: 48, warning: 12, expired: 3 },
  { name: "Apr", valid: 61, warning: 9, expired: 2 },
  { name: "May", valid: 55, warning: 15, expired: 4 },
  { name: "Jun", valid: 67, warning: 7, expired: 1 }
]

const pieData = [
  { name: "Valid", value: 67, color: "#10b981" },
  { name: "Warning", value: 7, color: "#f59e0b" },
  { name: "Expired", value: 1, color: "#ef4444" }
]

export function CertificateChart() {
  return (
    <Card className="bg-white/50 dark:bg-gray-900/50 backdrop-blur-sm">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <TrendingUp className="h-5 w-5" />
          Certificate Trends
        </CardTitle>
        <CardDescription>
          Certificate status over the last 6 months
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="grid gap-6 lg:grid-cols-2">
          <div>
            <h4 className="text-sm font-medium mb-4">Monthly Trends</h4>
            <ResponsiveContainer width="100%" height={200}>
              <BarChart data={data}>
                <CartesianGrid strokeDasharray="3 3" className="opacity-30" />
                <XAxis dataKey="name" />
                <YAxis />
                <Tooltip
                  contentStyle={{
                    backgroundColor: 'rgba(255, 255, 255, 0.95)',
                    border: '1px solid #e5e7eb',
                    borderRadius: '8px'
                  }}
                />
                <Bar dataKey="valid" stackId="a" fill="#10b981" />
                <Bar dataKey="warning" stackId="a" fill="#f59e0b" />
                <Bar dataKey="expired" stackId="a" fill="#ef4444" />
              </BarChart>
            </ResponsiveContainer>
          </div>

          <div>
            <h4 className="text-sm font-medium mb-4">Current Distribution</h4>
            <ResponsiveContainer width="100%" height={200}>
              <PieChart>
                <Pie
                  data={pieData}
                  cx="50%"
                  cy="50%"
                  innerRadius={40}
                  outerRadius={80}
                  paddingAngle={5}
                  dataKey="value"
                >
                  {pieData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip
                  contentStyle={{
                    backgroundColor: 'rgba(255, 255, 255, 0.95)',
                    border: '1px solid #e5e7eb',
                    borderRadius: '8px'
                  }}
                />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}