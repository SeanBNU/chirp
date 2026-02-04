import { Router } from 'express';
import { searchController } from '../controllers/search.controller.js';
import { optionalAuth } from '../middleware/auth.middleware.js';

const router = Router();

router.get('/', optionalAuth, searchController.search.bind(searchController));
router.get('/trending', searchController.getTrending.bind(searchController));
router.get('/leaderboard', searchController.getLeaderboard.bind(searchController));
router.get('/challenge', searchController.getDailyChallenge.bind(searchController));

export default router;
