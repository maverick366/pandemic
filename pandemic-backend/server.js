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
    eradicated: {
        yellow: false,
        blue: false,
        black: false,
        red: false
    }
};


// 🔹 Cities and Connections
const cities = {
    // 🔵 BLUE CITIES
    "San Francisco": { color: "blue", infectionLevel: 0, connectedCities: ["Los Angeles", "Chicago", "Tokyo", "Manila"] },
    "Chicago": { color: "blue", infectionLevel: 0, connectedCities: ["San Francisco", "Los Angeles", "Mexico City", "Atlanta", "Montreal"] },
    "Atlanta": { color: "blue", infectionLevel: 0, connectedCities: ["Chicago", "Washington", "Miami"] },
    "Montreal": { color: "blue", infectionLevel: 0, connectedCities: ["Chicago", "Washington", "New York"] },
    "Washington": { color: "blue", infectionLevel: 0, connectedCities: ["Montreal", "New York", "Miami", "Atlanta"] },
    "New York": { color: "blue", infectionLevel: 0, connectedCities: ["Montreal", "Washington", "London", "Madrid"] },
    "London": { color: "blue", infectionLevel: 0, connectedCities: ["New York", "Madrid", "Paris", "Essen"] },
    "Madrid": { color: "blue", infectionLevel: 0, connectedCities: ["New York", "London", "Paris", "Sao Paulo"] },
    "Paris": { color: "blue", infectionLevel: 0, connectedCities: ["Madrid", "London", "Essen", "Milan", "Algiers"] },
    "Essen": { color: "blue", infectionLevel: 0, connectedCities: ["London", "Paris", "Milan", "St. Petersburg"] },
    "Milan": { color: "blue", infectionLevel: 0, connectedCities: ["Essen", "Paris", "Istanbul"] },
    "St. Petersburg": { color: "blue", infectionLevel: 0, connectedCities: ["Essen", "Istanbul", "Moscow"] },

    // 🟡 YELLOW CITIES
    "Los Angeles": { color: "yellow", infectionLevel: 0, connectedCities: ["San Francisco", "Chicago", "Mexico City", "Sydney"] },
    "Mexico City": { color: "yellow", infectionLevel: 0, connectedCities: ["Los Angeles", "Chicago", "Miami", "Bogotá", "Lima"] },
    "Miami": { color: "yellow", infectionLevel: 0, connectedCities: ["Atlanta", "Washington", "Mexico City", "Bogotá"] },
    "Bogotá": { color: "yellow", infectionLevel: 0, connectedCities: ["Mexico City", "Miami", "Lima", "Sao Paulo", "Buenos Aires"] },
    "Lima": { color: "yellow", infectionLevel: 0, connectedCities: ["Mexico City", "Bogotá", "Santiago"] },
    "Santiago": { color: "yellow", infectionLevel: 0, connectedCities: ["Lima"] },
    "Buenos Aires": { color: "yellow", infectionLevel: 0, connectedCities: ["Bogotá", "Sao Paulo"] },
    "Sao Paulo": { color: "yellow", infectionLevel: 0, connectedCities: ["Bogotá", "Buenos Aires", "Madrid", "Lagos"] },
    "Lagos": { color: "yellow", infectionLevel: 0, connectedCities: ["Sao Paulo", "Khartoum", "Kinshasa"] },
    "Kinshasa": { color: "yellow", infectionLevel: 0, connectedCities: ["Lagos", "Johannesburg", "Khartoum"] },
    "Johannesburg": { color: "yellow", infectionLevel: 0, connectedCities: ["Kinshasa", "Khartoum"] },
    "Khartoum": { color: "yellow", infectionLevel: 0, connectedCities: ["Lagos", "Kinshasa", "Johannesburg", "Cairo"] },

    // ⚫ BLACK CITIES
    "Moscow": { color: "black", infectionLevel: 0, connectedCities: ["St. Petersburg", "Istanbul", "Tehran"] },
    "Istanbul": { color: "black", infectionLevel: 0, connectedCities: ["Milan", "St. Petersburg", "Moscow", "Baghdad", "Cairo", "Algiers"] },
    "Baghdad": { color: "black", infectionLevel: 0, connectedCities: ["Istanbul", "Cairo", "Riyadh", "Karachi", "Tehran"] },
    "Cairo": { color: "black", infectionLevel: 0, connectedCities: ["Istanbul", "Baghdad", "Khartoum", "Algiers"] },
    "Algiers": { color: "black", infectionLevel: 0, connectedCities: ["Madrid", "Paris", "Istanbul", "Cairo"] },
    "Tehran": { color: "black", infectionLevel: 0, connectedCities: ["Moscow", "Baghdad", "Karachi", "Delhi"] },
    "Karachi": { color: "black", infectionLevel: 0, connectedCities: ["Baghdad", "Delhi", "Mumbai", "Riyadh", "Tehran"] },
    "Riyadh": { color: "black", infectionLevel: 0, connectedCities: ["Baghdad", "Karachi", "Cairo"] },
    "Delhi": { color: "black", infectionLevel: 0, connectedCities: ["Tehran", "Karachi", "Mumbai", "Chennai", "Kolkata"] },
    "Mumbai": { color: "black", infectionLevel: 0, connectedCities: ["Karachi", "Delhi", "Chennai"] },
    "Kolkata": { color: "black", infectionLevel: 0, connectedCities: ["Delhi", "Chennai", "Bangkok", "Hong Kong"] },
    "Chennai": { color: "black", infectionLevel: 0, connectedCities: ["Mumbai", "Delhi", "Kolkata", "Jakarta", "Bangkok"] },

    // 🔴 RED CITIES
    "Beijing": { color: "red", infectionLevel: 0, connectedCities: ["Shanghai", "Seoul"] },
    "Seoul": { color: "red", infectionLevel: 0, connectedCities: ["Beijing", "Shanghai", "Tokyo"] },
    "Shanghai": { color: "red", infectionLevel: 0, connectedCities: ["Beijing", "Seoul", "Tokyo", "Hong Kong", "Taipei"] },
    "Hong Kong": { color: "red", infectionLevel: 0, connectedCities: ["Shanghai", "Taipei", "Manila", "Bangkok", "Kolkata"] },
    "Taipei": { color: "red", infectionLevel: 0, connectedCities: ["Shanghai", "Hong Kong", "Osaka", "Manila"] },
    "Tokyo": { color: "red", infectionLevel: 0, connectedCities: ["Seoul", "Osaka", "San Francisco"] },
    "Manila": { color: "red", infectionLevel: 0, connectedCities: ["Taipei", "Hong Kong", "Sydney", "San Francisco", "Jakarta"] },
    "Sydney": { color: "red", infectionLevel: 0, connectedCities: ["Manila", "Jakarta", "Los Angeles"] }
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

const getDiseaseColor = (city) => {
    // Mapping basic city colors (Replace with actual map later)
    if (["Atlanta", "Washington", "New York"].includes(city)) return "blue";
    if (["Miami", "Mexico City"].includes(city)) return "yellow";
    return "black"; // Default fallback
};

const checkEradication = (color) => {
    const isEradicated = Object.values(gameState.cities).every(city => {
        return getDiseaseColor(city) !== color || city.infectionLevel === 0;
    });

    if (isEradicated && gameState.markers.cureMarkers[color]) {
        gameState.markers.eradicated[color] = true;
        console.log(`🎉 The ${color} disease is now eradicated!`);
    }
};


// 🔹 Endpoint to Get Game State
app.get('/game-state', (req, res) => {
    console.log("✅ Sending game state:", gameState);
    res.json(gameState);
});

app.post('/treat-disease', (req, res) => {
    const { city } = req.body;

    if (!gameState.cities[city]) {
        return res.status(400).json({ error: "City not found." });
    }

    const cityData = gameState.cities[city];

    if (cityData.infectionLevel === 0) {
        return res.status(400).json({ message: "No disease to treat in this city." });
    }

    // 🔹 Find the disease color
    const diseaseColor = getDiseaseColor(city);

    // 🔹 Remove a disease cube from the city
    cityData.infectionLevel -= 1;
    gameState.diseases[diseaseColor].cubes += 1; // Return cube to supply

    console.log(`🩺 Treated 1 ${diseaseColor} disease cube in ${city}. Remaining: ${cityData.infectionLevel}`);

    // 🔹 Check if the disease is now eradicated
    checkEradication(diseaseColor);

    res.json({ message: `Treated 1 ${diseaseColor} disease cube in ${city}.`, gameState });
});

app.post('/outbreak', (req, res) => {
    if (gameState.markers.outbreaks >= 8) {
        return res.status(400).json({ message: "Game Over! Maximum outbreaks reached." });
    }

    gameState.markers.outbreaks += 1;
    console.log(`⚠️ Outbreak occurred! Outbreaks count: ${gameState.markers.outbreaks}`);

    if (gameState.markers.outbreaks >= 8) {
        console.log("❌ Game Over! Maximum outbreaks reached.");
    }

    res.json({ message: "Outbreak tracked.", gameState });
});

// 🔹 Start Server
app.listen(PORT, () => {
    console.log(`Server running on http://localhost:${PORT}`);
});
