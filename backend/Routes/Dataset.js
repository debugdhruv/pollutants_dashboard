// routes/opengds.js
const express = require('express');
const {
  getOpenGDSRecords,
  getOpenGDSRecord,
  createOpenGDSRecord,
  createBulkOpenGDSRecords,
  updateOpenGDSRecord,
  deleteOpenGDSRecord,
  deleteBulkOpenGDSRecords,
  getOpenGDSStats
} = require('../Controllers/opengds');
const { protect, authorize } = require('../middleware/auth');
const { validateOpenGDSCreate, validateOpenGDSUpdate } = require('../middleware/opeGdsValidation');

const router = express.Router();

// Apply authentication to all routes
router.use(protect);

// Stats route (should be before /:id route)
router.get('/stats', getOpenGDSStats);

// Main CRUD routes
router.route('/')
  .get(getOpenGDSRecords)              // GET /api/opengds - Get all records with filtering & pagination
  .post(validateOpenGDSCreate, createOpenGDSRecord);  // POST /api/opengds - Create single record

// Bulk operations
router.route('/bulk')
  .post(createBulkOpenGDSRecords)      // POST /api/opengds/bulk - Create multiple records
  .delete(authorize('admin'), deleteBulkOpenGDSRecords); // DELETE /api/opengds/bulk - Delete multiple records (admin only)

// Individual record operations
router.route('/:id')
  .get(getOpenGDSRecord)               // GET /api/opengds/:id - Get single record
  .put(validateOpenGDSUpdate, updateOpenGDSRecord)    // PUT /api/opengds/:id - Update record
  .delete(deleteOpenGDSRecord);        // DELETE /api/opengds/:id - Delete record

module.exports = router;