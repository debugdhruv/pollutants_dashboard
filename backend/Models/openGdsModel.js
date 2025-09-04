// models/OpenGDS.js
const mongoose = require('mongoose');

const openGDSSchema = new mongoose.Schema({
  city: {
    type: String,
    required: true,
    trim: true
  },
  monthYear: {
    type: String,
    required: true,
    trim: true
  },
  no: {
    type: Number,
    required: true,
    min: 0
  },
  nox: {
    type: Number,
    required: true,
    min: 0
  },
  benzene: {
    type: Number,
    required: true,
    min: 0
  },
  toluene: {
    type: Number,
    required: true,
    min: 0
  },
  ethylBen: {
    type: Number,
    required: true,
    min: 0
  },
  mpXylene: {
    type: Number,
    required: true,
    min: 0
  },
  oXylene: {
    type: Number,
    required: true,
    min: 0
  },
  ws: {
    type: mongoose.Schema.Types.Mixed, // Can be number or string (for "*" values)
    required: true
  },
  temp: {
    type: Number,
    required: true
  },
  rh: {
    type: Number,
    required: true,
    min: 0,
    max: 100
  },
  sr: {
    type: Number,
    required: true,
    min: 0
  },
  rg: {
    type: Number,
    required: true,
    min: 0
  }
}, {
  timestamps: true,
  collection: 'opengds' // Explicitly set collection name
});

// Create compound index for efficient querying
// openGDSSchema.index({ city: 1, monthYear: 1 });

// Add methods for data analysis
// openGDSSchema.statics.findByCity = function(cityName) {
//   return this.find({ city: new RegExp(cityName, 'i') });
// };

// openGDSSchema.statics.findByDateRange = function(startMonth, endMonth) {
//   return this.find({
//     monthYear: {
//       $gte: startMonth,
//       $lte: endMonth
//     }
//   });
// };

// openGDSSchema.statics.getAveragesByCity = function(cityName) {
//   return this.aggregate([
//     { $match: { city: new RegExp(cityName, 'i') } },
//     {
//       $group: {
//         _id: '$city',
//         avgNO: { $avg: '$no' },
//         avgNOX: { $avg: '$nox' },
//         avgBenzene: { $avg: '$benzene' },
//         avgToluene: { $avg: '$toluene' },
//         avgEthylBen: { $avg: '$ethylBen' },
//         avgMpXylene: { $avg: '$mpXylene' },
//         avgOXylene: { $avg: '$oXylene' },
//         avgTemp: { $avg: '$temp' },
//         avgRH: { $avg: '$rh' },
//         avgSR: { $avg: '$sr' },
//         avgRG: { $avg: '$rg' },
//         count: { $sum: 1 }
//       }
//     }
//   ]);
// };

// // Validation for month-year format
// openGDSSchema.path('monthYear').validate(function(value) {
//   const monthYearRegex = /^(Jan|Feb|Mar|Apr|May|Jun|Jul|Aug|Sep|Oct|Nov|Dec)-\d{2}$/;
//   return monthYearRegex.test(value);
// }, 'Month-Year must be in format MMM-YY (e.g., Jan-19)');

const OpenGDS = mongoose.model('OpenGDS', openGDSSchema);

module.exports = OpenGDS;