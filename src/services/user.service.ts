import { createUser, getUserCategories, toggleUserCategory } from "../repositories/user.repository";
import { hashPassword, comparePassword } from "../utils/hash";
import { PrismaClient } from "@prisma/client";

export const prisma = new PrismaClient({ log: ["query"] });
export const registerUser = async (data: {
  userId: bigint;
  password: string;
  name: string;
  firstTrack: string;
  secondTrack: string;
  isNotificationAgreed?: boolean;
  categoryNames?: string[];
}) => {
  const hashedPassword = await hashPassword(data.password);

  try {
    return await createUser({
      userId: data.userId,
      name: data.name,
      firstTrack: data.firstTrack,
      secondTrack: data.secondTrack,
      isNotificationAgreed: data.isNotificationAgreed,
      password: hashedPassword,
      categoryNames: data.categoryNames,
    });
  } catch (err: any) {
    if (err.code === "P2002") {
      throw new Error("중복된 학번입니다.");
    }
    throw err;
  }
};

// 사용자 관심 카테고리 조회 서비스
export const getUserCategoriesService = async (userId: bigint) => {
  return await getUserCategories(userId);
};

// 사용자 관심 카테고리 토글 서비스
export const toggleUserCategoryService = async (userId: bigint, categoryName: string) => {
  return await toggleUserCategory(userId, categoryName);
};