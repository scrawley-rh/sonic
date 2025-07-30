// --- API BASED - NO LOCALSTORAGE/FIREBASE ---

// The base URL for your backend API. You will need to replace this
// with the actual URL provided by your OpenShift deployment.
const API_BASE_URL = 'https://sonic-backend.apps.shift.crawleyrocks.com '; // <-- IMPORTANT: CHANGE THIS AFTER DEPLOYMENT

// --- INITIALIZATION ---
let userData = null;
// We still use localStorage for the ID to remember the same user on the same browser
let userId = localStorage.getItem('sonicPlayerId'); 
if (!userId) {
    // Generate a simple unique ID for new players
    userId = `player_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    localStorage.setItem('sonicPlayerId', userId);
}


// --- GAME ASSETS & CONFIG ---
const avatars = [
    { id: 'sonic', name: 'Sonic', img: 'assets/images/sonic.png', cost: 0 },
    { id: 'tails', name: 'Tails', img: 'assets/images/tails.png', cost: 2 },
    { id: 'knuckles', name: 'Knuckles', img: 'assets/images/knuckles.png', cost: 4 },
    { id: 'amy', name: 'Amy', img: 'assets/images/amy.png', cost: 6 },
    { id: 'shadow', name: 'Shadow', img: 'assets/images/shadow.png', cost: 8 },
    { id: 'golden-sonic', name: 'Golden Sonic', img: 'assets/images/super-sonic.png', cost: 10 },
];

const levels = [
    // Level 1: Home Row Basics
    { words: ['a', 'add', 'ask', 'all', 'ad', 'as', 'dad', 'fad', 'fall', 'fast', 'gas', 'glad', 'had', 'has', 'jack', 'run', 'jump', 'fun', 'blue', 'shall'], speed: 1.5, goal: 5 },
    // Level 2: Home Row + E, I, R, U
    { words: ['are', 'air', 'ark', 'die', 'due', 'ear', 'era', 'fed', 'fire', 'fur', 'ire', 'jar', 'jug', 'lie', 'red', 'ride', 'rue', 'use', 'sea', 'sue'], speed: 1.7, goal: 8 },
    // Level 3: Home Row + Full Top Row
    { words: ['after', 'eight', 'elite', 'error', 'fort', 'greet', 'heart', 'erupt', 'party', 'power', 'quiet', 'quite', 'treat', 'water', 'were', 'where', 'their', 'there', 'tower', 'type'], speed: 2.0, goal: 10 },
    // Level 4: Home Row + Bottom Row
    { words: ['cab', 'can', 'cave', 'lava', 'van', 'vex', 'nab', 'man', 'madam', 'max', 'fava', 'flag', 'savage', 'black', 'knack', 'calm', 'slam', 'scam', 'land', 'sand'], speed: 2.2, goal: 12 },
    // Level 5: All rows, simple words
    { words: ['about', 'back', 'child', 'day', 'even', 'first', 'good', 'have', 'just', 'know', 'like', 'make', 'new', 'other', 'people', 'right', 'see', 'take', 'way', 'year'], speed: 2.5, goal: 15 },
    // Level 6: Longer words + words from L5
    { words: ['again', 'always', 'become', 'change', 'during', 'every', 'follow', 'great', 'house', 'large', 'light', 'mother', 'never', 'place', 'point', 'school', 'small', 'still', 'study', 'world'], speed: 2.7, goal: 15 },
    // Level 7: Common English words
    { words: ['another', 'because', 'between', 'country', 'different', 'example', 'family', 'speed', 'important', 'interest', 'national', 'number', 'problem', 'question', 'service', 'something', 'system', 'thought', 'through', 'without'], speed: 3.0, goal: 18 },
    // Level 8: Short Sonic-themed words
    { words: ['blue', 'chaos', 'dash', 'fast', 'gem', 'hero', 'jump', 'loop', 'master', 'power', 'race', 'ring', 'robot', 'run', 'save', 'sonic', 'spin', 'speed', 'tails', 'zone'], speed: 3.2, goal: 20 },
    // Level 9: Longer Sonic-themed words
    { words: ['adventure', 'badnik', 'chao', 'emerald', 'eggman', 'echnida', 'escape', 'gadget', 'guardian', 'hedgehog', 'knuckles', 'mobius', 'platform', 'robotnik', 'shadow', 'silver', 'supersonic', 'villain', 'wisps', 'whistle'], speed: 3.5, goal: 20 },
    // Level 10: Challenge Mix
    { words: ['acceleration', 'checkpoint', 'invincible', 'hydrocity', 'metropolis', 'mystical', 'brain', 'cyberspace', 'devastating', 'amazing', 'friendship', 'unstoppable', 'hyperspace', 'phenomenal', 'powerful', 'velocity', 'victorious', 'funny', 'yesterday', 'factory'], speed: 3.8, goal: 20 },
];

const sentences = [
    "Sonic the Hedgehog is the fastest thing alive.", "Sonic collects golden rings to stay safe.", "Tails is a two-tailed fox and Sonic's best friend.", "Knuckles the Echidna guards the Master Emerald.", "The seven Chaos Emeralds hold incredible power.", "Green Hill Zone is a beautiful and iconic location.", "Shadow the Hedgehog is the ultimate life form.", "Amy Rose chases Sonic with her Piko Piko Hammer.", "Silver the Hedgehog travels from the future.", "Blaze the Cat is a princess from another dimension.", "Sometimes Aunt Nicole dresses up like Sonic and runs around the yard.", "Cream the Rabbit is often accompanied by her Chao, Cheese.", "The Tornado is Sonic's trusty biplane.", "Chaos is a water creature and a powerful god.", "Robotnik often builds elaborate badniks.", "Super Sonic transforms with the Chaos Emeralds.", "The Death Egg is a massive space station.", "Speed is Sonic's greatest advantage.", "He always fights for justice and freedom.", "The Wisps are colorful alien creatures.", "Big the Cat loves fishing with his frog, Froggy.", "Rouge the Bat is a treasure hunter and spy.", "Vector the Crocodile leads the Chaotix Detective Agency.", "Espio the Chameleon is a master of stealth.", "Charmy Bee is the youngest member of the Chaotix.", "The G.U.N. organization often pursues Shadow.", "Sonic's spin dash is an iconic move.", "The Flickies are small birds often trapped in robots.", "Eggman's robots are called Badniks.", "Metal Sonic is a powerful robotic doppelganger.", "The Special Stages are where Chaos Emeralds are found.", "Sonic often runs through loops and corkscrews.", "He has saved the world countless times.", "The Boost ability gives Sonic incredible speed bursts.", "Sonic's adventures span across many different worlds.", "He believes in freedom and never gives up.", "The Time Stones can manipulate time itself.", "Sonic's friends always stand by him.", "The Blue Blur is a hero to many.", "He loves chili dogs more than anything.", "The Phantom Ruby creates illusions.", "Infinite is a powerful mercenary with a mask."
];

// --- DOM ELEMENTS ---
const mainMenu = document.getElementById('main-menu');
const gameScreen = document.getElementById('game-screen');
const avatarScreen = document.getElementById('avatar-screen');
const sentenceModeScreen = document.getElementById('sentence-mode-screen');
const leaderboardScreen = document.getElementById('leaderboard-screen');
const leaderboardBtn = document.getElementById('leaderboard-btn');
const playerStats = document.getElementById('player-stats');
const typingInput = document.getElementById('typing-input');
const wordContainer = document.getElementById('word-container');
const playerAvatar = document.getElementById('player-avatar');

// --- GAME STATE ---
let currentLevel = 0;
let score = 0;
let timeLeft = 60;
let gameInterval;
let wordFallInterval;
let activeWords = [];
let sessionWords = [];
let isGameRunning = false;

// --- DATA LOADING & UI FUNCTIONS ---
async function loadPlayerData() {
    try {
        const response = await fetch(`${API_BASE_URL}/api/player`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ id: userId })
        });
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        const data = await response.json();

        if (data) {
            userData = data;
            playerStats.classList.remove('hidden');
            showScreen('main-menu');
        } else {
            // New player, prompt for name.
            document.getElementById('name-modal').classList.remove('hidden');
            userData = {
                displayName: '',
                unlockedAvatars: ['sonic'],
                currentAvatar: 'sonic',
                emeralds: 0,
                highestLevel: 0,
                leaderboardStats: { avgWpm: 0, accuracy: 0, totalWords: 0, gamesPlayed: 0 }
            };
        }
        updateUI();
    } catch (error) {
        console.error('Failed to load player data:', error);
        showMessage('Connection Error', 'Could not connect to the game server. Please ensure the backend is running.');
    }
}

async function savePlayerData() {
    if (!userData) return;
    try {
        await fetch(`${API_BASE_URL}/api/save`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ id: userId, data: userData })
        });
    } catch (error) {
        console.error('Failed to save player data:', error);
    }
}

function updateUI() {
    if (!userData) return;
    document.getElementById('emeralds-count').textContent = userData.emeralds;
    document.getElementById('user-id-display').textContent = userData.displayName || 'Guest';
    const currentAvatarData = avatars.find(a => a.id === userData.currentAvatar);
    if (currentAvatarData) {
        playerAvatar.src = currentAvatarData.img;
    }
    updateAvatarScreen();
}

// --- SCREEN MANAGEMENT ---
function showScreen(screenId) {
    ['main-menu', 'game-screen', 'avatar-screen', 'sentence-mode-screen', 'leaderboard-screen'].forEach(id => {
        const el = document.getElementById(id);
        if (el) el.classList.add('hidden');
    });
    const screenEl = document.getElementById(screenId);
    if(screenEl) screenEl.classList.remove('hidden');

    if (screenId === 'game-screen') startGame();
    if (screenId === 'sentence-mode-screen') setupSentenceMode();
    if (screenId === 'leaderboard-screen') loadLeaderboard();
}

// --- EVENT LISTENERS ---
document.getElementById('start-game-btn').addEventListener('click', () => showScreen('game-screen'));
document.getElementById('avatar-select-btn').addEventListener('click', () => showScreen('avatar-screen'));
document.getElementById('sentence-mode-btn').addEventListener('click', () => showScreen('sentence-mode-screen'));
document.getElementById('leaderboard-btn').addEventListener('click', () => showScreen('leaderboard-screen'));
document.getElementById('back-to-menu-from-avatar').addEventListener('click', () => showScreen('main-menu'));
document.getElementById('back-to-menu-from-sentence').addEventListener('click', () => showScreen('main-menu'));
document.getElementById('back-to-menu-from-leaderboard').addEventListener('click', () => showScreen('main-menu'));

document.getElementById('submit-name-btn').addEventListener('click', async () => {
    const playerNameInput = document.getElementById('player-name-input');
    const newName = playerNameInput.value.trim();
    if (newName && newName.length > 0) {
        userData.displayName = newName;
        await savePlayerData();
        document.getElementById('name-modal').classList.add('hidden');
        playerStats.classList.remove('hidden');
        showScreen('main-menu');
        updateUI();
    } else {
        playerNameInput.placeholder = "Name can't be empty!";
    }
});

// --- AVATAR SCREEN ---
function updateAvatarScreen() {
    const avatarGrid = document.getElementById('avatar-grid');
    if (!avatarGrid || !userData) return;
    avatarGrid.innerHTML = '';
    avatars.forEach(avatar => {
        const isUnlocked = userData.unlockedAvatars.includes(avatar.id);
        const isSelected = userData.currentAvatar === avatar.id;
        const avatarDiv = document.createElement('div');
        avatarDiv.className = `p-4 rounded-lg cursor-pointer border-4 ${isSelected ? 'border-yellow-400' : 'border-transparent'} ${!isUnlocked ? 'bg-black bg-opacity-50' : ''}`;
        avatarDiv.innerHTML = `<img src="${avatar.img}" alt="${avatar.name}" class="mx-auto ${!isUnlocked ? 'locked' : 'unlocked'}" onerror="this.src='https://placehold.co/100x100/CCCCCC/FFFFFF?text=Error'; this.onerror=null;"><p class="mt-2">${avatar.name}</p>${!isUnlocked ? `<p class="text-yellow-400">${avatar.cost} Emeralds</p>` : ''}`;
        avatarDiv.addEventListener('click', () => {
            if (isUnlocked) {
                userData.currentAvatar = avatar.id;
                savePlayerData();
                updateUI();
            } else if (userData.emeralds >= avatar.cost) {
                userData.emeralds -= avatar.cost;
                userData.unlockedAvatars.push(avatar.id);
                userData.currentAvatar = avatar.id;
                savePlayerData();
                updateUI();
                showMessage("Unlocked!", `You unlocked ${avatar.name}!`);
            } else {
                showMessage("Not Enough Emeralds", `You need ${avatar.cost} emeralds to unlock ${avatar.name}.`);
            }
        });
        avatarGrid.appendChild(avatarDiv);
    });
}

// --- GAME LOGIC ---
function startGame() {
    isGameRunning = true;
    currentLevel = userData.highestLevel < levels.length ? userData.highestLevel : levels.length - 1;
    let combinedWords = [];
    for (let i = 0; i <= currentLevel; i++) {
        combinedWords = [...combinedWords, ...levels[i].words];
    }
    sessionWords = [...new Set(combinedWords)];
    sessionWords.sort(() => Math.random() - 0.5);
    score = 0;
    timeLeft = 60;
    activeWords = [];
    wordContainer.innerHTML = '';
    typingInput.value = '';
    typingInput.focus();
    updateGameHUD();
    gameInterval = setInterval(gameLoop, 1000);
    startWordFall();
}

function stopGame(isWin) {
    isGameRunning = false;
    clearInterval(gameInterval);
    clearInterval(wordFallInterval);
    if (isWin) {
        const emeraldsWon = currentLevel + 1;
        userData.emeralds += emeraldsWon;
        if (currentLevel === userData.highestLevel && userData.highestLevel < levels.length - 1) {
            userData.highestLevel++;
        }
        savePlayerData();
        updateUI();
        showLevelCompleteModal(emeraldsWon);
    } else {
        showMessage("Game Over", `You didn't reach the goal of ${levels[currentLevel].goal} words. Try again!`);
    }
}

