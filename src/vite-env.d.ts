/// <reference types="vite/client" />

// JSON 파일 import 타입 선언
declare module '*.json' {
  const value: any;
  export default value;
}

// Public 폴더의 JSON 파일을 위한 타입 선언
declare module '/category.json' {
  const value: Array<{
    code: string;
    name: string;
    sub?: Array<any>;
  }>;
  export default value;
}
