// components/dashboard/recordForm.jsx
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"

export function RecordForm({ formData, setFormData, isEditing }) {
  const handleInputChange = (field, value) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }))
  }

  // Month options for dropdown
  const months = [
    "Jan", "Feb", "Mar", "Apr", "May", "Jun",
    "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"
  ]

  // Year options (last 10 years)
  const years = Array.from({ length: 10 }, (_, i) => {
    const year = new Date().getFullYear() - i
    return year.toString().slice(-2) // Get last 2 digits
  })

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 py-4">
      {/* Basic Information */}
      <div className="space-y-2">
        <Label htmlFor="city" className="text-sm font-medium">
          City <span className="text-red-500">*</span>
        </Label>
        <Input
          id="city"
          value={formData.city}
          onChange={(e) => handleInputChange("city", e.target.value)}
          placeholder="Enter city name"
          className="w-full"
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="monthYear" className="text-sm font-medium">
          Month-Year <span className="text-red-500">*</span>
        </Label>
        <Input
          id="monthYear"
          value={formData.monthYear}
          onChange={(e) => handleInputChange("monthYear", e.target.value)}
          placeholder="e.g., Jan-19"
          className="w-full"
        />
        <p className="text-xs text-gray-500">Format: MMM-YY (e.g., Jan-19)</p>
      </div>

      {/* Pollutant Concentrations */}
      <div className="space-y-2">
        <Label htmlFor="no" className="text-sm font-medium">
          NO (μg/m³) <span className="text-red-500">*</span>
        </Label>
        <Input
          id="no"
          type="number"
          step="0.01"
          min="0"
          value={formData.no}
          onChange={(e) => handleInputChange("no", e.target.value)}
          placeholder="Enter NO concentration"
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="nox" className="text-sm font-medium">
          NOX (ppb) <span className="text-red-500">*</span>
        </Label>
        <Input
          id="nox"
          type="number"
          step="0.01"
          min="0"
          value={formData.nox}
          onChange={(e) => handleInputChange("nox", e.target.value)}
          placeholder="Enter NOX concentration"
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="benzene" className="text-sm font-medium">
          Benzene (μg/m³) <span className="text-red-500">*</span>
        </Label>
        <Input
          id="benzene"
          type="number"
          step="0.01"
          min="0"
          value={formData.benzene}
          onChange={(e) => handleInputChange("benzene", e.target.value)}
          placeholder="Enter Benzene concentration"
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="toluene" className="text-sm font-medium">
          Toluene (μg/m³) <span className="text-red-500">*</span>
        </Label>
        <Input
          id="toluene"
          type="number"
          step="0.01"
          min="0"
          value={formData.toluene}
          onChange={(e) => handleInputChange("toluene", e.target.value)}
          placeholder="Enter Toluene concentration"
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="ethylBen" className="text-sm font-medium">
          Ethyl Benzene (μg/m³) <span className="text-red-500">*</span>
        </Label>
        <Input
          id="ethylBen"
          type="number"
          step="0.01"
          min="0"
          value={formData.ethylBen}
          onChange={(e) => handleInputChange("ethylBen", e.target.value)}
          placeholder="Enter Ethyl Benzene concentration"
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="mpXylene" className="text-sm font-medium">
          MP Xylene (μg/m³) <span className="text-red-500">*</span>
        </Label>
        <Input
          id="mpXylene"
          type="number"
          step="0.01"
          min="0"
          value={formData.mpXylene}
          onChange={(e) => handleInputChange("mpXylene", e.target.value)}
          placeholder="Enter MP Xylene concentration"
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="oXylene" className="text-sm font-medium">
          O Xylene (μg/m³) <span className="text-red-500">*</span>
        </Label>
        <Input
          id="oXylene"
          type="number"
          step="0.01"
          min="0"
          value={formData.oXylene}
          onChange={(e) => handleInputChange("oXylene", e.target.value)}
          placeholder="Enter O Xylene concentration"
        />
      </div>

      {/* Environmental Parameters */}
      <div className="space-y-2">
        <Label htmlFor="ws" className="text-sm font-medium">
          Wind Speed (m/s) <span className="text-red-500">*</span>
        </Label>
        <Input
          id="ws"
          value={formData.ws}
          onChange={(e) => handleInputChange("ws", e.target.value)}
          placeholder="Enter wind speed or *"
        />
        <p className="text-xs text-gray-500">Enter number or "*" for no data</p>
      </div>

      <div className="space-y-2">
        <Label htmlFor="temp" className="text-sm font-medium">
          Temperature (°C) <span className="text-red-500">*</span>
        </Label>
        <Input
          id="temp"
          type="number"
          step="0.01"
          value={formData.temp}
          onChange={(e) => handleInputChange("temp", e.target.value)}
          placeholder="Enter temperature"
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="rh" className="text-sm font-medium">
          Relative Humidity (%) <span className="text-red-500">*</span>
        </Label>
        <Input
          id="rh"
          type="number"
          step="0.01"
          min="0"
          max="100"
          value={formData.rh}
          onChange={(e) => handleInputChange("rh", e.target.value)}
          placeholder="Enter humidity (0-100)"
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="sr" className="text-sm font-medium">
          Solar Radiation (W/m²) <span className="text-red-500">*</span>
        </Label>
        <Input
          id="sr"
          type="number"
          step="0.01"
          min="0"
          value={formData.sr}
          onChange={(e) => handleInputChange("sr", e.target.value)}
          placeholder="Enter solar radiation"
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="rg" className="text-sm font-medium">
          Rain Gauge (mm) <span className="text-red-500">*</span>
        </Label>
        <Input
          id="rg"
          type="number"
          step="0.01"
          min="0"
          value={formData.rg}
          onChange={(e) => handleInputChange("rg", e.target.value)}
          placeholder="Enter rainfall"
        />
      </div>
    </div>
  )
}