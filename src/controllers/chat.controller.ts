import { Request, Response, NextFunction, RequestHandler } from "express";
import { StatusCodes } from "http-status-codes";
import { chatService } from "../services/chat.service";

// 채팅 질문 처리 핸들러
export const chatHandler: RequestHandler = async (req, res, next) => {
  try {
    const { question } = req.body;
    
    if (!question || typeof question !== 'string' || question.trim().length === 0) {
      return res.status(StatusCodes.BAD_REQUEST).json({
        success: false,
        message: "질문을 입력해주세요.",
      });
    }

    const result = await chatService(question.trim());
    
    res.sendSuccess(StatusCodes.OK, "채팅 응답을 성공적으로 받았습니다.", result);
  } catch (err) {
    next(err);
  }
};
