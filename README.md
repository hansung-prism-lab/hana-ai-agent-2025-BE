# HANA Main Server
<div align="center">

  https://github.com/user-attachments/assets/4b888521-15ca-4232-aa8e-5b8ff2564fb4

</div>
HANA 는 한성대학교 AI 공지사항 및 도움 에이전트 서비스입니다.

## Preview
<img width="4959" height="7016" alt="판넬_ver3" src="https://github.com/user-attachments/assets/d8e0ec60-ba6d-48f1-b4fa-ae27f590d939" />

### Members

<table width="50%" align="center">
    <tr>
        <td align="center"><b>FE</b></td>
        <td align="center"><b>BE</b></td>
        <td align="center"><b>AI</b></td>
        <td align="center"><b>AI</b></td>
    </tr>
    <tr>
        <td align="center"><img src="https://github.com/user-attachments/assets/b95eea07-c69a-4bbf-9a8f-eccda41c410e" style="width:220px; object-fit:cover;" /></td>
        <td align="center"><img src="https://github.com/user-attachments/assets/561672fc-71f6-49d3-b826-da55d6ace0c4" style="width:220px; object-fit:cover;" /></td>
        <td align="center"><img src="https://github.com/user-attachments/assets/c3b96a8f-2760-4bc3-8b9d-ff76f5dbcac4" style="width:220px; object-fit:cover;" /></td>
        <td align="center"><img src="https://github.com/user-attachments/assets/6d6ae01b-1cf0-411f-8d7c-ca9338cbe944" style="width:220px; object-fit:cover;" /></td>
    </tr>
    <tr>
        <td align="center"><b><a href="https://github.com/nyun-nye">윤예진</a></b></td>
        <td align="center"><b><a href="https://github.com/hardwoong">박세웅</a></b></td>
        <td align="center"><b><a href="https://github.com/jwon0523">이재원</a></b></td>
        <td align="center"><b><a href="https://github.com/ThreeeJ">정종진</a></b></td>
    </tr>
</table>

## Tech Stack

- **Node.js 18.20.8** - 런타임
- **Express.js** - 웹 프레임워크
- **TypeScript** - 타입 안전성
- **Prisma** - ORM
- **MySQL** - 데이터베이스
- **JWT + bcrypt** - 인증/보안
- **Swagger UI** - API 문서
- **PM2** - 프로세스 관리
- **esbuild** - 빌드 도구

## Getting Started

### Installation

```bash
# 저장소 클론
git clone https://github.com/Hansung-AI-for-Notice-and-Assistance/BE.git
cd BE

# 의존성 설치
npm install
```

### Environment Variables

```env
# Database
DATABASE_URL="mysql://username:password@localhost:3306/database_name"

# JWT
JWT_SECRET="your_jwt_secret_key"
JWT_REFRESH_SECRET="your_refresh_secret_key"

# AI Server (Optional)
FAST_API_URL="http://13.209.9.15:8000"
```

### Database Setup

```bash
# Prisma 클라이언트 생성
npx prisma generate

# 데이터베이스 마이그레이션
npx prisma migrate dev

# (선택) Prisma Studio 실행
npx prisma studio
```

### Run

```bash
# 개발 모드
npm run dev

# 프로덕션 빌드
npm run build

# 프로덕션 실행
npm start

# PM2로 프로덕션 실행
npm run start:prod
```

## Project Structure

```
BE/
├── src/
│   ├── index.ts                 # 엔트리포인트
│   ├── controllers/             # API 컨트롤러
│   │   ├── auth.controller.ts
│   │   ├── chat.controller.ts
│   │   ├── notification.controller.ts
│   │   ├── oauth.controller.ts
│   │   ├── post.controller.ts
│   │   └── user.controller.ts
│   ├── services/                # 비즈니스 로직
│   │   ├── auth.service.ts
│   │   ├── chat.service.ts
│   │   ├── notification.service.ts
│   │   ├── oauth.service.ts
│   │   ├── post.service.ts
│   │   └── user.service.ts
│   ├── repositories/            # 데이터 접근 계층
│   │   ├── category.repository.ts
│   │   ├── notification.repository.ts
│   │   ├── post.repository.ts
│   │   ├── token.repository.ts
│   │   └── user.repository.ts
│   ├── routes/                  # API 라우트
│   │   ├── auth.ts
│   │   ├── chat.ts
│   │   ├── notification.ts
│   │   ├── oauth.ts
│   │   ├── post.ts
│   │   └── user.ts
│   ├── utils/                   # 유틸리티
│   │   ├── auth.middleware.ts
│   │   ├── bigint.util.ts
│   │   ├── jwt.ts
│   │   └── hash.ts
│   ├── types/                   # TypeScript 타입 정의
│   └── swagger/                 # API 문서
├── prisma/
│   ├── schema.prisma
│   └── migrations/
├── scripts/
│   └── build.ts
└── dist/                        # 빌드 결과물
```

## Key Features

- **JWT 인증 시스템**: 액세스 토큰(15분) + 리프레시 토큰(7일) 기반 인증
- **AI 채팅 서비스**: FastAPI 서버 연동을 통한 지능형 공지사항 질의응답
- **알림 토글**: 포스트별 알림 구독/해제 기능
- **긴급 공지사항**: D-day 기준 정렬로 급박한 공지 우선 노출
- **카테고리별 조회**: 공지사항 카테고리 분류 및 필터링
- **응답 파싱**: AI 응답을 구조화된 데이터(본문, 관련 링크, 추천 질문)로 변환

## API Endpoints

### Auth API (`/auth`)

- `POST /auth/refresh-token` - 토큰 갱신
- `POST /auth/logout` - 로그아웃
- `GET /auth/profile` - 프로필 조회

### User API (`/users`)

- `POST /users` - 회원가입
- `POST /users/login` - 로그인

### Notification API (`/notifications`)

- `GET /notifications/{post_id}` - 알림 상태 조회
- `PUT /notifications/{post_id}` - 알림 토글 (생성/삭제)

### Post API (`/posts`)

- `GET /posts/urgent` - 긴급 공지사항 조회 (D-day 기준 상위 3개)
- `GET /posts/category/{category}` - 카테고리별 포스트 조회

### Chat API (`/chat`)

- `POST /chat` - AI 채팅 (FastAPI 서버 연동)

## API Documentation

서버 실행 후 아래 URL에서 확인:

- **Swagger UI**: http://localhost:8080/docs

## Server Information

| 환경              | URL                     |
| ----------------- | ----------------------- |
| 개발 서버         | http://localhost:8080   |
| 프로덕션 서버     | https://hanaa.p-e.kr    |
| AI 서버 (FastAPI) | http://13.209.9.15:8000 |

## License

이 프로젝트는 한성대학교 공학경진대회에서 진행되었습니다.
