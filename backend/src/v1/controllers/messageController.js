const Message = require('../models/messageModel');

const getMessages = async (req, res) => {
    const { senderId, receiverId } = req.params;

    try {
        const messages = await Message.find({
            $or: [
                { sender: senderId, receiver: receiverId },
                { sender: receiverId, receiver: senderId }
            ]
        }).sort({ timestamp: 1 });

        res.status(200).json(messages);
    } catch (error) {
        res.status(500).json({ message: 'Error fetching messages' });
    }
};

module.exports = { getMessages };
