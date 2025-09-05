const fieldMapping = {
  'City': 'city',
  'Month - Year': 'monthYear',
  'NO (µg/m3)': 'no',
  'NOX (ppb)': 'nox',
  'Benzene (µg/m3)': 'benzene',
  'Toluene (µg/m3)': 'toluene',
  'Ethyl Ben (µg/m3)': 'ethylBen',
  'MP Xylene (µg/m3)': 'mpXylene',
  'O xylene (µg/m3)': 'oXylene',
  'WS (m/s)': 'ws',
  'Temp (°C)': 'temp',
  'RH (%)': 'rh',
  'SR (W/m2)': 'sr',
  'RG (mm)': 'rg'
}

// Normalize a single record to match schema
export function normalizeRecord(record) {
  if (record.city && record.monthYear) {
    return record
  }

  // Create normalized record
  const normalized = {
    _id: record._id,
    createdAt: record.createdAt,
    updatedAt: record.updatedAt,
    __v: record.__v
  }

  // Map CSV fields to schema fields
  Object.keys(fieldMapping).forEach(csvField => {
    const schemaField = fieldMapping[csvField]
    if (record[csvField] !== undefined && record[csvField] !== null) {
      normalized[schemaField] = record[csvField]
    }
  })

  return normalized
}

export function normalizeRecords(records) {
  console.log('Normalizing records:', records.length)
  const normalized = records.map(record => normalizeRecord(record))
  console.log('First normalized record:', normalized[0])
  return normalized
}

export function getFieldValue(record, fieldName) {
  // Try schema field first
  if (record[fieldName] !== undefined && record[fieldName] !== null) {
    return record[fieldName]
  }

  // Try to find CSV field equivalent
  const csvField = Object.keys(fieldMapping).find(
    key => fieldMapping[key] === fieldName
  )
  
  if (csvField && record[csvField] !== undefined && record[csvField] !== null) {
    return record[csvField]
  }

  return undefined
}

// Check if record has CSV format fields
export function isCSVFormat(record) {
  return record['City'] !== undefined || record['Month - Year'] !== undefined
}

// Convert record to API format for sending to backend
export function prepareForAPI(record) {
  return {
    city: getFieldValue(record, 'city'),
    monthYear: getFieldValue(record, 'monthYear'),
    no: getFieldValue(record, 'no'),
    nox: getFieldValue(record, 'nox'),
    benzene: getFieldValue(record, 'benzene'),
    toluene: getFieldValue(record, 'toluene'),
    ethylBen: getFieldValue(record, 'ethylBen'),
    mpXylene: getFieldValue(record, 'mpXylene'),
    oXylene: getFieldValue(record, 'oXylene'),
    ws: getFieldValue(record, 'ws'),
    temp: getFieldValue(record, 'temp'),
    rh: getFieldValue(record, 'rh'),
    sr: getFieldValue(record, 'sr'),
    rg: getFieldValue(record, 'rg')
  }
}

export function debugRecord(record) {
  console.log('Record fields:', Object.keys(record))
  console.log('Has city field:', record.city !== undefined)
  console.log('Has City field:', record['City'] !== undefined)
  console.log('City value:', getFieldValue(record, 'city'))
  console.log('Month-Year value:', getFieldValue(record, 'monthYear'))
}