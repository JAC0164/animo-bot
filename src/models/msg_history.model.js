const mongoose = require('mongoose');

const MsgHistorySchema = new mongoose.Schema({
  msg: String,
});

module.exports = mongoose.model('msgHistory', MsgHistorySchema);
