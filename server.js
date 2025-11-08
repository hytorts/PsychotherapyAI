// server.js
import express from "express";
import fetch from "node-fetch";
import cors from "cors";

const app = express();
app.use(express.json());
app.use(cors());

// LM Studio 서버 주소 (이미 실행 중인 1234 포트)
const LMSTUDIO_API_URL = "http://localhost:1234/v1/chat/completions";

// ✅ /chat 엔드포인트 (프론트엔드에서 이쪽으로 요청을 보냄)
app.post("/chat", async (req, res) => {
  const { message } = req.body;

  try {
    // LM Studio로 요청 전달
    const response = await fetch(LMSTUDIO_API_URL, {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        model: "meta-llama-3-8b-instruct", // LM Studio에서 선택한 모델 이름
        messages: [
          { role: "system", content: "You are a warm and empathetic psychological counselor." },
          { role: "user", content: message }
        ],
        temperature: 0.7,
        max_tokens: 512
      })
    });

    // JSON 변환 시도
    const data = await response.json();

    // LM Studio 응답 로그 (디버깅용)
    console.log("🔹 LM Studio 응답:", data);

    // LM Studio가 정상 응답 시
    if (data && data.choices && data.choices.length > 0) {
      res.json({ reply: data.choices[0].message.content });
    } else {
      res.json({ reply: "⚠️ LM Studio에서 응답을 받을 수 없습니다." });
    }
  } catch (error) {
    console.error("❌ LM Studio 서버 오류:", error);
    res.status(500).json({ error: "LM Studio 연결 실패" });
  }
});

// ✅ 서버 실행
const PORT = 3000;
app.listen(PORT, () => {
  console.log(`✅ 서버 실행 중: http://localhost:${PORT}`);
});
