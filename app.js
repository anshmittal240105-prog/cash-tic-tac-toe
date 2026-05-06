const boardEl = document.querySelector("#board");
const boardWrap = document.querySelector(".board-wrap");
const menuPanel = document.querySelector("#menuPanel");
const modeLabel = document.querySelector("#modeLabel");
const statusText = document.querySelector("#statusText");
const matchDetails = document.querySelector("#matchDetails");
const walletBalance = document.querySelector("#walletBalance");
const playerPhone = document.querySelector("#playerPhone");
const subscriptionBadge = document.querySelector("#subscriptionBadge");
const homeAvatar = document.querySelector("#homeAvatar");
const homePlayerName = document.querySelector("#homePlayerName");
const homePlayerMeta = document.querySelector("#homePlayerMeta");
const homeTotalGames = document.querySelector("#homeTotalGames");
const homeGamesWon = document.querySelector("#homeGamesWon");
const homeGamesLost = document.querySelector("#homeGamesLost");
const homeMoneyWon = document.querySelector("#homeMoneyWon");
const homeWalletChip = document.querySelector("#homeWalletChip");
const otpInput = document.querySelector("#otpInput");
const verifyOtpButton = document.querySelector("#verifyOtpButton");
const otpStatusText = document.querySelector("#otpStatusText");
const modal = document.querySelector("#modal");
const modalTitle = document.querySelector("#modalTitle");
const modalText = document.querySelector("#modalText");
const modalActions = document.querySelector("#modalActions");
const backButton = document.querySelector("#backButton");
const telegramLoginCard = document.querySelector("#telegramLoginCard");
const telegramUserName = document.querySelector("#telegramUserName");

const WALLET_SHEET_ENDPOINT = "https://script.google.com/macros/s/AKfycby3Kmgy49kIFJiCfiB8Z0SAeunqeHaLd5fynvL3W3zC6p-k0qHWCIW6Kcp2XR_PuG_BOg/exec";
const WALLET_SYNC_INTERVAL_MS = 15000;
const AI_DIRECT_LINK_AD_URL = "https://omg10.com/4/10970664";
const AI_DIRECT_LINK_MIN_SECONDS = 15;
const firebaseConfig = {
  apiKey: "AIzaSyC8wJy6LJWtLKfsBiJY1T3uqSMzbXUp7pY",
  authDomain: "cash-tic-tac-toe-514a8.firebaseapp.com",
  projectId: "cash-tic-tac-toe-514a8",
  storageBucket: "cash-tic-tac-toe-514a8.firebasestorage.app",
  messagingSenderId: "323871057141",
  appId: "1:323871057141:web:0e2ae14d4cd0e4bfb711bc",
  measurementId: "G-YZRKX2CWDW",
};
const firebaseApp = window.firebase?.apps?.length ? window.firebase.app() : window.firebase?.initializeApp(firebaseConfig);
const firebaseAuth = firebaseApp ? window.firebase.auth() : null;
const firebaseDb = firebaseApp ? window.firebase.firestore() : null;
const tgWebApp = window.Telegram?.WebApp || null;
const subscriptionPlans = {
  FREE: {
    name: "Free",
    price: 0,
    days: 0,
    aiMercyEvery: 30,
    referralReward: 10,
    platformFeePercent: 10,
    perks: ["Standard matchmaking access", "10% platform fee", "Rs 10 referral estimate"],
  },
  VIP: {
    name: "VIP",
    price: 99,
    days: 30,
    aiMercyEvery: 20,
    referralReward: 15,
    platformFeePercent: 8,
    perks: ["Priority arena access", "8% platform fee", "Rs 15 referral estimate", "VIP badge"],
  },
  PREMIUM: {
    name: "Premium",
    price: 249,
    days: 30,
    aiMercyEvery: 10,
    referralReward: 25,
    platformFeePercent: 5,
    perks: ["Premium arena access", "5% platform fee", "Rs 25 referral estimate", "Premium badge"],
  },
};
const avatarOptions = [
  "XO", "X1", "O2", "₹", "VIP", "99", "⚡", "★", "🔥", "💎", "🎯", "👑",
  "🧠", "🚀", "🕹", "🏆", "🎲", "✨", "🟢", "🔵", "🔴", "🟡", "🟣", "⚔",
];
const paidAmounts = [1, 2, 5, 10, 20, 50, 100, 200, 500, 1000];
const winLines = [
  [0, 1, 2],
  [3, 4, 5],
  [6, 7, 8],
  [0, 3, 6],
  [1, 4, 7],
  [2, 5, 8],
  [0, 4, 8],
  [2, 4, 6],
];

const state = {
  user: null,
  telegramUser: null,
  profile: { name: "", avatar: "XO", avatarImage: "" },
  subscription: { plan: "FREE", expiresAt: null, purchasedAt: null },
  stats: {
    totalGames: 0,
    wins: 0,
    losses: 0,
    draws: 0,
    aiGames: 0,
    realGames: 0,
    cashGames: 0,
    cashWins: 0,
    totalMoneyWon: 0,
    currentStreak: 0,
    bestStreak: 0,
  },
  wallet: 0,
  board: Array(9).fill(""),
  mode: "idle",
  turn: "X",
  locked: true,
  match: null,
  aiGames: 0,
  referrals: 0,
  walletRequests: [],
  appliedWalletApprovals: [],
  walletSyncTimer: null,
  walletSyncInFlight: false,
  otpConfirmation: null,
  otpPhone: "",
  currentRoute: "login",
  routeHistory: [],
  referralEvents: [],
  playerDrawChoice: null,
  opponentDrawChoice: null,
  aiAdHadFocusAway: false,
  aiAdGateTimer: null,
  aiAdGateActive: false,
  aiAdGateRequired: false,
  aiAdSecondsLeft: 0,
  aiAdStartedAt: null,
};

const routes = {
  home: () => showHome(false),
  ai: () => startAiMatch(false),
  real: () => showRealMenu(false),
  local: () => showLocalMenu(false),
  localCash: () => showCashAmounts(false),
  private: () => showPrivateMenu(false),
  joinRoom: () => showJoinRoom(false),
  createRoom: () => showCreateRoomMenu(false),
};

function initTelegramMiniApp() {
  if (!isTelegramMiniApp()) return;
  tgWebApp.ready();
  tgWebApp.expand();
  document.body.classList.add("telegram-mini-app");
  applyTelegramTheme();
  state.telegramUser = tgWebApp.initDataUnsafe?.user || null;
  if (state.telegramUser) {
    telegramLoginCard.classList.remove("hidden");
    telegramUserName.textContent = getTelegramDisplayName();
  }
  tgWebApp.BackButton?.onClick(goBack);
  syncTelegramBackButton();
}

function applyTelegramTheme() {
  const theme = tgWebApp?.themeParams || {};
  if (theme.bg_color) document.documentElement.style.setProperty("--bg", theme.bg_color);
  if (theme.text_color) document.documentElement.style.setProperty("--text", theme.text_color);
  if (theme.hint_color) document.documentElement.style.setProperty("--muted", theme.hint_color);
  if (theme.button_color) document.documentElement.style.setProperty("--mint", theme.button_color);
  if (theme.secondary_bg_color) document.documentElement.style.setProperty("--panel", theme.secondary_bg_color);
}

function syncTelegramBackButton() {
  if (!isTelegramMiniApp() || !tgWebApp?.BackButton) return;
  if (state.currentRoute === "login" || state.currentRoute === "home") {
    tgWebApp.BackButton.hide();
  } else {
    tgWebApp.BackButton.show();
  }
}

function getTelegramDisplayName() {
  const user = state.telegramUser;
  if (!user) return "Telegram Player";
  return [user.first_name, user.last_name].filter(Boolean).join(" ") || user.username || `Player ${user.id}`;
}

function isTelegramMiniApp() {
  return Boolean(tgWebApp?.initData);
}

function goToRoute(route, push = true) {
  if (push && state.currentRoute && state.currentRoute !== route) {
    state.routeHistory.push(state.currentRoute);
  }
  const render = routes[route];
  if (render) render();
}

function setRoute(route) {
  state.currentRoute = route;
  syncTelegramBackButton();
}

