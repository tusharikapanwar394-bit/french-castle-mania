const { cityDetails, questions } = window.FrenchCastleManiaData;
const leaderboardDatabaseUrl = window.FCMConfig?.leaderboardDatabaseUrl?.replace(/\/$/, '');

const app = document.querySelector('#app');
const STORAGE_KEY = 'french-castle-mania-progress';
const state = { screen: 'intro', currentQuestionIndex: 0, score: 0, correct: 0, incorrect: 0, startTime: null, elapsed: 0, answered: false, selected: null, feedback: null, sound: false, participantName: '', leaderboardStatus: '' };
let timerId;

const escapeHtml = (value) => String(value).replace(/[&<>'"]/g, (character) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', "'": '&#39;', '"': '&quot;' }[character]));
const currentQuestion = () => questions[state.currentQuestionIndex];
const currentCity = () => currentQuestion()?.city;
const formatTime = (seconds) => `${String(Math.floor(seconds / 60)).padStart(2, '0')}:${String(seconds % 60).padStart(2, '0')}`;
const save = () => { try { localStorage.setItem(STORAGE_KEY, JSON.stringify({ ...state, feedback: null, selected: null, answered: false })); } catch { /* storage is optional */ } };
const load = () => { try { const saved = JSON.parse(localStorage.getItem(STORAGE_KEY)); if (saved?.screen === 'quiz' && Number.isInteger(saved.currentQuestionIndex) && saved.currentQuestionIndex < questions.length) Object.assign(state, saved, { feedback: null, selected: null, answered: false }); } catch { /* continue without recovery */ } };
const cityProgress = (city) => questions.filter((item) => item.city === city).map((item) => questions.indexOf(item) < state.currentQuestionIndex);

function render() {
  if (state.screen === 'intro') renderIntro();
  else if (state.screen === 'map') renderMap();
  else if (state.screen === 'quiz') renderQuiz();
  else renderResults();
}

function renderIntro() {
  app.innerHTML = `<section class="intro scene-shell"><div class="stars"></div><div class="moon"></div><div class="intro-vignette"></div><div class="castle silhouette"><span class="tower tower-left"></span><span class="tower tower-right"></span><span class="keep"></span><span class="windows"></span></div><div class="intro-copy"><p class="eyebrow">Un voyage en quatre chapitres</p><h1>French<br /><em>Castle Mania</em></h1><p class="lede">Une aventure à travers la France</p><label class="name-field"><span>Votre nom</span><input id="participant-name" maxlength="24" placeholder="Entrez votre nom" value="${escapeHtml(state.participantName)}" /></label><button class="gold-button enter-button" data-action="enter">Entrer dans le château <span>↗</span></button></div><p class="intro-foot">20 énigmes <span>·</span> 4 villes <span>·</span> 1 trésor</p></section>`;
}

function renderMap(finale = false) {
  const activeIndex = finale ? 4 : cityDetails[currentCity()]?.order ?? 0;
  app.innerHTML = `<section class="map-screen scene-shell"><div class="map-noise"></div><header class="topbar"><div class="brand-mark">FCM <span>France, en jeu</span></div><button class="icon-button" data-action="toggle-sound" aria-label="Toggle sound">${state.sound ? '◉' : '◌'}</button></header><div class="map-heading"><p class="eyebrow">${finale ? 'Le voyage est complet' : 'La carte du voyage'}</p><h1>${finale ? 'Toute la France vous attend.' : 'Choisissez votre prochaine lumière.'}</h1></div><div class="france-map ${finale ? 'final-map' : ''}"><div class="map-outline"></div><div class="route route-one ${activeIndex > 0 ? 'lit' : ''}"></div><div class="route route-two ${activeIndex > 1 ? 'lit' : ''}"></div><div class="route route-three ${activeIndex > 2 ? 'lit' : ''}"></div>${Object.entries(cityDetails).map(([city, info]) => `<div class="map-marker marker-${info.accent} ${info.order <= activeIndex ? 'active' : 'locked'}"><span class="marker-dot"></span><strong>${city.toUpperCase()}</strong><small>${info.chapter}</small></div>`).join('')}</div>${finale ? '<div class="map-complete">✦ <span>Les quatre villes sont illuminées</span> ✦</div>' : `<div class="map-caption"><span class="seal-mini">${String((cityDetails[currentCity()]?.order ?? 0) + 1).padStart(2, '0')}</span><div><strong>${currentCity()}</strong><p>${cityDetails[currentCity()]?.subtitle}</p></div><button class="gold-button" data-action="start-city">Entrer <span>→</span></button></div>`}</section>`;
}

