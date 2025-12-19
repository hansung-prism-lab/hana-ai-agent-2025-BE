import axios from 'axios';

interface FastAPIResponse {
  isSuccess: boolean;
  httpStatus: number;
  message: string;
  data: {
    answer: string;
  };
  timeStamp: string;
}

interface ParsedChatResponse {
  mainAnswer: string;
  relatedLinks: string[];
  suggestedQuestions: string[];
}

export const chatService = async (question: string): Promise<ParsedChatResponse> => {
  const maxRetries = 10;
  let lastError: any;

  for (let attempt = 1; attempt <= maxRetries; attempt++) {
    try {
      // FastAPI 서버 에이전트 초기화 (/build 호출)
      try {
        await axios.post('http://13.209.9.15:8000/build', {}, {
          timeout: 10000, // 10초 타임아웃
          headers: {
            'Content-Type': 'application/json'
          }
        });
        console.log('FastAPI 에이전트 초기화 완료');
      } catch (buildError: any) {
        console.log('FastAPI 에이전트 초기화 실패 (무시하고 계속 진행):', buildError.message);
      }

      // FastAPI 서버로 요청 보내기
      const response = await axios.post<FastAPIResponse>('http://13.209.9.15:8000/chat', {
        question: question
      }, {
        timeout: 30000, // 30초 타임아웃
        headers: {
          'Content-Type': 'application/json'
        }
      });

      if (!response.data.isSuccess) {
        throw new Error(`FastAPI 서버 오류: ${response.data.message}`);
      }

      const answer = response.data.data.answer;
      
      // 응답 파싱
      const parsedResponse = parseChatResponse(answer);
      
      return parsedResponse;
    } catch (error: any) {
      lastError = error;
      
      // 마지막 시도가 아니면 잠시 대기 후 재시도
      if (attempt < maxRetries) {
        console.log(`채팅 서비스 재시도 ${attempt}/${maxRetries}: ${error.message}`);
        await new Promise(resolve => setTimeout(resolve, 1000 * attempt)); // 점진적 대기 (1초, 2초, 3초...)
        continue;
      }
      
      // 마지막 시도에서도 실패하면 에러 처리
      if (error.code === 'ECONNREFUSED') {
        throw new Error('FastAPI 서버에 연결할 수 없습니다.');
      } else if (error.code === 'ETIMEDOUT') {
        throw new Error('FastAPI 서버 응답 시간이 초과되었습니다.');
      } else if (error.response) {
        throw new Error(`FastAPI 서버 오류: ${error.response.status} - ${error.response.data?.message || '알 수 없는 오류'}`);
      } else {
        throw new Error(`채팅 서비스 오류: ${error.message}`);
      }
    }
  }
  
  // 이 코드는 실행되지 않지만 TypeScript를 위해 추가
  throw new Error(`채팅 서비스 오류: ${lastError?.message || '알 수 없는 오류'}`);
};

