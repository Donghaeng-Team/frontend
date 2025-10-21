/**
 * S3 URL을 CloudFront URL로 변환
 * S3 버킷 직접 접근은 403 에러가 발생하므로 CloudFront를 통해 접근해야 함
 */
export const convertToCloudFrontUrl = (url: string): string => {
  if (!url) return url;

  // S3 URL 패턴들
  const s3Patterns = [
    'sesac-final-bytogether-dev-user.s3.ap-northeast-2.amazonaws.com',
    'sesac-final-bytogether-dev-market.s3.ap-northeast-2.amazonaws.com',
    // 필요시 추가 패턴
  ];

  const cloudFrontDomain = 'https://d336wfxni0xdc5.cloudfront.net';

  for (const pattern of s3Patterns) {
    if (url.includes(pattern)) {
      return url.replace(`https://${pattern}`, cloudFrontDomain);
    }
  }

  return url;
};
