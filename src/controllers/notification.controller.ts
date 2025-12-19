import { Request, Response, NextFunction, RequestHandler } from "express";
import { StatusCodes } from "http-status-codes";
import { createNotificationForUser, checkNotificationStatus, toggleNotificationService } from "../services/notification.service";

// 특정 포스트에 대한 알림 토글 핸들러
export const toggleNotificationHandler: RequestHandler = async (req, res, next) => {
  try {
    const { post_id } = req.params;
    const postId = BigInt(post_id);
    
    // 현재 로그인한 사용자 정보 (JWT에서 추출)
    const userId = req.user?.id;
    
    if (!userId) {
      return res.status(401).json({
        success: false,
        message: "로그인이 필요합니다.",
      });
    }

    const result = await toggleNotificationService(userId, postId);
    
    res.sendSuccess(200, result.message, {
      action: result.action,
      postId: result.postId,
      postTitle: result.post.title,
      postCategory: result.post.category,
      userId: result.user.userId.toString(),
      userName: result.user.name,
      ...(result.notificationId && { notificationId: result.notificationId }),
    });
  } catch (err) {
    next(err);
  }
};

// 특정 포스트의 알림 상태 확인 핸들러
export const getNotificationsByPostHandler: RequestHandler = async (req, res, next) => {
  try {
    const { post_id } = req.params;
    const postId = BigInt(post_id);
    
    // 현재 로그인한 사용자 정보 (JWT에서 추출)
    const userId = req.user?.id;
    
    if (!userId) {
      return res.status(401).json({
        success: false,
        message: "로그인이 필요합니다.",
      });
    }

    const result = await checkNotificationStatus(userId, postId);
    
    res.sendSuccess(200, result.message, {
      postId: result.postId,
      isNotificationSet: result.isNotificationSet,
    });
  } catch (err) {
    next(err);
  }
};
