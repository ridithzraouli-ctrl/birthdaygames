const firebaseConfig = {
    apiKey: "AIzaSyADjbuYXQzbRQU2PZZUKjcogDAixgyr_NQ",
    authDomain: "my-arcade-app-1a2ae.firebaseapp.com",
    projectId: "my-arcade-app-1a2ae",
    storageBucket: "my-arcade-app-1a2ae.firebasestorage.app",
    messagingSenderId: "650926380080",
    appId: "1:650926380080:web:ed2576989f47ee3e2b89f5"
};

if (!firebase.apps.length) {
    firebase.initializeApp(firebaseConfig);
}

const database = firebase.database();
const playersRef = database.ref("players");

function getUserId() {
    let id = localStorage.getItem("bdayUserId");

    if (!id) {
        id = "user_" + Date.now() + "_" + Math.random().toString(36).substring(2, 7);
        localStorage.setItem("bdayUserId", id);
    }

    return id;
}

function getActiveUser() {
    let user = localStorage.getItem("bdayActiveUser");

    if (!user) {
        user = prompt("Enter a username to save your coins:", "Player 1");

        if (!user || user.trim() === "") {
            user = "Player 1";
        }

        user = user.trim();
        localStorage.setItem("bdayActiveUser", user);
    }

    return user;
}

function getAllScores() {
    return JSON.parse(localStorage.getItem("bdayLeaderboardData") || "{}");
}

function saveLocalScores(scores) {
    localStorage.setItem("bdayLeaderboardData", JSON.stringify(scores));
}

function getPlayerKey(username) {
    return encodeURIComponent(username.trim().toLowerCase())
        .replace(/\./g, "%2E");
}

function getCoins() {
    const id = getUserId();
    const scores = getAllScores();

    if (!scores[id]) {
        const legacyCoins = parseInt(localStorage.getItem("bdayCoins")) || 0;

        scores[id] = {
            name: getActiveUser(),
            coins: legacyCoins
        };

        saveLocalScores(scores);
    }

    return Number(scores[id].coins) || 0;
}

function saveCurrentPlayer() {
    const id = getUserId();
    const username = getActiveUser();
    const coins = getCoins();

    const scores = getAllScores();

    scores[id] = {
        name: username,
        coins: coins
    };

    saveLocalScores(scores);
    localStorage.setItem("bdayCoins", coins);

    const playerKey = getPlayerKey(username);

    return playersRef.child(playerKey).set({
        id: id,
        name: username,
        coins: coins
    }).catch(function(error) {
        console.error("Firebase save error:", error);
    });
}

function addCoins(amount) {
    amount = Number(amount) || 0;

    if (amount <= 0) {
        return;
    }

    const id = getUserId();
    const username = getActiveUser();
    const scores = getAllScores();

    if (!scores[id]) {
        scores[id] = {
            name: username,
            coins: 0
        };
    }

    scores[id].coins = (Number(scores[id].coins) || 0) + amount;
    scores[id].name = username;

    saveLocalScores(scores);
    localStorage.setItem("bdayCoins", scores[id].coins);

    updateCoinDisplays();

    if (typeof renderLeaderboard === "function") {
        renderLeaderboard();
    }

    saveCurrentPlayer();
}

function spendCoins(amount) {
    amount = Number(amount) || 0;

    if (amount <= 0) {
        return false;
    }

    const id = getUserId();
    const username = getActiveUser();
    const scores = getAllScores();
    const current = getCoins();

    if (current < amount) {
        return false;
    }

    if (!scores[id]) {
        scores[id] = {
            name: username,
            coins: current
        };
    }

    scores[id].coins = current - amount;
    scores[id].name = username;

    saveLocalScores(scores);
    localStorage.setItem("bdayCoins", scores[id].coins);

    updateCoinDisplays();

    if (typeof renderLeaderboard === "function") {
        renderLeaderboard();
    }

    saveCurrentPlayer();

    return true;
}