function gameLoop() {
    if (!isGameRunning) return;
    timeLeft--;
    updateGameHUD();
    if (timeLeft <= 0) {
        stopGame(score >= levels[currentLevel].goal);
    }
}

function updateGameHUD() {
    document.getElementById('level-display').textContent = currentLevel + 1;
    document.getElementById('score-display').textContent = score;
    document.getElementById('time-display').textContent = timeLeft;
}

function startWordFall() {
    const level = levels[currentLevel];
    const intervalTime = 3000 / level.speed;
    wordFallInterval = setInterval(createWord, intervalTime);
}

function createWord() {
    if (!isGameRunning) return;
    if (sessionWords.length === 0) {
        let combinedWords = [];
        for (let i = 0; i <= currentLevel; i++) {
            combinedWords = [...combinedWords, ...levels[i].words];
        }
        sessionWords = [...new Set(combinedWords)];
        sessionWords.sort(() => Math.random() - 0.5);
    }
    const wordIndex = Math.floor(Math.random() * sessionWords.length);
    const wordText = sessionWords.splice(wordIndex, 1)[0];
    if (!wordText) return;
    const wordEl = document.createElement('div');
    wordEl.textContent = wordText;
    wordEl.className = 'absolute text-2xl p-2 bg-black bg-opacity-75 rounded';
    wordEl.style.left = `${Math.random() * 90}%`;
    wordEl.style.top = `-30px`;
    wordContainer.appendChild(wordEl);
    const wordObj = { el: wordEl, text: wordText, y: -30 };
    activeWords.push(wordObj);
    animateWord(wordObj);
}

