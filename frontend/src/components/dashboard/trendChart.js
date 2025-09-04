"use client"

import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from "recharts"
import { getFieldValue } from "./dataNormalizer"

export function TrendChart({ data }) {
  // Transform data for chart - combine monthYear and sort chronologically
  const chartData = data
    .map(record => ({
      monthYear: getFieldValue(record, 'monthYear'),
      city: getFieldValue(record, 'city'),
      benzene: getFieldValue(record, 'benzene'),
      toluene: getFieldValue(record, 'toluene'),
      no: getFieldValue(record, 'no'),
      nox: getFieldValue(record, 'nox'),
      temp: getFieldValue(record, 'temp'),
      rh: getFieldValue(record, 'rh'),
      ws: getFieldValue(record, 'ws')
    }))
    .filter(record => record.monthYear) // Remove records without monthYear
    .sort((a, b) => {
      // Sort by month-year chronologically
      const [monthA, yearA] = a.monthYear.split('-')
      const [monthB, yearB] = b.monthYear.split('-')
      
      const monthOrder = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 
                         'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec']
      
      if (yearA !== yearB) {
        return parseInt(yearA) - parseInt(yearB)
      }
      
      return monthOrder.indexOf(monthA) - monthOrder.indexOf(monthB)
    })

  // Custom tooltip to show all relevant data
  const CustomTooltip = ({ active, payload, label }) => {
    if (active && payload && payload.length) {
      const data = payload[0].payload
      return (
        <div className="bg-white p-3 border border-gray-300 rounded shadow-lg">
          <p className="font-semibold">{`${label} - ${data.city}`}</p>
          <p className="text-blue-600">{`NO: ${data.no} μg/m³`}</p>
          <p className="text-green-600">{`Benzene: ${data.benzene} μg/m³`}</p>
          <p className="text-orange-600">{`Toluene: ${data.toluene} μg/m³`}</p>
          <p className="text-purple-600">{`NOX: ${data.nox} ppb`}</p>
          <p className="text-red-600">{`Temperature: ${data.temp}°C`}</p>
          <p className="text-cyan-600">{`Humidity: ${data.rh}%`}</p>
        </div>
      )
    }
    return null
  }

  if (!data || data.length === 0) {
    return (
      <div className="flex items-center justify-center h-[300px] text-gray-500">
        No data available for chart
      </div>
    )
  }

  return (
    <div className="w-full">
      {/* Main pollutants chart */}
      <div className="mb-6">
        <h3 className="text-lg font-semibold mb-3">Pollutant Concentrations Over Time</h3>
        <ResponsiveContainer width="100%" height={300}>
          <LineChart data={chartData} margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
            <XAxis 
              dataKey="monthYear" 
              tick={{ fontSize: 12 }}
              angle={-45}
              textAnchor="end"
              height={60}
            />
            <YAxis 
              label={{ value: 'Concentration (μg/m³)', angle: -90, position: 'insideLeft' }}
              tick={{ fontSize: 12 }}
            />
            <Tooltip content={<CustomTooltip />} />
            <Legend />
            <Line 
              type="monotone" 
              dataKey="benzene" 
              stroke="#8884d8" 
              strokeWidth={2}
              dot={{ r: 4 }}
              name="Benzene (μg/m³)"
            />
            <Line 
              type="monotone" 
              dataKey="toluene" 
              stroke="#82ca9d" 
              strokeWidth={2}
              dot={{ r: 4 }}
              name="Toluene (μg/m³)"
            />
            <Line 
              type="monotone" 
              dataKey="no" 
              stroke="#ff7300" 
              strokeWidth={2}
              dot={{ r: 4 }}
              name="NO (μg/m³)"
            />
            <Line 
              type="monotone" 
              dataKey="nox" 
              stroke="#ff0080" 
              strokeWidth={2}
              dot={{ r: 4 }}
              name="NOX (ppb)"
            />
          </LineChart>
        </ResponsiveContainer>
      </div>

      {/* Environmental parameters chart */}
      <div>
        <h3 className="text-lg font-semibold mb-3">Environmental Parameters Over Time</h3>
        <ResponsiveContainer width="100%" height={300}>
          <LineChart data={chartData} margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
            <XAxis 
              dataKey="monthYear" 
              tick={{ fontSize: 12 }}
              angle={-45}
              textAnchor="end"
              height={60}
            />
            <YAxis 
              label={{ value: 'Value', angle: -90, position: 'insideLeft' }}
              tick={{ fontSize: 12 }}
            />
            <Tooltip content={<CustomTooltip />} />
            <Legend />
            <Line 
              type="monotone" 
              dataKey="temp" 
              stroke="#ff4444" 
              strokeWidth={2}
              dot={{ r: 4 }}
              name="Temperature (°C)"
            />
            <Line 
              type="monotone" 
              dataKey="rh" 
              stroke="#4444ff" 
              strokeWidth={2}
              dot={{ r: 4 }}
              name="Humidity (%)"
            />
          </LineChart>
        </ResponsiveContainer>
      </div>

      {/* Data summary */}
      <div className="mt-4 p-4 bg-gray-50 rounded-lg">
        <h4 className="font-semibold mb-2">Chart Data Summary</h4>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
          <div>
            <span className="font-medium">Records:</span> {chartData.length}
          </div>
          <div>
            <span className="font-medium">Cities:</span> {[...new Set(chartData.map(d => d.city))].join(', ')}
          </div>
          <div>
            <span className="font-medium">Date Range:</span> {chartData[0]?.monthYear} - {chartData[chartData.length - 1]?.monthYear}
          </div>
          <div>
            <span className="font-medium">Avg Temp:</span> {chartData.length > 0 ? (chartData.reduce((sum, d) => sum + d.temp, 0) / chartData.length).toFixed(1) : 0}°C
          </div>
        </div>
      </div>
    </div>
  )
}