const mongoose = require('mongoose');

const messageSchema = new mongoose.Schema({
    sender: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    receiver: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    content: { type: String, required: true },
    timestamp: { type: Date, default: Date.now },
    messageType: { type: String, enum: ['chat', 'image', 'file'], default: 'chat' },
});

const Message = mongoose.model('Message', messageSchema);

module.exports = Message;
