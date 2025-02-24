// pandemic_backend/server.js
const express = require('express');
const cors = require('cors');
const app = express();
const PORT = 4000;

// Enable CORS for frontend access
app.use(cors());
app.use(express.json());

// Game state (basic setup)
let gameState = {
    players: [],
    cities: {},
    infectionDeck: [],
    playerDeck: [],
    outbreaks: 0,
    curesDiscovered: 0,
    researchStations: ['Atlanta'],
};

// Initialize game with default settings
app.post('/start-game', (req, res) => {
    gameState = initializeGame();
    res.json({ message: 'Game started!', gameState });
});

// Get current game state
app.get('/game-state', (req, res) => {
    console.log("Sending game state:", gameState);  // Debugging line
    res.json(gameState);
});


// Handle player actions (move, treat, build, etc.)
app.post('/action', (req, res) => {
    const { player, action, city } = req.body;
    const result = performAction(player, action, city);
    res.json(result);
});

// Infect cities (simulating an infection phase)
app.post('/infect', (req, res) => {
    infectCities();
    res.json({ message: 'Infections processed!', gameState });
});

// Initialize basic game logic
function initializeGame() {
    return {
        players: [
            { id: 1, name: 'Player 1', role: 'Medic', location: 'Atlanta' },
        ],
        cities: {
            'Atlanta': { infectionLevel: 0, connectedCities: ['Washington', 'Miami'] },
            'Washington': { infectionLevel: 0, connectedCities: ['Atlanta', 'New York'] },
            'Miami': { infectionLevel: 0, connectedCities: ['Atlanta', 'Mexico City'] },
        },
        infectionDeck: ['Atlanta', 'Washington', 'Miami'],
        playerDeck: ['Atlanta', 'Washington', 'Miami'],
        outbreaks: 0,
        curesDiscovered: 0,
        researchStations: ['Atlanta'],
    };
}

// Perform player actions
function performAction(player, action, city) {
    if (action === 'move' && gameState.cities[city]) {
        const playerObj = gameState.players.find(p => p.name === player);
        if (playerObj) {
            playerObj.location = city;
            return { success: true, message: `${player} moved to ${city}` };
        }
    }
    return { success: false, message: 'Invalid action' };
}

// Infect cities
function infectCities() {
    const cityToInfect = gameState.infectionDeck.shift();
    if (cityToInfect) {
        gameState.cities[cityToInfect].infectionLevel++;
        if (gameState.cities[cityToInfect].infectionLevel > 3) {
            gameState.outbreaks++;
        }
    }
}

// Start the server
app.listen(PORT, () => {
    console.log(`Server running on http://localhost:${PORT}`);
});
