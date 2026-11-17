/* ==========================================================================
   INTERACTIVE RPG RESUME ENGINE (XP, AUDIO CHIMES, QUESTS & ATS SWITCHER)
   ========================================================================== */
let currentXP = 60;
const maxXP = 1000;
let soundEnabled = true;

const ranks = [
    { min: 0, label: "LVL 1 • FINTECH NOVICE" },
    { min: 200, label: "LVL 2 • VENTURE ANALYST" },
    { min: 450, label: "LVL 3 • STRATEGY ASSOCIATE" },
    { min: 700, label: "LVL 4 • FOUNDERS OFFICE PRO" },
    { min: 950, label: "LVL 5 • EXECUTIVE LEADER" }
];

// Gentle 8-bit Web Audio synth chime
function playChime(freq = 587.33) {
    if (!soundEnabled) return;
    try {
        const AudioCtx = window.AudioContext || window.webkitAudioContext;
        const ctx = new AudioCtx();
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.type = "triangle";
        osc.frequency.setValueAtTime(freq, ctx.currentTime);
        osc.frequency.exponentialRampToValueAtTime(freq * 1.5, ctx.currentTime + 0.12);
        gain.gain.setValueAtTime(0.08, ctx.currentTime);
        gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.18);
        osc.connect(gain);
        gain.connect(ctx.destination);
        osc.start();
        osc.stop(ctx.currentTime + 0.19);
    } catch (e) {
        // Ignore audio errors if blocked by browser autoplay rules
    }
}

function updateHUD() {
    const xpText = document.getElementById("xp-text");
    const xpBar = document.getElementById("xp-bar");
    const rankLabel = document.getElementById("player-rank");

    const pct = Math.min(100, Math.round((currentXP / maxXP) * 100));
    xpText.textContent = `${currentXP} / ${maxXP} XP`;
    xpBar.style.width = `${pct}%`;

    let activeRank = ranks[0].label;
    for (const r of ranks) {
        if (currentXP >= r.min) activeRank = r.label;
    }
    rankLabel.textContent = activeRank;
}

function spawnFloater(event, text) {
    const el = document.createElement("div");
    el.className = "xp-floater";
    el.textContent = text;
    const x = event && event.clientX ? event.clientX : window.innerWidth / 2;
    const y = event && event.clientY ? event.clientY : 120;
    el.style.left = `${x}px`;
    el.style.top = `${y - 12}px`;
    document.body.appendChild(el);
    setTimeout(() => el.remove(), 950);
}

function gainXP(amount, event, customMsg) {
    currentXP = Math.min(maxXP, currentXP + amount);
    updateHUD();
    playChime(659.25);
    spawnFloater(event, customMsg || `+${amount} XP!`);
}

function completeQuest(card, xpAmount, event) {
    if (card.classList.contains("claimed")) {
        playChime(440);
        spawnFloater(event, "QUEST LOGGED!");
        return;
    }
    card.classList.add("claimed");
    const status = card.querySelector(".quest-status");
    if (status) status.textContent = "★ QUEST COMPLETED & CLAIMED";
    gainXP(xpAmount, event, `+${xpAmount} XP!`);
}

function toggleEquip(btn, event) {
    const isEquipped = btn.classList.toggle("equipped");
    if (isEquipped) {
        gainXP(25, event, "EQUIPPED +25 XP");
    } else {
        playChime(392);
        spawnFloater(event, "UNEQUIPPED");
    }
}

function filterQuests(category, btn) {
    playChime(523.25);
    document.querySelectorAll(".tab-btn").forEach(b => b.classList.remove("active"));
    btn.classList.add("active");

    document.querySelectorAll(".quest-card").forEach(card => {
        if (category === "all" || card.dataset.category === category) {
            card.style.display = "flex";
        } else {
            card.style.display = "none";
        }
    });
}

function copyPhone(event) {
    if (navigator.clipboard) {
        navigator.clipboard.writeText("+91 7007827450");
    }
    gainXP(30, event, "NUMBER COPIED +30 XP");
}

function toggleResumeMode(showATS) {
    const gameView = document.getElementById("game-view");
    const atsView = document.getElementById("ats-view");
    if (showATS) {
        gameView.classList.add("hidden");
        atsView.classList.remove("hidden");
        window.scrollTo(0, 0);
    } else {
        atsView.classList.add("hidden");
        gameView.classList.remove("hidden");
        window.scrollTo(0, 0);
    }
}

document.getElementById("sound-toggle").addEventListener("click", function () {
    soundEnabled = !soundEnabled;
    this.textContent = soundEnabled ? "SFX: ON" : "SFX: OFF";
    if (soundEnabled) playChime(783.99);
});

updateHUD();
