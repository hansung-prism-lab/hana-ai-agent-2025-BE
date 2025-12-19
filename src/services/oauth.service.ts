import type { Express } from "express";

export const generateRedirectUrl = (user: Express.User): string => {
  const frontendUrl =
    process.env.FRONTEND_REDIRECT_URL || "http://localhost:3001/login/success";

  // 토큰 발급 등 추가 작업 가능
  // const token = jwt.sign({ id: user.id }, process.env.JWT_SECRET!, { expiresIn: '7d' });
  // return `${frontendUrl}?token=${token}`;

  return `${frontendUrl}`; // 세션 기반이면 token 필요 없음
};
