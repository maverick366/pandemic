// pandemic_frontend/src/GameBoard.js
import React, { useState, useEffect } from 'react';
import axios from 'axios';
import './GameBoard.css';

const API_URL = 'http://localhost:4000';

const SCALE_FACTOR = 2; // Increase map size by 50%

const cityPositions = {
    // 🔵 BLUE CITIES
    "San Francisco": { x: 100 * SCALE_FACTOR, y: 200 * SCALE_FACTOR, color: "blue" },
    "Chicago": { x: 150 * SCALE_FACTOR, y: 150 * SCALE_FACTOR, color: "blue" },
    "Atlanta": { x: 200 * SCALE_FACTOR, y: 200 * SCALE_FACTOR, color: "blue" },
    "Montreal": { x: 250 * SCALE_FACTOR, y: 150 * SCALE_FACTOR, color: "blue" },
    "Washington": { x: 300 * SCALE_FACTOR, y: 180 * SCALE_FACTOR, color: "blue" },
    "New York": { x: 350 * SCALE_FACTOR, y: 160 * SCALE_FACTOR, color: "blue" },
    "London": { x: 400 * SCALE_FACTOR, y: 120 * SCALE_FACTOR, color: "blue" },
    "Madrid": { x: 420 * SCALE_FACTOR, y: 160 * SCALE_FACTOR, color: "blue" },
    "Paris": { x: 460 * SCALE_FACTOR, y: 140 * SCALE_FACTOR, color: "blue" },
    "Essen": { x: 480 * SCALE_FACTOR, y: 100 * SCALE_FACTOR, color: "blue" },
    "Milan": { x: 500 * SCALE_FACTOR, y: 140 * SCALE_FACTOR, color: "blue" },
    "St. Petersburg": { x: 520 * SCALE_FACTOR, y: 80 * SCALE_FACTOR, color: "blue" },

    // 🟡 YELLOW CITIES
    "Los Angeles": { x: 120 * SCALE_FACTOR, y: 300 * SCALE_FACTOR, color: "yellow" },
    "Mexico City": { x: 170 * SCALE_FACTOR, y: 350 * SCALE_FACTOR, color: "yellow" },
    "Miami": { x: 240 * SCALE_FACTOR, y: 340 * SCALE_FACTOR, color: "yellow" },
    "Bogotá": { x: 220 * SCALE_FACTOR, y: 400 * SCALE_FACTOR, color: "yellow" },
    "Lima": { x: 180 * SCALE_FACTOR, y: 450 * SCALE_FACTOR, color: "yellow" },
    "Santiago": { x: 200 * SCALE_FACTOR, y: 500 * SCALE_FACTOR, color: "yellow" },
    "Buenos Aires": { x: 240 * SCALE_FACTOR, y: 480 * SCALE_FACTOR, color: "yellow" },
    "Sao Paulo": { x: 300 * SCALE_FACTOR, y: 460 * SCALE_FACTOR, color: "yellow" },
    "Lagos": { x: 360 * SCALE_FACTOR, y: 400 * SCALE_FACTOR, color: "yellow" },
    "Kinshasa": { x: 380 * SCALE_FACTOR, y: 440 * SCALE_FACTOR, color: "yellow" },
    "Johannesburg": { x: 420 * SCALE_FACTOR, y: 480 * SCALE_FACTOR, color: "yellow" },
    "Khartoum": { x: 400 * SCALE_FACTOR, y: 400 * SCALE_FACTOR, color: "yellow" },

    // ⚫ BLACK CITIES
    "Moscow": { x: 540 * SCALE_FACTOR, y: 90 * SCALE_FACTOR, color: "black" },
    "Istanbul": { x: 520 * SCALE_FACTOR, y: 130 * SCALE_FACTOR, color: "black" },
    "Baghdad": { x: 550 * SCALE_FACTOR, y: 170 * SCALE_FACTOR, color: "black" },
    "Cairo": { x: 500 * SCALE_FACTOR, y: 190 * SCALE_FACTOR, color: "black" },
    "Algiers": { x: 470 * SCALE_FACTOR, y: 170 * SCALE_FACTOR, color: "black" },
    "Tehran": { x: 570 * SCALE_FACTOR, y: 120 * SCALE_FACTOR, color: "black" },
    "Karachi": { x: 600 * SCALE_FACTOR, y: 200 * SCALE_FACTOR, color: "black" },
    "Riyadh": { x: 560 * SCALE_FACTOR, y: 220 * SCALE_FACTOR, color: "black" },
    "Delhi": { x: 620 * SCALE_FACTOR, y: 180 * SCALE_FACTOR, color: "black" },
    "Mumbai": { x: 610 * SCALE_FACTOR, y: 220 * SCALE_FACTOR, color: "black" },
    "Kolkata": { x: 660 * SCALE_FACTOR, y: 170 * SCALE_FACTOR, color: "black" },
    "Chennai": { x: 650 * SCALE_FACTOR, y: 220 * SCALE_FACTOR, color: "black" },

    // 🔴 RED CITIES (Now all 12 are included!)
    "Beijing": { x: 700 * SCALE_FACTOR, y: 100 * SCALE_FACTOR, color: "red" },
    "Seoul": { x: 740 * SCALE_FACTOR, y: 110 * SCALE_FACTOR, color: "red" },
    "Shanghai": { x: 720 * SCALE_FACTOR, y: 140 * SCALE_FACTOR, color: "red" },
    "Hong Kong": { x: 720 * SCALE_FACTOR, y: 180 * SCALE_FACTOR, color: "red" },
    "Taipei": { x: 750 * SCALE_FACTOR, y: 190 * SCALE_FACTOR, color: "red" },
    "Tokyo": { x: 780 * SCALE_FACTOR, y: 130 * SCALE_FACTOR, color: "red" },
    "Manila": { x: 770 * SCALE_FACTOR, y: 230 * SCALE_FACTOR, color: "red" },
    "Sydney": { x: 820 * SCALE_FACTOR, y: 350 * SCALE_FACTOR, color: "red" },
    "Jakarta": { x: 680 * SCALE_FACTOR, y: 260 * SCALE_FACTOR, color: "red" },
    "Bangkok": { x: 660 * SCALE_FACTOR, y: 240 * SCALE_FACTOR, color: "red" },
    "Ho Chi Minh City": { x: 690 * SCALE_FACTOR, y: 280 * SCALE_FACTOR, color: "red" },
    "Osaka": { x: 800 * SCALE_FACTOR, y: 150 * SCALE_FACTOR, color: "red" }
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
            let adjustedX = position.x + 10;
            let adjustedY = position.y + 10;
            let adjustedWidth = 0;
            let adjustedRotation = 0;

            // ✅ Wrap-around: Sydney ↔ Los Angeles
            if (city === "Sydney" && connectedCity === "Los Angeles") {
                className += " connection-wrap-right";
                return (
                    <div
                        key={`${city}-${connectedCity}`}
                        className={className}
                        style={{
                            left: `${position.x + 20}px`,
                            top: `${position.y}px`,
                            width: `100px`,
                            transform: `rotate(0deg)`,
                        }}
                    ></div>
                );
            } else if (city === "Los Angeles" && connectedCity === "Sydney") {
                className += " connection-wrap-left";
                return (
                    <div
                        key={`${city}-${connectedCity}`}
                        className={className}
                        style={{
                            left: `${position.x - 120}px`,
                            top: `${position.y}px`,
                            width: `100px`,
                            transform: `rotate(0deg)`,
                        }}
                    ></div>
                );
            }
            // ✅ Wrap-around: Tokyo ↔ San Francisco
            else if (city === "Tokyo" && connectedCity === "San Francisco") {
                className += " connection-wrap-right";
                return (
                    <div
                        key={`${city}-${connectedCity}`}
                        className={className}
                        style={{
                            left: `${position.x + 20}px`,
                            top: `${position.y}px`,
                            width: `100px`,
                            transform: `rotate(0deg)`,
                        }}
                    ></div>
                );
            } else if (city === "San Francisco" && connectedCity === "Tokyo") {
                className += " connection-wrap-left";
                return (
                    <div
                        key={`${city}-${connectedCity}`}
                        className={className}
                        style={{
                            left: `${position.x - 120}px`,
                            top: `${position.y}px`,
                            width: `100px`,
                            transform: `rotate(0deg)`,
                        }}
                    ></div>
                );
            }
            // ✅ Wrap-around: Manila ↔ San Francisco
            else if (city === "Manila" && connectedCity === "San Francisco") {
                className += " connection-wrap-right"; // ✅ Arrow pointing right
                return (
                    <div
                        key={`${city}-${connectedCity}`}
                        className={className}
                        style={{
                            left: `${position.x + 20}px`,
                            top: `${position.y}px`,
                            width: `100px`,
                            transform: `rotate(0deg)`,
                        }}
                    ></div>
                );
            } else if (city === "San Francisco" && connectedCity === "Manila") {
                className += " connection-wrap-left"; // ✅ Arrow pointing left
                return (
                    <div
                        key={`${city}-${connectedCity}`}
                        className={className}
                        style={{
                            left: `${position.x - 120}px`,
                            top: `${position.y}px`,
                            width: `100px`,
                            transform: `rotate(0deg)`,
                        }}
                    ></div>
                );
            }
            // ✅ Regular connections
            else {
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

    {/* ✅ Render Cities */}
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
                    left: `${position.x}px`,
                    top: `${position.y}px`,
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
