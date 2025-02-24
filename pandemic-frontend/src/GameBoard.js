// pandemic_frontend/src/GameBoard.js
import React, { useState, useEffect } from 'react';
import axios from 'axios';
import './GameBoard.css';

const API_URL = 'http://localhost:4000';

const cityPositions = {
    // 🔵 BLUE CITIES
    "San Francisco": { x: 100, y: 200, color: "blue" },
    "Chicago": { x: 150, y: 150, color: "blue" },
    "Atlanta": { x: 200, y: 200, color: "blue" },
    "Montreal": { x: 250, y: 150, color: "blue" },
    "Washington": { x: 300, y: 180, color: "blue" },
    "New York": { x: 350, y: 160, color: "blue" },
    "London": { x: 400, y: 120, color: "blue" },
    "Madrid": { x: 420, y: 160, color: "blue" },
    "Paris": { x: 460, y: 140, color: "blue" },
    "Essen": { x: 480, y: 100, color: "blue" },
    "Milan": { x: 500, y: 140, color: "blue" },
    "St. Petersburg": { x: 520, y: 80, color: "blue" },

    // 🟡 YELLOW CITIES
    "Los Angeles": { x: 120, y: 300, color: "yellow" },
    "Mexico City": { x: 170, y: 350, color: "yellow" },
    "Miami": { x: 240, y: 340, color: "yellow" },
    "Bogotá": { x: 220, y: 400, color: "yellow" },
    "Lima": { x: 180, y: 450, color: "yellow" },
    "Santiago": { x: 200, y: 500, color: "yellow" },
    "Buenos Aires": { x: 240, y: 480, color: "yellow" },
    "Sao Paulo": { x: 300, y: 460, color: "yellow" },
    "Lagos": { x: 360, y: 400, color: "yellow" },
    "Kinshasa": { x: 380, y: 440, color: "yellow" },
    "Johannesburg": { x: 420, y: 480, color: "yellow" },
    "Khartoum": { x: 400, y: 400, color: "yellow" },

    // ⚫ BLACK CITIES
    "Moscow": { x: 540, y: 90, color: "black" },
    "Istanbul": { x: 520, y: 130, color: "black" },
    "Baghdad": { x: 550, y: 170, color: "black" },
    "Cairo": { x: 500, y: 190, color: "black" },
    "Algiers": { x: 470, y: 170, color: "black" },
    "Tehran": { x: 570, y: 120, color: "black" },
    "Karachi": { x: 600, y: 200, color: "black" },
    "Riyadh": { x: 560, y: 220, color: "black" },
    "Delhi": { x: 620, y: 180, color: "black" },
    "Mumbai": { x: 610, y: 220, color: "black" },
    "Kolkata": { x: 660, y: 170, color: "black" },
    "Chennai": { x: 650, y: 220, color: "black" },

    // 🔴 RED CITIES (Now all 12 included)
    "Beijing": { x: 700, y: 100, color: "red" },
    "Seoul": { x: 740, y: 110, color: "red" },
    "Shanghai": { x: 720, y: 140, color: "red" },
    "Hong Kong": { x: 720, y: 180, color: "red" },
    "Taipei": { x: 750, y: 190, color: "red" },
    "Tokyo": { x: 780, y: 130, color: "red" },
    "Manila": { x: 770, y: 230, color: "red" },
    "Sydney": { x: 820, y: 350, color: "red" },
    "Jakarta": { x: 700, y: 280, color: "red" },
    "Bangkok": { x: 670, y: 240, color: "red" },
    "Ho Chi Minh City": { x: 730, y: 260, color: "red" },
    "Osaka": { x: 800, y: 150, color: "red" }
};



const getInfectionColor = (infectionLevel) => {
    if (infectionLevel >= 3) return "red";
    if (infectionLevel === 2) return "orange";
    if (infectionLevel === 1) return "yellow";
    return "lightblue";
};

