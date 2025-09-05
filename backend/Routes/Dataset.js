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

router.use(protect);

router.get('/stats', getOpenGDSStats);

router.route('/')
  .get(getOpenGDSRecords)             
  .post(validateOpenGDSCreate, createOpenGDSRecord); 

// Bulk operations
router.route('/bulk')
  .post(createBulkOpenGDSRecords)     
  .delete(authorize('admin'), deleteBulkOpenGDSRecords); 

// Individual record operations
router.route('/:id')
  .get(getOpenGDSRecord)              
  .put(validateOpenGDSUpdate, updateOpenGDSRecord) 
  .delete(deleteOpenGDSRecord);   

module.exports = router;