function goBack() {
  if (!modal.classList.contains("hidden")) {
    closeModal();
    return;
  }
  const previous = state.routeHistory.pop();
  if (previous && routes[previous]) {
    routes[previous]();
    return;
  }
  showHome();
}

function loadSession() {
  const saved = localStorage.getItem("cashTacToeUser");
  if (!saved) return;
  try {
    const user = JSON.parse(saved);
    if (!user.phone || !user.referralCode) return;
    state.user = user;
    state.profile = normalizeProfile(user.profile, user.phone);
    state.wallet = Number(user.wallet || 0);
    state.subscription = normalizeSubscription(user.subscription);
    state.stats = normalizeStats(user.stats);
    state.referrals = Number(user.referrals || 0);
    state.referralEvents = Array.isArray(user.referralEvents) ? user.referralEvents : [];
    state.walletRequests = Array.isArray(user.walletRequests) ? user.walletRequests : [];
    state.appliedWalletApprovals = Array.isArray(user.appliedWalletApprovals) ? user.appliedWalletApprovals : [];
    updateWallet();
    renderPlayer();
    startWalletAutoSync();
    syncWalletApprovals({ silent: true });
    showHome();
  } catch {
    localStorage.removeItem("cashTacToeUser");
  }
}

async function saveSession() {
  if (!state.user) return;
  state.user.profile = state.profile;
  state.user.wallet = state.wallet;
  state.user.subscription = state.subscription;
  state.user.stats = state.stats;
  state.user.referrals = state.referrals;
  state.user.referralEvents = state.referralEvents;
  state.user.walletRequests = state.walletRequests;
  state.user.appliedWalletApprovals = state.appliedWalletApprovals;
  localStorage.setItem("cashTacToeUser", JSON.stringify(state.user));
  saveUserToFirestore();
}

function formatRs(amount) {
  return `Rs ${Number(amount).toLocaleString("en-IN", { maximumFractionDigits: 2 })}`;
}

function updateWallet() {
  walletBalance.textContent = formatRs(state.wallet);
  homeWalletChip.textContent = formatRs(state.wallet);
  pulseElement(walletBalance.closest(".wallet"));
  saveSession();
  renderHomeProfile();
}

function renderPlayer() {
  playerPhone.textContent = state.user ? maskPhone(state.user.phone) : "-";
  const plan = getActivePlan();
  subscriptionBadge.textContent = plan.name;
  subscriptionBadge.className = `plan-${plan.name.toLowerCase()}`;
  renderHomeProfile();
}

function renderHomeProfile() {
  const phone = state.user?.phone || "";
  renderAvatar(homeAvatar);
  homePlayerName.textContent = state.profile.name || (phone ? `Player ${phone.slice(-4)}` : "Player");
  homePlayerMeta.textContent = `${getActivePlan().name} · ${phone ? maskPhone(phone) : "Tap for full profile"}`;
  homeTotalGames.textContent = state.stats.totalGames;
  homeGamesWon.textContent = state.stats.wins;
  homeGamesLost.textContent = state.stats.losses;
  homeMoneyWon.textContent = formatRs(state.stats.totalMoneyWon);
}

function normalizeProfile(profile = {}, phone = "") {
  return {
    name: profile.name || (phone ? `Player ${phone.slice(-4)}` : "Player"),
    avatar: profile.avatar || "XO",
    avatarImage: profile.avatarImage || "",
  };
}

function renderAvatar(element) {
  if (!element) return;
  element.innerHTML = "";
  element.style.backgroundImage = "";
  if (state.profile.avatarImage) {
    element.classList.add("has-image");
    element.style.backgroundImage = `url("${state.profile.avatarImage}")`;
    return;
  }
  element.classList.remove("has-image");
  element.textContent = state.profile.avatar || "XO";
}

function normalizeSubscription(subscription = {}) {
  const plan = subscriptionPlans[subscription.plan] ? subscription.plan : "FREE";
  const expiresAt = subscription.expiresAt || null;
  if (plan !== "FREE" && expiresAt && new Date(expiresAt).getTime() <= Date.now()) {
    return { plan: "FREE", expiresAt: null, purchasedAt: subscription.purchasedAt || null };
  }
  return { plan, expiresAt, purchasedAt: subscription.purchasedAt || null };
}

function getActivePlanKey() {
  state.subscription = normalizeSubscription(state.subscription);
  return state.subscription.plan || "FREE";
}

function getActivePlan() {
  return subscriptionPlans[getActivePlanKey()] || subscriptionPlans.FREE;
}

function getPlanExpiryText() {
  if (getActivePlanKey() === "FREE") return "No expiry";
  return new Date(state.subscription.expiresAt).toLocaleDateString("en-IN");
}

function normalizeStats(stats = {}) {
  return {
    totalGames: Number(stats.totalGames || 0),
    wins: Number(stats.wins || 0),
    losses: Number(stats.losses || 0),
    draws: Number(stats.draws || 0),
    aiGames: Number(stats.aiGames || 0),
    realGames: Number(stats.realGames || 0),
    cashGames: Number(stats.cashGames || 0),
    cashWins: Number(stats.cashWins || 0),
    totalMoneyWon: Number(stats.totalMoneyWon || 0),
    currentStreak: Number(stats.currentStreak || 0),
    bestStreak: Number(stats.bestStreak || 0),
  };
}

function recordGameResult(result) {
  const stats = state.stats;
  const isAi = state.mode === "ai";
  const isCash = state.match?.stake > 0;
  const playerWon = result.mark === "X";
  const playerLost = result.mark === "O";
  const draw = result.mark === "draw";

  stats.totalGames += 1;
  if (isAi) stats.aiGames += 1;
  if (!isAi) stats.realGames += 1;
  if (isCash) stats.cashGames += 1;
  if (playerWon) {
    stats.wins += 1;
    stats.totalMoneyWon += state.mode === "ai" ? 10 : Number(state.match?.payout || 0);
    stats.currentStreak += 1;
    stats.bestStreak = Math.max(stats.bestStreak, stats.currentStreak);
    if (isCash) stats.cashWins += 1;
  }
  if (playerLost) {
    stats.losses += 1;
    stats.currentStreak = 0;
  }
  if (draw) {
    stats.draws += 1;
    stats.currentStreak = 0;
  }
  saveSession();
}

function holdStake(amount) {
  if (state.wallet < amount) {
    showModal("Wallet balance low", `You need ${formatRs(amount)} to enter this cash match. Add money through Wallet and wait for manual approval.`, [
      ["Open Wallet", showWalletPage, "primary-button"],
      ["Cancel", closeModal, "ghost-button"],
    ]);
    return false;
  }
  state.wallet -= amount;
  updateWallet();
  return true;
}

function refundHeldStake() {
  if (!state.match?.stakeHeld) return;
  state.wallet += state.match.stakeHeld;
  state.match.stakeHeld = 0;
  updateWallet();
}

function makeRequestId() {
  return `CTT-${Date.now().toString(36).toUpperCase()}-${Math.random().toString(36).slice(2, 6).toUpperCase()}`;
}

function requestStatusClass(status) {
  return String(status || "PENDING").toLowerCase();
}

function setStatus(mode, text) {
  modeLabel.textContent = mode;
  statusText.textContent = text;
}

function renderBoard() {
  boardEl.innerHTML = "";
  state.board.forEach((mark, index) => {
    const cell = document.createElement("button");
    cell.className = `cell ${mark.toLowerCase()}`;
    cell.textContent = mark;
    cell.setAttribute("aria-label", `Cell ${index + 1}`);
    cell.addEventListener("click", () => playCell(index));
    boardEl.appendChild(cell);
  });
}

function clearResultAnimation() {
  boardEl.classList.remove("result-win", "result-loss", "result-draw");
  boardWrap.querySelector(".result-burst")?.remove();
}

function playResultAnimation(result) {
  clearResultAnimation();
  const playerResult = result.mark === "draw" ? "draw" : result.mark === "X" ? "win" : "loss";
  boardEl.classList.add(`result-${playerResult}`);
  const burst = document.createElement("div");
  burst.className = `result-burst ${playerResult}`;
  burst.textContent = playerResult === "win" ? "You Win" : playerResult === "loss" ? "You Lost" : "Draw";
  boardWrap.appendChild(burst);
  setTimeout(() => burst.remove(), 1200);
}

