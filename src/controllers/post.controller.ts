import { Request, Response, NextFunction, RequestHandler } from "express";
import { StatusCodes } from "http-status-codes";
import { 
  getUrgentPostsService, 
  getPostsByCategoryService, 
  getNotificationPostsService, 
  getUserInterestedPostsService 
} from "../services/post.service";

// 긴급 공지글 조회 핸들러 (D-day 계산)
export const getUrgentPostsHandler: RequestHandler = async (req, res, next) => {
  try {
    const result = await getUrgentPostsService();
    
    res.sendSuccess(StatusCodes.OK, result.message, {
      posts: result.posts,
      count: result.count,
    });
  } catch (error) {
    console.error("Error in getUrgentPostsHandler:", error);
    next(error);
  }
};

// 카테고리별 공지글 조회 핸들러
export const getPostsByCategoryHandler: RequestHandler = async (req, res, next) => {
  try {
    const { category } = req.params;
    const { cursor, limit } = req.query;
    
    const limitNumber = limit ? parseInt(limit as string, 10) : 5;
    
    const result = await getPostsByCategoryService(
      category,
      cursor as string,
      limitNumber
    );
    
    res.sendSuccess(StatusCodes.OK, result.message, {
      posts: result.posts,
      nextCursor: result.nextCursor,
      hasMore: result.hasMore,
      count: result.count,
    });
  } catch (error) {
    console.error("Error in getPostsByCategoryHandler:", error);
    next(error);
  }
};

// 알림 설정한 공지글 조회 핸들러
export const getNotificationPostsHandler: RequestHandler = async (req, res, next) => {
  try {
    const { cursor, limit } = req.query;
    const userId = req.user?.id; // 인증 미들웨어에서 설정된 사용자 ID
    
    if (!userId) {
      return res.status(StatusCodes.UNAUTHORIZED).json({
        statusCode: StatusCodes.UNAUTHORIZED,
        message: "인증이 필요합니다.",
        data: null,
      });
    }
    
    const limitNumber = limit ? parseInt(limit as string, 10) : 5;
    
    const result = await getNotificationPostsService(
      userId,
      cursor as string,
      limitNumber
    );
    
    res.sendSuccess(StatusCodes.OK, result.message, {
      posts: result.posts,
      nextCursor: result.nextCursor,
      hasMore: result.hasMore,
      count: result.count,
    });
  } catch (error) {
    console.error("Error in getNotificationPostsHandler:", error);
    next(error);
  }
};

// 사용자 관심 카테고리의 공지글 조회 핸들러
export const getUserInterestedPostsHandler: RequestHandler = async (req, res, next) => {
  try {
    const { cursor, limit } = req.query;
    const userId = req.user?.id; // 인증 미들웨어에서 설정된 사용자 ID
    
    if (!userId) {
      return res.status(StatusCodes.UNAUTHORIZED).json({
        statusCode: StatusCodes.UNAUTHORIZED,
        message: "인증이 필요합니다.",
        data: null,
      });
    }
    
    const limitNumber = limit ? parseInt(limit as string, 10) : 3;
    
    const result = await getUserInterestedPostsService(
      userId,
      cursor as string,
      limitNumber
    );
    
    res.sendSuccess(StatusCodes.OK, result.message, {
      posts: result.posts,
      nextCursor: result.nextCursor,
      hasMore: result.hasMore,
      count: result.count,
    });
  } catch (error) {
    console.error("Error in getUserInterestedPostsHandler:", error);
    next(error);
  }
};
