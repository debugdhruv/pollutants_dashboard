const  OpenGDS  = require('../Models/openGdsModel');


const fieldMapping = {
  // Schema fields -> [schema_field, csv_field]
  'city': ['city', 'City'],
  'monthYear': ['monthYear', 'Month - Year'],
  'no': ['no', 'NO (µg/m3)'],
  'nox': ['nox', 'NOX (ppb)'],
  'benzene': ['benzene', 'Benzene (µg/m3)'],
  'toluene': ['toluene', 'Toluene (µg/m3)'],
  'ethylBen': ['ethylBen', 'Ethyl Ben (µg/m3)'],
  'mpXylene': ['mpXylene', 'MP Xylene (µg/m3)'],
  'oXylene': ['oXylene', 'O xylene (µg/m3)'],
  'ws': ['ws', 'WS (m/s)'],
  'temp': ['temp', 'Temp (°C)'],
  'rh': ['rh', 'RH (%)'],
  'sr': ['sr', 'SR (W/m2)'],
  'rg': ['rg', 'RG (mm)']
};


// Helper function to build query from request parameters
const buildQuery = (queryParams) => {
  const query = {};
  
  // Handle different operators
  Object.keys(queryParams).forEach(key => {
    if (key.startsWith('_') || ['page', 'limit', 'sort', 'fields', 'search'].includes(key)) {
      return; // Skip pagination and system parameters
    }
    
    const value = queryParams[key];
    
    // Handle range queries (field_min, field_max)
    if (key.endsWith('_min') || key.endsWith('_max')) {
      const baseField = key.replace(/_min$|_max$/, '');
      const operator = key.endsWith('_min') ? '$gte' : '$lte';
      
      // Check if this field has mapping
      if (fieldMapping[baseField]) {
        const [schemaField, csvField] = fieldMapping[baseField];
        
        // Create OR condition for both field formats
        if (!query.$or) {
          query.$or = [];
        }
        
        const schemaCondition = {};
        schemaCondition[schemaField] = { [operator]: Number(value) };
        
        const csvCondition = {};
        csvCondition[csvField] = { [operator]: Number(value) };
        
        query.$or.push(schemaCondition, csvCondition);
      }
      return;
    }
    
    // Handle direct field queries
    if (fieldMapping[key]) {
      const [schemaField, csvField] = fieldMapping[key];
      
      // Create OR condition for both field formats
      if (!query.$or) {
        query.$or = [];
      }
      
      const schemaCondition = {};
      const csvCondition = {};
      
      if (Array.isArray(value)) {
        schemaCondition[schemaField] = { $in: value };
        csvCondition[csvField] = { $in: value };
      } else {
        schemaCondition[schemaField] = value;
        csvCondition[csvField] = value;
      }
      
      query.$or.push(schemaCondition, csvCondition);
    }
  });
  
  return query;
};

// Helper function to handle advanced filtering
const buildAdvancedQuery = (req) => {
  let query = {};
  
  // Text search across multiple fields (both formats)
  if (req.query.search) {
    query.$or = [
      { city: { $regex: req.query.search, $options: 'i' } },
      { 'City': { $regex: req.query.search, $options: 'i' } },
      { monthYear: { $regex: req.query.search, $options: 'i' } },
      { 'Month - Year': { $regex: req.query.search, $options: 'i' } }
    ];
  }
  
  // Range queries for numeric fields
  const numericFields = ['no', 'nox', 'benzene', 'toluene', 'ethylBen', 'mpXylene', 'oXylene', 'temp', 'rh', 'sr', 'rg'];
  
  numericFields.forEach(field => {
    const minKey = `${field}_min`;
    const minValue = req.query[minKey];
    const maxKey = `${field}_max`;
    const maxValue = req.query[maxKey];
    
    if (minValue || maxValue) {
      const [schemaField, csvField] = fieldMapping[field];
      const conditions = [];
      
      // Build conditions for both field formats
      if (minValue && maxValue) {
        // Range condition
        conditions.push({
          [schemaField]: { $gte: Number(minValue), $lte: Number(maxValue) }
        });
        conditions.push({
          [csvField]: { $gte: Number(minValue), $lte: Number(maxValue) }
        });
      } else if (minValue) {
        // Min only
        conditions.push({ [schemaField]: { $gte: Number(minValue) } });
        conditions.push({ [csvField]: { $gte: Number(minValue) } });
      } else if (maxValue) {
        // Max only
        conditions.push({ [schemaField]: { $lte: Number(maxValue) } });
        conditions.push({ [csvField]: { $lte: Number(maxValue) } });
      }
      
      if (conditions.length > 0) {
        if (!query.$or) {
          query.$or = [];
        }
        query.$or.push(...conditions);
      }
    }
  });
  
  // Direct field matches
  const directFields = ['city', 'monthYear'];
  directFields.forEach(field => {
    if (req.query[field]) {
      const [schemaField, csvField] = fieldMapping[field];
      const conditions = [
        { [schemaField]: { $regex: req.query[field], $options: 'i' } },
        { [csvField]: { $regex: req.query[field], $options: 'i' } }
      ];
      
      if (!query.$or) {
        query.$or = [];
      }
      query.$or.push(...conditions);
    }
  });
  
  // Date range queries
  if (req.query.date_from || req.query.date_to) {
    query.createdAt = {};
    if (req.query.date_from) query.createdAt.$gte = new Date(req.query.date_from);
    if (req.query.date_to) query.createdAt.$lte = new Date(req.query.date_to);
  }
  
  // Handle explicit OR conditions from frontend
  if (req.query.$or) {
    try {
      const orConditions = JSON.parse(req.query.$or);
      if (!query.$or) {
        query.$or = [];
      }
      query.$or.push(...orConditions);
    } catch (error) {
      console.log('Invalid $or condition');
    }
  }
  
  // Handle AND conditions
  if (req.query.$and) {
    try {
      const andConditions = JSON.parse(req.query.$and);
      query.$and = andConditions;
    } catch (error) {
      console.log('Invalid $and condition');
    }
  }
  
  return query;
};

