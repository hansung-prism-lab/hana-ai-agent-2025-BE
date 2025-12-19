import { getUrgentPosts, getPostsByCategory, getNotificationPosts, getUserInterestedPosts } from "../repositories/post.repository";
import { Post } from "@prisma/client";

// D-day 계산 함수
const calculateDDay = (endDate: Date): number => {
  const today = new Date();
  const todayStart = new Date(today.getFullYear(), today.getMonth(), today.getDate());
  const endDateStart = new Date(endDate.getFullYear(), endDate.getMonth(), endDate.getDate());
  
  const diffTime = endDateStart.getTime() - todayStart.getTime();
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  
  return diffDays;
};

// 긴급 공지글 조회 서비스
export const getUrgentPostsService = async () => {
  try {
    const posts = await getUrgentPosts();
    
    // D-day 계산 및 응답 데이터 포맷팅
    const urgentPosts = posts.map((post: any) => ({
      id: post.id.toString(),
      title: post.title,
      content: post.content,
      summary: post.summary, 
      link: post.link,
      image: post.image ? post.image : null,
      category: post.category,
      startDate: post.startDate ? post.startDate.toISOString() : null,
      endDate: post.endDate ? post.endDate.toISOString() : null,
      dDay: post.endDate ? calculateDDay(post.endDate) : 0,
      createdAt: post.createdAt.toISOString(),
      updatedAt: post.updatedAt.toISOString(),
    }));
    
    return {
      posts: urgentPosts,
      count: urgentPosts.length,
      message: urgentPosts.length > 0 
        ? `종료일이 임박한 공지 ${urgentPosts.length}개를 조회했습니다.`
        : "종료일이 임박한 공지가 없습니다.",
    };
  } catch (error) {
    console.error("Error in getUrgentPostsService:", error);
    throw new Error("긴급 공지 조회 중 오류가 발생했습니다.");
  }
};

// 카테고리별 공지글 조회 서비스
export const getPostsByCategoryService = async (
  category: string,
  cursor?: string,
  limit: number = 5
) => {
  try {
    const result = await getPostsByCategory(category, cursor, limit);
    
    // 응답 데이터 포맷팅
    const formattedPosts = result.posts.map((post: any) => ({
      id: post.id.toString(),
      title: post.title,
      content: post.content,
      summary: post.summary,
      link: post.link,
      image: post.image ? post.image : null,
      category: post.category,
      startDate: post.startDate ? post.startDate.toISOString() : null,
      endDate: post.endDate ? post.endDate.toISOString() : null,
      createdAt: post.createdAt.toISOString(),
      updatedAt: post.updatedAt.toISOString(),
    }));
    
    return {
      posts: formattedPosts,
      nextCursor: result.nextCursor,
      hasMore: result.hasMore,
      count: formattedPosts.length,
      message: `${category} 카테고리의 공지 ${formattedPosts.length}개를 조회했습니다.`,
    };
  } catch (error) {
    console.error("Error in getPostsByCategoryService:", error);
    throw new Error("카테고리별 공지 조회 중 오류가 발생했습니다.");
  }
};

// 알림 설정한 공지글 조회 서비스
export const getNotificationPostsService = async (
  userId: bigint,
  cursor?: string,
  limit: number = 5
) => {
  try {
    const result = await getNotificationPosts(userId, cursor, limit);
    
    // 응답 데이터 포맷팅
    const formattedPosts = result.posts.map((post: any) => ({
      id: post.id.toString(),
      title: post.title,
      content: post.content,
      summary: post.summary,
      link: post.link,
      image: post.image ? post.image : null,
      category: post.category,
      startDate: post.startDate ? post.startDate.toISOString() : null,
      endDate: post.endDate ? post.endDate.toISOString() : null,
      createdAt: post.createdAt.toISOString(),
      updatedAt: post.updatedAt.toISOString(),
    }));
    
    return {
      posts: formattedPosts,
      nextCursor: result.nextCursor,
      hasMore: result.hasMore,
      count: formattedPosts.length,
      message: `알림 설정한 공지 ${formattedPosts.length}개를 조회했습니다.`,
    };
  } catch (error) {
    console.error("Error in getNotificationPostsService:", error);
    throw new Error("알림 설정한 공지 조회 중 오류가 발생했습니다.");
  }
};

// 사용자 관심 카테고리의 공지글 조회 서비스
export const getUserInterestedPostsService = async (
  userId: bigint,
  cursor?: string,
  limit: number = 3
) => {
  try {
    const result = await getUserInterestedPosts(userId, cursor, limit);
    
    // 응답 데이터 포맷팅
    const formattedPosts = result.posts.map((post: any) => ({
      id: post.id.toString(),
      title: post.title,
      content: post.content,
      summary: post.summary,
      link: post.link,
      image: post.image ? post.image : null,
      category: post.category,
      startDate: post.startDate ? post.startDate.toISOString() : null,
      endDate: post.endDate ? post.endDate.toISOString() : null,
      createdAt: post.createdAt.toISOString(),
      updatedAt: post.updatedAt.toISOString(),
    }));
    
    return {
      posts: formattedPosts,
      nextCursor: result.nextCursor,
      hasMore: result.hasMore,
      count: formattedPosts.length,
      message: `관심 카테고리의 공지 ${formattedPosts.length}개를 조회했습니다.`,
    };
  } catch (error) {
    console.error("Error in getUserInterestedPostsService:", error);
    throw new Error("관심 카테고리의 공지 조회 중 오류가 발생했습니다.");
  }
};