function sceneIcon(location) { const symbols = { cafe: '☕', postcard: '✦', 'family-portrait': '♢', 'treasure-chest': '▣', 'eiffel-tower': '♜', promenade: '◒', 'clock-tower': '◷', calendar: '▦', 'museum-door': '▥', 'birthday-chest': '✧', interior: '◇', 'lyon-cafe': '☕', 'portrait-gallery': '♢', library: '▤', 'family-room': '♧', diary: '✎', bakery: '⌁', 'castle-gate': '♜', 'culture-room': '✦', 'final-seal': '✥' }; return symbols[location.split('-').slice(1).join('-')] || '✦'; }

function renderQuiz() {
  const question = currentQuestion(); const info = cityDetails[question.city]; const cityQuestions = questions.filter((item) => item.city === question.city); const cityIndex = cityQuestions.findIndex((item) => item.id === question.id); const progress = cityProgress(question.city); const letter = ['A', 'B', 'C', 'D'];
  app.innerHTML = `<section class="quiz-screen scene-shell theme-${info.accent} location-${question.visualLocation}"><header class="topbar quiz-topbar"><div class="brand-mark">FRENCH <span>CASTLE MANIA</span></div><div class="timer"><span>TIME</span><strong id="timer">${formatTime(state.elapsed)}</strong></div><button class="icon-button" data-action="toggle-sound" aria-label="Toggle sound">${state.sound ? '◉' : '◌'}</button></header><div class="city-banner"><span class="chapter-number">0${info.order + 1}</span><div><p class="eyebrow">${info.chapter}</p><h2>${question.city}</h2></div><div class="city-progress">${progress.map((done, index) => `<i class="${done || index === cityIndex ? 'on' : ''}"></i>`).join('')}</div></div><div class="location-art"><div class="art-moon"></div><div class="art-architecture"></div><div class="art-object">${sceneIcon(question.visualLocation)}</div><p>${question.visualLocation.replaceAll('-', ' ')}</p></div><article class="question-panel"><div class="question-meta"><span>Énigme ${String(question.id).padStart(2, '0')}</span><span>Journey ${question.id} / 20</span></div><h1>${escapeHtml(question.question)}</h1><div class="answers">${question.options.map((option, index) => `<button class="answer ${state.selected === index ? 'selected' : ''} ${state.feedback && index === question.correctAnswer ? 'correct' : ''} ${state.feedback && state.selected === index && index !== question.correctAnswer ? 'wrong' : ''}" data-answer="${index}" ${state.answered ? 'disabled' : ''}><span>${letter[index]}</span>${escapeHtml(option)}</button>`).join('')}</div>${state.feedback ? `<div class="feedback ${state.feedback.kind}"><strong>${state.feedback.kind === 'correct' ? 'BRAVO !' : 'PRESQUE !'}</strong><span>${escapeHtml(state.feedback.message)}</span></div>` : ''}</article><footer class="quiz-footer"><span>${cityIndex + 1} / 5 dans ${question.city}</span><span class="score-pill">${state.score} pts</span></footer></section>`;
}

function renderResults() {
  app.innerHTML = `<section class="results-screen scene-shell"><div class="results-stars"></div><div class="result-seal">✥<span>FCM</span></div><p class="eyebrow">Le grand trésor est ouvert</p><h1>La France<br /><em>est à vous !</em></h1><p class="lede">Vous avez traversé la France.</p><div class="result-stats"><div><strong>${state.score}</strong><span>Score final</span></div><div><strong>${state.correct}<small> / 20</small></strong><span>Réponses justes</span></div><div><strong>${formatTime(state.elapsed)}</strong><span>Temps de voyage</span></div></div><div class="result-route"><span>Paris</span><i></i><span>Nice</span><i></i><span>Lyon</span><i></i><span>Bordeaux</span></div><div class="result-actions"><button class="gold-button" data-action="leaderboard">Voir le classement <span>↗</span></button><button class="quiet-button" data-action="restart">Recommencer</button></div><p class="result-note">${state.leaderboardStatus || 'VOTRE AVENTURE EST TERMINÉE'} <span>·</span> 4 / 4 villes explorées</p></section>`;
}

