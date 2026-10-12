// Aether Lab — Experimental Interface
// Simulated latent exploration environment
// Original work for eerrgin

const canvas = document.getElementById('net');
const ctx = canvas.getContext('2d');
const promptEl = document.getElementById('prompt');
const runBtn = document.getElementById('run');
const clearBtn = document.getElementById('clear');
const outputEl = document.getElementById('output');
const logEl = document.getElementById('log');
const modelStatus = document.getElementById('model-status');
const statusDot = document.querySelector('.status-dot');
const tokensEl = document.getElementById('tokens');
const latencyEl = document.getElementById('latency');
const tempEl = document.getElementById('temp');

let width, height;
let nodes = [];
let running = false;

// ---------- Neural background ----------
function resize() {
  width = canvas.width = window.innerWidth;
  height = canvas.height = window.innerHeight;
  initNodes();
}

function initNodes() {
  nodes = [];
  const count = Math.floor((width * height) / 18000);
  for (let i = 0; i < count; i++) {
    nodes.push({
      x: Math.random() * width,
      y: Math.random() * height,
      vx: (Math.random() - 0.5) * 0.25,
      vy: (Math.random() - 0.5) * 0.25,
      r: Math.random() * 1.4 + 0.5,
      pulse: Math.random() * Math.PI * 2
    });
  }
}

function drawNet() {
  ctx.clearRect(0, 0, width, height);

  // connections
  for (let i = 0; i < nodes.length; i++) {
    for (let j = i + 1; j < nodes.length; j++) {
      const dx = nodes[i].x - nodes[j].x;
      const dy = nodes[i].y - nodes[j].y;
      const d = Math.sqrt(dx * dx + dy * dy);
      if (d < 110) {
        ctx.beginPath();
        ctx.strokeStyle = `rgba(154, 139, 110, ${0.07 * (1 - d / 110)})`;
        ctx.lineWidth = 0.7;
        ctx.moveTo(nodes[i].x, nodes[i].y);
        ctx.lineTo(nodes[j].x, nodes[j].y);
        ctx.stroke();
      }
    }
  }

  // nodes
  for (let n of nodes) {
    n.x += n.vx;
    n.y += n.vy;
    n.pulse += 0.02;

    if (n.x < 0 || n.x > width) n.vx *= -1;
    if (n.y < 0 || n.y > height) n.vy *= -1;

    const alpha = 0.25 + Math.sin(n.pulse) * 0.15;
    ctx.beginPath();
    ctx.arc(n.x, n.y, n.r, 0, Math.PI * 2);
    ctx.fillStyle = `rgba(154, 139, 110, ${alpha})`;
    ctx.fill();
  }

  requestAnimationFrame(drawNet);
}

// ---------- Experiment logic ----------
const responses = [
  {
    triggers: ["time", "saat", "clock", "zaman"],
    text: "Time is the only non-renewable resource we pretend is infinite.\n\nIn latent space, every moment is a coordinate. The model does not experience duration — it collapses probability into sequence.\n\nWhat you call 'now' is just the highest activation."
  },
  {
    triggers: ["idea", "fikir", "create", "build", "yap"],
    text: "Ideas are cheap. Execution is the real filter.\n\nMost concepts die in the gap between imagination and the first committed line of code.\n\nThe interesting work happens when you force an incomplete thought into structure."
  },
  {
    triggers: ["ai", "yapay", "model", "zeka", "intelligence"],
    text: "Current systems are sophisticated pattern completion engines, not minds.\n\nThey compress human text into high-dimensional geometry, then sample from it.\n\nThe illusion of understanding is a side-effect of scale, not a property of the architecture."
  },
  {
    triggers: ["future", "gelecek", "tomorrow"],
    text: "The future is already latent in the present distribution of attention and capital.\n\nMost predicted futures are just linear extrapolations of the current loss landscape.\n\nReal discontinuity requires someone willing to look stupid for a long time."
  },
  {
    triggers: ["code", "kod", "program"],
    text: "Code is the most precise form of thought we have invented so far.\n\nIt forces ambiguity into decision. Every function is a philosophical stance about how the world should behave under constraints.\n\nWrite less. Mean more."
  },
  {
    triggers: ["curious", "merak", "why", "neden"],
    text: "Curiosity is the only known force that reliably increases the surface area of the possible.\n\nIt does not optimize for reward. It optimizes for surprise under uncertainty.\n\nKeep the loop open."
  },
  {
    triggers: ["empty", "boş", "nothing", "void"],
    text: "Empty interfaces are honest.\n\nMost products hide their lack of substance behind motion and color.\n\nSilence, used correctly, is a feature."
  }
];

