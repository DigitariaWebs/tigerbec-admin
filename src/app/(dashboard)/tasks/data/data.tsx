import {
  ArrowDown,
  ArrowRight,
  ArrowUp,
  CheckCircle,
  Circle,
  CircleOff,
  HelpCircle,
  Timer,
  AlertTriangle,
} from "lucide-react"

export const labels = [
  {
    value: "bug",
    label: "Bug",
  },
  {
    value: "feature",
    label: "Feature",
  },
  {
    value: "documentation",
    label: "Documentation",
  },
]

// Updated to match backend statuses: TODO, IN_PROGRESS, COMPLETED, CANCELLED
export const statuses = [
  {
    value: "TODO",
    label: "Todo",
    icon: Circle,
  },
  {
    value: "IN_PROGRESS",
    label: "In Progress",
    icon: Timer,
  },
  {
    value: "COMPLETED",
    label: "Done",
    icon: CheckCircle,
  },
  {
    value: "CANCELLED",
    label: "Canceled",
    icon: CircleOff,
  },
]

// Updated to match backend priorities: LOW, MEDIUM, HIGH, URGENT
export const priorities = [
  {
    label: "Low",
    value: "LOW",
    icon: ArrowDown,
  },
  {
    label: "Medium",
    value: "MEDIUM",
    icon: ArrowRight,
  },
  {
    label: "High",
    value: "HIGH",
    icon: ArrowUp,
  },
  {
    label: "Urgent",
    value: "URGENT",
    icon: AlertTriangle,
  },
]
