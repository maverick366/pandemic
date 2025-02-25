const express = require('express');
const cors = require('cors');

const app = express();
const PORT = 4000;

app.use(cors());
app.use(express.json());

// 🔹 Role Cards & Pawns
const roles = [
    "Medic", "Scientist", "Researcher", "Dispatcher", "Operations Expert",
    "Quarantine Specialist", "Contingency Planner"
];

const pawns = roles.map(role => ({ role, location: "Atlanta" }));

// 🔹 Player Deck (48 City Cards, 6 Epidemic Cards, 5 Event Cards)
const playerDeck = [
    ...Array(48).fill().map((_, i) => ({ type: "City", name: `City ${i + 1}` })),
    ...Array(6).fill({ type: "Epidemic" }),
    ...Array(5).fill().map((_, i) => ({ type: "Event", name: `Event ${i + 1}` }))
];

// 🔹 Infection Deck (48 Cities)
const infectionDeck = [
    "San Francisco", "Chicago", "Atlanta", "Montreal", "Washington", "New York",
    "London", "Madrid", "Paris", "Essen", "Milan", "St. Petersburg",
    "Los Angeles", "Mexico City", "Miami", "Bogotá", "Lima", "Santiago",
    "Buenos Aires", "Sao Paulo", "Lagos", "Kinshasa", "Johannesburg", "Khartoum",
    "Moscow", "Istanbul", "Baghdad", "Cairo", "Algiers", "Tehran",
    "Karachi", "Riyadh", "Delhi", "Mumbai", "Kolkata", "Chennai",
    "Beijing", "Seoul", "Shanghai", "Hong Kong", "Taipei", "Tokyo",
    "Manila", "Sydney", "Jakarta", "Bangkok", "Ho Chi Minh City", "Osaka"
];

// 🔹 City Connections (For Outbreaks & Board Visualization)
const cityConnections = {
    "San Francisco": ["Los Angeles", "Chicago", "Tokyo", "Manila"],
    "Chicago": ["San Francisco", "Atlanta", "Montreal", "Mexico City"],
    "Atlanta": ["Chicago", "Washington", "Miami"],
    "Montreal": ["Chicago", "New York", "Washington"],
    "Washington": ["Montreal", "Atlanta", "New York", "Miami"],
    "New York": ["Montreal", "Washington", "London", "Madrid"],
    "London": ["New York", "Madrid", "Essen", "Paris"],
    "Madrid": ["New York", "London", "Paris", "Sao Paulo", "Algiers"],
    "Paris": ["London", "Madrid", "Essen", "Milan", "Algiers"],
    "Essen": ["London", "Paris", "Milan", "St. Petersburg"],
    "Milan": ["Paris", "Essen", "Istanbul"],
    "St. Petersburg": ["Essen", "Moscow", "Istanbul"],
    "Los Angeles": ["San Francisco", "Mexico City", "Sydney", "Chicago"],
    "Mexico City": ["Los Angeles", "Chicago", "Miami", "Bogotá", "Lima"],
    "Miami": ["Washington", "Atlanta", "Mexico City", "Bogotá"],
    "Bogotá": ["Mexico City", "Miami", "Lima", "Buenos Aires", "Sao Paulo"],
    "Lima": ["Mexico City", "Bogotá", "Santiago"],
    "Santiago": ["Lima"],
    "Buenos Aires": ["Bogotá", "Sao Paulo"],
    "Sao Paulo": ["Buenos Aires", "Bogotá", "Madrid", "Lagos"],
    "Lagos": ["Sao Paulo", "Khartoum", "Kinshasa"],
    "Kinshasa": ["Lagos", "Johannesburg", "Khartoum"],
    "Johannesburg": ["Kinshasa", "Khartoum"],
    "Khartoum": ["Lagos", "Kinshasa", "Johannesburg", "Cairo"],
    "Moscow": ["St. Petersburg", "Tehran", "Istanbul"],
    "Istanbul": ["Milan", "St. Petersburg", "Moscow", "Baghdad", "Cairo", "Algiers"],
    "Baghdad": ["Istanbul", "Tehran", "Riyadh", "Karachi", "Cairo"],
    "Cairo": ["Istanbul", "Algiers", "Baghdad", "Riyadh", "Khartoum"],
    "Algiers": ["Madrid", "Paris", "Istanbul", "Cairo"],
    "Tehran": ["Moscow", "Delhi", "Baghdad", "Karachi"],
    "Karachi": ["Tehran", "Delhi", "Baghdad", "Mumbai", "Riyadh"],
    "Riyadh": ["Cairo", "Baghdad", "Karachi"],
    "Delhi": ["Tehran", "Karachi", "Mumbai", "Kolkata", "Chennai"],
    "Mumbai": ["Delhi", "Karachi", "Chennai"],
    "Kolkata": ["Delhi", "Chennai", "Bangkok", "Hong Kong"],
    "Chennai": ["Mumbai", "Delhi", "Kolkata", "Bangkok", "Jakarta"],
    "Beijing": ["Seoul", "Shanghai"],
    "Seoul": ["Beijing", "Tokyo", "Shanghai"],
    "Shanghai": ["Beijing", "Seoul", "Tokyo", "Hong Kong", "Taipei"],
    "Hong Kong": ["Shanghai", "Taipei", "Bangkok", "Ho Chi Minh City", "Manila"],
    "Taipei": ["Shanghai", "Hong Kong", "Osaka", "Manila"],
    "Tokyo": ["Seoul", "Shanghai", "Osaka", "San Francisco"],
    "Manila": ["Hong Kong", "Taipei", "San Francisco", "Ho Chi Minh City", "Sydney"],
    "Sydney": ["Los Angeles", "Manila", "Jakarta"],
    "Jakarta": ["Chennai", "Bangkok", "Ho Chi Minh City", "Sydney"],
    "Bangkok": ["Kolkata", "Chennai", "Jakarta", "Ho Chi Minh City", "Hong Kong"],
    "Ho Chi Minh City": ["Bangkok", "Hong Kong", "Jakarta", "Manila"],
    "Osaka": ["Tokyo", "Taipei"]
};

