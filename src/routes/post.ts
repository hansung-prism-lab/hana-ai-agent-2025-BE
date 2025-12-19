import { Router, RequestHandler } from "express";
import { 
  getUrgentPostsHandler, 
  getPostsByCategoryHandler, 
  getNotificationPostsHandler, 
  getUserInterestedPostsHandler 
} from "../controllers/post.controller";
import { authenticateToken, requireAuth } from "../utils/auth.middleware";

const router = Router();


// 긴급 공지글 조회
router.get("/urgent", authenticateToken, requireAuth, getUrgentPostsHandler as RequestHandler);

// 카테고리별 공지글 조회 (커서 페이지네이션)
router.get("/category/:category", authenticateToken, requireAuth, getPostsByCategoryHandler as RequestHandler);

// 알림 설정한 공지글 조회 (커서 페이지네이션)
router.get("/notifications", authenticateToken, requireAuth, getNotificationPostsHandler as RequestHandler);

// 사용자 관심 카테고리의 공지글 조회 (커서 페이지네이션)
router.get("/interested", authenticateToken, requireAuth, getUserInterestedPostsHandler as RequestHandler);

export default router;
