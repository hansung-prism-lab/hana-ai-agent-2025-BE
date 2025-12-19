import express from "express";
import userRouter from "./routes/user";
import authRouter from "./routes/auth";
import notificationRouter from "./routes/notification";
import postRouter from "./routes/post";
import chatRouter from "./routes/chat";
import swaggerUi from "swagger-ui-express";
import YAML from "yamljs";
import dotenv from "dotenv";
import morgan from "morgan"; // morgan 임포트
import cors from "cors"; // cors 임포트
import { responseHandler, errorHandler } from "./utils/response.util";
import { authenticateToken } from "./utils/auth.middleware";
import cookieParser from 'cookie-parser';
import { snakeToCamelMiddleware } from "./utils/case-converter.util";
dotenv.config();

const app = express();
const port = parseInt(process.env.PORT || "3000", 10);

// CORS 미들웨어 추가
app.use(cors({
  origin: '*', // 모든 출처 허용 (개발 환경에 적합)
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS', 'PATCH'], // 허용할 HTTP 메서드
  allowedHeaders: ['Content-Type', 'Authorization'], // 허용할 헤더
}));

app.use(express.json());
app.use(cookieParser());
app.use(snakeToCamelMiddleware);

// HTTP 요청 로깅 미들웨어 추가
app.use(morgan("dev")); // 'dev' 포맷은 개발 환경에 적합한 로그를 출력

// app.use(authenticateToken); // 전역 인증 미들웨어 제거 - 각 라우트에서 개별적으로 처리

app.use(responseHandler); 
// Swagger 문서 로드
const swaggerDocument = YAML.load(__dirname + "/swagger/openapi.yml");

// OpenAPI 스키마를 JSON으로 제공하는 엔드포인트 추가
app.get('/docs/swagger.json', (req, res) => {
  res.setHeader('Content-Type', 'application/json');
  res.send(swaggerDocument);
});

// Swagger UI 정적 파일과 템플릿을 분리하여 서빙 (배포환경에서 JS가 HTML로 반환되는 문제 방지)
app.use(
  "/docs",
  swaggerUi.serveFiles(swaggerDocument, {
    swaggerOptions: { url: "/docs/swagger.json", validatorUrl: null },
  })
);
app.get(
  "/docs",
  swaggerUi.setup(swaggerDocument, {
    customCss: '.swagger-ui .topbar { display: none }',
    customSiteTitle: "HANA API Documentation",
    swaggerOptions: { url: "/docs/swagger.json", validatorUrl: null },
  })
);

app.use("/auth", authRouter);
app.use("/users", userRouter);
app.use("/notifications", notificationRouter);
app.use("/posts", postRouter);
app.use("/chat", chatRouter);
// 글로벌 에러 핸들러 - 모든 라우트 정의 후에 추가
app.use(errorHandler);

app.listen(port, "0.0.0.0", () => {
  console.log(`Server is running at http://0.0.0.0:${port}`);
  console.log(`Swagger UI is available at http://0.0.0.0:${port}/docs`);
});