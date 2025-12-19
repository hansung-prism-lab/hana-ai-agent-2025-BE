import { PrismaClient, User } from "@prisma/client";
import { findOrCreateCategory } from "./category.repository";

export const prisma = new PrismaClient({ log: ["query"] });

export const createUser = async (data: {
  userId: bigint;
  password: string;
  name: string;
  firstTrack: string;
  secondTrack: string;
  isNotificationAgreed?: boolean;
  categoryNames?: string[];
}): Promise<User> => {
  return await prisma.$transaction(async (tx) => {
    // 1. User 생성
    const user = await tx.user.create({
      data: {
        userId: data.userId,
        password: data.password,
        name: data.name,
        firstTrack: data.firstTrack,
        secondTrack: data.secondTrack,
        isNotificationAgreed: data.isNotificationAgreed ?? false,
      },
    });

    // 2. Category들 처리 및 UserCategory 연결
    if (data.categoryNames && data.categoryNames.length > 0) {
      for (const categoryName of data.categoryNames) {
        // Category 찾거나 생성
        let category = await tx.category.findFirst({
          where: { name: categoryName }
        });

        if (!category) {
          category = await tx.category.create({
            data: { name: categoryName }
          });
        }

        // UserCategory 매핑 생성
        await tx.userCategory.create({
          data: {
            userId: user.id,
            categoryId: category.id
          }
        });
      }
    }

    return user;
  });
};

export const findUserByUserId = async (userId: bigint) => {
  return await prisma.user.findFirst({ 
    where: { 
      userId 
    } 
  });
};

// 사용자의 관심 카테고리 조회
export const getUserCategories = async (userId: bigint) => {
  const userCategories = await prisma.userCategory.findMany({
    where: {
      userId: userId,
    },
    include: {
      category: true,
    },
  });

  return userCategories.map(uc => ({
    id: uc.category.id.toString(),
    name: uc.category.name,
    createdAt: uc.createdAt,
  }));
};

// 사용자 관심 카테고리 토글 (추가/제거)
export const toggleUserCategory = async (userId: bigint, categoryName: string) => {
  return await prisma.$transaction(async (tx) => {
    // 1. 카테고리 찾기 또는 생성
    let category = await tx.category.findFirst({
      where: { name: categoryName }
    });

    if (!category) {
      category = await tx.category.create({
        data: { name: categoryName }
      });
    }

    // 2. 기존 UserCategory 관계 확인
    const existingUserCategory = await tx.userCategory.findFirst({
      where: {
        userId: userId,
        categoryId: category.id,
      },
    });

    if (existingUserCategory) {
      // 3-1. 이미 있으면 삭제 (관심 카테고리에서 제거)
      await tx.userCategory.delete({
        where: {
          id: existingUserCategory.id,
        },
      });
      return { action: 'removed', categoryName };
    } else {
      // 3-2. 없으면 생성 (관심 카테고리에 추가)
      await tx.userCategory.create({
        data: {
          userId: userId,
          categoryId: category.id,
        },
      });
      return { action: 'added', categoryName };
    }
  });
};