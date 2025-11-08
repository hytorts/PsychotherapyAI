1. LM Studio 설치
  [LM Studio 공식 사이트](https://lmstudio.ai/)
2. 설치 이후 첫화면부터 get started, user선택 후 continue, skip 그리고 Model을 meta-llama-3-8b-instruct검색이후 맨 위 Model 설치이후 load model 클릭
3. 시스템 환경 변수 path에 C:\Users\user_name\AppData\Local\Programs\LM Studio\lms.exe 경로 저장.
4. cmd에서 lms server start --port 1234 실행.
  Success! Server is now running on port 1234 << 이거 나오면 성공
5. 이후 node.js 설치한 이후
6. npm init -y, npm install express cors node-fetch, node server.js로 서버 실행.