async function switchUser() {
    const current = getActiveUser();

    const newUser = prompt(
        "Enter your new username:",
        current
    );

    if (!newUser || newUser.trim() === "") {
        return;
    }

    const cleanedName = newUser.trim();
    const newPlayerKey = getPlayerKey(cleanedName);
    const id = getUserId();
    const scores = getAllScores();

    try {
        const snapshot = await playersRef.child(newPlayerKey).once("value");
        const firebasePlayer = snapshot.val();

        localStorage.setItem("bdayActiveUser", cleanedName);

        if (firebasePlayer) {
            scores[id] = {
                name: firebasePlayer.name || cleanedName,
                coins: Number(firebasePlayer.coins) || 0
            };

            localStorage.setItem(
                "bdayCoins",
                Number(firebasePlayer.coins) || 0
            );
        } else {
            const currentCoins = scores[id]
                ? Number(scores[id].coins) || 0
                : 0;

            scores[id] = {
                name: cleanedName,
                coins: currentCoins
            };

            localStorage.setItem("bdayCoins", currentCoins);

            await playersRef.child(newPlayerKey).set({
                id: id,
                name: cleanedName,
                coins: currentCoins
            });
        }

        saveLocalScores(scores);
        updateCoinDisplays();

        if (typeof renderLeaderboard === "function") {
            renderLeaderboard();
        }

        if (typeof updateLeaderboardUI === "function") {
            updateLeaderboardUI();
        }

    } catch (error) {
        console.error("Firebase user switch error:", error);

        localStorage.setItem("bdayActiveUser", cleanedName);

        const currentCoins = scores[id]
            ? Number(scores[id].coins) || 0
            : 0;

        scores[id] = {
            name: cleanedName,
            coins: currentCoins
        };

        saveLocalScores(scores);
        updateCoinDisplays();

        if (typeof renderLeaderboard === "function") {
            renderLeaderboard();
        }

        if (typeof updateLeaderboardUI === "function") {
            updateLeaderboardUI();
        }
    }
}

function updateCoinDisplays() {
    const coins = getCoins();
    const user = getActiveUser();

    document.querySelectorAll(".coin-count").forEach(function(el) {
        el.innerText = coins;
    });

    document.querySelectorAll("#user-display").forEach(function(el) {
        el.innerText = user;
    });
}

function loadFirebaseLeaderboard() {
    playersRef.on("value", function(snapshot) {
        const data = snapshot.val() || {};
        const scores = {};

        Object.keys(data).forEach(function(key) {
            const player = data[key];

            if (!player) {
                return;
            }

            let playerName = player.name;

            if (!playerName || !String(playerName).trim()) {
                try {
                    playerName = decodeURIComponent(key);
                } catch (error) {
                    playerName = key;
                }
            }

            if (!playerName || !String(playerName).trim()) {
                playerName = "Player";
            }

            const id = player.id || key;

            scores[id] = {
                name: String(playerName),
                coins: Number(player.coins) || 0
            };
        });

        const currentId = getUserId();
        const currentName = getActiveUser();

        if (!scores[currentId]) {
            const currentCoins = Number(localStorage.getItem("bdayCoins")) || 0;

            scores[currentId] = {
                name: currentName,
                coins: currentCoins
            };
        }

        saveLocalScores(scores);

        if (typeof renderLeaderboard === "function") {
            renderLeaderboard();
        }

        if (typeof updateLeaderboardUI === "function") {
            updateLeaderboardUI();
        }
    }, function(error) {
        console.error("Firebase leaderboard error:", error);
    });
}

function loadCurrentPlayerFromFirebase() {
    const username = getActiveUser();
    const playerKey = getPlayerKey(username);

    playersRef.child(playerKey).once("value")
        .then(function(snapshot) {
            const player = snapshot.val();

            if (!player) {
                saveCurrentPlayer();
                return;
            }

            const id = getUserId();
            const scores = getAllScores();
            const coins = Number(player.coins) || 0;
            const name = player.name || username;

            scores[id] = {
                name: name,
                coins: coins
            };

            saveLocalScores(scores);
            localStorage.setItem("bdayCoins", coins);
            localStorage.setItem("bdayActiveUser", name);

            updateCoinDisplays();

            if (typeof renderLeaderboard === "function") {
                renderLeaderboard();
            }

            if (typeof updateLeaderboardUI === "function") {
                updateLeaderboardUI();
            }
        })
        .catch(function(error) {
            console.error("Firebase player load error:", error);
        });
}

document.addEventListener("DOMContentLoaded", function() {
    updateCoinDisplays();
    loadCurrentPlayerFromFirebase();
    loadFirebaseLeaderboard();
});

window.addEventListener("pageshow", function() {
    updateCoinDisplays();
});
