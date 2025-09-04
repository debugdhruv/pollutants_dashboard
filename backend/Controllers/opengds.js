// controllers/openGDSController.js
const  OpenGDS  = require('../Models/openGdsModel');

// Helper function to build query from request parameters
const buildQuery = (queryParams) => {
  const query = {};
  
  // Handle different operators
  Object.keys(queryParams).forEach(key => {
    if (key.startsWith('_') || ['page', 'limit', 'sort', 'fields', 'search'].includes(key)) {
      return; // Skip pagination and system parameters
    }
    
    const value = queryParams[key];
    
    // Handle array values (multi-selection)
    if (Array.isArray(value)) {
      query[key] = { $in: value };
    }
    // Handle object values (operators)
    else if (typeof value === 'object' && value !== null) {
      query[key] = value;
    }
    // Handle single values
    else {
      query[key] = value;
    }
  });
  
  return query;
};

// Helper function to handle advanced filtering
const buildAdvancedQuery = (req) => {
  let query = {};
  
  // Text search across multiple fields
  if (req.query.search) {
    query.$or = [
      { city: { $regex: req.query.search, $options: 'i' } },
      { monthYear: { $regex: req.query.search, $options: 'i' } }
    ];
  }
  
  // Range queries for numeric fields
  const numericFields = ['no', 'nox', 'benzene', 'toluene', 'ethylBen', 'mpXylene', 'oXylene', 'temp', 'rh', 'sr', 'rg'];
  
  numericFields.forEach(field => {
    if (req.query[`${field}_min`] || req.query[`${field}_max`]) {
      query[field] = {};
      if (req.query[`${field}_min`]) query[field].$gte = Number(req.query[`${field}_min`]);
      if (req.query[`${field}_max`]) query[field].$lte = Number(req.query[`${field}_max`]);
    }
  });
  
  // Date range queries
  if (req.query.date_from || req.query.date_to) {
    query.createdAt = {};
    if (req.query.date_from) query.createdAt.$gte = new Date(req.query.date_from);
    if (req.query.date_to) query.createdAt.$lte = new Date(req.query.date_to);
  }
  
  // Combine with basic query
  const basicQuery = buildQuery(req.query);
  query = { ...query, ...basicQuery };
  
  // Handle OR conditions
  if (req.query.$or) {
    try {
      const orConditions = JSON.parse(req.query.$or);
      query.$or = orConditions;
    } catch (error) {
      console.log('Invalid $or condition');
    }
  }
  
  // Handle AND conditions (default behavior, but explicit)
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

// @desc    Get all OpenGDS records with advanced filtering
// @route   GET /api/opengds
// @access  Private
const getOpenGDSRecords = async (req, res) => {
  try {
    // Build query
    const query = buildAdvancedQuery(req);
    
    // Pagination
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const skip = (page - 1) * limit;
    
    // Sorting
    let sort = {};
    if (req.query.sort) {
      const sortBy = req.query.sort.split(',').join(' ');
      sort = sortBy.split(' ').reduce((acc, field) => {
        if (field.startsWith('-')) {
          acc[field.substring(1)] = -1;
        } else {
          acc[field] = 1;
        }
        return acc;
      }, {});
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