function animateWord(wordObj) {
    const gameHeight = wordContainer.clientHeight;
    const duration = (gameHeight / 30) * 1000;
    let startTime = null;
    function step(timestamp) {
        if (!isGameRunning || !wordObj.el.parentElement) return;
        if (!startTime) startTime = timestamp;
        const progress = timestamp - startTime;
        wordObj.y = -30 + (progress / duration) * (gameHeight + 30);
        if (wordObj.y > gameHeight) {
            wordObj.el.remove();
            activeWords = activeWords.filter(w => w !== wordObj);
        } else {
            wordObj.el.style.transform = `translateY(${wordObj.y}px)`;
            requestAnimationFrame(step);
        }
    }
    requestAnimationFrame(step);
}

typingInput.addEventListener('input', (e) => {
    if (!isGameRunning) return;
    const typedValue = e.target.value;
    if (typedValue.endsWith(' ')) {
        const typedWord = typedValue.trim();
        e.target.value = '';
        const matchedWordIndex = activeWords.findIndex(w => w.text === typedWord);
        if (matchedWordIndex !== -1) {
            const matchedWord = activeWords[matchedWordIndex];
            matchedWord.el.remove();
            activeWords.splice(matchedWordIndex, 1);
            score++;
            updateGameHUD();
            if (score >= levels[currentLevel].goal) {
                stopGame(true);
            }
        }
    }
});

