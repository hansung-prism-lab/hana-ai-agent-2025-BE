import { Router, RequestHandler } from "express";
import { toggleNotificationHandler, getNotificationsByPostHandler } from "../controllers/notification.controller";
import { authenticateToken, requireAuth } from "../utils/auth.middleware";

const router = Router();

// 특정 포스트에 대한 알림 토글
router.put("/:post_id", authenticateToken, requireAuth, toggleNotificationHandler as RequestHandler);

// 특정 포스트의 알림 조회
router.get("/:post_id", authenticateToken, requireAuth, getNotificationsByPostHandler as RequestHandler);

export default router;
