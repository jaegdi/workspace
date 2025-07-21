import { NavLink } from "react-router-dom"
import { 
  LayoutDashboard, 
  Server, 
  FileText, 
  Settings, 
  Shield,
  Activity,
  AlertTriangle
} from "lucide-react"
import { cn } from "@/lib/utils"
import { Badge } from "./ui/badge"

const navigation = [
  {
    name: "Dashboard",
    href: "/",
    icon: LayoutDashboard,
    badge: null
  },
  {
    name: "Clusters",
    href: "/clusters",
    icon: Server,
    badge: null
  },
  {
    name: "Scan Results",
    href: "/results",
    icon: FileText,
    badge: "12"
  },
  {
    name: "Monitoring",
    href: "/monitoring",
    icon: Activity,
    badge: null
  },
  {
    name: "Alerts",
    href: "/alerts",
    icon: AlertTriangle,
    badge: "3"
  },
  {
    name: "Settings",
    href: "/settings",
    icon: Settings,
    badge: null
  }
]

export function Sidebar() {
  return (
    <div className="fixed left-0 top-16 z-40 h-[calc(100vh-4rem)] w-64 border-r bg-white/80 dark:bg-gray-900/80 backdrop-blur-md supports-[backdrop-filter]:bg-white/60 dark:supports-[backdrop-filter]:bg-gray-900/60">
      <div className="flex h-full flex-col">
        <div className="flex-1 overflow-y-auto p-4">
          <nav className="space-y-2">
            {navigation.map((item) => (
              <NavLink
                key={item.name}
                to={item.href}
                className={({ isActive }) =>
                  cn(
                    "flex items-center justify-between rounded-lg px-3 py-2 text-sm font-medium transition-all duration-200 hover:bg-blue-50 dark:hover:bg-blue-900/20 hover:text-blue-700 dark:hover:text-blue-300",
                    isActive
                      ? "bg-gradient-to-r from-blue-500 to-purple-600 text-white shadow-lg shadow-blue-500/25"
                      : "text-gray-700 dark:text-gray-300"
                  )
                }
              >
                <div className="flex items-center gap-3">
                  <item.icon className="h-5 w-5" />
                  {item.name}
                </div>
                {item.badge && (
                  <Badge variant="secondary" className="ml-auto">
                    {item.badge}
                  </Badge>
                )}
              </NavLink>
            ))}
          </nav>
        </div>
        
        <div className="border-t p-4">
          <div className="flex items-center gap-3 rounded-lg bg-gradient-to-r from-green-50 to-blue-50 dark:from-green-900/20 dark:to-blue-900/20 p-3">
            <Shield className="h-5 w-5 text-green-600 dark:text-green-400" />
            <div className="text-sm">
              <div className="font-medium text-green-700 dark:text-green-300">System Status</div>
              <div className="text-green-600 dark:text-green-400">All systems operational</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}