const GameBoard = () => {
    const [gameState, setGameState] = useState(null);
    const [selectedCity, setSelectedCity] = useState('');

    useEffect(() => {
        fetchGameState();
    }, []);

    const fetchGameState = async () => {
        try {
            const response = await axios.get(`${API_URL}/game-state`);
            console.log("Fetched game state:", response.data);
            setGameState(response.data);
        } catch (error) {
            console.error("Error fetching game state:", error);
        }
    };

    // ✅ Function to treat a disease
    const treatDisease = async () => {
        if (!selectedCity) {
            console.warn("⚠️ No city selected!");
            return;
        }

        try {
            const response = await axios.post(`${API_URL}/treat-disease`, { city: selectedCity });
            console.log(response.data.message);
            fetchGameState(); // Refresh the game state after treating
        } catch (error) {
            console.error("Error treating disease:", error);
        }
    };

    // ✅ Function to trigger an outbreak
    const triggerOutbreak = async () => {
        try {
            const response = await axios.post(`${API_URL}/outbreak`);
            console.log(response.data.message);
            fetchGameState(); // Refresh game state after outbreak
        } catch (error) {
            console.error("Error triggering outbreak:", error);
        }
    };

    if (!gameState || !gameState.cities || Object.keys(gameState.cities).length === 0) {
        return <div className="loading">Loading game...</div>;
    }

    return (
        <div className="game-container">
            <h1>Pandemic Game</h1>
            <div className="game-info">
                <h2>Outbreaks: {gameState.markers.outbreaks} / 8</h2>
                <h2>Cures Discovered: {Object.values(gameState.markers.cureMarkers).filter(Boolean).length}</h2>
                <h2>Eradicated Diseases: {Object.entries(gameState.markers.eradicated)
                    .filter(([_, isEradicated]) => isEradicated)
                    .map(([color]) => color)
                    .join(", ") || "None"}
                </h2>
            </div>

            <div className="game-board">
                {/* ✅ Render Connections First */}
                {Object.keys(gameState.cities).flatMap((city) => {
                    const cityData = gameState.cities[city];
                    const position = cityPositions[city];

                    if (!position) return [];

                    return cityData.connectedCities.map((connectedCity) => {
                        const connectedPosition = cityPositions[connectedCity];
                        if (!connectedPosition) return null;

                        let className = "connection";
                        let adjustedX = position.x + 10; // ✅ Center line at city
                        let adjustedY = position.y + 10; // ✅ Center line at city
                        let adjustedWidth = 0;
                        let adjustedRotation = 0;

                        // ✅ Detect wrap-around connections and adjust accordingly
                        if (
                            (city === "Sydney" && connectedCity === "Los Angeles") ||
                            (city === "Tokyo" && connectedCity === "San Francisco") ||
                            (city === "Manila" && connectedCity === "San Francisco")
                        ) {
                            className += " connection-wrap-right"; // Arrow pointing right
                            adjustedX = position.x + 10; // Offset to center the start
                            adjustedWidth = 100; // Wrap distance
                            adjustedRotation = 0; // Horizontal arrow
                        } else if (
                            (city === "Los Angeles" && connectedCity === "Sydney") ||
                            (city === "San Francisco" && connectedCity === "Tokyo") ||
                            (city === "San Francisco" && connectedCity === "Manila")
                        ) {
                            className += " connection-wrap-left"; // Arrow pointing left
                            adjustedX = position.x - 10; // Offset to center the start
                            adjustedWidth = 100;
                            adjustedRotation = 0;
                        } else {
                            // Regular connection
                            const dx = connectedPosition.x - position.x;
                            const dy = connectedPosition.y - position.y;
                            adjustedWidth = Math.sqrt(dx * dx + dy * dy);
                            adjustedRotation = Math.atan2(dy, dx) * (180 / Math.PI);
                        }

                        return (
                            <div
                                key={`${city}-${connectedCity}`}
                                className={className}
                                style={{
                                    left: `${adjustedX}px`,
                                    top: `${adjustedY}px`,
                                    width: `${adjustedWidth}px`,
                                    transform: `rotate(${adjustedRotation}deg)`,
                                }}
                            ></div>
                        );
                    });
                })}

                {/* ✅ Render Cities - Ensure They Are Centered on Their Connections */}
                {Object.keys(gameState.cities).map((city) => {
                    const position = cityPositions[city];

                    if (!position) {
                        console.warn(`⚠️ No position found for city: ${city}`);
                        return null;
                    }

                    return (
                        <div
                            key={city}
                            className={`city ${position.color}`}
                            style={{
                                left: `${position.x - 10}px`, // ✅ Center city on connection lines
                                top: `${position.y - 10}px`, // ✅ Center city on connection lines
                                background: position.color,
                                color: position.color === "yellow" ? "black" : "white",
                                position: "absolute",
                                zIndex: 1, // Ensure cities are above lines
                            }}
                            onClick={() => setSelectedCity(city)}
                        >
                            {city}
                        </div>
                    );
                })}
            </div>

                




            <div className="controls">
                <h3>Selected City: {selectedCity || 'None'}</h3>
                <button 
                    onClick={treatDisease} 
                    disabled={!selectedCity || gameState.cities[selectedCity].infectionLevel === 0}
                >
                    Treat Disease
                </button>
                <button onClick={triggerOutbreak} disabled={gameState.markers.outbreaks >= 8}>
                    Trigger Outbreak
                </button>
                <button onClick={() => console.log("Move action")} disabled={!selectedCity}>Move Here</button>
                <button onClick={() => console.log("Build action")} disabled={!selectedCity}>Build Research Station</button>
            </div>
        </div>
    );
};

export default GameBoard;
