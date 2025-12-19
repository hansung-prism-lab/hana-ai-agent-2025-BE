import { Request, Response, NextFunction } from 'express';
import { StatusCodes } from 'http-status-codes';
import { PrismaClient } from '@prisma/client';
import {
  loginService,
  refreshTokenService,
  logoutService,
} from '../services/auth.service';
import { getUserCategories } from '../repositories/user.repository';

const prisma = new PrismaClient();

export const loginController = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { userId, password } = req.body;
    if (!userId || !password) {
      // 공통 에러 응답 유틸리티가 있다면 그것을 사용하는 것이 좋으나, 여기서는 직접 응답
      return res.status(StatusCodes.BAD_REQUEST).sendError(StatusCodes.BAD_REQUEST, 'userId and password are required');
    }
    const result = await loginService(userId, password);
    
    // 사용자 추가 정보 얻기
    const user = await prisma.user.findUnique({
      where: { userId: result.user?.userId }
    });
    
    res.sendSuccess(StatusCodes.OK, '로그인 성공', {
        accessToken: result.accessToken,
        refreshToken: result.refreshToken,
        userId: result.user?.userId,
    });
  } catch (error) {
    next(error); // 에러는 글로벌 에러 핸들러로 전달
  }
};

export const refreshTokenController = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { refreshToken } = req.body;
    if (!refreshToken) {
      return res.status(StatusCodes.BAD_REQUEST).sendError(StatusCodes.BAD_REQUEST, 'Refresh token is required');
    }
    const newTokens = await refreshTokenService(refreshToken);
    res.sendSuccess(StatusCodes.OK, 'Token refreshed successfully', {
        accessToken: newTokens.accessToken,
        refreshToken: newTokens.refreshToken,
    });
  } catch (error) {
    next(error);
  }
};

export const logoutController = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { refreshToken } = req.body; 
    // 실제로는 쿠키에서 가져오거나, 클라이언트가 명시적으로 삭제 요청을 보낼 때만 처리할 수 있음
    // 여기서는 요청 바디에 있다고 가정
    await logoutService(refreshToken);
    res.sendSuccess(StatusCodes.OK, 'Logout successful');
  } catch (error) {
    next(error);
  }
};

// 프로필 조회 컨트롤러
export const getProfileController = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const userId = req.user?.id;
    
    if (!userId) {
      return res.status(StatusCodes.UNAUTHORIZED).sendError(StatusCodes.UNAUTHORIZED, '인증이 필요합니다.');
    }

    // 사용자 정보 조회
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: {
        id: true,
        userId: true,
        name: true,
        firstTrack: true,
        secondTrack: true,
        isNotificationAgreed: true,
        createdAt: true,
        updatedAt: true,
      },
    });

    if (!user) {
      return res.status(StatusCodes.NOT_FOUND).sendError(StatusCodes.NOT_FOUND, '사용자를 찾을 수 없습니다.');
    }

    // 관심 카테고리 조회
    const categories = await getUserCategories(userId);

    res.sendSuccess(StatusCodes.OK, '프로필 조회 성공', {
      id: user.id.toString(),
      userId: user.userId.toString(),
      name: user.name,
      firstTrack: user.firstTrack,
      secondTrack: user.secondTrack,
      isNotificationAgreed: user.isNotificationAgreed,
      categories: categories,
      createdAt: user.createdAt.toISOString(),
      updatedAt: user.updatedAt.toISOString(),
    });
  } catch (error) {
    next(error);
  }
};
