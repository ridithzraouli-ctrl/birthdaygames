function getCoins() {
    return Number(localStorage.getItem("bdayCoins")) || 0;
}

function addCoins(amount) {
    amount = Number(amount) || 0;

    if (amount <= 0) {
        return;
    }

    const coins = getCoins() + amount;

    localStorage.setItem("bdayCoins", coins);

    updateCoinDisplays();
}

function spendCoins(amount) {
    amount = Number(amount) || 0;

    if (amount <= 0) {
        return false;
    }

    const coins = getCoins();

    if (coins < amount) {
        return false;
    }

    localStorage.setItem("bdayCoins", coins - amount);

    updateCoinDisplays();

    return true;
}

function updateCoinDisplays() {
    const coins = getCoins();

    document.querySelectorAll(".coin-count").forEach(function(el) {
        el.innerText = coins;
    });
}

document.addEventListener("DOMContentLoaded", function() {
    updateCoinDisplays();
});

window.addEventListener("pageshow", function() {
    updateCoinDisplays();
});