function flashCell(index) {
  const cell = boardEl.children[index];
  if (!cell) return;
  cell.classList.remove("flash");
  void cell.offsetWidth;
  cell.classList.add("flash");
}

function pulseElement(element) {
  if (!element) return;
  element.classList.remove("pulse");
  void element.offsetWidth;
  element.classList.add("pulse");
}

function setWinningCells(line = []) {
  [...boardEl.children].forEach((cell, index) => {
    cell.classList.toggle("win", line.includes(index));
  });
}

function winnerOf(board) {
  for (const line of winLines) {
    const [a, b, c] = line;
    if (board[a] && board[a] === board[b] && board[a] === board[c]) {
      return { mark: board[a], line };
    }
  }
  if (board.every(Boolean)) return { mark: "draw", line: [] };
  return null;
}

function resetBoard() {
  state.board = Array(9).fill("");
  state.turn = "X";
  state.locked = false;
  state.playerDrawChoice = null;
  state.opponentDrawChoice = null;
  renderBoard();
  setWinningCells();
  clearResultAnimation();
}

function startAiMatch(push = true) {
  if (state.aiAdGateRequired) {
    showAiAdRequiredModal();
    return;
  }
  if (push && state.currentRoute !== "ai") state.routeHistory.push(state.currentRoute);
  closeModal();
  document.body.classList.remove("home-active");
  setRoute("ai");
  state.mode = "ai";
  state.match = {
    title: "AI Challenge",
    stake: 0,
    opponent: "Algo Raja",
    payout: 10,
  };
  resetBoard();
  setStatus("Play With AI", "You are X. Beat the AI to win Rs 10.");
  renderDetails();
}

function startLocalMatch(type, amount = 0, push = true) {
  if (type === "cash" && !holdStake(amount)) return;
  if (push && state.currentRoute !== "game") state.routeHistory.push(state.currentRoute);
  setRoute("game");
  const feePercent = getActivePlan().platformFeePercent;
  state.mode = type === "cash" ? "local-cash" : "local-free";
  state.match = {
    title: type === "cash" ? "Local Cash Match" : "Local Free Match",
    stake: amount,
    opponent: randomOpponent(),
    payout: type === "cash" ? amount * 2 * ((100 - feePercent) / 100) : 0,
    house: type === "cash" ? amount * 2 * (feePercent / 100) : 0,
    feePercent: type === "cash" ? feePercent : 0,
    stakeHeld: type === "cash" ? amount : 0,
    roundOver: false,
  };
  state.locked = true;
  setStatus(state.match.title, `Searching for ${type === "cash" ? formatRs(amount) : "free"} player...`);
  renderDetails("Finding player with the exact same selection.");
  setTimeout(() => {
    resetBoard();
    setStatus(state.match.title, `${state.match.opponent} joined. You are X.`);
    renderDetails();
  }, 900);
}

function startPrivateMatch(type, amount = 0, code = makeRoomCode(), push = true) {
  if (type === "cash" && !holdStake(amount)) return;
  if (push && state.currentRoute !== "game") state.routeHistory.push(state.currentRoute);
  setRoute("game");
  const feePercent = getActivePlan().platformFeePercent;
  state.mode = type === "cash" ? "private-cash" : "private-free";
  state.match = {
    title: type === "cash" ? "Private Cash Room" : "Private Free Room",
    roomCode: code,
    stake: amount,
    opponent: "Private Guest",
    payout: type === "cash" ? amount * 2 * ((100 - feePercent) / 100) : 0,
    house: type === "cash" ? amount * 2 * (feePercent / 100) : 0,
    feePercent: type === "cash" ? feePercent : 0,
    stakeHeld: type === "cash" ? amount : 0,
    roundOver: false,
  };
  resetBoard();
  setStatus(state.match.title, `Room ${code} is ready. You are X.`);
  renderDetails();
}

function playCell(index) {
  if (state.locked || state.board[index]) return;
  state.board[index] = state.turn;
  renderBoard();
  flashCell(index);
  const result = winnerOf(state.board);
  if (result) {
    finishMatch(result);
    return;
  }
  if (state.mode === "ai") {
    state.locked = true;
    setStatus("Play With AI", "AI is thinking...");
    setTimeout(aiMove, 420);
    return;
  }
  state.turn = state.turn === "X" ? "O" : "X";
  setStatus(state.match.title, `${state.turn}'s turn.`);
}

function aiMove() {
  const index = chooseAiCell();
  if (index !== -1) state.board[index] = "O";
  renderBoard();
  flashCell(index);
  const result = winnerOf(state.board);
  if (result) {
    finishMatch(result);
    return;
  }
  state.locked = false;
  setStatus("Play With AI", "Your turn.");
}

function chooseAiCell() {
  const mustLose = isAiMercyRound();
  const ai = "O";
  const human = "X";
  if (!mustLose) {
    const win = findTacticalMove(ai);
    if (win !== -1) return win;
    const block = findTacticalMove(human);
    if (block !== -1) return block;
  }
  const preferred = mustLose ? [1, 3, 5, 7, 0, 2, 6, 8, 4] : [4, 0, 2, 6, 8, 1, 3, 5, 7];
  return preferred.find((i) => !state.board[i]) ?? -1;
}

function isAiMercyRound() {
  const every = getActivePlan().aiMercyEvery;
  return state.aiGames > 0 && state.aiGames % every === every - 1;
}

function findTacticalMove(mark) {
  for (const line of winLines) {
    const values = line.map((i) => state.board[i]);
    if (values.filter((v) => v === mark).length === 2 && values.includes("")) {
      return line[values.indexOf("")];
    }
  }
  return -1;
}

function finishMatch(result) {
  state.locked = true;
  setWinningCells(result.line);
  playResultAnimation(result);
  if (state.mode === "ai") {
    finishAi(result);
    return;
  }
  finishPlayerMatch(result);
}

function finishAi(result) {
  const mercyRound = isAiMercyRound();
  state.aiGames += 1;
  recordGameResult(result.mark === "X" || mercyRound ? { mark: "X" } : result);
  if (result.mark === "X" || mercyRound) {
    state.wallet += 10;
    updateWallet();
    setStatus("Play With AI", "You won Rs 10.");
    showModal("You won", "Rs 10 has been added to your simulated wallet.", [
      ["Play Again", startAiMatch, "primary-button"],
      ["Home", showHome, "ghost-button"],
    ]);
    return;
  }
  const reason = result.mark === "draw" ? "The match was drawn." : "The AI won.";
  setStatus("Play With AI", reason);
  if (hasAdFreeAi()) {
    showModal("Match over", reason, [
      ["Play Again", startAiMatch, "primary-button"],
      ["Home", showHome, "ghost-button"],
    ]);
    return;
  }
  state.aiAdGateRequired = true;
  showAiWatchAdModal(`${reason} Watch the ad to play again.`);
}

function hasAdFreeAi() {
  return ["VIP", "PREMIUM"].includes(getActivePlanKey());
}

function showAiWatchAdModal(message) {
  showModalHtml("Watch ad to continue", `
    <p>${escapeHtml(message)}</p>
    <div class="modal-actions inline-actions">
      <a class="primary-button link-button" id="aiWatchAdLink" href="${AI_DIRECT_LINK_AD_URL}" target="_blank" rel="noopener noreferrer">Watch Ad</a>
      <button class="ghost-button" id="aiAdHomeButton">Home</button>
    </div>
  `, []);
  document.querySelector("#aiWatchAdLink")?.addEventListener("click", beginAiDirectLinkAdGate);
  document.querySelector("#aiAdHomeButton")?.addEventListener("click", showHome);
}

function beginAiDirectLinkAdGate() {
  if (!state.aiAdGateActive) {
    state.aiAdHadFocusAway = false;
    showAiAdReturnGate(AI_DIRECT_LINK_MIN_SECONDS);
    return;
  }
  resumeAiAdGateCountdown();
}

function showAiAdReturnGate(secondsLeft) {
  if (state.aiAdGateTimer) clearInterval(state.aiAdGateTimer);
  state.aiAdGateActive = true;
  state.aiAdSecondsLeft = secondsLeft;
  renderAiAdReturnGate(secondsLeft);
  resumeAiAdGateCountdown();
}

