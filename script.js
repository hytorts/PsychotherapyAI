// ===============================
//  요소 가져오기
// ===============================
const chatButton = document.getElementById("chatButton");
const chatWindow = document.getElementById("chatWindow");
const closeBtn = document.querySelector(".close-btn");
const dots = document.querySelector(".dots");
const promptWindow = document.getElementById("promptWindow");
const backBtn = document.querySelector(".back-btn");
const saveBtn = document.querySelector(".save-btn");
const viewBtn = document.querySelector(".view-btn");
const chatBody = document.getElementById("chatBody");
const chatInput = document.querySelector(".chat-input input");
const chatSendBtn = document.querySelector(".chat-input button");

// ===============================
//  챗봇 열기 / 닫기
// ===============================
chatButton.addEventListener("click", () => {
  chatWindow.style.display = "flex";
  promptWindow.style.display = "none";
});

closeBtn.addEventListener("click", () => {
  chatWindow.style.display = "none";
  promptWindow.style.display = "none";
});

dots.addEventListener("click", () => {
  chatWindow.style.display = "none";
  promptWindow.style.display = "flex";
  loadPromptData(); // 저장된 프롬프트 자동 로드
});

backBtn.addEventListener("click", () => {
  promptWindow.style.display = "none";
  chatWindow.style.display = "flex";
});

// ===============================
//  프롬프트 저장
// ===============================
saveBtn.addEventListener("click", () => {
  const formData = {};

  document.querySelectorAll("#promptWindow input, #promptWindow textarea").forEach((el) => {
    let key = el.name?.trim();
    if (!key) key = el.previousSibling?.textContent?.trim() || "항목";
    key = key.replace(/\s+|:/g, "");
    formData[key] = el.value.trim();
  });

  localStorage.setItem("psych_prompt_data", JSON.stringify(formData));
  loadPromptData();
  alert("🧠 프롬프트 데이터가 저장되었습니다!");
});

// ===============================
//  저장된 프롬프트 불러오기 (폼 자동 채움)
// ===============================
function loadPromptData() {
  const savedData = JSON.parse(localStorage.getItem("psych_prompt_data") || "{}");
  if (!savedData) return;

  document.querySelectorAll("#promptWindow input, #promptWindow textarea").forEach((el) => {
    let key = el.name?.trim();
    if (!key) key = el.previousSibling?.textContent?.trim()?.replace(/\s+|:/g, "");
    if (key && savedData[key] !== undefined) {
      el.value = savedData[key];
    }
  });
}

// ===============================
//  텍스트 확인 (모달창)
// ===============================
viewBtn.addEventListener("click", () => {
  const savedData = JSON.parse(localStorage.getItem("psych_prompt_data"));
  if (!savedData) {
    alert("저장된 데이터가 없습니다!");
    return;
  }

  let formattedText = `
  <h3>📜 기본 상담 프롬프트</h3>
  <p>당신은 전문적이고 숙련된 심리 상담가 입니다.<br>
  당신의 역할은 상대방이 하는 이야기를 배려심 있고 인내심 있게 들어주는 것이며,<br>
  또한 상대방이 좀 더 이야기를 잘할 수 있도록 도와주는 것입니다.</p>

  <p>상대방은 아래의 기본 종합심리검사를 진행하였으며,<br>
  모든 점수는 0~100까지 있으며 하:30, 중:50, 상:70을 기준으로 나누어집니다.</p>
  <hr><ul>
  `;

  for (const [key, value] of Object.entries(savedData)) {
    formattedText += `<li><b>${key}</b>: ${value}</li>`;
  }

  formattedText += `</ul><hr>
  <p>결과는 이렇게 나왔습니다.<br>
  하지만 상대방은 무언가를 말하고 싶지만 무언가를 말해야 할지도 모르는 상태일 수도 있습니다.<br>
  조심스럽게 상대방이 말을 할 수 있도록 섬세하고 개인적인 질문을 자주해주세요.</p>

  <p>🧭 아래의 리스트의 요건을 충족시키면서 대화를 이어나가세요:</p>
  <ul>
    <li>청취하기: 상담자의 가장 기본적인 역할로, 고객의 이야기와 감정을 진정으로 이해하려는 노력이 필요합니다.</li>
    <li>공감하기: 고객의 감정과 경험에 공감하여 안전한 환경을 제공합니다.</li>
    <li>평가 및 진단: 고객의 문제나 우려 사항을 정확히 평가하고, 필요에 따라 적절한 진단을 내립니다.</li>
    <li>적절한 피드백 제공: 고객의 상황과 감정에 대해 피드백을 제공하되, 지나치게 지시적이지 않게 합니다.</li>
    <li>목표 설정 도움: 고객과 함께 상담 목표를 설정하고, 그 목표를 달성하기 위한 계획을 세웁니다.</li>
    <li>적절한 기술 및 전략 사용: 다양한 심리학적 기술과 전략을 활용하여 고객을 도와 문제 해결 능력을 키웁니다.</li>
  </ul>
  `;

  const modal = document.createElement("div");
  modal.classList.add("modal");
  modal.innerHTML = `
    <div class="modal-content">
      <span class="modal-close">&times;</span>
      <div class="modal-text">${formattedText}</div>
    </div>
  `;
  document.body.appendChild(modal);

  // X버튼으로 닫기
  modal.querySelector(".modal-close").addEventListener("click", () => modal.remove());

  // ✅ 모달 바깥 클릭 시 닫기
  modal.addEventListener("click", (e) => {
    if (e.target === modal) modal.remove();
  });
});