// 채팅 응답 파싱 함수
const parseChatResponse = (answer: string): ParsedChatResponse => {
  try {
    // 주요 답변 추출 (관련 링크나 추천 질문 섹션 이전까지)
    const mainAnswerEndPatterns = [
      '관련 공지사항\n',
      '관련 공지 링크\n',
      '관련 공지 링크:\n',
      '관련 공지사항 링크:\n',
      '관련 공지사항 링크는 아래와 같습니다:\n', 
      '### 관련 공지사항 링크',  
      'Related Announcements:',
      '추가로 궁금한 점이 있으시면',
      '혹시 더 궁금한 점이 있으신가요?',
      '### 추가 질문',          
      '\n1. [💬'
    ];
    
    let mainAnswerEndIndex = -1;
    for (const pattern of mainAnswerEndPatterns) {
      const index = answer.indexOf(pattern);
      if (index !== -1) {
        mainAnswerEndIndex = index;
        break;
      }
    }
    
    const mainAnswer = mainAnswerEndIndex !== -1 
      ? answer.substring(0, mainAnswerEndIndex).trim()
      : answer.trim();

    // 연관 링크들 추출 (이모지와 설명 텍스트 포함)
    const relatedLinks: string[] = [];
    
    // 관련 공지사항 섹션 시작점 찾기
    const relatedAnnouncementsPatterns = [
      '관련 공지사항\n',
      '관련 공지 링크\n',
      '관련 공지 링크:\n',
      '관련 공지사항 링크:\n',
      '관련 공지사항 링크는 아래와 같습니다:\n', 
      '### 관련 공지사항 링크', 
      'Related Announcements:'
    ];
    
    let linksStartIndex = -1;
    for (const pattern of relatedAnnouncementsPatterns) {
      const index = answer.indexOf(pattern);
      if (index !== -1) {
        linksStartIndex = index;
        break;
      }
    }
    
    if (linksStartIndex !== -1) {
      // 관련 링크 섹션 끝점 찾기 (추천 질문 섹션 시작점들 확인)
      const questionStartPatterns = [
        '\n1. [💬',
        '추가로 궁금한 점이 있으시면',
        '혹시 더 궁금한 점이 있으신가요?',
        '### 추가 질문',
        '궁금한 점이 있으신가요?'
      ];
      
      let questionsStartIndex = -1;
      for (const pattern of questionStartPatterns) {
        const index = answer.indexOf(pattern);
        if (index !== -1) {
          questionsStartIndex = index;
          break;
        }
      }
      
      const linksSection = questionsStartIndex !== -1 
        ? answer.substring(linksStartIndex, questionsStartIndex)
        : answer.substring(linksStartIndex);
      
      // 다양한 링크 형식 추출
      const linkMatches: string[] = [];
      
      // 1. 🔗 패턴으로 전체 링크 라인 추출 (기존)
      const emojiLinkMatches = linksSection.match(/🔗[^\n]+/g);
      if (emojiLinkMatches) {
        linkMatches.push(...emojiLinkMatches);
      }
      
      // 2. [텍스트]: https://... 형식 추출 (새로운 케이스 1)
      const colonLinkMatches = linksSection.match(/[^\n]+:\s*https?:\/\/[^\s\n]+/g);
      if (colonLinkMatches) {
        linkMatches.push(...colonLinkMatches);
      }
      
      // 3. [텍스트](https://...) 형식 추출 (새로운 케이스 2)
      const bracketLinkMatches = linksSection.match(/[^\n]*\[[^\]]+\]\(https?:\/\/[^\s\n\)]+\)/g);
      if (bracketLinkMatches) {
        linkMatches.push(...bracketLinkMatches);
      }
      
      // 링크 정리 및 후행 괄호 제거
      if (linkMatches.length > 0) {
        const cleanedLinks = linkMatches.map(link => {
          let cleanedLink = link.trim();
          // 링크 끝의 후행 소괄호 ")" 제거
          if (cleanedLink.endsWith(')')) {
            cleanedLink = cleanedLink.slice(0, -1);
          }
          return cleanedLink;
        });
        relatedLinks.push(...cleanedLinks);
      }
    }

    // 추천 질문들 추출 (이모지와 대괄호 포함)
    const suggestedQuestions: string[] = [];
    
    // 추천 질문 섹션 시작점 찾기 (여러 패턴 시도)
    const questionStartPatterns = [
      '\n1. [💬',
      '추가로 궁금한 점이 있으시면',
      '혹시 더 궁금한 점이 있으신가요?',
      '### 추가 질문',           
      '궁금한 점이 있으신가요?'
    ];
    
    let questionsStartIndex = -1;
    for (const pattern of questionStartPatterns) {
      const index = answer.indexOf(pattern);
      if (index !== -1) {
        questionsStartIndex = index;
        break;
      }
    }
    
    if (questionsStartIndex !== -1) {
      const questionsSection = answer.substring(questionsStartIndex);
      
      // [💬 ...] 패턴으로 전체 질문 라인 추출 (이모지와 대괄호 포함)
      const questionMatches = questionsSection.match(/\[💬[^\]]+\]/g);
      // console.log('Question matches:', questionMatches);
      
      if (questionMatches) {
        suggestedQuestions.push(...questionMatches.map(q => q.trim()));
      }
    }

    return {
      mainAnswer,
      relatedLinks,
      suggestedQuestions
    };
  } catch (error) {
    // 파싱 실패 시 전체 답변을 주요 답변으로 반환
    return {
      mainAnswer: answer,
      relatedLinks: [],
      suggestedQuestions: []
    };
  }
};
