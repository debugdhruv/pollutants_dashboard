import {
  Table,
  TableBody,
  TableCaption,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Edit, Trash2, Eye } from "lucide-react"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { ScrollArea } from "@/components/ui/scroll-area"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog"

import { getFieldValue } from "./dataNormalizer"

export function DataTable({ data, onEdit, onDelete, loading }) {
  const RecordDetails = ({ record }) => (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 py-4">
      <div>
        <h4 className="font-semibold mb-2">Basic Information</h4>
        <div className="space-y-1 text-sm">
          <p><span className="font-medium">City:</span> {record.city}</p>
          <p><span className="font-medium">Month-Year:</span> {record.monthYear}</p>
          <p><span className="font-medium">Created:</span> {new Date(record.createdAt).toLocaleDateString()}</p>
        </div>
      </div>
      
      <div>
        <h4 className="font-semibold mb-2">Environmental Data</h4>
        <div className="space-y-1 text-sm">
          <p><span className="font-medium">Temperature:</span> {record.temp}°C</p>
          <p><span className="font-medium">Humidity:</span> {record.rh}%</p>
          <p><span className="font-medium">Wind Speed:</span> {record.ws} m/s</p>
          <p><span className="font-medium">Solar Radiation:</span> {record.sr} W/m²</p>
          <p><span className="font-medium">Rain Gauge:</span> {record.rg} mm</p>
        </div>
      </div>
      
      <div className="col-span-full">
        <h4 className="font-semibold mb-2">Pollutant Concentrations</h4>
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4 text-sm">
          <div>
            <p><span className="font-medium">NO:</span> {record.no} μg/m³</p>
            <p><span className="font-medium">NOX:</span> {record.nox} ppb</p>
            <p><span className="font-medium">Benzene:</span> {record.benzene} μg/m³</p>
          </div>
          <div>
            <p><span className="font-medium">Toluene:</span> {record.toluene} μg/m³</p>
            <p><span className="font-medium">Ethyl Benzene:</span> {record.ethylBen} μg/m³</p>
            <p><span className="font-medium">MP Xylene:</span> {record.mpXylene} μg/m³</p>
          </div>
          <div>
            <p><span className="font-medium">O Xylene:</span> {record.oXylene} μg/m³</p>
          </div>
        </div>
      </div>
    </div>
  )

  const getAirQualityStatus = (record) => {
    // air quality measure karega based on multiple factors
    const avgPollutant = (record.no + record.benzene + record.toluene) / 3
    
    if (avgPollutant < 10) return { status: "Good", color: "bg-green-500" }
    if (avgPollutant < 20) return { status: "Moderate", color: "bg-yellow-500" }
    if (avgPollutant < 30) return { status: "Poor", color: "bg-orange-500" }
    return { status: "Hazardous", color: "bg-red-500" }
  }

  const handleDelete = (id) => {
    onDelete(id)
  }

  return (
    <div className="w-full">
      {/* Horizontal scroll container */}
      <div className="rounded-md border overflow-hidden">
        <div className="overflow-x-auto">
          <div className="min-w-[900px]">
            <ScrollArea className="h-[600px]">
              <Table>
                <TableCaption>
                  Environmental monitoring data from OpenGDS
                </TableCaption>
                <TableHeader>
                  <TableRow>
                    <TableHead className="min-w-[120px]">City</TableHead>
                    <TableHead className="min-w-[120px]">Period</TableHead>
                    <TableHead className="min-w-[110px]">Temperature</TableHead>
                    <TableHead className="min-w-[100px]">Humidity</TableHead>
                    <TableHead className="min-w-[120px]">NO</TableHead>
                    <TableHead className="min-w-[120px]">Benzene</TableHead>
                    <TableHead className="min-w-[120px]">Toluene</TableHead>
                    <TableHead className="min-w-[120px]">Air Quality</TableHead>
                    <TableHead className="min-w-[200px]">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {data.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={9} className="text-center py-8 text-gray-500">
                        No records found. Add some environmental data to get started.
                      </TableCell>
                    </TableRow>
                  ) : (
                    data.map((record) => {
                      const airQuality = getAirQualityStatus(record)
                      return (
                        <TableRow key={record._id || record.id}>
                          <TableCell className="font-medium">{record.city}</TableCell>
                          <TableCell>{record.monthYear}</TableCell>
                          <TableCell>{record.temp}°C</TableCell>
                          <TableCell>{record.rh}%</TableCell>
                          <TableCell>{record.no} μg/m³</TableCell>
                          <TableCell>{record.benzene} μg/m³</TableCell>
                          <TableCell>{record.toluene} μg/m³</TableCell>
                          <TableCell>
                            <Badge 
                              className={`${airQuality.color} text-white`}
                              variant="secondary"
                            >
                              {airQuality.status}
                            </Badge>
                          </TableCell>
                          <TableCell>
                            <div className="flex items-center gap-2">
                              {/* View Details Dialog */}
                              <Dialog>
                                <DialogTrigger asChild>
                                  <Button variant="outline" size="sm" title="View Details">
                                    <Eye className="h-4 w-4" />
                                  </Button>
                                </DialogTrigger>
                                <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
                                  <DialogHeader>
                                    <DialogTitle>
                                      Environmental Record Details - {getFieldValue(record, 'city')} ({getFieldValue(record, 'monthYear')})
                                    </DialogTitle>
                                  </DialogHeader>
                                  <RecordDetails record={record} />
                                </DialogContent>
                              </Dialog>
                              
                              {/* Edit Button */}
                              <Button 
                                variant="outline" 
                                size="sm" 
                                onClick={() => onEdit(record)}
                                disabled={loading}
                                title="Edit Record"
                              >
                                <Edit className="h-4 w-4" />
                              </Button>
                              
                              {/* Delete Button with Confirmation */}
                              <AlertDialog>
                                <AlertDialogTrigger asChild>
                                  <Button 
                                    variant="outline" 
                                    size="sm" 
                                    disabled={loading}
                                    className="text-red-600 hover:text-red-700 hover:bg-red-50"
                                    title="Delete Record"
                                  >
                                    <Trash2 className="h-4 w-4" />
                                  </Button>
                                </AlertDialogTrigger>
                                <AlertDialogContent>
                                  <AlertDialogHeader>
                                    <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
                                    <AlertDialogDescription>
                                      This action cannot be undone. This will permanently delete the 
                                      environmental record for {getFieldValue(record, 'city')} ({getFieldValue(record, 'monthYear')}).
                                    </AlertDialogDescription>
                                  </AlertDialogHeader>
                                  <AlertDialogFooter>
                                    <AlertDialogCancel>Cancel</AlertDialogCancel>
                                    <AlertDialogAction
                                      onClick={() => handleDelete(record._id || record.id)}
                                      className="bg-red-600 hover:bg-red-700"
                                    >
                                      Delete
                                    </AlertDialogAction>
                                  </AlertDialogFooter>
                                </AlertDialogContent>
                              </AlertDialog>
                            </div>
                          </TableCell>
                        </TableRow>
                      )
                    })
                  )}
                </TableBody>
              </Table>
            </ScrollArea>
          </div>
        </div>
      </div>
      
      {/* Footer with record count and air quality legend */}
      {data.length > 0 && (
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 px-2 py-4 border-t">
          <div className="text-sm text-gray-500">
            Showing {data.length} record(s)
          </div>
          <div className="flex flex-wrap items-center gap-2 text-sm text-gray-500">
            <span className="mr-2">Air Quality:</span>
            <Badge variant="outline" className="gap-1">
              <span className="w-2 h-2 bg-green-500 rounded-full"></span>
              Good
            </Badge>
            <Badge variant="outline" className="gap-1">
              <span className="w-2 h-2 bg-yellow-500 rounded-full"></span>
              Moderate
            </Badge>
            <Badge variant="outline" className="gap-1">
              <span className="w-2 h-2 bg-orange-500 rounded-full"></span>
              Poor
            </Badge>
            <Badge variant="outline" className="gap-1">
              <span className="w-2 h-2 bg-red-500 rounded-full"></span>
              Hazardous
            </Badge>
          </div>
        </div>
      )}
    </div>
  )
}