function resumeAiAdGateCountdown() {
  if (!state.aiAdGateActive || state.aiAdGateTimer || state.aiAdSecondsLeft <= 0) return;
  state.aiAdStartedAt = Date.now();
  const startingSeconds = state.aiAdSecondsLeft;
  state.aiAdGateTimer = setInterval(() => {
    const elapsed = Math.floor((Date.now() - state.aiAdStartedAt) / 1000);
    const remaining = Math.max(0, startingSeconds - elapsed);
    state.aiAdSecondsLeft = remaining;
    renderAiAdReturnGate(remaining);
    if (remaining <= 0) {
      clearInterval(state.aiAdGateTimer);
      state.aiAdGateTimer = null;
      renderAiAdReturnGate(0);
    }
  }, 1000);
}

function renderAiAdReturnGate(secondsLeft) {
  if (!state.aiAdGateActive) return;
  if (secondsLeft > 0 || !state.aiAdHadFocusAway) {
    const seconds = Math.max(0, secondsLeft);
    if (state.aiAdHadFocusAway) {
      showModalHtml("Watch full ad to continue", `
        <p>You returned to the game. ${seconds} seconds are still left, so open the ad again to finish.</p>
        <div class="modal-actions inline-actions">
          <a class="primary-button link-button" id="aiWatchAdLink" href="${AI_DIRECT_LINK_AD_URL}" target="_blank" rel="noopener noreferrer">Open Ad Again (${seconds}s)</a>
          <button class="ghost-button" id="aiAdHomeButton">Home</button>
        </div>
      `, []);
      document.querySelector("#aiWatchAdLink")?.addEventListener("click", () => showAiAdReturnGate(state.aiAdSecondsLeft));
      document.querySelector("#aiAdHomeButton")?.addEventListener("click", showHome);
      return;
    }
    const message = `The ad opened in a new tab. Switch to it now. Continue unlocks in ${seconds} seconds after you return.`;
    showModal("Watch full ad to continue", message, [
      [`${seconds}s`, () => {}, "primary-button disabled-button"],
      ["Home", showHome, "ghost-button"],
    ]);
    return;
  }

  completeAiAdGate();
  showModal("Ad completed", "You can continue playing now.", [
    ["Play Again", startAiMatch, "primary-button"],
    ["Home", showHome, "ghost-button"],
  ]);
}

function showAiAdRequiredModal() {
  if (state.aiAdGateActive) {
    renderAiAdReturnGate(state.aiAdSecondsLeft);
    return;
  }
  showAiWatchAdModal("Complete the ad from your last AI match before starting another AI game.");
}

function stopAiAdGateTimer() {
  if (state.aiAdGateTimer) clearInterval(state.aiAdGateTimer);
  state.aiAdGateTimer = null;
  state.aiAdGateActive = false;
  state.aiAdSecondsLeft = 0;
  state.aiAdStartedAt = null;
}

function completeAiAdGate() {
  stopAiAdGateTimer();
  state.aiAdGateRequired = false;
}

function finishPlayerMatch(result) {
  state.match.roundOver = true;
  recordGameResult(result);
  if (result.mark === "draw") {
    setStatus(state.match.title, "Draw. Both players can leave or play again.");
    showDrawChoices();
    return;
  }

  const youWon = result.mark === "X";
  if (state.match.stake > 0 && youWon) state.wallet += state.match.payout;
  updateWallet();
  setStatus(state.match.title, youWon ? `You won ${formatRs(state.match.payout)}.` : "You lost the match.");
  renderDetails();
  showModal(youWon ? "You won" : "Match over", youWon ? `Winner gets 90%: ${formatRs(state.match.payout)}. House fee: ${formatRs(state.match.house)}.` : "The loser gets nothing in a cash match.", [
    ["Play Again", () => restartCurrentMatch(), "primary-button"],
    ["Home", showHome, "ghost-button"],
  ]);
}

function showDrawChoices() {
  showModal("Draw match", "Choose whether to leave or continue. This prototype simulates the other player's choice.", [
    ["Play Again", () => resolveDraw("again"), "primary-button"],
    ["Leave", () => resolveDraw("leave"), "ghost-button"],
  ]);
}

function resolveDraw(choice) {
  state.playerDrawChoice = choice;
  state.opponentDrawChoice = Math.random() > 0.35 ? choice : "leave";
  closeModal();
  if (state.playerDrawChoice === "again" && state.opponentDrawChoice === "again") {
    state.match.roundOver = false;
    restartCurrentMatch();
    setStatus(state.match.title, "Both players chose play again.");
    return;
  }
  refundHeldStake();
  setStatus(state.match.title, "Game ended. Bets returned after draw.");
  showModal("Bets returned", "At least one player left, so both players get their full stake back.", [
    ["Home", showHome, "primary-button"],
    ["New Match", showRealMenu, "ghost-button"],
  ]);
}

function restartCurrentMatch() {
  closeModal();
  if (state.match?.roundOver && state.match.stake > 0 && !holdStake(state.match.stake)) return;
  if (state.match) {
    state.match.stakeHeld = state.match.stake || 0;
    state.match.roundOver = false;
  }
  resetBoard();
  setStatus(state.match.title, "New round started. You are X.");
  renderDetails();
}

function renderDetails(note = "") {
  const match = state.match;
  if (!match) {
    matchDetails.textContent = "Select a mode to begin.";
    return;
  }
  const items = [
    ["Opponent", match.opponent],
    ["Stake", formatRs(match.stake || 0)],
    ["Winner Gets", formatRs(match.payout || 0)],
    ["Platform Fee", match.feePercent ? `${formatRs(match.house || 0)} (${match.feePercent}%)` : formatRs(match.house || 0)],
    ["Plan", getActivePlan().name],
  ];
  if (match.roomCode) items.unshift(["Room Code", match.roomCode]);
  matchDetails.innerHTML = `
    <div class="detail-grid">
      ${items.map(([label, value]) => `<div class="detail-pill"><span>${label}</span><strong>${value}</strong></div>`).join("")}
    </div>
    ${note ? `<p>${note}</p>` : ""}
  `;
}

function showHome(resetHistory = true) {
  closeModal();
  document.body.classList.remove("login-active");
  document.body.classList.add("home-active");
  syncWalletApprovals({ silent: true });
  setRoute("home");
  if (resetHistory) state.routeHistory = [];
  state.mode = "idle";
  state.match = null;
  state.locked = true;
  state.board = Array(9).fill("");
  renderBoard();
  setStatus("Choose a mode", "Ready when you are.");
  matchDetails.textContent = "Select a mode to begin.";
  menuPanel.innerHTML = "";
}

function showLoginScreen() {
  closeModal();
  document.body.classList.add("login-active");
  document.body.classList.remove("home-active");
  setRoute("login");
  state.routeHistory = [];
  state.mode = "idle";
  state.match = null;
  state.locked = true;
  state.board = Array(9).fill("");
  renderBoard();
  setStatus("Choose a mode", "Ready when you are.");
  matchDetails.textContent = "Select a mode to begin.";
  menuPanel.innerHTML = "";
  document.querySelector("#phoneInput").value = "";
  document.querySelector("#referralInput").value = "";
  if (otpInput) {
    otpInput.value = "";
    otpInput.classList.add("hidden");
  }
  verifyOtpButton?.classList.add("hidden");
  setOtpStatus("");
}

function setOtpStatus(message) {
  if (otpStatusText) otpStatusText.textContent = message || "";
}

function ensureRecaptchaVerifier() {
  if (!firebaseAuth) return null;
  if (window.cashTacToeRecaptchaVerifier) return window.cashTacToeRecaptchaVerifier;
  window.cashTacToeRecaptchaVerifier = new window.firebase.auth.RecaptchaVerifier("recaptcha-container", {
    size: "invisible",
  });
  return window.cashTacToeRecaptchaVerifier;
}