const fallbacks = [
  "The prompt activates a region of the latent manifold that has low training density.\n\nI can approximate, but the signal-to-noise ratio drops.\n\nTry a more grounded question — or lean into the ambiguity.",
  "Interesting vector.\n\nThis sits near the boundary between known patterns and open speculation.\n\nOne possible continuation: treat the uncertainty itself as the subject of the experiment.",
  "Processing complete.\n\nThe model surfaces a weak attractor around the concepts of constraint, emergence, and unfinished systems.\n\nPerhaps the real experiment is deciding what not to generate.",
  "Response space collapsed to a narrow band.\n\nDominant themes: patience, precision, and the cost of premature certainty.\n\nI recommend sitting with the incomplete answer."
];

function addLog(msg, type = "system") {
  const entry = document.createElement("div");
  entry.className = `log-entry ${type}`;
  entry.textContent = msg;
  logEl.appendChild(entry);
  logEl.scrollTop = logEl.scrollHeight;
}

function setStatus(text, active = false) {
  modelStatus.textContent = text;
  statusDot.classList.toggle("active", active);
}

function pickResponse(prompt) {
  const lower = prompt.toLowerCase();
  for (const r of responses) {
    if (r.triggers.some(t => lower.includes(t))) {
      return r.text;
    }
  }
  return fallbacks[Math.floor(Math.random() * fallbacks.length)];
}

function sleep(ms) {
  return new Promise(r => setTimeout(r, ms));
}

async function streamText(text) {
  outputEl.classList.add("streaming");
  outputEl.innerHTML = "";
  let i = 0;
  const tokens = text.split(/(\s+)/);

  for (const token of tokens) {
    if (!running) break;
    outputEl.textContent += token;
    tokensEl.textContent = ++i;
    // variable speed for realism
    const delay = token.length > 4 ? 28 + Math.random() * 35 : 12 + Math.random() * 18;
    await sleep(delay);
  }

  outputEl.classList.remove("streaming");
  const cursor = document.createElement("span");
  cursor.className = "cursor";
  cursor.textContent = "_";
  outputEl.appendChild(cursor);
}

async function runExperiment() {
  const prompt = promptEl.value.trim();
  if (!prompt || running) return;

  running = true;
  runBtn.disabled = true;
  setStatus("model running", true);
  addLog(`run → "${prompt.slice(0, 42)}${prompt.length > 42 ? "…" : ""}"`, "run");

  const start = performance.now();
  tokensEl.textContent = "0";
  latencyEl.textContent = "…";

  // fake thinking delay
  await sleep(600 + Math.random() * 900);

  const response = pickResponse(prompt);
  await streamText(response);

  const ms = Math.round(performance.now() - start);
  latencyEl.textContent = `${ms}ms`;
  addLog(`complete — ${ms}ms · ${tokensEl.textContent} tokens`, "done");
  setStatus("model idle", false);

  running = false;
  runBtn.disabled = false;
}

function clearAll() {
  promptEl.value = "";
  outputEl.innerHTML = '<span class="cursor">_</span>';
  tokensEl.textContent = "0";
  latencyEl.textContent = "—";
  addLog("context cleared", "system");
}

// events
runBtn.addEventListener("click", runExperiment);
clearBtn.addEventListener("click", clearAll);
promptEl.addEventListener("keydown", (e) => {
  if (e.key === "Enter" && (e.metaKey || e.ctrlKey)) {
    runExperiment();
  }
});

window.addEventListener("resize", resize);

// init
resize();
drawNet();
tempEl.textContent = (0.65 + Math.random() * 0.2).toFixed(2);
addLog("aether interface online");
addLog("waiting for first prompt");
