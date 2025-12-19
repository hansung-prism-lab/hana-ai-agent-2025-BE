import { PrismaClient } from "@prisma/client";
import { createNotification, findNotificationsByPostId, toggleNotification } from "../repositories/notification.repository";

export const prisma = new PrismaClient({ log: ["query"] });

export const createNotificationForUser = async (userId: bigint, postId: bigint) => {
  try {
    // 1. 포스트가 존재하는지 확인
    const post = await prisma.post.findFirst({
      where: { id: postId },
      select: { id: true, title: true, category: true },
    });

    if (!post) {
      throw new Error("포스트를 찾을 수 없습니다.");
    }

    // 2. 사용자가 존재하는지 확인
    const user = await prisma.user.findFirst({
      where: { id: userId },
      select: { id: true, userId: true, name: true },
    });

    if (!user) {
      throw new Error("사용자를 찾을 수 없습니다.");
    }

    // 3. 이미 알림 신청했는지 확인
    const existingNotification = await prisma.notification.findFirst({
      where: {
        userId: userId,
        postId: postId,
      },
    });

    if (existingNotification) {
      throw new Error("이미 해당 포스트에 알림을 신청했습니다.");
    }

    // 4. 알림 생성
    const notification = await createNotification({
      userId,
      postId,
    });

    return {
      post,
      user,
      notification,
      message: "알림 신청이 완료되었습니다.",
    };
  } catch (err: any) {
    if (err.code === "P2002") {
      throw new Error("이미 알림을 신청한 포스트입니다.");
    }
    throw err;
  }
};

export const checkNotificationStatus = async (userId: bigint, postId: bigint) => {
  try {
    // 현재 사용자가 해당 포스트에 알림을 신청했는지 확인
    const existingNotification = await prisma.notification.findFirst({
      where: {
        userId: userId,
        postId: postId,
      },
    });

    return {
      postId: postId.toString(),
      isNotificationSet: !!existingNotification,
      message: existingNotification 
        ? "해당 포스트에 알림이 설정되어 있습니다." 
        : "해당 포스트에 알림이 설정되어 있지 않습니다.",
    };
  } catch (err) {
    throw err;
  }
};

// 알림 토글 서비스
export const toggleNotificationService = async (userId: bigint, postId: bigint) => {
  try {
    // 1. 포스트 정보 확인
    const post = await prisma.post.findFirst({
      where: { id: postId },
      select: { id: true, title: true, category: true },
    });

    if (!post) {
      throw new Error("포스트를 찾을 수 없습니다.");
    }

    // 2. 사용자 정보 확인
    const user = await prisma.user.findFirst({
      where: { id: userId },
      select: { id: true, userId: true, name: true },
    });

    if (!user) {
      throw new Error("사용자를 찾을 수 없습니다.");
    }

    // 3. 알림 토글 실행
    const result = await toggleNotification(userId, postId);

    return {
      ...result,
      post,
      user,
      message: result.action === 'added' 
        ? "알림이 성공적으로 설정되었습니다."
        : "알림이 성공적으로 해제되었습니다.",
    };
  } catch (err: any) {
    if (err.code === "P2002") {
      throw new Error("이미 알림을 신청한 포스트입니다.");
    }
    throw err;
  }
};