// Update the main controller function
const getOpenGDSRecords = async (req, res) => {
  try {
    // Build query that handles both field formats
    const query = buildAdvancedQuery(req);
    
    console.log('Generated MongoDB Query:', JSON.stringify(query, null, 2));
    
    // Pagination
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const skip = (page - 1) * limit;
    
    // Sorting - handle both field formats
    let sort = {};
    if (req.query.sort) {
      const sortFields = req.query.sort.split(',');
      sortFields.forEach(field => {
        const trimmedField = field.trim();
        if (trimmedField.startsWith('-')) {
          const fieldName = trimmedField.substring(1);
          // Try both field formats for sorting
          if (fieldMapping[fieldName]) {
            const [schemaField, csvField] = fieldMapping[fieldName];
            sort[schemaField] = -1;
            sort[csvField] = -1;
          } else {
            sort[fieldName] = -1;
          }
        } else {
          if (fieldMapping[trimmedField]) {
            const [schemaField, csvField] = fieldMapping[trimmedField];
            sort[schemaField] = 1;
            sort[csvField] = 1;
          } else {
            sort[trimmedField] = 1;
          }
        }
      });
    } else {
      sort = { createdAt: -1 }; // Default sort by newest first
    }
    
    // Field selection
    let selectFields = '';
    if (req.query.fields) {
      selectFields = req.query.fields.split(',').join(' ');
    }
    
    // Execute query
    const records = await OpenGDS.find(query)
      .select(selectFields)
      .sort(sort)
      .skip(skip)
      .limit(limit)
      .lean();
    
    // Get total count for pagination
    const total = await OpenGDS.countDocuments(query);
    
    // Calculate pagination info
    const totalPages = Math.ceil(total / limit);
    const hasNextPage = page < totalPages;
    const hasPrevPage = page > 1;
    
    res.json({
      success: true,
      data: {
        records,
        pagination: {
          current_page: page,
          total_pages: totalPages,
          total_records: total,
          records_per_page: limit,
          has_next_page: hasNextPage,
          has_prev_page: hasPrevPage,
          next_page: hasNextPage ? page + 1 : null,
          prev_page: hasPrevPage ? page - 1 : null
        },
        query_applied: query,
        sort_applied: sort
      }
    });

  } catch (error) {
    console.error('Get OpenGDS records error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error fetching records',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

// @desc    Get single OpenGDS record by ID
// @route   GET /api/opengds/:id
// @access  Private
const getOpenGDSRecord = async (req, res) => {
  try {
    const record = await OpenGDS.findById(req.params.id);
    
    if (!record) {
      return res.status(404).json({
        success: false,
        message: 'Record not found'
      });
    }
    
    res.json({
      success: true,
      data: { record }
    });

  } catch (error) {
    console.error('Get OpenGDS record error:', error);
    
    if (error.name === 'CastError') {
      return res.status(400).json({
        success: false,
        message: 'Invalid record ID format'
      });
    }
    
    res.status(500).json({
      success: false,
      message: 'Server error fetching record',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

// @desc    Create new OpenGDS record
// @route   POST /api/opengds
// @access  Private
const createOpenGDSRecord = async (req, res) => {
  try {
    const record = new OpenGDS(req.body);
    const savedRecord = await record.save();
    
    res.status(201).json({
      success: true,
      message: 'Record created successfully',
      data: { record: savedRecord }
    });

  } catch (error) {
    console.error('Create OpenGDS record error:', error);
    
    if (error.name === 'ValidationError') {
      const validationErrors = Object.values(error.errors).map(err => err.message);
      return res.status(400).json({
        success: false,
        message: 'Validation failed',
        errors: validationErrors
      });
    }
    
    if (error.code === 11000) {
      return res.status(400).json({
        success: false,
        message: 'Duplicate record exists'
      });
    }
    
    res.status(500).json({
      success: false,
      message: 'Server error creating record',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

// @desc    Create multiple OpenGDS records (bulk insert)
// @route   POST /api/opengds/bulk
// @access  Private
const createBulkOpenGDSRecords = async (req, res) => {
  try {
    const records = req.body.records;
    
    if (!Array.isArray(records) || records.length === 0) {
      return res.status(400).json({
        success: false,
        message: 'Records array is required'
      });
    }
    
    const savedRecords = await OpenGDS.insertMany(records);
    
    res.status(201).json({
      success: true,
      message: `${savedRecords.length} records created successfully`,
      data: { 
        records: savedRecords,
        count: savedRecords.length
      }
    });

  } catch (error) {
    console.error('Bulk create OpenGDS records error:', error);
    
    if (error.name === 'ValidationError' || (error.writeErrors && error.writeErrors.length > 0)) {
      return res.status(400).json({
        success: false,
        message: 'Validation failed for one or more records',
        errors: error.writeErrors || [error.message]
      });
    }
    
    res.status(500).json({
      success: false,
      message: 'Server error creating records',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

// @desc    Update OpenGDS record
// @route   PUT /api/opengds/:id
// @access  Private
const updateOpenGDSRecord = async (req, res) => {
  try {
    const record = await OpenGDS.findByIdAndUpdate(
      req.params.id,
      req.body,
      {
        new: true,
        runValidators: true
      }
    );
    
    if (!record) {
      return res.status(404).json({
        success: false,
        message: 'Record not found'
      });
    }
    
    res.json({
      success: true,
      message: 'Record updated successfully',
      data: { record }
    });

  } catch (error) {
    console.error('Update OpenGDS record error:', error);
    
    if (error.name === 'CastError') {
      return res.status(400).json({
        success: false,
        message: 'Invalid record ID format'
      });
    }
    
    if (error.name === 'ValidationError') {
      const validationErrors = Object.values(error.errors).map(err => err.message);
      return res.status(400).json({
        success: false,
        message: 'Validation failed',
        errors: validationErrors
      });
    }
    
    res.status(500).json({
      success: false,
      message: 'Server error updating record',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

// @desc    Delete OpenGDS record
// @route   DELETE /api/opengds/:id
// @access  Private
const deleteOpenGDSRecord = async (req, res) => {
  try {
    const record = await OpenGDS.findByIdAndDelete(req.params.id);
    
    if (!record) {
      return res.status(404).json({
        success: false,
        message: 'Record not found'
      });
    }
    
    res.json({
      success: true,
      message: 'Record deleted successfully',
      data: { deletedRecord: record }
    });

  } catch (error) {
    console.error('Delete OpenGDS record error:', error);
    
    if (error.name === 'CastError') {
      return res.status(400).json({
        success: false,
        message: 'Invalid record ID format'
      });
    }
    
    res.status(500).json({
      success: false,
      message: 'Server error deleting record',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

// @desc    Delete multiple OpenGDS records
// @route   DELETE /api/opengds/bulk
// @access  Private
const deleteBulkOpenGDSRecords = async (req, res) => {
  try {
    const { ids } = req.body;
    
    if (!Array.isArray(ids) || ids.length === 0) {
      return res.status(400).json({
        success: false,
        message: 'IDs array is required'
      });
    }
    
    const result = await OpenGDS.deleteMany({ _id: { $in: ids } });
    
    res.json({
      success: true,
      message: `${result.deletedCount} records deleted successfully`,
      data: { 
        deletedCount: result.deletedCount,
        requestedCount: ids.length
      }
    });

  } catch (error) {
    console.error('Bulk delete OpenGDS records error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error deleting records',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

// @desc    Get OpenGDS statistics
// @route   GET /api/opengds/stats
// @access  Private
const getOpenGDSStats = async (req, res) => {
  try {
    const stats = await OpenGDS.aggregate([
      {
        $group: {
          _id: null,
          totalRecords: { $sum: 1 },
          avgNO: { $avg: '$no' },
          avgNOX: { $avg: '$nox' },
          avgBenzene: { $avg: '$benzene' },
          avgToluene: { $avg: '$toluene' },
          avgTemp: { $avg: '$temp' },
          avgRH: { $avg: '$rh' },
          maxNO: { $max: '$no' },
          minNO: { $min: '$no' },
          cities: { $addToSet: '$city' }
        }
      }
    ]);
    
    const cityStats = await OpenGDS.aggregate([
      {
        $group: {
          _id: '$city',
          count: { $sum: 1 },
          avgNO: { $avg: '$no' },
          avgTemp: { $avg: '$temp' }
        }
      },
      { $sort: { count: -1 } }
    ]);
    
    res.json({
      success: true,
      data: {
        overall: stats[0] || {},
        by_city: cityStats
      }
    });

  } catch (error) {
    console.error('Get OpenGDS stats error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error fetching statistics',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

module.exports = {
  getOpenGDSRecords,
  getOpenGDSRecord,
  createOpenGDSRecord,
  createBulkOpenGDSRecords,
  updateOpenGDSRecord,
  deleteOpenGDSRecord,
  deleteBulkOpenGDSRecords,
  getOpenGDSStats
};