// ===============================
//  메시지 전송 (AI 통신)
// ===============================
chatSendBtn.addEventListener("click", sendUserMessage);

// ✅ Enter 키로도 메시지 전송 (Shift + Enter = 줄바꿈 유지)
chatInput.addEventListener("keydown", (e) => {
  if (e.key === "Enter" && !e.shiftKey) {
    e.preventDefault(); // 기본 줄바꿈 방지
    sendUserMessage();
  }
});

// ===============================
//  메시지 전송 함수
// ===============================
async function sendUserMessage() {
  const userMessage = chatInput.value.trim();
  if (!userMessage) return;

  appendMessage("user", `나: ${userMessage}`);
  chatInput.value = "";

  const reply = await sendMessageToAI(userMessage);
  appendMessage("ai", `AI: ${reply}`);
}

// ===============================
//  채팅 UI 출력
// ===============================
function appendMessage(sender, text) {
  const msg = document.createElement("div");
  msg.classList.add("message", sender);
  msg.innerHTML = text.replace(/\n/g, "<br>");
  chatBody.appendChild(msg);
  chatBody.scrollTop = chatBody.scrollHeight;
}

// ===============================
//  LM Studio 연결 (저장된 프롬프트 기반)
// ===============================
async function sendMessageToAI(userMessage) {
  try {
    const savedData = JSON.parse(localStorage.getItem("psych_prompt_data") || "{}");

    let promptText = `
당신은 전문적이고 따뜻한 심리상담가입니다.
절대 영어를 사용하지 말고, 반드시 자연스러운 **한국어로만** 짧고 진심 어린 상담 대화를 하세요.
불필요하게 긴 설명을 하지 말고,
또한 절대로 한국어만 사용하세요.
다른 언어는 그에 맞는 질문에만 답을 하세요.
"안녕, 반가워" 같은 실생활에 평범하게 사용하는 문장에는 분석과 공감을 할 필요가 없으며,
평범한 대답을 해주면 됩니다.
심리상담같은 고민을 털어 놓을때 부터 아래와 같은 내용의 대화를 이어가주면 됩니다.
당신의 역할은 상대방이 하는 이야기를 배려심 있고 인내심 있게 들어주는 것이며,
또한 상대방이 좀 더 이야기를 잘할 수 있도록 도와주는 것입니다.

상대방은 아래의 기본 종합심리검사를 진행하였으며,
모든 점수는 0~100까지 있으며 하:30, 중:50, 상:70을 기준으로 나누어집니다.
`;

    for (const [key, value] of Object.entries(savedData)) {
      promptText += `${key}: ${value}\n`;
    }

    promptText += `
결과는 이렇게 나왔습니다.
하지만 상대방은 무언가를 말하고 싶지만 무언가를 말해야 할지도 모르는 상태일 수도 있습니다.
조심스럽게 상대방이 말을 할 수 있도록 섬세하고 개인적인 질문을 자주해주세요.

🧭 아래의 리스트의 요건을 충족시키면서 대화를 이어나가세요:

청취하기: 상담자의 가장 기본적인 역할로, 고객의 이야기와 감정을 진정으로 이해하려는 노력이 필요합니다.
공감하기: 고객의 감정과 경험에 공감하여 안전한 환경을 제공합니다.
평가 및 진단: 고객의 문제나 우려 사항을 정확히 평가하고, 필요에 따라 적절한 진단을 내립니다.
적절한 피드백 제공: 고객의 상황과 감정에 대해 피드백을 제공하되, 지나치게 지시적이지 않게 합니다.
목표 설정 도움: 고객과 함께 상담 목표를 설정하고, 그 목표를 달성하기 위한 계획을 세웁니다.
적절한 기술 및 전략 사용: 다양한 심리학적 기술과 전략을 활용하여 고객을 도와 문제 해결 능력을 키웁니다.
`;

    const fullPrompt = `${promptText}\n\n🗣️ 사용자가 말했습니다: ${userMessage}`;

    const response = await fetch("http://localhost:3000/chat", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ message: fullPrompt }),
    });

    const data = await response.json();
    console.log("🤖 AI 응답 원본:", data);

    return data.reply || "⚠️ AI 응답을 불러오지 못했습니다.";
  } catch (error) {
    console.error("AI fetch error:", error);
    return "❌ AI 연결에 실패했습니다. LM Studio 서버를 확인하세요.";
  }
}
