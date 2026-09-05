// Fetch coins from local storage or start at 0
function getCoins() {
    return parseInt(localStorage.getItem('bdayCoins')) || 0;
}

// Add coins and save progress
function addCoins(amount) {
    let current = getCoins();
    current += amount;
    localStorage.setItem('bdayCoins', current);
    updateCoinDisplays();
}

// Spend coins (returns true if purchase succeeded)
function spendCoins(amount) {
    let current = getCoins();
    if (current >= amount) {
        current -= amount;
        localStorage.setItem('bdayCoins', current);
        updateCoinDisplays();
        return true;
    }
    return false;
}

// Keep coin displays updated on screen
function updateCoinDisplays() {
    const coinDisplays = document.querySelectorAll('.coin-count');
    coinDisplays.forEach(el => {
        el.innerText = getCoins();
    });
}

document.addEventListener('DOMContentLoaded', updateCoinDisplays);
