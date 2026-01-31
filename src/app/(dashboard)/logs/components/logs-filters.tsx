"use client"

import { useState } from "react"
import { LogsQueryParams } from "@/lib/api/logs"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover"
import { Calendar } from "@/components/ui/calendar"
import { Card, CardContent } from "@/components/ui/card"
import { Filter, X, Calendar as CalendarIcon, Search } from "lucide-react"
import { format } from "date-fns"
import { cn } from "@/lib/utils"

interface LogsFiltersProps {
  filters: LogsQueryParams
  onFilterChange: (filters: Partial<LogsQueryParams>) => void
}

export function LogsFilters({ filters, onFilterChange }: LogsFiltersProps) {
  const [isExpanded, setIsExpanded] = useState(false)
  const [localFilters, setLocalFilters] = useState<LogsQueryParams>(filters)
  const [startDate, setStartDate] = useState<Date>()
  const [endDate, setEndDate] = useState<Date>()

  const handleApplyFilters = () => {
    onFilterChange({
      ...localFilters,
      start_date: startDate ? format(startDate, 'yyyy-MM-dd') : undefined,
      end_date: endDate ? format(endDate, 'yyyy-MM-dd') : undefined,
    })
  }

  const handleResetFilters = () => {
    const resetFilters = { limit: 50, offset: 0 }
    setLocalFilters(resetFilters)
    setStartDate(undefined)
    setEndDate(undefined)
    onFilterChange(resetFilters)
  }

  const activeFiltersCount = Object.entries(filters).filter(
    ([key, value]) => value && key !== 'limit' && key !== 'offset'
  ).length

  return (
    <Card>
      <CardContent className="pt-6">
        <div className="space-y-4">
          {/* Filter Header */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Filter className="h-4 w-4" />
              <h3 className="font-semibold">Filters</h3>
              {activeFiltersCount > 0 && (
                <span className="rounded-full bg-primary px-2 py-0.5 text-xs text-primary-foreground">
                  {activeFiltersCount}
                </span>
              )}
            </div>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setIsExpanded(!isExpanded)}
            >
              {isExpanded ? "Hide" : "Show"}
            </Button>
          </div>

          {/* Quick Search */}
          <div className="relative">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              placeholder="Search by email..."
              value={localFilters.user_email || ""}
              onChange={(e) =>
                setLocalFilters({ ...localFilters, user_email: e.target.value })
              }
              className="pl-9"
            />
          </div>

          {/* Expanded Filters */}
          {isExpanded && (
            <div className="grid gap-4 pt-4 md:grid-cols-2 lg:grid-cols-4">
              {/* User Role */}
              <div className="space-y-2">
                <Label>User Role</Label>
                <Select
                  value={localFilters.user_role || "all"}
                  onValueChange={(value) =>
                    setLocalFilters({
                      ...localFilters,
                      user_role: value === "all" ? undefined : (value as "admin" | "member"),
                    })
                  }
                >
                  <SelectTrigger>
                    <SelectValue placeholder="All roles" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Roles</SelectItem>
                    <SelectItem value="admin">Admin</SelectItem>
                    <SelectItem value="member">Member</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {/* Activity Type */}
              <div className="space-y-2">
                <Label>Activity Type</Label>
                <Select
                  value={localFilters.activity_type || "all"}
                  onValueChange={(value) =>
                    setLocalFilters({
                      ...localFilters,
                      activity_type: value === "all" ? undefined : value,
                    })
                  }
                >
                  <SelectTrigger>
                    <SelectValue placeholder="All activities" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Activities</SelectItem>
                    <SelectItem value="signup">Signup</SelectItem>
                    <SelectItem value="signin">Signin</SelectItem>
                    <SelectItem value="password_reset">Password Reset</SelectItem>
                    <SelectItem value="profile_update">Profile Update</SelectItem>
                    <SelectItem value="delete">Delete</SelectItem>
                    <SelectItem value="car_added">Car Added</SelectItem>
                    <SelectItem value="car_updated">Car Updated</SelectItem>
                    <SelectItem value="car_sold">Car Sold</SelectItem>
                    <SelectItem value="oauth_signin">OAuth Signin</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {/* Resource Type */}
              <div className="space-y-2">
                <Label>Resource Type</Label>
                <Select
                  value={localFilters.resource_type || "all"}
                  onValueChange={(value) =>
                    setLocalFilters({
                      ...localFilters,
                      resource_type: value === "all" ? undefined : value,
                    })
                  }
                >
                  <SelectTrigger>
                    <SelectValue placeholder="All resources" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Resources</SelectItem>
                    <SelectItem value="admin">Admin</SelectItem>
                    <SelectItem value="member">Member</SelectItem>
                    <SelectItem value="car">Car</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {/* Status */}
              <div className="space-y-2">
                <Label>Status</Label>
                <Select
                  value={localFilters.status || "all"}
                  onValueChange={(value) =>
                    setLocalFilters({
                      ...localFilters,
                      status: value === "all" ? undefined : (value as "success" | "failure"),
                    })
                  }
                >
                  <SelectTrigger>
                    <SelectValue placeholder="All statuses" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Statuses</SelectItem>
                    <SelectItem value="success">Success</SelectItem>
                    <SelectItem value="failure">Failure</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {/* Start Date */}
              <div className="space-y-2">
                <Label>Start Date</Label>
                <Popover>
                  <PopoverTrigger asChild>
                    <Button
                      variant="outline"
                      className={cn(
                        "w-full justify-start text-left font-normal",
                        !startDate && "text-muted-foreground"
                      )}
                    >
                      <CalendarIcon className="mr-2 h-4 w-4" />
                      {startDate ? format(startDate, "PPP") : "Pick a date"}
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0" align="start">
                    <Calendar
                      mode="single"
                      selected={startDate}
                      onSelect={setStartDate}
                      initialFocus
                    />
                  </PopoverContent>
                </Popover>
              </div>

              {/* End Date */}
              <div className="space-y-2">
                <Label>End Date</Label>
                <Popover>
                  <PopoverTrigger asChild>
                    <Button
                      variant="outline"
                      className={cn(
                        "w-full justify-start text-left font-normal",
                        !endDate && "text-muted-foreground"
                      )}
                    >
                      <CalendarIcon className="mr-2 h-4 w-4" />
                      {endDate ? format(endDate, "PPP") : "Pick a date"}
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0" align="start">
                    <Calendar
                      mode="single"
                      selected={endDate}
                      onSelect={setEndDate}
                      initialFocus
                    />
                  </PopoverContent>
                </Popover>
              </div>

              {/* User ID */}
              <div className="space-y-2">
                <Label>User ID</Label>
                <Input
                  placeholder="Filter by user ID..."
                  value={localFilters.user_id || ""}
                  onChange={(e) =>
                    setLocalFilters({ ...localFilters, user_id: e.target.value })
                  }
                />
              </div>

              {/* Resource ID */}
              <div className="space-y-2">
                <Label>Resource ID</Label>
                <Input
                  placeholder="Filter by resource ID..."
                  value={localFilters.resource_id || ""}
                  onChange={(e) =>
                    setLocalFilters({ ...localFilters, resource_id: e.target.value })
                  }
                />
              </div>
            </div>
          )}

          {/* Action Buttons */}
          <div className="flex items-center justify-end gap-2 pt-2">
            {activeFiltersCount > 0 && (
              <Button
                variant="ghost"
                size="sm"
                onClick={handleResetFilters}
                className="gap-2"
              >
                <X className="h-4 w-4" />
                Reset
              </Button>
            )}
            <Button onClick={handleApplyFilters} className="gap-2">
              <Filter className="h-4 w-4" />
              Apply Filters
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
