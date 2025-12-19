import { Request, Response, NextFunction, RequestHandler } from "express";
import { StatusCodes } from "http-status-codes";
import { registerUser, getUserCategoriesService, toggleUserCategoryService } from "../services/user.service";

// 사용자 생성 핸들러
export const createUserHandler: RequestHandler = async (req, res, next) => {
  try {
    const { userId, password, name, firstTrack, secondTrack, isNotificationAgreed, categoryNames } = req.body;

    const user = await registerUser({ 
      userId, 
      password, 
      name, 
      firstTrack, 
      secondTrack, 
      isNotificationAgreed,
      categoryNames 
    });
    res.sendSuccess(201, "회원가입 성공", {
      userId: user.userId.toString(),
    });
  } catch (err) {
    next(err);
  }
};

export const getUserCategoriesHandler: RequestHandler = async (req, res, next) => {
  try {
    const userId = req.user?.id;
    const categories = await getUserCategoriesService(userId as bigint);
    res.sendSuccess(200, "관심 카테고리 조회 성공", {
      categories,
    });
  } catch (err) {
    next(err);
  }
};

export const toggleUserCategoryHandler: RequestHandler = async (req, res, next) => {
  try {
    const { categoryName } = req.params;
    const userId = req.user?.id;
    const result = await toggleUserCategoryService(userId as bigint, categoryName);
    
    const message = result.action === 'added' 
      ? `'${categoryName}' 카테고리를 관심 카테고리에 추가했습니다.`
      : `'${categoryName}' 카테고리를 관심 카테고리에서 제거했습니다.`;
    
    res.sendSuccess(200, message, {
      action: result.action,
      categoryName: result.categoryName,
    });
  } catch (err) {
    next(err);
  }
};