// --- SENTENCE MODE ---
let sentenceStartTime;
let currentSentence = '';

function setupSentenceMode() {
    currentSentence = sentences[Math.floor(Math.random() * sentences.length)];
    document.getElementById('sentence-text').textContent = currentSentence;
    const sentenceInput = document.getElementById('sentence-input');
    sentenceInput.value = '';
    sentenceInput.disabled = false;
    document.getElementById('submit-sentence-btn').classList.remove('hidden');
    document.getElementById('next-sentence-btn').classList.add('hidden');
    document.getElementById('wpm-display').textContent = '0';
    document.getElementById('accuracy-display').textContent = '100';
    sentenceInput.focus();
    sentenceStartTime = null;
}

document.getElementById('sentence-input').addEventListener('keypress', () => {
    if (!sentenceStartTime) {
        sentenceStartTime = new Date();
    }
});

document.getElementById('submit-sentence-btn').addEventListener('click', () => {
    if (!sentenceStartTime) {
        showMessage("Wait!", "Start typing to begin the timer.");
        return;
    }
    const typedSentence = document.getElementById('sentence-input').value;
    const timeTaken = (new Date() - sentenceStartTime) / 1000 / 60;
    const wordsTyped = typedSentence.trim().split(/\s+/).length;
    const wpm = timeTaken > 0 ? Math.round(wordsTyped / timeTaken) : 0;
    let correctChars = 0;
    for (let i = 0; i < typedSentence.length; i++) {
        if (i < currentSentence.length && typedSentence[i] === currentSentence[i]) {
            correctChars++;
        }
    }
    const accuracy = Math.round((correctChars / currentSentence.length) * 100);
    document.getElementById('wpm-display').textContent = wpm;
    document.getElementById('accuracy-display').textContent = accuracy;
    document.getElementById('sentence-input').disabled = true;
    document.getElementById('submit-sentence-btn').classList.add('hidden');
    document.getElementById('next-sentence-btn').classList.remove('hidden');
    
    // Update leaderboard stats
    const stats = userData.leaderboardStats;
    const totalGames = stats.gamesPlayed + 1;
    stats.avgWpm = Math.round(((stats.avgWpm * stats.gamesPlayed) + wpm) / totalGames);
    stats.accuracy = Math.round(((stats.accuracy * stats.gamesPlayed) + accuracy) / totalGames);
    stats.totalWords += wordsTyped;
    stats.gamesPlayed = totalGames;
    savePlayerData();
});

