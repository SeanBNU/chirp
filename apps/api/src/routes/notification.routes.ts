import { Router } from 'express';
import { notificationController } from '../controllers/notification.controller.js';
import { auth } from '../middleware/auth.middleware.js';

const router = Router();

router.get('/', auth, notificationController.getNotifications.bind(notificationController));
router.get('/unread', auth, notificationController.getUnreadCount.bind(notificationController));
router.put('/read', auth, notificationController.markAllAsRead.bind(notificationController));
router.put('/:id/read', auth, notificationController.markAsRead.bind(notificationController));

export default router;
