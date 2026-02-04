import { Router } from 'express';
import multer from 'multer';
import { userController } from '../controllers/user.controller.js';
import { auth, optionalAuth } from '../middleware/auth.middleware.js';
import { validateBody } from '../middleware/validate.middleware.js';
import { uploadLimiter } from '../middleware/rateLimiter.middleware.js';
import { updateProfileSchema } from '../validators/user.validator.js';
import { env } from '../config/env.js';

const router = Router();

// Configure multer
const storage = multer.diskStorage({
  destination: (_req, _file, cb) => cb(null, env.UPLOAD_DIR),
  filename: (_req, file, cb) => cb(null, `${Date.now()}-${file.originalname}`),
});

const upload = multer({
  storage,
  limits: { fileSize: env.MAX_FILE_SIZE },
  fileFilter: (_req, file, cb) => {
    if (file.mimetype.startsWith('image/')) {
      cb(null, true);
    } else {
      cb(new Error('Only images are allowed'));
    }
  },
});

router.get('/suggested', auth, userController.getSuggestedUsers.bind(userController));

router.get('/:username', optionalAuth, userController.getProfile.bind(userController));

router.put(
  '/profile',
  auth,
  validateBody(updateProfileSchema),
  userController.updateProfile.bind(userController)
);

router.put(
  '/avatar',
  auth,
  uploadLimiter,
  upload.single('avatar'),
  userController.updateAvatar.bind(userController)
);

router.put(
  '/banner',
  auth,
  uploadLimiter,
  upload.single('banner'),
  userController.updateBanner.bind(userController)
);

router.post('/:username/follow', auth, userController.follow.bind(userController));
router.delete('/:username/follow', auth, userController.unfollow.bind(userController));

router.get('/:username/followers', optionalAuth, userController.getFollowers.bind(userController));
router.get('/:username/following', optionalAuth, userController.getFollowing.bind(userController));

export default router;