document.getElementById('next-sentence-btn').addEventListener('click', setupSentenceMode);

// --- LEADERBOARD ---
async function loadLeaderboard() {
    const leaderboardBody = document.getElementById('leaderboard-body');
    leaderboardBody.innerHTML = '<tr><td colspan="5" class="text-center p-4">Loading...</td></tr>';
    try {
        const response = await fetch(`${API_BASE_URL}/api/leaderboard`);
        const data = await response.json();
        leaderboardBody.innerHTML = '';
        if (data.length === 0) {
            leaderboardBody.innerHTML = '<tr><td colspan="5" class="text-center p-4">No data yet. Play sentence mode!</td></tr>';
            return;
        }
        data.forEach((player, index) => {
            const row = document.createElement('tr');
            row.innerHTML = `<td class="p-2">${index + 1}</td><td class="p-2">${player.name}</td><td class="p-2">${player.wpm}</td><td class="p-2">${player.accuracy}%</td><td class="p-2">${player.totalwords || 'N/A'}</td>`;
            leaderboardBody.appendChild(row);
        });
    } catch (error) {
        console.error("Error loading leaderboard:", error);
        leaderboardBody.innerHTML = '<tr><td colspan="5" class="text-center p-4">Could not load leaderboard.</td></tr>';
    }
}

