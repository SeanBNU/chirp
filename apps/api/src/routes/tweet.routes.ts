import { Router } from 'express';
import multer from 'multer';
import { tweetController } from '../controllers/tweet.controller.js';
import { auth, optionalAuth } from '../middleware/auth.middleware.js';
import { validateBody } from '../middleware/validate.middleware.js';
import { uploadLimiter } from '../middleware/rateLimiter.middleware.js';
import { createTweetSchema, reactionSchema, voteSchema } from '../validators/tweet.validator.js';
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
    if (file.mimetype.startsWith('image/') || file.mimetype.startsWith('video/')) {
      cb(null, true);
    } else {
      cb(new Error('Only images and videos are allowed'));
    }
  },
});

// Feed
router.get('/feed', auth, tweetController.getFeed.bind(tweetController));

// Vibe filter
router.get('/vibe/:vibe', optionalAuth, tweetController.getByVibe.bind(tweetController));

// User tweets
router.get('/user/:username', optionalAuth, tweetController.getUserTweets.bind(tweetController));

// Tweet CRUD
router.post(
  '/',
  auth,
  uploadLimiter,
  upload.array('media', 4),
  tweetController.create.bind(tweetController)
);

router.get('/:id', optionalAuth, tweetController.getById.bind(tweetController));
router.delete('/:id', auth, tweetController.delete.bind(tweetController));

// Replies
router.get('/:id/replies', optionalAuth, tweetController.getReplies.bind(tweetController));

// Reactions
router.post(
  '/:id/react',
  auth,
  validateBody(reactionSchema),
  tweetController.react.bind(tweetController)
);

// Retweet
router.post('/:id/retweet', auth, tweetController.retweet.bind(tweetController));

// Vote
router.post(
  '/:id/vote',
  auth,
  validateBody(voteSchema),
  tweetController.vote.bind(tweetController)
);

export default router;
