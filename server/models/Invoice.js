const mongoose = require('mongoose');

const InvoiceSchema = new mongoose.Schema({
    projectId: { type: mongoose.Schema.Types.ObjectId, ref: 'Project' },
    clientId: { type: mongoose.Schema.Types.ObjectId, ref: 'Client' },
    amount: Number,
    status: { type: String, enum: ['paid', 'outstanding'], default: 'outstanding' },
    dueDate: Date,
    userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User' }
});

module.exports = mongoose.model('Invoice', InvoiceSchema);