async function loginWithPhone() {
  const phone = document.querySelector("#phoneInput")?.value.replace(/\D/g, "");
  if (!phone || phone.length !== 10) {
    showModal("Phone number needed", "Enter a valid 10 digit phone number to continue.", [
      ["OK", closeModal, "primary-button"],
    ]);
    return;
  }
  if (!firebaseAuth) {
    showModal("Firebase not loaded", "Firebase login is not ready. Check your internet connection and try again.", [
      ["OK", closeModal, "primary-button"],
    ]);
    return;
  }
  try {
    setOtpStatus("Sending OTP...");
    const verifier = ensureRecaptchaVerifier();
    state.otpPhone = phone;
    state.otpConfirmation = await firebaseAuth.signInWithPhoneNumber(`+91${phone}`, verifier);
    otpInput?.classList.remove("hidden");
    verifyOtpButton?.classList.remove("hidden");
    setOtpStatus("OTP sent. Enter the code to verify.");
  } catch (error) {
    setOtpStatus("");
    window.cashTacToeRecaptchaVerifier?.clear?.();
    window.cashTacToeRecaptchaVerifier = null;
    showModal("OTP failed", getFirebaseAuthMessage(error), [
      ["OK", closeModal, "primary-button"],
    ]);
  }
}

async function verifyPhoneOtp() {
  const otp = otpInput?.value.replace(/\D/g, "");
  const invitedBy = document.querySelector("#referralInput")?.value.trim().toUpperCase();
  if (!state.otpConfirmation || !state.otpPhone) {
    showModal("OTP needed", "Send OTP first, then enter the verification code.", [
      ["OK", closeModal, "primary-button"],
    ]);
    return;
  }
  if (!otp || otp.length < 6) {
    showModal("OTP needed", "Enter the 6 digit OTP.", [
      ["OK", closeModal, "primary-button"],
    ]);
    return;
  }
  try {
    setOtpStatus("Verifying OTP...");
    const credential = await state.otpConfirmation.confirm(otp);
    await completeFirebaseLogin(credential.user, invitedBy);
    setOtpStatus("");
  } catch (error) {
    setOtpStatus("");
    showModal("Wrong OTP", getFirebaseAuthMessage(error), [
      ["Try Again", closeModal, "primary-button"],
    ]);
  }
}

async function completeFirebaseLogin(firebaseUser, invitedBy = "") {
  const phone = String(firebaseUser.phoneNumber || "").replace("+91", "").replace(/\D/g, "").slice(-10);
  const savedUser = await loadUserFromFirestore(firebaseUser.uid);
  state.user = savedUser || {
    uid: firebaseUser.uid,
    phone,
    phoneNumber: firebaseUser.phoneNumber,
    invitedBy,
    referralCode: makeReferralCode(phone),
    createdAt: new Date().toISOString(),
  };
  state.user.uid = firebaseUser.uid;
  state.user.phone = state.user.phone || phone;
  state.user.phoneNumber = firebaseUser.phoneNumber;
  state.profile = normalizeProfile(state.user.profile, state.user.phone);
  state.wallet = Number(state.user.wallet || 0);
  state.subscription = normalizeSubscription(state.user.subscription);
  state.stats = normalizeStats(state.user.stats);
  state.referrals = Number(state.user.referrals || 0);
  state.referralEvents = Array.isArray(state.user.referralEvents) ? state.user.referralEvents : [];
  state.walletRequests = Array.isArray(state.user.walletRequests) ? state.user.walletRequests : [];
  state.appliedWalletApprovals = Array.isArray(state.user.appliedWalletApprovals) ? state.user.appliedWalletApprovals : [];
  state.otpConfirmation = null;
  state.otpPhone = "";
  updateWallet();
  renderPlayer();
  saveSession();
  startWalletAutoSync();
  syncWalletApprovals({ silent: true });
  showHome();
}

async function loadUserFromFirestore(uid) {
  if (!firebaseDb || !uid) return null;
  try {
    const doc = await firebaseDb.collection("users").doc(uid).get();
    return doc.exists ? doc.data() : null;
  } catch {
    return null;
  }
}

function saveUserToFirestore() {
  if (!firebaseDb || !state.user?.uid) return;
  firebaseDb.collection("users").doc(state.user.uid).set(state.user, { merge: true }).catch(() => {});
}

async function logoutUser() {
  await saveSession();
  try {
    await firebaseAuth?.signOut();
  } catch {
    // Local logout should still work if Firebase sign-out fails.
  }
  localStorage.removeItem("cashTacToeUser");
  state.user = null;
  state.profile = { name: "", avatar: "XO", avatarImage: "" };
  state.subscription = { plan: "FREE", expiresAt: null, purchasedAt: null };
  state.stats = normalizeStats();
  state.wallet = 0;
  state.referrals = 0;
  state.referralEvents = [];
  state.walletRequests = [];
  state.appliedWalletApprovals = [];
  state.otpConfirmation = null;
  state.otpPhone = "";
  if (state.walletSyncTimer) clearInterval(state.walletSyncTimer);
  state.walletSyncTimer = null;
  completeAiAdGate();
  updateWallet();
  renderPlayer();
  showLoginScreen();
}

function getFirebaseAuthMessage(error) {
  const code = error?.code || "";
  if (code.includes("invalid-verification-code")) return "The OTP is incorrect. Please check and try again.";
  if (code.includes("too-many-requests")) return "Too many OTP attempts. Wait some time and try again.";
  if (code.includes("quota-exceeded")) return "Firebase SMS quota is finished for today.";
  if (code.includes("unauthorized-domain")) return "Add this website domain in Firebase Authentication settings.";
  return error?.message || "Firebase could not complete phone login right now.";
}

function loginWithTelegram() {
  if (!state.telegramUser) return;
  const telegramId = String(state.telegramUser.id);
  const phoneLikeId = telegramId.slice(-10).padStart(10, "0");
  const invitedBy = document.querySelector("#referralInput")?.value.trim().toUpperCase();
  state.user = {
    phone: phoneLikeId,
    telegramId,
    telegramUsername: state.telegramUser.username || "",
    invitedBy,
    referralCode: makeReferralCode(phoneLikeId),
  };
  state.profile = {
    ...normalizeProfile({}, phoneLikeId),
    name: getTelegramDisplayName(),
    avatar: "TG",
    avatarImage: "",
  };
  state.wallet = 0;
  state.stats = normalizeStats();
  state.referrals = 0;
  state.referralEvents = [];
  state.walletRequests = [];
  state.appliedWalletApprovals = [];
  updateWallet();
  renderPlayer();
  saveSession();
  startWalletAutoSync();
  syncWalletApprovals({ silent: true });
  showHome();
}

function showAiMenu(push = true) {
  if (push) goToRoute("ai");
}

function renderAiMenu() {
  document.body.classList.remove("home-active");
  setRoute("ai");
  menuPanel.innerHTML = `
    <h2 class="panel-title">AI Rules</h2>
    <div class="option-list">
      <button class="option-button" data-action="start-ai">
        <strong>Start AI Match</strong>
        <small>Win Rs 10 when you beat the AI.</small>
      </button>
    </div>
  `;
}

function showRealMenu(push = true) {
  if (push) {
    goToRoute("real");
    return;
  }
  closeModal();
  document.body.classList.remove("home-active");
  setRoute("real");
  menuPanel.innerHTML = `
    <h2 class="panel-title">Real Player</h2>
    <div class="option-list">
      <button class="option-button" data-action="private-menu">
        <strong>Private</strong>
        <small>Create or join using a room code.</small>
      </button>
      <button class="option-button" data-action="local-menu">
        <strong>Local</strong>
        <small>Match with another player choosing the same type.</small>
      </button>
    </div>
  `;
}

function showLocalMenu(push = true) {
  if (push) {
    goToRoute("local");
    return;
  }
  setRoute("local");
  menuPanel.innerHTML = `
    <h2 class="panel-title">Local Match</h2>
    <div class="option-list">
      <button class="option-button" data-action="local-free">
        <strong>Free</strong>
        <small>Find another local free player.</small>
      </button>
      <button class="option-button" data-action="local-cash-menu">
        <strong>Cash</strong>
        <small>Find someone with the exact same bet amount.</small>
      </button>
    </div>
  `;
}

function showCashAmounts(push = true) {
  if (push) {
    goToRoute("localCash");
    return;
  }
  setRoute("localCash");
  menuPanel.innerHTML = `
    <h2 class="panel-title">Choose Bet</h2>
    <div class="amount-grid">
      ${paidAmounts.map((amount) => `<button class="amount-button" data-cash="${amount}">${formatRs(amount)}</button>`).join("")}
    </div>
  `;
}