// --- MODAL / MESSAGING ---
function showMessage(title, message) {
    const modalTitle = document.getElementById('modal-title');
    const modalMessage = document.getElementById('modal-message');
    const modalEmeralds = document.getElementById('modal-emeralds');
    const nextLevelBtn = document.getElementById('modal-next-level-btn');
    const messageModal = document.getElementById('message-modal');
    if (modalTitle) modalTitle.textContent = title;
    if (modalMessage) modalMessage.textContent = message;
    if (modalEmeralds) modalEmeralds.innerHTML = '';
    if (nextLevelBtn) nextLevelBtn.classList.add('hidden');
    if (messageModal) messageModal.classList.remove('hidden');
}

function showLevelCompleteModal(emeraldsWon) {
    const modalTitle = document.getElementById('modal-title');
    const modalMessage = document.getElementById('modal-message');
    const emeraldsContainer = document.getElementById('modal-emeralds');
    const nextLevelBtn = document.getElementById('modal-next-level-btn');
    const messageModal = document.getElementById('message-modal');
    if(modalTitle) modalTitle.textContent = `Level ${currentLevel + 1} Complete!`;
    let message = `You earned ${emeraldsWon} Chaos Emeralds!`;
    if(emeraldsContainer) {
        emeraldsContainer.innerHTML = '';
        for (let i = 0; i < emeraldsWon; i++) {
            const emeraldEl = document.createElement('div');
            emeraldEl.className = 'chaos-emerald';
            emeraldsContainer.appendChild(emeraldEl);
        }
    }
    if (nextLevelBtn) {
        if (currentLevel < levels.length - 1) {
            nextLevelBtn.classList.remove('hidden');
        } else {
            message += "\n\nYou've beaten all the levels!";
        }
    }
    if(modalMessage) modalMessage.textContent = message;
    if(messageModal) messageModal.classList.remove('hidden');
}

document.getElementById('modal-close-btn').addEventListener('click', () => {
    document.getElementById('message-modal').classList.add('hidden');
    if (!isGameRunning) {
        showScreen('main-menu');
    }
});

document.getElementById('modal-next-level-btn').addEventListener('click', () => {
    document.getElementById('message-modal').classList.add('hidden');
    startGame();
});

// --- App Entry Point ---
document.addEventListener('DOMContentLoaded', () => {
    loadPlayerData();
});