function renderLeaderboard(entries = []) {
  const body = entries.length ? entries.map((entry, index) => `<li><span class="rank">${String(index + 1).padStart(2, '0')}</span><strong>${escapeHtml(entry.name)}</strong><b>${entry.score} pts</b><small>${formatTime(entry.elapsed)}</small></li>`).join('') : '<li class="empty-rank">Aucun score publié pour le moment.</li>';
  app.innerHTML = `<section class="leaderboard-screen scene-shell"><header class="topbar"><div class="brand-mark">FCM <span>Le classement</span></div><button class="icon-button" data-action="back-results" aria-label="Back to results">×</button></header><div class="leaderboard-copy"><p class="eyebrow">Les aventuriers du château</p><h1>Qui connaît<br /><em>la France ?</em></h1><p>Classement par points, puis par temps le plus rapide.</p></div><ol class="leaderboard-list">${body}</ol><button class="gold-button" data-action="restart">Recommencer le voyage <span>↗</span></button><p class="leaderboard-note">${leaderboardDatabaseUrl ? 'Classement partagé en direct' : 'Classement partagé à configurer dans src/config.js'}</p></section>`;
}

async function fetchLeaderboard() {
  if (!leaderboardDatabaseUrl) { renderLeaderboard([]); return; }
  renderLeaderboard([]);
  document.querySelector('.leaderboard-list').innerHTML = '<li class="empty-rank">Chargement du classement…</li>';
  try {
    const response = await fetch(`${leaderboardDatabaseUrl}/leaderboard.json`);
    if (!response.ok) throw new Error('Leaderboard request failed');
    const data = await response.json();
    const entries = Object.values(data || {}).sort((a, b) => b.score - a.score || a.elapsed - b.elapsed || a.createdAt - b.createdAt).slice(0, 50);
    renderLeaderboard(entries);
  } catch { renderLeaderboard([]); document.querySelector('.leaderboard-note').textContent = 'Le classement est momentanément indisponible.'; }
}

async function submitScore() {
  if (!leaderboardDatabaseUrl || state.leaderboardStatus === 'Score envoyé') return;
  try {
    const response = await fetch(`${leaderboardDatabaseUrl}/leaderboard.json`, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ name: state.participantName || 'Voyageur', score: state.score, elapsed: state.elapsed, correct: state.correct, createdAt: Date.now() }) });
    if (!response.ok) throw new Error('Score submission failed');
    state.leaderboardStatus = 'Score envoyé'; save(); render();
  } catch { state.leaderboardStatus = 'Score non envoyé'; render(); }
}

function beginQuiz() { state.screen = 'quiz'; state.currentQuestionIndex = 0; state.startTime = Date.now(); state.elapsed = 0; state.score = 0; state.correct = 0; state.incorrect = 0; state.leaderboardStatus = ''; startTimer(); save(); render(); }
function startTimer() { clearInterval(timerId); timerId = setInterval(() => { if (state.screen === 'quiz' && state.startTime) { state.elapsed = Math.floor((Date.now() - state.startTime) / 1000); const timer = document.querySelector('#timer'); if (timer) timer.textContent = formatTime(state.elapsed); } }, 1000); }
function answer(index) { if (state.answered) return; const question = currentQuestion(); state.answered = true; state.selected = index; const isCorrect = index === question.correctAnswer; state.feedback = { kind: isCorrect ? 'correct' : 'wrong', message: isCorrect ? 'The seal recognizes your answer.' : `${question.explanation} The journey continues.` }; if (isCorrect) state.correct += 1, state.score += 100; else state.incorrect += 1, state.score -= 25; save(); render(); setTimeout(() => { state.currentQuestionIndex += 1; state.answered = false; state.selected = null; state.feedback = null; if (state.currentQuestionIndex >= questions.length) { state.screen = 'results'; clearInterval(timerId); save(); render(); submitScore(); } else if (questions[state.currentQuestionIndex].city !== question.city) { state.screen = 'map'; save(); render(); } else { save(); render(); } }, 1500); }

app.addEventListener('click', (event) => { const action = event.target.closest('[data-action]')?.dataset.action; if (action === 'enter') { state.participantName = document.querySelector('#participant-name')?.value.trim() || 'Voyageur'; save(); state.screen = 'map'; render(); } if (action === 'start-city') { if (!state.startTime) beginQuiz(); else { state.screen = 'quiz'; render(); } } if (action === 'leaderboard') fetchLeaderboard(); if (action === 'back-results') { state.screen = 'results'; render(); } if (action === 'restart') { localStorage.removeItem(STORAGE_KEY); Object.assign(state, { screen: 'intro', currentQuestionIndex: 0, score: 0, correct: 0, incorrect: 0, startTime: null, elapsed: 0, leaderboardStatus: '' }); render(); } if (action === 'toggle-sound') { state.sound = !state.sound; render(); } const answerButton = event.target.closest('[data-answer]'); if (answerButton) answer(Number(answerButton.dataset.answer)); });
load(); render(); if (state.screen === 'quiz') startTimer();
