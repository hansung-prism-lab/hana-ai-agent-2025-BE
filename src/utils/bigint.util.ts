/**
 * BigInt를 문자열로 변환하는 함수
 */
export const serializeBigInt = (obj: any): any => {
  if (obj === null || obj === undefined) {
    return obj;
  }

  if (typeof obj === 'bigint') {
    return obj.toString();
  }

  if (Array.isArray(obj)) {
    return obj.map(serializeBigInt);
  }

  if (typeof obj === 'object') {
    const result: any = {};
    for (const key in obj) {
      if (obj.hasOwnProperty(key)) {
        result[key] = serializeBigInt(obj[key]);
      }
    }
    return result;
  }

  return obj;
};

/**
 * Prisma 결과를 JSON 직렬화 가능한 형태로 변환
 */
export const serializePrismaResult = <T>(result: T): T => {
  return serializeBigInt(result);
};
