import { Router, RequestHandler } from 'express';
import {
  loginController,
  refreshTokenController,
  logoutController,
  getProfileController,
} from '../controllers/auth.controller';
import { authenticateToken, requireAuth } from '../utils/auth.middleware'; // requireAuth 추가

const router = Router();

// POST /auth/login - 사용자 로그인
router.post('/login', loginController as RequestHandler);

// POST /auth/refresh-token - 액세스 토큰 갱신
router.post('/refresh-token', refreshTokenController as RequestHandler);

// POST /auth/logout - 로그아웃 (현재 세션)
// 로그아웃은 인증된 사용자만 요청할 수 있도록 requireAuth 미들웨어 추가
router.post('/logout', requireAuth, logoutController as RequestHandler);

// GET /auth/profile - 프로필 조회 (관심 카테고리 포함)
router.get('/profile', authenticateToken, requireAuth, getProfileController as RequestHandler);

export default router; 