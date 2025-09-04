"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card"
import { DataTable } from "@/components/dashboard/dataTable"
import { Filters } from "@/components/dashboard/filters"
import { TrendChart } from "@/components/dashboard/trendChart"
import { RecordForm } from "@/components/dashboard/RecordForm"
import {
  Dialog, DialogTrigger, DialogContent, DialogHeader, DialogTitle, DialogFooter
} from "@/components/ui/dialog"
// import { toast } from "@/components/ui/use-toast"
import { openGDSAPI } from "@/Api/apiServer"
import { Loader2, LogOut, RefreshCw } from "lucide-react"
import { normalizeRecords, getFieldValue, prepareForAPI } from "@/components/dashboard/dataNormalizer"
import { useRouter } from "next/navigation"

// Initial empty form data based on OpenGDS schema
const initialFormData = {
  city: "",
  monthYear: "",
  no: "",
  nox: "",
  benzene: "",
  toluene: "",
  ethylBen: "",
  mpXylene: "",
  oXylene: "",
  ws: "",
  temp: "",
  rh: "",
  sr: "",
  rg: ""
}

export default function DashboardPage() {
  const [records, setRecords] = useState([])
  const [filteredRecords, setFilteredRecords] = useState([])
  const [open, setOpen] = useState(false)
  const [isEditing, setIsEditing] = useState(false)
  const [formData, setFormData] = useState(initialFormData)
  const [editId, setEditId] = useState(null)
  const [loading, setLoading] = useState(false)
  const [pageLoading, setPageLoading] = useState(true)
  const [statistics, setStatistics] = useState(null)
  const router =useRouter()
  const [pagination, setPagination] = useState({
    current_page: 1,
    total_pages: 1,
    total_records: 0,
    records_per_page: 10
  })

  // Fetch all records from API
  const fetchRecords = async (filters = {}, page = 1, limit = 10) => {
    setPageLoading(true)
    try {
      const params = {
        page,
        limit,
        ...filters
      }
      
      const response = await openGDSAPI.getRecords(params)
      
      if (response.success) {
        const normalizedRecords = normalizeRecords(response.data.records)
setRecords(normalizedRecords)
setFilteredRecords(normalizedRecords)
        setPagination(response.data.pagination)
        
        // toast({
        //   title: "Success",
        //   description: `Loaded ${response.data.records.length} records`,
        // })
      }
    } catch (error) {
      console.error("Failed to fetch records:", error)
      // toast({
      //   title: "Error",
      //   description: error.message || "Failed to fetch records",
      //   variant: "destructive"
      // })
      // Set empty state on error
      setRecords([])
      setFilteredRecords([])
    } finally {
      setPageLoading(false)
    }
  }

  // Fetch statistics
  const fetchStatistics = async () => {
    try {
      const response = await openGDSAPI.getStatistics()
      if (response.success) {
        setStatistics(response.data)
      }
    } catch (error) {
      console.error("Failed to fetch statistics:", error)
    }
  }

  // Load data on component mount
  useEffect(() => {
    fetchRecords()
    fetchStatistics()
  }, [])

  // Handle filtering from Filters component
  const handleFilter = async (filters) => {
    await fetchRecords(filters, 1) // Reset to page 1 when filtering
  }

  // Handle pagination
  const handlePageChange = async (page) => {
    await fetchRecords({}, page, pagination.records_per_page)
  }

  // Event handlers for CRUD operations
  const handleAdd = () => {
    setIsEditing(false)
    setFormData(initialFormData)
    setEditId(null)
    setOpen(true)
  }

  const handleEdit = (record) => {
    setIsEditing(true)
    setEditId(record._id || record.id) // Handle both MongoDB _id and local id
    setFormData({
      city: record.city,
      monthYear: record.monthYear,
      no: record.no.toString(),
      nox: record.nox.toString(),
      benzene: record.benzene.toString(),
      toluene: record.toluene.toString(),
      ethylBen: record.ethylBen.toString(),
      mpXylene: record.mpXylene.toString(),
      oXylene: record.oXylene.toString(),
      ws: record.ws.toString(),
      temp: record.temp.toString(),
      rh: record.rh.toString(),
      sr: record.sr.toString(),
      rg: record.rg.toString()
    })
    setOpen(true)
  }

  const handleDelete = async (id) => {
    setLoading(true)
    try {
      const response = await openGDSAPI.deleteRecord(id)
      
      if (response.success) {
        // Refresh the records list
        await fetchRecords()
        await fetchStatistics() // Update statistics
        
        // toast({
        //   title: "Success",
        //   description: "Record deleted successfully",
        // })
      }
    } catch (error) {
      console.error("Delete error:", error)
      // toast({
      //   title: "Error",
      //   description: error.message || "Failed to delete record",
      //   variant: "destructive"
      // })
    } finally {
      setLoading(false)
    }
  }

  const validateForm = () => {
    const errors = []
    
    if (!formData.city.trim()) errors.push("City is required")
    if (!formData.monthYear.trim()) errors.push("Month-Year is required")
    
    // Validate month-year format
    const monthYearRegex = /^(Jan|Feb|Mar|Apr|May|Jun|Jul|Aug|Sep|Oct|Nov|Dec)-\d{2}$/
    if (formData.monthYear && !monthYearRegex.test(formData.monthYear)) {
      errors.push("Month-Year must be in format MMM-YY (e.g., Jan-19)")
    }

    // Validate required numeric fields
    const numericFields = ['no', 'nox', 'benzene', 'toluene', 'ethylBen', 'mpXylene', 'oXylene', 'temp', 'rh', 'sr', 'rg']
    numericFields.forEach(field => {
      if (!formData[field] || isNaN(Number(formData[field]))) {
        errors.push(`${field.toUpperCase()} must be a valid number`)
      }
    })

    // Validate RH range (0-100)
    if (formData.rh && (Number(formData.rh) < 0 || Number(formData.rh) > 100)) {
      errors.push("Relative Humidity must be between 0 and 100")
    }

    // Validate minimum values for numeric fields
    const minFields = ['no', 'nox', 'benzene', 'toluene', 'ethylBen', 'mpXylene', 'oXylene', 'sr', 'rg']
    minFields.forEach(field => {
      if (formData[field] && Number(formData[field]) < 0) {
        errors.push(`${field.toUpperCase()} must be greater than or equal to 0`)
      }
    })

    return errors
  }

  const handleSave = async () => {
    const validationErrors = validateForm()
    // if (validationErrors.length > 0) {
    //   // toast({
    //   //   title: "Validation Error",
    //   //   description: validationErrors.join(", "),
    //   //   variant: "destructive"
    //   // })
    //   return
    // }

    setLoading(true)
    try {
      const recordData = {
        city: formData.city.trim(),
        monthYear: formData.monthYear,
        no: Number(formData.no),
        nox: Number(formData.nox),
        benzene: Number(formData.benzene),
        toluene: Number(formData.toluene),
        ethylBen: Number(formData.ethylBen),
        mpXylene: Number(formData.mpXylene),
        oXylene: Number(formData.oXylene),
        ws: isNaN(Number(formData.ws)) ? formData.ws : Number(formData.ws),
        temp: Number(formData.temp),
        rh: Number(formData.rh),
        sr: Number(formData.sr),
        rg: Number(formData.rg)
      }

      let response
      if (isEditing) {
        response = await openGDSAPI.updateRecord(editId, recordData)
        // toast({
        //   title: "Success",
        //   description: "Record updated successfully",
        // })
      } else {
        response = await openGDSAPI.createRecord(recordData)
        // toast({
        //   title: "Success",
        //   description: "Record created successfully",
        // })
            setLoading(false)
      }
      if (response.success) {
        // Refresh the records list and statistics
        await fetchRecords()
        await fetchStatistics()
        
        setOpen(false)
        setFormData(initialFormData)
        setEditId(null)
        setIsEditing(false)
      }

      
    } catch (error) {
      console.error("Save error:", error)
      // toast.error(error.message || "Failed to save record")
    } finally {
      setLoading(false)
    }
  }

  // Calculate statistics from current records if API stats not available
  const getDisplayStatistics = () => {
    if (statistics?.overall) {
      return {
        totalRecords: statistics.overall.totalRecords || 0,
        totalCities: statistics.overall.cities?.length || 0,
        avgTemp: statistics.overall.avgTemp?.toFixed(1) || '0.0',
        avgRH: statistics.overall.avgRH?.toFixed(1) || '0.0'
      }
    }
    
    // Fallback to local calculation using normalized data
    return {
      totalRecords: pagination.total_records || records.length,
      totalCities: [...new Set(records.map(r => getFieldValue(r, 'city')))].length,
      avgTemp: records.length > 0 ? (records.reduce((sum, r) => sum + (getFieldValue(r, 'temp') || 0), 0) / records.length).toFixed(1) : '0.0',
      avgRH: records.length > 0 ? (records.reduce((sum, r) => sum + (getFieldValue(r, 'rh') || 0), 0) / records.length).toFixed(1) : '0.0'
    }
  }

  const displayStats = getDisplayStatistics()

  if (pageLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="h-8 w-8 animate-spin mx-auto mb-4" />
          <p className="text-gray-600">Loading environmental data...</p>
        </div>
      </div>
    )
  }

  const logout =()=>{
    localStorage.removeItem("userData")
    router.push("/login")
  }

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-7xl mx-auto">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-3xl font-bold text-gray-900">OpenGDS Environment Dashboard</h1>
          <Button 
            onClick={() => {fetchRecords(); fetchStatistics()}} 
            variant="outline"
            className="flex items-center gap-2"
          >
            <RefreshCw className="h-4 w-4" />
            Refresh Data
          </Button>


          <Button 
            onClick={() =>logout()} 
            variant="outline"
            className="flex items-center gap-2"
          >
            <LogOut className="h-4 w-4" />
           Logout
          </Button>
        </div>
        
        {/* Statistics Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-6">
          <Card>
            <CardContent className="p-6">
              <div className="text-2xl font-bold">{displayStats.totalRecords}</div>
              <p className="text-sm text-gray-600">Total Records</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-6">
              <div className="text-2xl font-bold">{displayStats.totalCities}</div>
              <p className="text-sm text-gray-600">Cities</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-6">
              <div className="text-2xl font-bold">{displayStats.avgTemp}°C</div>
              <p className="text-sm text-gray-600">Avg Temperature</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-6">
              <div className="text-2xl font-bold">{displayStats.avgRH}%</div>
              <p className="text-sm text-gray-600">Avg Humidity</p>
            </CardContent>
          </Card>
        </div>

        {/* Filters */}
        <Card className="mb-6">
          <CardHeader>
            <CardTitle className="text-xl font-semibold">Filters</CardTitle>
          </CardHeader>
          <CardContent>
            <Filters onFilter={handleFilter} />
          </CardContent>
        </Card>

        {/* Data Table */}
        <Card className="mb-6">
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle className="text-xl font-semibold">
              Pollutant Records ({pagination.total_records})
            </CardTitle>
            <Button onClick={handleAdd} className="bg-blue-600 hover:bg-blue-700">
              Add New Record
            </Button>
          </CardHeader>
          <CardContent>
            <DataTable 
              data={filteredRecords} 
              onEdit={handleEdit} 
              onDelete={handleDelete}
              loading={loading}
            />
            
            {/* Pagination */}
            {pagination.total_pages > 1 && (
              <div className="flex items-center justify-between mt-4">
                <div className="text-sm text-gray-500">
                  Showing {((pagination.current_page - 1) * pagination.records_per_page) + 1} to{' '}
                  {Math.min(pagination.current_page * pagination.records_per_page, pagination.total_records)} of{' '}
                  {pagination.total_records} records
                </div>
                <div className="flex items-center gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handlePageChange(pagination.current_page - 1)}
                    disabled={!pagination.has_prev_page || pageLoading}
                  >
                    Previous
                  </Button>
                  <span className="text-sm">
                    Page {pagination.current_page} of {pagination.total_pages}
                  </span>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handlePageChange(pagination.current_page + 1)}
                    disabled={!pagination.has_next_page || pageLoading}
                  >
                    Next
                  </Button>
                </div>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Trends Chart */}
        <Card>
          <CardHeader>
            <CardTitle className="text-xl font-semibold">Environmental Trends</CardTitle>
          </CardHeader>
          <CardContent>
            <TrendChart data={filteredRecords} />
          </CardContent>
        </Card>

        {/* Add/Edit Modal */}
        <Dialog open={open} onOpenChange={setOpen}>
          <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle className="text-xl font-semibold">
                {isEditing ? "Edit Environmental Record" : "Add New Environmental Record"}
              </DialogTitle>
            </DialogHeader>
            
            <RecordForm 
              formData={formData} 
              setFormData={setFormData}
              isEditing={isEditing}
            />
            
            <DialogFooter className="gap-2">
              <Button 
                variant="outline" 
                onClick={() => {
                  setOpen(false)
                  setFormData(initialFormData)
                  setEditId(null)
                  setIsEditing(false)
                }}
                disabled={loading}
              >
                Cancel
              </Button>
              <Button 
                onClick={handleSave}
                // disabled={loading}
                className="bg-blue-600 hover:bg-blue-700"
              >
                {loading ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin mr-2" />
                    Saving...
                  </>
                ) : (
                  isEditing ? "Update Record" : "Save Record"
                )}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    </div>
  )
}