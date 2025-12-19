import { PrismaClient, Category } from "@prisma/client";

export const prisma = new PrismaClient({ log: ["query"] });

export const findOrCreateCategory = async (name: string): Promise<Category> => {
  // 먼저 기존 카테고리가 있는지 확인
  let category = await prisma.category.findFirst({
    where: { name }
  });

  // 없으면 새로 생성
  if (!category) {
    category = await prisma.category.create({
      data: { name }
    });
  }

  return category;
};

export const findCategoriesByName = async (names: string[]): Promise<Category[]> => {
  return await prisma.category.findMany({
    where: {
      name: {
        in: names
      }
    }
  });
};

export const getAllCategories = async (): Promise<Category[]> => {
  return await prisma.category.findMany({
    orderBy: {
      name: 'asc'
    }
  });
};
