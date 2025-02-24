const express = require('express');
const cors = require('cors');

const app = express();
const PORT = 4000;

app.use(cors());
app.use(express.json());

// 🔹 Role Cards (One per player)
const roles = [
    "Medic", "Scientist", "Researcher", "Dispatcher", "Operations Expert",
    "Quarantine Specialist", "Contingency Planner"
];

// 🔹 Pawns (One per player, all start in Atlanta)
const pawns = roles.map(role => ({ role, location: "Atlanta" }));

// 🔹 Player Deck (48 City Cards, 6 Epidemic Cards, 5 Event Cards)
const playerDeck = [
    ...Array(48).fill().map((_, i) => ({ type: "City", name: `City ${i + 1}` })), // 48 City Cards
    ...Array(6).fill({ type: "Epidemic" }), // 6 Epidemic Cards
    ...Array(5).fill().map((_, i) => ({ type: "Event", name: `Event ${i + 1}` })) // 5 Event Cards
];

// 🔹 Infection Deck (48 Cards)
const infectionDeck = Array(48).fill().map((_, i) => `City ${i + 1}`);

// 🔹 Disease Cubes (96 total - 24 per color)
const diseases = {
    yellow: { cubes: 24 },
    blue: { cubes: 24 },
    black: { cubes: 24 },
    red: { cubes: 24 }
};

// 🔹 Game Markers
const markers = {
    infectionRate: 0,
    outbreaks: 0,
    cureMarkers: {
        yellow: false,
        blue: false,
        black: false,
        red: false
    },
    eradicated: {  // ✅ New eradication state
        yellow: false,
        blue: false,
        black: false,
        red: false
    }
};


// 🔹 Cities and Connections
const cities = {
    "Atlanta": { infectionLevel: 1, connectedCities: ["Washington", "Miami"] },
    "Washington": { infectionLevel: 2, connectedCities: ["Atlanta", "New York"] },
    "Miami": { infectionLevel: 0, connectedCities: ["Atlanta", "Mexico City"] },
    "New York": { infectionLevel: 1, connectedCities: ["Washington"] },
    "Mexico City": { infectionLevel: 3, connectedCities: ["Miami"] }
};

// 🔹 Full Game State
const gameState = {
    players: pawns,
    playerDeck,
    infectionDeck,
    diseases,
    markers,
    cities,
    researchStations: ["Atlanta"]
};

// 🔹 Endpoint to Get Game State
app.get('/game-state', (req, res) => {
    console.log("✅ Sending game state:", gameState);
    res.json(gameState);
});

// 🔹 Start Server
app.listen(PORT, () => {
    console.log(`Server running on http://localhost:${PORT}`);
});