function showPrivateMenu(push = true) {
  if (push) {
    goToRoute("private");
    return;
  }
  setRoute("private");
  menuPanel.innerHTML = `
    <h2 class="panel-title">Private Room</h2>
    <div class="option-list">
      <button class="option-button" data-action="join-room">
        <strong>Join Room</strong>
        <small>Enter an existing room code.</small>
      </button>
      <button class="option-button" data-action="create-room-menu">
        <strong>Create Room</strong>
        <small>Create a free or cash room.</small>
      </button>
    </div>
  `;
}

function showJoinRoom(push = true) {
  if (push) {
    goToRoute("joinRoom");
    return;
  }
  setRoute("joinRoom");
  menuPanel.innerHTML = `
    <h2 class="panel-title">Join Room</h2>
    <div class="input-row">
      <input id="roomCodeInput" placeholder="Room code" maxlength="8" />
      <button class="primary-button" data-action="confirm-join">Join</button>
    </div>
  `;
}

function showCreateRoomMenu(push = true) {
  if (push) {
    goToRoute("createRoom");
    return;
  }
  setRoute("createRoom");
  menuPanel.innerHTML = `
    <h2 class="panel-title">Create Room</h2>
    <div class="option-list">
      <button class="option-button" data-action="private-free">
        <strong>Free</strong>
        <small>Get a room code and wait for player two.</small>
      </button>
      <div class="input-row">
        <input id="privateAmountInput" type="number" min="1" placeholder="Any cash amount" />
        <button class="primary-button" data-action="private-cash">Create Cash Room</button>
      </div>
    </div>
  `;
}

function confirmCash(amount) {
  const feePercent = getActivePlan().platformFeePercent;
  showModal("Confirm cash match", `You are betting ${formatRs(amount)}. Winner gets ${formatRs(amount * 2 * ((100 - feePercent) / 100))} and platform fee is ${formatRs(amount * 2 * (feePercent / 100))} (${feePercent}%).`, [
    ["Confirm", () => {
      closeModal();
      startLocalMatch("cash", amount);
    }, "primary-button"],
    ["Cancel", closeModal, "ghost-button"],
  ]);
}

function showModal(title, text, actions) {
  modalTitle.textContent = title;
  modalText.textContent = text;
  modalActions.innerHTML = "";
  actions.forEach(([label, fn, className]) => modalActions.append(makeAction(label, fn, className)));
  modal.classList.remove("hidden");
}

function showModalHtml(title, html, actions) {
  modalTitle.textContent = title;
  modalText.innerHTML = html;
  modalActions.innerHTML = "";
  actions.forEach(([label, fn, className]) => modalActions.append(makeAction(label, fn, className)));
  modal.classList.remove("hidden");
}

function makeAction(label, fn, className) {
  const button = document.createElement("button");
  button.className = className;
  button.textContent = label;
  if (className.includes("disabled-button")) button.disabled = true;
  button.addEventListener("click", fn);
  return button;
}

function closeModal() {
  modal.classList.add("hidden");
}

function escapeHtml(value) {
  return String(value)
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;");
}

function makeRoomCode() {
  return Math.random().toString(36).slice(2, 8).toUpperCase();
}

function makeReferralCode(phone) {
  return `CTT${phone.slice(-4)}${Math.random().toString(36).slice(2, 5).toUpperCase()}`;
}

function maskPhone(phone) {
  return `******${phone.slice(-4)}`;
}

function copyReferralCode() {
  const code = state.user?.referralCode;
  if (!code) return;
  copyText(code, "Referral code copied");
}

function copyText(text, successTitle) {
  navigator.clipboard?.writeText(text).then(() => {
    showModal(successTitle, text, [
      ["OK", closeModal, "primary-button"],
    ]);
  }).catch(() => {
    showModal(successTitle, text, [
      ["OK", closeModal, "primary-button"],
    ]);
  });
}

function showReferralPage() {
  const code = state.user?.referralCode || "-";
  const joined = `${state.referrals} player${state.referrals === 1 ? "" : "s"} joined`;
  const rewardPerReferral = getActivePlan().referralReward;
  const estimatedRewards = state.referrals * rewardPerReferral;
  const invitedBy = state.user?.invitedBy || "Direct login";
  const shareText = `Join Cash Tac Toe with my referral code ${code}`;
  const activity = state.referralEvents.length
    ? state.referralEvents.slice().reverse().map((event) => `
      <div class="request-row">
        <div>
          <strong>${escapeHtml(event.title)}</strong>
          <small>${escapeHtml(event.time)}</small>
        </div>
        <span class="status-chip approved">${escapeHtml(event.status)}</span>
      </div>
    `).join("")
    : `<div class="request-row"><div><strong>No referral joins yet</strong><small>Your referred players will appear here.</small></div></div>`;

  showModalHtml("Referral Dashboard", `
    <div class="referral-dashboard">
      <div class="referral-hero">
        <span>Your Referral Code</span>
        <strong>${escapeHtml(code)}</strong>
        <small>${escapeHtml(shareText)}</small>
      </div>
      <div class="referral-stats">
        <div class="wallet-panel"><span>Total Joined</span><strong>${escapeHtml(joined)}</strong></div>
        <div class="wallet-panel"><span>Estimated Rewards</span><strong>${formatRs(estimatedRewards)}</strong></div>
        <div class="wallet-panel"><span>Reward Per Join</span><strong>${formatRs(rewardPerReferral)}</strong></div>
        <div class="wallet-panel"><span>You Joined By</span><strong>${escapeHtml(invitedBy)}</strong></div>
      </div>
      <div class="wallet-panel referral-share">
        <span>Share Message</span>
        <strong>${escapeHtml(shareText)}</strong>
      </div>
      <div class="wallet-history">${activity}</div>
    </div>
  `, [
    ["Copy Code", copyReferralCode, "primary-button"],
    ["Copy Message", () => copyText(shareText, "Referral message copied"), "ghost-button"],
    ["Add Referred Player", simulateReferral, "ghost-button"],
    ["Close", closeModal, "ghost-button"],
  ]);
}

function showWalletPage() {
  syncWalletApprovals({ silent: true });
  const pending = state.walletRequests.filter((request) => request.status === "PENDING").length;
  const history = state.walletRequests.length
    ? state.walletRequests.slice().reverse().map((request) => `
      <div class="request-row">
        <div>
          <strong>${escapeHtml(request.type)} ${formatRs(request.amount)}</strong>
          <small>${escapeHtml(request.id)} · ${escapeHtml(request.createdAt)}</small>
        </div>
        <span class="status-chip ${requestStatusClass(request.status)}">${escapeHtml(request.status)}</span>
      </div>
    `).join("")
    : `<div class="request-row"><div><strong>No wallet requests yet</strong><small>Deposit and withdrawal requests will appear here.</small></div></div>`;

  showModalHtml("Wallet", `
    <div class="wallet-summary">
      <div class="wallet-panel"><span>Available Balance</span><strong>${formatRs(state.wallet)}</strong></div>
      <div class="wallet-panel"><span>Pending Manual Requests</span><strong>${pending}</strong></div>
    </div>
    <div class="wallet-history">${history}</div>
  `, [
    ["Deposit", showDepositForm, "primary-button"],
    ["Withdraw", showWithdrawalForm, "ghost-button"],
    ["Close", closeModal, "ghost-button"],
  ]);
}

