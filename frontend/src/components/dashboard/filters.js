"use client"

import { useState } from "react"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Card, CardContent } from "@/components/ui/card"
import { X, Filter, RotateCcw } from "lucide-react"

export function Filters({ onFilter }) {
  const [filters, setFilters] = useState({
    // Basic filters
    city: "",
    monthYear: "",
    search: "",
    
    // Range filters for numeric fields
    no_min: "",
    no_max: "",
    nox_min: "",
    nox_max: "",
    benzene_min: "",
    benzene_max: "",
    toluene_min: "",
    toluene_max: "",
    temp_min: "",
    temp_max: "",
    rh_min: "",
    rh_max: "",
    sr_min: "",
    sr_max: "",
    rg_min: "",
    rg_max: "",
    
    // Date filters
    date_from: "",
    date_to: "",
    
    // Sorting
    sort: "createdAt",
    sortOrder: "desc"
  })

  const [activeFilters, setActiveFilters] = useState([])

  // Month options for dropdown
  const months = [
    "Jan", "Feb", "Mar", "Apr", "May", "Jun",
    "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"
  ]

  // Year options 
  const years = Array.from({ length: 10 }, (_, i) => {
    const year = new Date().getFullYear() - i
    return year.toString().slice(-2) // Get last 2 digits
  })

  // Sort options
  const sortOptions = [
    { value: "createdAt", label: "Created Date" },
    { value: "city", label: "City" },
    { value: "monthYear", label: "Month-Year" },
    { value: "temp", label: "Temperature" },
    { value: "no", label: "NO Level" },
    { value: "benzene", label: "Benzene Level" },
    { value: "toluene", label: "Toluene Level" }
  ]

  const handleFilterChange = (key, value) => {
    setFilters(prev => ({
      ...prev,
      [key]: value
    }))
  }

  const buildFilterParams = () => {
    const params = {}
    
    // Add non-empty filters
    Object.keys(filters).forEach(key => {
      if (filters[key] && filters[key].toString().trim() !== "") {
        params[key] = filters[key]
      }
    })

    // Handle sorting
    if (params.sort && params.sortOrder) {
      params.sort = params.sortOrder === "desc" ? `-${params.sort}` : params.sort
      delete params.sortOrder
    }

    return params
  }

  const handleApply = () => {
    const filterParams = buildFilterParams()
    
    // Track active filters for display
    const active = Object.keys(filterParams).map(key => ({
      key,
      value: filterParams[key],
      label: getFilterLabel(key, filterParams[key])
    }))
    
    setActiveFilters(active)
    
    // Call parent component with filters
    if (onFilter) {
      onFilter(filterParams)
    }
    
    console.log("Applied filters:", filterParams)
  }

  const handleClear = () => {
    const clearedFilters = Object.keys(filters).reduce((acc, key) => {
      acc[key] = ""
      return acc
    }, {})
    
    setFilters({
      ...clearedFilters,
      sort: "createdAt",
      sortOrder: "desc"
    })
    setActiveFilters([])
    
    // Call parent with empty filters
    if (onFilter) {
      onFilter({})
    }
  }

  const removeFilter = (filterKey) => {
    const newFilters = { ...filters }
    newFilters[filterKey] = ""
    setFilters(newFilters)
    
    const newParams = buildFilterParams()
    delete newParams[filterKey]
    
    const active = Object.keys(newParams).map(key => ({
      key,
      value: newParams[key],
      label: getFilterLabel(key, newParams[key])
    }))
    
    setActiveFilters(active)
    
    if (onFilter) {
      onFilter(newParams)
    }
  }

  const getFilterLabel = (key, value) => {
    const labels = {
      city: `City: ${value}`,
      monthYear: `Period: ${value}`,
      search: `Search: ${value}`,
      no_min: `NO Min: ${value}`,
      no_max: `NO Max: ${value}`,
      nox_min: `NOX Min: ${value}`,
      nox_max: `NOX Max: ${value}`,
      benzene_min: `Benzene Min: ${value}`,
      benzene_max: `Benzene Max: ${value}`,
      toluene_min: `Toluene Min: ${value}`,
      toluene_max: `Toluene Max: ${value}`,
      temp_min: `Temp Min: ${value}°C`,
      temp_max: `Temp Max: ${value}°C`,
      rh_min: `Humidity Min: ${value}%`,
      rh_max: `Humidity Max: ${value}%`,
      sr_min: `Solar Min: ${value}`,
      sr_max: `Solar Max: ${value}`,
      rg_min: `Rain Min: ${value}`,
      rg_max: `Rain Max: ${value}`,
      date_from: `From: ${value}`,
      date_to: `To: ${value}`,
      sort: `Sort: ${value}`
    }
    return labels[key] || `${key}: ${value}`
  }

  return (
    <div className="space-y-4">
      {/* Basic Filters */}
      <Card>
        <CardContent className="p-4">
          <h4 className="font-semibold mb-3 flex items-center gap-2">
            <Filter className="h-4 w-4" />
            Basic Filters
          </h4>
          <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4 gap-4">
            <div className="space-y-2">
              <Label htmlFor="search">Search</Label>
              <Input
                id="search"
                value={filters.search}
                onChange={(e) => handleFilterChange("search", e.target.value)}
                placeholder="Search city or period..."
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="city">City</Label>
              <Input
                id="city"
                value={filters.city}
                onChange={(e) => handleFilterChange("city", e.target.value)}
                placeholder="Enter city name"
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="monthYear">Period</Label>
              <Input
                id="monthYear"
                value={filters.monthYear}
                onChange={(e) => handleFilterChange("monthYear", e.target.value)}
                placeholder="e.g., Jul-19"
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="sort">Sort By</Label>
              <div className="flex gap-2">
                <Select 
                  value={filters.sort} 
                  onValueChange={(value) => handleFilterChange("sort", value)}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Sort by" />
                  </SelectTrigger>
                  <SelectContent>
                    {sortOptions.map(option => (
                      <SelectItem key={option.value} value={option.value}>
                        {option.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <Select 
                  value={filters.sortOrder} 
                  onValueChange={(value) => handleFilterChange("sortOrder", value)}
                >
                  <SelectTrigger className="w-24">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="asc">Asc</SelectItem>
                    <SelectItem value="desc">Desc</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Range Filters */}
    

      {/* Date Range */}
      {/* <Card>
        <CardContent className="p-4">
          <h4 className="font-semibold mb-3">Date Range</h4>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="date_from">From Date</Label>
              <Input
                id="date_from"
                type="date"
                value={filters.date_from}
                onChange={(e) => handleFilterChange("date_from", e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="date_to">To Date</Label>
              <Input
                id="date_to"
                type="date"
                value={filters.date_to}
                onChange={(e) => handleFilterChange("date_to", e.target.value)}
              />
            </div>
          </div>
        </CardContent>
      </Card> */}

      {/* Action Buttons */}
      <div className="flex gap-2">
        <Button onClick={handleApply} className="flex items-center gap-2">
          <Filter className="h-4 w-4" />
          Apply Filters
        </Button>
        <Button onClick={handleClear} variant="outline" className="flex items-center gap-2">
          <RotateCcw className="h-4 w-4" />
          Clear All
        </Button>
      </div>

      {/* Active Filters Display */}
      {activeFilters.length > 0 && (
        <Card>
          <CardContent className="p-4">
            <h4 className="font-semibold mb-2">Active Filters ({activeFilters.length})</h4>
            <div className="flex flex-wrap gap-2">
              {activeFilters.map((filter) => (
                <div
                  key={filter.key}
                  className="flex items-center gap-2 bg-blue-100 text-blue-800 px-3 py-1 rounded-full text-sm"
                >
                  <span>{filter.label}</span>
                  <button
                    onClick={() => removeFilter(filter.key)}
                    className="hover:bg-blue-200 rounded-full p-1"
                  >
                    <X className="h-3 w-3" />
                  </button>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  )
}