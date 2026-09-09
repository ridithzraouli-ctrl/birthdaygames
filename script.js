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
    const user = getActiveUser();
    const scores = getAllScores();
    if (scores[user] === undefined) {
        const legacyCoins = parseInt(localStorage.getItem('bdayCoins')) || 0;
        scores[user] = legacyCoins;
        localStorage.setItem('bdayLeaderboardData', JSON.stringify(scores));
    }
    return scores[user];
}

function addCoins(amount) {
    const user = getActiveUser();
    const scores = getAllScores();
    const current = getCoins();
    
    scores[user] = current + amount;
    
    localStorage.setItem('bdayLeaderboardData', JSON.stringify(scores));
    localStorage.setItem('bdayCoins', scores[user]);
    
    updateCoinDisplays();
    if (typeof renderLeaderboard === 'function') renderLeaderboard();
}

function spendCoins(amount) {
    const user = getActiveUser();
    const scores = getAllScores();
    const current = getCoins();
    
    if (current >= amount) {
        scores[user] = current - amount;
        localStorage.setItem('bdayLeaderboardData', JSON.stringify(scores));
        localStorage.setItem('bdayCoins', scores[user]);
        
        updateCoinDisplays();
        if (typeof renderLeaderboard === 'function') renderLeaderboard();
        return true;
    }
    return false;
}

function switchUser() {
    const current = getActiveUser();
    const newUser = prompt("Switch profile or enter new username:", current);
    if (newUser && newUser.trim() !== "") {
        localStorage.setItem('bdayActiveUser', newUser.trim());
        localStorage.setItem('bdayCoins', getCoins());
        
        updateCoinDisplays();
        if (typeof renderLeaderboard === 'function') renderLeaderboard();
    }
}

function updateCoinDisplays() {
    const coins = getCoins();
    const user = getActiveUser();
    
    const coinDisplays = document.querySelectorAll('.coin-count');
    coinDisplays.forEach(el => {
        el.innerText = coins;
    });

    const userDisplays = document.querySelectorAll('#user-display');
    userDisplays.forEach(el => {
        el.innerText = user;
    });
}

document.addEventListener('DOMContentLoaded', updateCoinDisplays);
window.addEventListener('pageshow', updateCoinDisplays);