function showSubscriptionPage() {
  const activeKey = getActivePlanKey();
  const active = getActivePlan();
  const cards = Object.entries(subscriptionPlans).map(([key, plan]) => {
    const isActive = key === activeKey;
    const perks = plan.perks.map((perk) => `<li>${escapeHtml(perk)}</li>`).join("");
    const price = plan.price ? `${formatRs(plan.price)} / ${plan.days} days` : "Free forever";
    return `
      <div class="plan-card ${isActive ? "active" : ""}">
        <div>
          <span>${isActive ? "Current Plan" : "Plan"}</span>
          <strong>${escapeHtml(plan.name)}</strong>
          <small>${escapeHtml(price)}</small>
        </div>
        <ul>${perks}</ul>
        ${key === "FREE"
          ? `<button class="ghost-button" data-plan="${key}" disabled>Default</button>`
          : `<button class="${isActive ? "ghost-button" : "primary-button"}" data-plan="${key}">${isActive ? "Extend Plan" : "Buy Plan"}</button>`}
      </div>
    `;
  }).join("");

  showModalHtml("Subscription", `
    <div class="subscription-dashboard">
      <div class="referral-hero subscription-hero">
        <span>Active Plan</span>
        <strong>${escapeHtml(active.name)}</strong>
        <small>Expires: ${escapeHtml(getPlanExpiryText())}</small>
      </div>
      <div class="wallet-summary">
        <div class="wallet-panel"><span>Wallet Balance</span><strong>${formatRs(state.wallet)}</strong></div>
        <div class="wallet-panel"><span>Arena Access</span><strong>${escapeHtml(active.name)}</strong></div>
        <div class="wallet-panel"><span>Cash Fee</span><strong>${active.platformFeePercent}%</strong></div>
        <div class="wallet-panel"><span>Referral Reward</span><strong>${formatRs(active.referralReward)}</strong></div>
      </div>
      <div class="plan-grid">${cards}</div>
    </div>
  `, [
    ["Open Wallet", showWalletPage, "ghost-button"],
    ["Close", closeModal, "ghost-button"],
  ]);
}

function showProfilePage() {
  const plan = getActivePlan();
  const stats = state.stats;
  const winRate = stats.totalGames ? Math.round((stats.wins / stats.totalGames) * 100) : 0;
  const profileRows = [
    ["Phone Number", state.user ? maskPhone(state.user.phone) : "-"],
    ["Active Plan", plan.name],
    ["Plan Expiry", getPlanExpiryText()],
    ["Wallet Balance", formatRs(state.wallet)],
    ["Referral Code", state.user?.referralCode || "-"],
    ["Joined By", state.user?.invitedBy || "Direct login"],
  ];
  const banners = [
    ["Total Games", stats.totalGames],
    ["Games Won", stats.wins],
    ["Games Lost", stats.losses],
    ["Games Drawn", stats.draws],
    ["Win Rate", `${winRate}%`],
    ["Current Streak", stats.currentStreak],
    ["Best Streak", stats.bestStreak],
    ["AI Games", stats.aiGames],
    ["Real Games", stats.realGames],
    ["Cash Games", stats.cashGames],
    ["Cash Wins", stats.cashWins],
    ["Total Money Won", formatRs(stats.totalMoneyWon)],
    ["Referrals", state.referrals],
  ];

  showModalHtml("My Profile", `
    <div class="profile-dashboard">
      <div class="profile-top">
        <div class="profile-avatar" id="profileAvatarPreview"></div>
        <div>
          <span>Player Account</span>
          <strong>${escapeHtml(state.profile.name || "Player")}</strong>
          <small>${escapeHtml(plan.name)} player · ${escapeHtml(getPlanExpiryText())}</small>
        </div>
      </div>
      <div class="profile-info-grid">
        ${profileRows.map(([label, value]) => `
          <div class="wallet-panel">
            <span>${escapeHtml(label)}</span>
            <strong>${escapeHtml(value)}</strong>
          </div>
        `).join("")}
      </div>
      <div class="profile-banner-grid">
        ${banners.map(([label, value]) => `
          <div class="profile-banner">
            <span>${escapeHtml(label)}</span>
            <strong>${escapeHtml(value)}</strong>
          </div>
        `).join("")}
      </div>
    </div>
  `, [
    ["Edit Profile", showEditProfilePage, "primary-button"],
    ["Wallet", showWalletPage, "primary-button"],
    ["Subscription", showSubscriptionPage, "ghost-button"],
    ["Referral", showReferralPage, "ghost-button"],
    ["Logout", logoutUser, "ghost-button"],
    ["Close", closeModal, "ghost-button"],
  ]);
  renderAvatar(document.querySelector("#profileAvatarPreview"));
}

function showEditProfilePage() {
  const avatars = avatarOptions.map((avatar) => `
    <button class="avatar-choice ${!state.profile.avatarImage && state.profile.avatar === avatar ? "active" : ""}" data-avatar="${escapeHtml(avatar)}">${escapeHtml(avatar)}</button>
  `).join("");

  showModalHtml("Edit Profile", `
    <div class="edit-profile">
      <div class="profile-top compact-profile">
        <div class="profile-avatar" id="editAvatarPreview"></div>
        <div>
          <span>Profile Preview</span>
          <strong>${escapeHtml(state.profile.name || "Player")}</strong>
          <small>Choose an avatar, upload an image, or change your name.</small>
        </div>
      </div>
      <div class="input-row">
        <input id="profileNameInput" maxlength="24" placeholder="Display name" value="${escapeHtml(state.profile.name || "")}" />
        <input id="profileImageInput" type="file" accept="image/*" />
      </div>
      <div class="avatar-grid">${avatars}</div>
    </div>
  `, [
    ["Save Profile", saveProfileEdits, "primary-button"],
    ["Remove Image", removeProfileImage, "ghost-button"],
    ["Back", showProfilePage, "ghost-button"],
    ["Close", closeModal, "ghost-button"],
  ]);
  renderAvatar(document.querySelector("#editAvatarPreview"));
  document.querySelector("#profileImageInput")?.addEventListener("change", handleProfileImageUpload);
}

function buySubscription(planKey) {
  const plan = subscriptionPlans[planKey];
  if (!plan || planKey === "FREE") return;
  if (state.wallet < plan.price) {
    showModal("Wallet balance low", `You need ${formatRs(plan.price)} to buy ${plan.name}. Add money to wallet first.`, [
      ["Open Wallet", showWalletPage, "primary-button"],
      ["Back", showSubscriptionPage, "ghost-button"],
    ]);
    return;
  }
  const baseTime = state.subscription.plan === planKey && state.subscription.expiresAt
    ? Math.max(Date.now(), new Date(state.subscription.expiresAt).getTime())
    : Date.now();
  state.wallet -= plan.price;
  state.subscription = {
    plan: planKey,
    purchasedAt: new Date().toISOString(),
    expiresAt: new Date(baseTime + plan.days * 24 * 60 * 60 * 1000).toISOString(),
  };
  updateWallet();
  renderPlayer();
  saveSession();
  showModal(`${plan.name} activated`, `${plan.name} is active until ${getPlanExpiryText()}.`, [
    ["View Subscription", showSubscriptionPage, "primary-button"],
    ["Home", showHome, "ghost-button"],
  ]);
}

function selectAvatar(avatar) {
  const currentName = document.querySelector("#profileNameInput")?.value.trim();
  if (currentName) state.profile.name = currentName;
  state.profile.avatar = avatar;
  state.profile.avatarImage = "";
  saveSession();
  renderPlayer();
  showEditProfilePage();
}

function saveProfileEdits() {
  const name = document.querySelector("#profileNameInput")?.value.trim();
  state.profile.name = name || normalizeProfile({}, state.user?.phone || "").name;
  saveSession();
  renderPlayer();
  showProfilePage();
}

function removeProfileImage() {
  state.profile.avatarImage = "";
  saveSession();
  renderPlayer();
  showEditProfilePage();
}

function handleProfileImageUpload(event) {
  const file = event.target.files?.[0];
  if (!file) return;
  if (!file.type.startsWith("image/")) {
    showModal("Image needed", "Choose a valid image file for your profile avatar.", [
      ["Back", showEditProfilePage, "primary-button"],
    ]);
    return;
  }
  if (file.size > 800 * 1024) {
    showModal("Image too large", "Choose an image under 800 KB so the profile can save locally.", [
      ["Back", showEditProfilePage, "primary-button"],
    ]);
    return;
  }
  const reader = new FileReader();
  reader.addEventListener("load", () => {
    state.profile.avatarImage = String(reader.result || "");
    saveSession();
    renderPlayer();
    showEditProfilePage();
  });
  reader.readAsDataURL(file);
}

function showDepositForm() {
  showModalHtml("Deposit Request", `
    <div class="input-row">
      <input id="walletAmountInput" type="number" min="1" placeholder="Amount in Rs" />
      <input id="walletReferenceInput" maxlength="60" placeholder="Payment reference / UPI transaction ID" />
    </div>
  `, [
    ["Submit Request", () => submitWalletRequest("DEPOSIT"), "primary-button"],
    ["Back", showWalletPage, "ghost-button"],
  ]);
}

