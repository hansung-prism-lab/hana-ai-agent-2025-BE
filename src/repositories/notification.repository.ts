import { PrismaClient, Notification } from "@prisma/client";

export const prisma = new PrismaClient({ log: ["query"] });

export const createNotification = async (data: {
  userId: bigint;
  postId: bigint;
}): Promise<Notification> => {
  return await prisma.notification.create({
    data: {
      userId: data.userId,
      postId: data.postId,
    },
  });
};

export const createNotificationsForUsers = async (data: {
  userIds: bigint[];
  postId: bigint;
}): Promise<{ count: number }> => {
  const notifications = data.userIds.map(userId => ({
    userId,
    postId: data.postId,
  }));

  return await prisma.notification.createMany({
    data: notifications,
    skipDuplicates: true, // 중복된 알림은 건너뛰기
  });
};

export const findNotificationsByPostId = async (postId: bigint) => {
  return await prisma.notification.findMany({
    where: {
      postId,
    },
    include: {
      user: {
        select: {
          id: true,
          userId: true,
          name: true,
        },
      },
    },
  });
};

export const findNotificationsByUserId = async (userId: bigint) => {
  return await prisma.notification.findMany({
    where: {
      userId,
    },
    orderBy: {
      createdAt: 'desc',
    },
  });
};

export const deleteNotification = async (id: bigint): Promise<Notification> => {
  return await prisma.notification.delete({
    where: {
      id,
    },
  });
};

// 알림 토글 (추가/제거)
export const toggleNotification = async (userId: bigint, postId: bigint) => {
  return await prisma.$transaction(async (tx) => {
    // 1. 기존 알림 확인
    const existingNotification = await tx.notification.findFirst({
      where: {
        userId: userId,
        postId: postId,
      },
    });

    if (existingNotification) {
      // 2-1. 이미 있으면 삭제 (알림 해제)
      await tx.notification.delete({
        where: {
          id: existingNotification.id,
        },
      });
      return { action: 'removed', postId: postId.toString() };
    } else {
      // 2-2. 없으면 생성 (알림 설정)
      const notification = await tx.notification.create({
        data: {
          userId: userId,
          postId: postId,
        },
      });
      return { action: 'added', postId: postId.toString(), notificationId: notification.id.toString() };
    }
  });
};
