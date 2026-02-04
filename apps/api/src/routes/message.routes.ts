import { Router } from 'express';
import { messageController } from '../controllers/message.controller.js';
import { auth } from '../middleware/auth.middleware.js';
import { validateBody } from '../middleware/validate.middleware.js';
import { sendMessageSchema } from '../validators/message.validator.js';

const router = Router();

router.get('/', auth, messageController.getConversations.bind(messageController));
router.get('/unread', auth, messageController.getUnreadCount.bind(messageController));
router.get('/:username', auth, messageController.getConversation.bind(messageController));
router.post(
  '/',
  auth,
  validateBody(sendMessageSchema),
  messageController.sendMessage.bind(messageController)
);

export default router;
