const mongoose = require('mongoose');

const ProjectSchema = new mongoose.Schema({
    title: String,
    description: String,
    status: { type: String, enum: ['in-progress', 'completed'], default: 'in-progress' },
    clientId: { type: mongoose.Schema.Types.ObjectId, ref: 'Client' },
    userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User' }
});

module.exports = mongoose.model('Project', ProjectSchema);