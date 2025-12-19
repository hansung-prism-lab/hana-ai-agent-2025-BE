import { Router, RequestHandler } from "express";
import { createUserHandler, getUserCategoriesHandler, toggleUserCategoryHandler } from "../controllers/user.controller";
import { loginController } from "../controllers/auth.controller";
import { authenticateToken, requireAuth } from "../utils/auth.middleware";

const router = Router();

// 회원가입은 인증 필요 없음
router.post("/", createUserHandler);
// 로그인은 인증 필요 없음
router.post("/login", loginController as RequestHandler);

router.get("/categories", authenticateToken, requireAuth, getUserCategoriesHandler as RequestHandler);
router.put("/categories/:categoryName", authenticateToken, requireAuth, toggleUserCategoryHandler as RequestHandler);

export default router;