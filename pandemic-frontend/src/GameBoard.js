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

const GameBoard = () => {
    const [gameState, setGameState] = useState(null);
    const [selectedCity, setSelectedCity] = useState('');

    useEffect(() => {
        fetchGameState();
    }, []);

    const fetchGameState = async () => {
        try {
            const response = await axios.get(`${API_URL}/game-state`);
            setGameState(response.data);
        } catch (error) {
            console.error('Error fetching game state:', error);
        }
    };

    const treatDisease = async () => {
        if (!selectedCity) return;
        try {
            await axios.post(`${API_URL}/treat-disease`, { city: selectedCity });
            fetchGameState(); // Refresh the game state after treating
        } catch (error) {
            console.error('Error treating disease:', error);
        }
    };

    const movePlayer = async () => {
        if (!selectedCity) return;
        try {
            await axios.post(`${API_URL}/move-player`, { city: selectedCity });
            fetchGameState(); // Refresh game state after moving
        } catch (error) {
            console.error('Error moving player:', error);
        }
    };

    const buildResearchStation = async () => {
        if (!selectedCity) return;
        try {
            await axios.post(`${API_URL}/build-research-station`, { city: selectedCity });
            fetchGameState(); // Refresh game state after building
        } catch (error) {
            console.error('Error building research station:', error);
        }
    };


    if (!gameState) return <div>Loading game...</div>;

    return (
        <div className="game-container">
            <h1>Pandemic Game</h1>
            <div className="game-info">
                <h2>Outbreaks: {gameState.markers.outbreaks}</h2>
            </div>

            {/* Game Board with Cities and Connections */}
            <div className="game-board">
                {/* Draw Connection Lines */}
                {Object.keys(gameState.cities).flatMap((city) => {
                    const cityData = gameState.cities[city];
                    const position = cityPositions[city];

                    if (!position || !cityData.connectedCities) return [];

                    return cityData.connectedCities
                        .filter(connectedCity => 
                            !(
                                (city === "Los Angeles" && connectedCity === "Sydney") ||
                                (city === "Sydney" && connectedCity === "Los Angeles") ||
                                (city === "San Francisco" && connectedCity === "Manila") ||
                                (city === "Manila" && connectedCity === "San Francisco") ||
                                (city === "San Francisco" && connectedCity === "Tokyo") ||
                                (city === "Tokyo" && connectedCity === "San Francisco")
                            )
                        )
                        .map((connectedCity) => {
                            const connectedPosition = cityPositions[connectedCity];
                            if (!connectedPosition) return null;

                            return (
                                <svg key={`${city}-${connectedCity}`} className="game-board-svg">
                                    <line
                                        x1={position.x}
                                        y1={position.y}
                                        x2={connectedPosition.x}
                                        y2={connectedPosition.y}
                                        className="connection-line"
                                    />
                                </svg>
                            );
                        });
                })}

                {/* Draw Cities */}
                {Object.keys(gameState.cities).map((city) => {
                    const cityData = gameState.cities[city];
                    const position = cityPositions[city];

                    if (!position) return null;

                    return (
                        <div
                key={city}
                className={`city ${position.color}`} // ✅ Ensure color is applied from cityPositions
                style={{ left: position.x, top: position.y, backgroundColor: position.color }}
                onClick={() => setSelectedCity(city)}
            >
                                        {city}
                                        <div className="infection">
                                            Infections: {cityData.infectionLevel}
                                        </div>
                                    </div>
                                );
                            })}
                        </div>

            {/* Controls */}
            <div className="controls">
                <h3>Selected City: {selectedCity || 'None'}</h3>
                <button 
                    onClick={treatDisease} 
                    disabled={!selectedCity || gameState.cities[selectedCity].infectionLevel === 0}>
                    Treat Disease
                </button>
                <button onClick={() => movePlayer()} disabled={!selectedCity}>Move Here</button>
                <button onClick={() => buildResearchStation()} disabled={!selectedCity}>Build Research Station</button>

            </div>
        </div>
    );
};

export default GameBoard;
