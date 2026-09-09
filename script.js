function getUserId() {
    let id = localStorage.getItem('bdayUserId');
    if (!id) {
        id = 'user_' + Date.now() + '_' + Math.random().toString(36).substring(2, 7);
        localStorage.setItem('bdayUserId', id);
    }
    return id;
}

function getActiveUser() {
    let user = localStorage.getItem('bdayActiveUser');
    if (!user) {
        user = prompt("Enter a username to save your coins:", "Player 1");
        if (!user || user.trim() === "") user = "Player 1";
        user = user.trim();
        localStorage.setItem('bdayActiveUser', user);
    }
    return user;
}

function getAllScores() {
    return JSON.parse(localStorage.getItem('bdayLeaderboardData') || '{}');
}

function getCoins() {
    const id = getUserId();
    const scores = getAllScores();
    if (!scores[id]) {
        const legacyCoins = parseInt(localStorage.getItem('bdayCoins')) || 0;
        scores[id] = { name: getActiveUser(), coins: legacyCoins };
        localStorage.setItem('bdayLeaderboardData', JSON.stringify(scores));
    }
    return scores[id].coins;
}

function addCoins(amount) {
    const id = getUserId();
    const scores = getAllScores();
    
    if (!scores[id]) {
        scores[id] = { name: getActiveUser(), coins: 0 };
    }
    
    scores[id].coins += amount;
    scores[id].name = getActiveUser();
    
    localStorage.setItem('bdayLeaderboardData', JSON.stringify(scores));
    localStorage.setItem('bdayCoins', scores[id].coins);
    
    updateCoinDisplays();
    if (typeof renderLeaderboard === 'function') renderLeaderboard();
}

function spendCoins(amount) {
    const id = getUserId();
    const scores = getAllScores();
    const current = getCoins();
    
    if (current >= amount) {
        scores[id].coins -= amount;
        localStorage.setItem('bdayLeaderboardData', JSON.stringify(scores));
        localStorage.setItem('bdayCoins', scores[id].coins);
        
        updateCoinDisplays();
        if (typeof renderLeaderboard === 'function') renderLeaderboard();
        return true;
    }
    return false;
}

function switchUser() {
    const id = getUserId();
    const current = getActiveUser();
    const newUser = prompt("Enter your new username:", current);
    
    if (newUser && newUser.trim() !== "") {
        const cleanedName = newUser.trim();
        const scores = getAllScores();
        
        localStorage.setItem('bdayActiveUser', cleanedName);
        
        if (scores[id]) {
            scores[id].name = cleanedName;
        } else {
            scores[id] = { name: cleanedName, coins: getCoins() };
        }
        
        localStorage.setItem('bdayLeaderboardData', JSON.stringify(scores));
        
        updateCoinDisplays();
        if (typeof renderLeaderboard === 'function') renderLeaderboard();
    }
}

function updateCoinDisplays() {
    const coins = getCoins();
    const user = getActiveUser();
    
    document.querySelectorAll('.coin-count').forEach(el => el.innerText = coins);
    document.querySelectorAll('#user-display').forEach(el => el.innerText = user);
}

document.addEventListener('DOMContentLoaded', updateCoinDisplays);
window.addEventListener('pageshow', updateCoinDisplays);