function showWithdrawalForm() {
  showModalHtml("Withdrawal Request", `
    <div class="input-row">
      <input id="walletAmountInput" type="number" min="1" placeholder="Amount in Rs" />
      <input id="walletReferenceInput" maxlength="60" placeholder="UPI ID / payout note" />
    </div>
  `, [
    ["Submit Request", () => submitWalletRequest("WITHDRAWAL"), "primary-button"],
    ["Back", showWalletPage, "ghost-button"],
  ]);
}

async function submitWalletRequest(type) {
  const amount = Number(document.querySelector("#walletAmountInput")?.value);
  const reference = document.querySelector("#walletReferenceInput")?.value.trim();
  if (!amount || amount <= 0) {
    showModal("Amount needed", "Enter a valid wallet amount.", [["OK", type === "DEPOSIT" ? showDepositForm : showWithdrawalForm, "primary-button"]]);
    return;
  }
  if (type === "WITHDRAWAL" && amount > state.wallet) {
    showModal("Balance too low", "Withdrawal amount cannot be greater than your available wallet balance.", [["OK", showWithdrawalForm, "primary-button"]]);
    return;
  }
  const request = {
    id: makeRequestId(),
    type,
    phone: state.user.phone,
    maskedPhone: maskPhone(state.user.phone),
    amount,
    reference: reference || "Not provided",
    status: "PENDING",
    createdAt: new Date().toLocaleString("en-IN"),
  };
  state.walletRequests.push(request);
  saveSession();
  await sendWalletRequestToSheet(request);
  showModal(`${type === "DEPOSIT" ? "Deposit" : "Withdrawal"} pending`, "Your request has been sent for manual verification. Wallet balance changes only after approval.", [
    ["Wallet", showWalletPage, "primary-button"],
    ["Home", showHome, "ghost-button"],
  ]);
}

async function sendWalletRequestToSheet(request) {
  if (!WALLET_SHEET_ENDPOINT) return false;
  try {
    await fetch(WALLET_SHEET_ENDPOINT, {
      method: "POST",
      mode: "no-cors",
      headers: { "Content-Type": "text/plain;charset=utf-8" },
      body: JSON.stringify({
        action: "wallet_request",
        request,
      }),
    });
    return true;
  } catch {
    return false;
  }
}

function startWalletAutoSync() {
  if (state.walletSyncTimer || !state.user) return;
  state.walletSyncTimer = setInterval(() => {
    syncWalletApprovals({ silent: true });
  }, WALLET_SYNC_INTERVAL_MS);
}

async function syncWalletApprovals(options = {}) {
  const silent = Boolean(options.silent);
  if (!state.user || state.walletSyncInFlight) return;
  if (!WALLET_SHEET_ENDPOINT) {
    if (silent) return;
    showModal("Sheet endpoint missing", "Add your Google Apps Script web app URL in WALLET_SHEET_ENDPOINT inside app.js, then approvals can sync from Google Sheets.", [
      ["OK", showWalletPage, "primary-button"],
    ]);
    return;
  }
  try {
    state.walletSyncInFlight = true;
    const data = await loadWalletApprovalsJsonp();
    applyWalletApprovals(Array.isArray(data.requests) ? data.requests : []);
    if (!silent) showWalletPage();
  } catch {
    if (silent) return;
    showModal("Sync failed", "Could not sync approvals from Google Sheets right now.", [
      ["OK", showWalletPage, "primary-button"],
    ]);
  } finally {
    state.walletSyncInFlight = false;
  }
}

function loadWalletApprovalsJsonp() {
  return new Promise((resolve, reject) => {
    const callbackName = `walletApprovalCallback${Date.now()}`;
    const script = document.createElement("script");
    const timeout = setTimeout(() => {
      cleanup();
      reject(new Error("Wallet approval sync timed out"));
    }, 12000);

    window[callbackName] = (data) => {
      cleanup();
      resolve(data);
    };

    function cleanup() {
      clearTimeout(timeout);
      delete window[callbackName];
      script.remove();
    }

    script.onerror = () => {
      cleanup();
      reject(new Error("Wallet approval sync failed"));
    };
    script.src = `${WALLET_SHEET_ENDPOINT}?phone=${encodeURIComponent(state.user.phone)}&callback=${callbackName}`;
    document.body.appendChild(script);
  });
}

function applyWalletApprovals(requests) {
  requests.forEach((remote) => {
    const local = state.walletRequests.find((request) => request.id === remote.id);
    if (local) local.status = remote.status || local.status;
    if ((remote.status === "APPROVED") && !state.appliedWalletApprovals.includes(remote.id)) {
      if (remote.type === "DEPOSIT") state.wallet += Number(remote.amount || 0);
      if (remote.type === "WITHDRAWAL") state.wallet = Math.max(0, state.wallet - Number(remote.amount || 0));
      state.appliedWalletApprovals.push(remote.id);
    }
  });
  updateWallet();
  saveSession();
}

function simulateReferral() {
  if (!state.user) return;
  state.referrals += 1;
  state.referralEvents.push({
    title: `Referral player ${state.referrals}`,
    time: new Date().toLocaleString("en-IN"),
    status: "JOINED",
  });
  renderPlayer();
  saveSession();
  showReferralPage();
}

function randomOpponent() {
  const names = ["Aarav", "Meera", "Kabir", "Nisha", "Rehan", "Tara", "Dev", "Isha"];
  return names[Math.floor(Math.random() * names.length)];
}

document.addEventListener("click", (event) => {
  const action = event.target.closest("[data-action]")?.dataset.action;
  if (!action) return;
  if (action === "wallet-page") {
    event.preventDefault();
    event.stopPropagation();
  }
  if (action === "phone-login") loginWithPhone();
  if (action === "verify-otp") verifyPhoneOtp();
  if (action === "telegram-login") loginWithTelegram();
  if (action === "referral-page") showReferralPage();
  if (action === "wallet-page") showWalletPage();
  if (action === "subscription-page") showSubscriptionPage();
  if (action === "profile-page") showProfilePage();
  if (action === "copy-referral") copyReferralCode();
  if (action === "simulate-referral") simulateReferral();
  if (action === "ai-menu") startAiMatch();
  if (action === "real-menu") showRealMenu();
  if (action === "start-ai") startAiMatch();
  if (action === "private-menu") showPrivateMenu();
  if (action === "local-menu") showLocalMenu();
  if (action === "local-free") startLocalMatch("free");
  if (action === "local-cash-menu") showCashAmounts();
  if (action === "join-room") showJoinRoom();
  if (action === "create-room-menu") showCreateRoomMenu();
  if (action === "private-free") startPrivateMatch("free");
  if (action === "private-cash") {
    const amount = Number(document.querySelector("#privateAmountInput")?.value);
    if (amount > 0) startPrivateMatch("cash", amount);
  }
  if (action === "confirm-join") {
    const code = document.querySelector("#roomCodeInput")?.value.trim().toUpperCase();
    if (code) startPrivateMatch("free", 0, code);
  }
});

document.addEventListener("click", (event) => {
  const cash = event.target.closest("[data-cash]")?.dataset.cash;
  if (cash) confirmCash(Number(cash));
  const plan = event.target.closest("[data-plan]")?.dataset.plan;
  if (plan) buySubscription(plan);
  const avatar = event.target.closest("[data-avatar]")?.dataset.avatar;
  if (avatar) selectAvatar(avatar);
});

document.querySelector("#homeButton").addEventListener("click", showHome);
backButton.addEventListener("click", goBack);
document.querySelector("#resetButton").addEventListener("click", () => {
  if (state.match) restartCurrentMatch();
});

document.addEventListener("visibilitychange", () => {
  if (!document.hidden) syncWalletApprovals({ silent: true });
});

window.addEventListener("focus", () => {
  syncWalletApprovals({ silent: true });
  if (state.aiAdGateActive) {
    if (state.aiAdGateTimer) clearInterval(state.aiAdGateTimer);
    state.aiAdGateTimer = null;
    renderAiAdReturnGate(state.aiAdSecondsLeft);
  }
});

window.addEventListener("blur", () => {
  state.aiAdHadFocusAway = true;
  if (state.aiAdGateActive) resumeAiAdGateCountdown();
});

renderBoard();
updateWallet();
renderPlayer();
initTelegramMiniApp();
loadSession();
