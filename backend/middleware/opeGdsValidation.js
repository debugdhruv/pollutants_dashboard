// middleware/openGDSValidation.js

// Validate OpenGDS record creation
const validateOpenGDSCreate = (req, res, next) => {
  const {
    city, monthYear, no, nox, benzene, toluene,
    ethylBen, mpXylene, oXylene, ws, temp, rh, sr, rg
  } = req.body;
  
  const errors = [];

  // Required field validation
  if (!city || typeof city !== 'string' || city.trim().length === 0) {
    errors.push('City is required and must be a non-empty string');
  }

  if (!monthYear || typeof monthYear !== 'string' || monthYear.trim().length === 0) {
    errors.push('Month-Year is required and must be a non-empty string');
  }

  // Numeric field validations
  const numericFields = [
    { field: 'no', value: no, name: 'NO' },
    { field: 'nox', value: nox, name: 'NOX' },
    { field: 'benzene', value: benzene, name: 'Benzene' },
    { field: 'toluene', value: toluene, name: 'Toluene' },
    { field: 'ethylBen', value: ethylBen, name: 'Ethyl Benzene' },
    { field: 'mpXylene', value: mpXylene, name: 'MP Xylene' },
    { field: 'oXylene', value: oXylene, name: 'O Xylene' },
    { field: 'temp', value: temp, name: 'Temperature' },
    { field: 'rh', value: rh, name: 'Relative Humidity' },
    { field: 'sr', value: sr, name: 'Solar Radiation' },
    { field: 'rg', value: rg, name: 'Rain Gauge' }
  ];

  numericFields.forEach(({ field, value, name }) => {
    if (value === undefined || value === null) {
      errors.push(`${name} is required`);
    } else if (typeof value !== 'number' || isNaN(value)) {
      errors.push(`${name} must be a valid number`);
    } else if (value < 0) {
      errors.push(`${name} must be greater than or equal to 0`);
    }
  });

  // Special validation for RH (0-100)
  if (typeof rh === 'number' && !isNaN(rh) && (rh < 0 || rh > 100)) {
    errors.push('Relative Humidity must be between 0 and 100');
  }

  // WS can be number or string (for "*" values)
  if (ws === undefined || ws === null) {
    errors.push('Wind Speed (WS) is required');
  } else if (typeof ws !== 'number' && typeof ws !== 'string') {
    errors.push('Wind Speed (WS) must be a number or string');
  } else if (typeof ws === 'number' && (isNaN(ws) || ws < 0)) {
    errors.push('Wind Speed (WS) must be a valid positive number');
  }

  // Month-Year format validation (optional - if you want strict format)
  if (monthYear && typeof monthYear === 'string') {
    const monthYearRegex = /^(Jan|Feb|Mar|Apr|May|Jun|Jul|Aug|Sep|Oct|Nov|Dec)-\d{2}$/;
    if (!monthYearRegex.test(monthYear.trim())) {
      errors.push('Month-Year must be in format MMM-YY (e.g., Jan-19)');
    }
  }

  if (errors.length > 0) {
    return res.status(400).json({
      success: false,
      message: 'Validation failed',
      errors
    });
  }

  // Trim string values
  req.body.city = city.trim();
  req.body.monthYear = monthYear.trim();

  next();
};

// Validate OpenGDS record update (similar to create but all fields optional)
const validateOpenGDSUpdate = (req, res, next) => {
  const {
    city, monthYear, no, nox, benzene, toluene,
    ethylBen, mpXylene, oXylene, ws, temp, rh, sr, rg
  } = req.body;
  
  const errors = [];

  // Optional field validation (only validate if provided)
  if (city !== undefined && (typeof city !== 'string' || city.trim().length === 0)) {
    errors.push('City must be a non-empty string');
  }

  if (monthYear !== undefined && (typeof monthYear !== 'string' || monthYear.trim().length === 0)) {
    errors.push('Month-Year must be a non-empty string');
  }

  // Numeric field validations (only if provided)
  const numericFields = [
    { field: 'no', value: no, name: 'NO' },
    { field: 'nox', value: nox, name: 'NOX' },
    { field: 'benzene', value: benzene, name: 'Benzene' },
    { field: 'toluene', value: toluene, name: 'Toluene' },
    { field: 'ethylBen', value: ethylBen, name: 'Ethyl Benzene' },
    { field: 'mpXylene', value: mpXylene, name: 'MP Xylene' },
    { field: 'oXylene', value: oXylene, name: 'O Xylene' },
    { field: 'temp', value: temp, name: 'Temperature' },
    { field: 'rh', value: rh, name: 'Relative Humidity' },
    { field: 'sr', value: sr, name: 'Solar Radiation' },
    { field: 'rg', value: rg, name: 'Rain Gauge' }
  ];

  numericFields.forEach(({ field, value, name }) => {
    if (value !== undefined) {
      if (typeof value !== 'number' || isNaN(value)) {
        errors.push(`${name} must be a valid number`);
      } else if (value < 0) {
        errors.push(`${name} must be greater than or equal to 0`);
      }
    }
  });

  // Special validation for RH (0-100)
  if (rh !== undefined && typeof rh === 'number' && !isNaN(rh) && (rh < 0 || rh > 100)) {
    errors.push('Relative Humidity must be between 0 and 100');
  }

  // WS validation (if provided)
  if (ws !== undefined) {
    if (typeof ws !== 'number' && typeof ws !== 'string') {
      errors.push('Wind Speed (WS) must be a number or string');
    } else if (typeof ws === 'number' && (isNaN(ws) || ws < 0)) {
      errors.push('Wind Speed (WS) must be a valid positive number');
    }
  }

  // Month-Year format validation (if provided)
  if (monthYear !== undefined && typeof monthYear === 'string') {
    const monthYearRegex = /^(Jan|Feb|Mar|Apr|May|Jun|Jul|Aug|Sep|Oct|Nov|Dec)-\d{2}$/;
    if (!monthYearRegex.test(monthYear.trim())) {
      errors.push('Month-Year must be in format MMM-YY (e.g., Jan-19)');
    }
  }

  if (errors.length > 0) {
    return res.status(400).json({
      success: false,
      message: 'Validation failed',
      errors
    });
  }

  // Trim string values if provided
  if (city) req.body.city = city.trim();
  if (monthYear) req.body.monthYear = monthYear.trim();

  next();
};

// Validate bulk creation
const validateBulkOpenGDS = (req, res, next) => {
  const { records } = req.body;

  if (!Array.isArray(records) || records.length === 0) {
    return res.status(400).json({
      success: false,
      message: 'Records array is required and must not be empty'
    });
  }

  if (records.length > 1000) {
    return res.status(400).json({
      success: false,
      message: 'Maximum 1000 records allowed per bulk operation'
    });
  }

  next();
};

module.exports = {
  validateOpenGDSCreate,
  validateOpenGDSUpdate,
  validateBulkOpenGDS
};