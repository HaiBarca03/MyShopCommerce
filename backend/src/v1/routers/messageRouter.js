const express = require('express');
const { getMessages } = require('../controllers/messageController');
const messageRouter = express.Router();

messageRouter.get('/messages/:senderId/:receiverId', getMessages);

module.exports = messageRouter;