// 🔹 Game State
const gameState = {
    players: pawns,
    playerDeck,
    infectionDeck,
    markers: { outbreaks: 0 },
    cities: infectionDeck.reduce((acc, city) => {
        acc[city] = {
            infectionLevel: 0,
            researchStation: false,
            outbreak: false,
            connectedCities: cityConnections[city] || [] // ✅ Add city connections
        };
        return acc;
    }, {}),
    researchStations: ["Atlanta"]
};

// 🔹 Utility Functions
const shuffleDeck = (deck) => {
    for (let i = deck.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [deck[i], deck[j]] = [deck[j], deck[i]];
    }
};

// 🔹 Initial Infection Setup
const drawInfectionCards = (count) => infectionDeck.splice(0, count);

const placeInitialCubes = () => {
    shuffleDeck(infectionDeck);

    const threeCubes = drawInfectionCards(3);
    const twoCubes = drawInfectionCards(3);
    const oneCubes = drawInfectionCards(3);

    threeCubes.forEach(city => gameState.cities[city].infectionLevel = 3);
    twoCubes.forEach(city => gameState.cities[city].infectionLevel = 2);
    oneCubes.forEach(city => gameState.cities[city].infectionLevel = 1);
};

placeInitialCubes();

// 🔹 API Endpoints

// ✅ Get Game State
app.get('/game-state', (req, res) => {
    res.json(gameState);
});

// ✅ Draw New Infection Card
app.post('/draw-infection-card', (req, res) => {
    if (infectionDeck.length === 0) {
        return res.status(400).json({ message: "Infection deck is empty!" });
    }

    const drawnCity = infectionDeck.shift();
    const cityData = gameState.cities[drawnCity];

    if (!cityData) {
        return res.status(400).json({ message: `City ${drawnCity} not found in game state.` });
    }

    // ✅ Check for Outbreak
    if (cityData.infectionLevel >= 3) {
        gameState.markers.outbreaks += 1;
        cityConnections[drawnCity].forEach(connectedCity => {
            if (gameState.cities[connectedCity].infectionLevel < 3) {
                gameState.cities[connectedCity].infectionLevel += 1;
            }
        });
    } else {
        cityData.infectionLevel += 1;
    }

    res.json({ message: `Infected ${drawnCity}.`, gameState });
});

// ✅ Treat Disease
app.post('/treat-disease', (req, res) => {
    const { city } = req.body;

    if (!gameState.cities[city]) {
        return res.status(400).json({ error: "City not found." });
    }

    const cityData = gameState.cities[city];

    if (cityData.infectionLevel === 0) {
        return res.status(400).json({ message: "No disease to treat in this city." });
    }

    cityData.infectionLevel -= 1;

    console.log(`🩺 Treated 1 disease cube in ${city}. Remaining infections: ${cityData.infectionLevel}`);

    res.json({ message: `Treated 1 disease cube in ${city}.`, gameState });
});


// ✅ Start Server
app.listen(PORT, () => {
    console.log(`🚀 Server is running on http://localhost:${PORT}`);
});
