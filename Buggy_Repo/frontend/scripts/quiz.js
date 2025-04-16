const BASE_URL = "http://localhost:8000";

let score = 0;
let highScore = 0;
let currentQuestion = null;
let gameOver = false;
let attemptHistory = [];

const scoreDisplay = document.getElementById("scoreDisplay");
const questionDiv = document.getElementById("question");
const form = document.getElementById("answerForm");
const feedback = document.getElementById("feedback");
const resetBtn = document.getElementById("resetBtn");
const attemptList = document.getElementById("attemptList");
const attemptCount = document.getElementById("attemptCount");
const searchInput = document.getElementById("search");

function updateScoreDisplay() {
  scoreDisplay.textContent = `Score: ${score} | High Score: ${highScore}`;
}

function updateAttempts() {
  const search = searchInput ? searchInput.value.toLowerCase() : "";
  const filtered = attemptHistory.filter(a =>
    a.question.toLowerCase().includes(search)
  );

  if (attemptList) {
    attemptList.innerHTML = filtered.map(a => `
      <div>
        <strong>${a.question}</strong><br/>
        Your answer: ${a.answer} — ${a.result}
      </div>
    `).join("");
  }

  if (attemptCount) {
    attemptCount.textContent = `Total attempts: ${filtered.length}`;
  }
}

if (searchInput) {
  searchInput.addEventListener("input", updateAttempts);
}

async function loadHighScore() {
  try {
    const res = await fetch(`${BASE_URL}/quiz/highscore`);
    if (!res.ok) {
      throw new Error(`Server returned ${res.status}: ${res.statusText}`);
    }
    const data = await res.json();
    if (data && typeof data.high_score === 'number') {
      highScore = data.high_score;
      updateScoreDisplay();
    } else {
      throw new Error("Invalid high score data format");
    }
  } catch (error) {
    console.error("Failed to load high score:", error);
    feedback.textContent = "Failed to load high score.";
  }
}

async function loadQuestion() {
  if (gameOver) return;

  try {
    const res = await fetch(`${BASE_URL}/quiz/question`);
    if (!res.ok) {
      throw new Error(`Server returned ${res.status}: ${res.statusText}`);
    }
    const data = await res.json();

    if (!data || !data.text || !Array.isArray(data.options) || !data.id) {
      throw new Error("Invalid question format received");
    }

    currentQuestion = data;
    questionDiv.textContent = data.text;

    form.innerHTML = data.options.map(option => `
      <label>
        <input type="radio" name="answer" value="${option}" required>
        ${option}
      </label><br/>
    `).join("") + `<button type="submit">Submit</button>`;

    form.dataset.id = data.id;
    feedback.textContent = "";
  } catch (error) {
    console.error("Failed to load question:", error);
    feedback.textContent = "Failed to load question.";
  }
}

form.addEventListener("submit", async (e) => {
  e.preventDefault();
  if (gameOver) return;

  const selected = form.querySelector("input[name=answer]:checked");
  if (!selected) return;

  const answer = selected.value;
  const id = parseInt(form.dataset.id);
  if (isNaN(id)) {
    feedback.textContent = "Invalid question ID.";
    return;
  }

  try {
    const res = await fetch(`${BASE_URL}/quiz/answer`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id, answer, score })
    });

    if (!res.ok) {
      throw new Error(`Server returned ${res.status}: ${res.statusText}`);
    }

    const data = await res.json();

    if (data.error) {
      feedback.textContent = data.error;
      return;
    }

    attemptHistory.push({
      question: currentQuestion.text,
      answer,
      result: data.is_correct ? "✅ Correct" : `❌ Wrong (Correct: ${data.correct_answer})`
    });

    updateAttempts();

    if (data.is_correct) {
      score = data.score;
      if (data.high_score > highScore) {
        highScore = data.high_score;
      }
      updateScoreDisplay();
      feedback.textContent = "✅ Correct!";
      await loadQuestion();
    } else {
      feedback.textContent = `❌ Incorrect. Correct answer: ${data.correct_answer}. Game Over.`;
      gameOver = true;
      form.innerHTML = "";
      resetBtn.classList.remove("hidden");
    }
  } catch (error) {
    console.error("Error submitting answer:", error);
    feedback.textContent = "Error submitting answer.";
  }
});

if (resetBtn) {
  resetBtn.addEventListener("click", () => {
    score = 0;
    gameOver = false;
    attemptHistory = [];
    updateScoreDisplay();
    updateAttempts();
    resetBtn.classList.add("hidden");
    loadQuestion();
  });
}

window.addEventListener("DOMContentLoaded", async () => {
  await loadHighScore();
  loadQuestion();
});
