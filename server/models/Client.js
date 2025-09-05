const mongoose = require('mongoose');

const ClientSchema = new mongoose.Schema({
    name: String,
    email: String,
    company: String,
    userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User' }
});

module.exports = mongoose.model('Client', ClientSchema);