import { PrismaClient, Post } from "@prisma/client";

export const prisma = new PrismaClient();

// 종료일이 임박한 공지글을 조회
export const getUrgentPosts = async (): Promise<Post[]> => {
  const today = new Date();
  
  // console.log("🔍 [DEBUG] getUrgentPosts 시작");
  // console.log("📅 [DEBUG] 현재 날짜:", today);
  // console.log("📅 [DEBUG] 현재 날짜 (ISO):", today.toISOString());
  try {
    const [currentDb]: Array<{ db: string | null }> = await prisma.$queryRaw`SELECT DATABASE() AS db`;
    // console.log("🗄️ [DEBUG] 연결된 DB:", currentDb?.db ?? "<unknown>");
  } catch (e) {
    console.log("⚠️ [DEBUG] DB 이름 조회 실패:", e);
  }
  
  try {
    const totalCount = await prisma.post.count();
    const nullEndDateCount = await prisma.post.count({ where: { endDate: null } });
    const futureEndDateCount = await prisma.post.count({ where: { endDate: { gte: today } } });
    // console.log(`📊 [DEBUG] posts 총 개수: ${totalCount}`);
    // console.log(`📊 [DEBUG] endDate NULL 개수: ${nullEndDateCount}`);
    // console.log(`📊 [DEBUG] endDate >= today 개수: ${futureEndDateCount}`);
  } catch (e) {
    console.log("⚠️ [DEBUG] posts 카운트 실패:", e);
  }
  
  // 먼저 모든 posts 조회해서 디버깅
  const allPosts = await prisma.post.findMany({
    select: {
      id: true,
      title: true,
      endDate: true,
      createdAt: true,
    },
    orderBy: {
      createdAt: 'desc',
    },
    take: 10, // 최근 10개만
  });
  
  // console.log("📊 [DEBUG] 최근 10개 posts:");
  // allPosts.forEach((post, index) => {
  //   console.log(`  ${index + 1}. ID: ${post.id}, 제목: ${post.title}, 종료일: ${post.endDate}, 생성일: ${post.createdAt}`);
  // });
  
  // 실제 쿼리 실행
  const result = await prisma.post.findMany({
    where: {
      endDate: {
        gte: today, // 오늘 이후의 종료일
      },
    },
    orderBy: {
      endDate: 'asc', // 종료일 오름차순 (가장 가까운 것부터)
    },
    take: 3, // 상위 3개만
    select: {
      id: true,
      title: true,
      link: true,
      content: true,
      summary: true,
      image: true,
      category: true,
      startDate: true,
      endDate: true,
      createdAt: true,
      updatedAt: true,
    },
  });
  
  // console.log("✅ [DEBUG] 쿼리 결과:", result.length, "개");
  // result.forEach((post, index) => {
    // console.log(`  ${index + 1}. ID: ${post.id}, 제목: ${post.title}, 종료일: ${post.endDate}`);
  // });
  
  return result;
};


// 모든 공지글을 조회
export const getAllPosts = async (): Promise<Post[]> => {
  return await prisma.post.findMany({
    orderBy: {
      createdAt: 'desc', // 최신순
    },
  });
};

// 특정 ID의 공지글을 조회
export const getPostById = async (id: bigint): Promise<Post | null> => {
  return await prisma.post.findUnique({
    where: {
      id,
    },
  });
};

// 카테고리별 공지글 조회 (커서 페이지네이션)
export const getPostsByCategory = async (
  category: string,
  cursor?: string,
  limit: number = 5
): Promise<{ posts: Post[]; nextCursor: string | null; hasMore: boolean }> => {
  const posts = await prisma.post.findMany({
    where: {
      category,
      ...(cursor && { id: { lt: BigInt(cursor) } }), // cursor가 있으면 그보다 작은 id만
    },
    orderBy: {
      id: 'desc', // 최신순 (id가 큰 순서)
    },
    take: limit + 1, // limit보다 1개 더 가져와서 hasMore 판단
    select: {
      id: true,
      title: true,
      link: true,
      content: true,
      summary: true,
      image: true,
      category: true,
      startDate: true,
      endDate: true,
      createdAt: true,
      updatedAt: true,
    },
  });

  const hasMore = posts.length > limit;
  const result = hasMore ? posts.slice(0, limit) : posts;
  const nextCursor = hasMore ? result[result.length - 1].id.toString() : null;

  return {
    posts: result,
    nextCursor,
    hasMore,
  };
};

// 알림 설정한 공지글 조회 (커서 페이지네이션)
export const getNotificationPosts = async (
  userId: bigint,
  cursor?: string,
  limit: number = 5
): Promise<{ posts: Post[]; nextCursor: string | null; hasMore: boolean }> => {
  const posts = await prisma.post.findMany({
    where: {
      notifications: {
        some: {
          userId: userId, // 현재 로그인한 사용자 ID
        },
      },
      ...(cursor && { id: { lt: BigInt(cursor) } }), // cursor가 있으면 그보다 작은 id만
    },
    orderBy: {
      id: 'desc', // 최신순 (id가 큰 순서)
    },
    take: limit + 1, // limit보다 1개 더 가져와서 hasMore 판단
    select: {
      id: true,
      title: true,
      link: true,
      content: true,
      summary: true,
      image: true,
      category: true,
      startDate: true,
      endDate: true,
      createdAt: true,
      updatedAt: true,
    },
  });

  const hasMore = posts.length > limit;
  const result = hasMore ? posts.slice(0, limit) : posts;
  const nextCursor = hasMore ? result[result.length - 1].id.toString() : null;

  return {
    posts: result,
    nextCursor,
    hasMore,
  };
};

// 사용자 관심 카테고리의 공지글 조회 (커서 페이지네이션)
export const getUserInterestedPosts = async (
  userId: bigint,
  cursor?: string,
  limit: number = 3
): Promise<{ posts: Post[]; nextCursor: string | null; hasMore: boolean }> => {
  // 먼저 사용자의 관심 카테고리들을 조회
  const userCategories = await prisma.userCategory.findMany({
    where: {
      userId: userId,
    },
    include: {
      category: true,
    },
  });

  // 관심 카테고리가 없으면 빈 결과 반환
  if (userCategories.length === 0) {
    return {
      posts: [],
      nextCursor: null,
      hasMore: false,
    };
  }

  // 카테고리 이름들 추출
  const categoryNames = userCategories.map(uc => uc.category.name);

  const posts = await prisma.post.findMany({
    where: {
      category: {
        in: categoryNames, // 사용자의 관심 카테고리들
      },
      ...(cursor && { id: { lt: BigInt(cursor) } }), // cursor가 있으면 그보다 작은 id만
    },
    orderBy: {
      id: 'desc', // 최신순 (id가 큰 순서)
    },
    take: 4, // 4개를 조회해서 4번째가 있으면 hasMore 판단
    select: {
      id: true,
      title: true,
      link: true,
      content: true,
      summary: true,
      image: true,
      category: true,
      startDate: true,
      endDate: true,
      createdAt: true,
      updatedAt: true,
    },
  });

  const hasMore = posts.length === 4; // 4개가 조회되면 hasMore true
  const result = hasMore ? posts.slice(0, 3) : posts; // 4개가 있으면 3개만 반환, 없으면 그대로 반환
  const nextCursor = hasMore ? result[result.length - 1].id.toString() : null;

  return {
    posts: result,
    nextCursor,
    hasMore,
  };
};
