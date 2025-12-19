import { Router, RequestHandler } from "express";
import { chatHandler } from "../controllers/chat.controller";

const router = Router();

// 채팅 질문 처리
router.post("/", chatHandler as RequestHandler);

export default router;
