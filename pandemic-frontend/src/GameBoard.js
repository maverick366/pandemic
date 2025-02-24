// pandemic_frontend/src/GameBoard.js
import React, { useState, useEffect } from 'react';
import axios from 'axios';
import './GameBoard.css';

const API_URL = 'http://localhost:4000';

const cityPositions = {
    'Atlanta': { x: 200, y: 300 },
    'Washington': { x: 250, y: 250 },
    'Miami': { x: 200, y: 400 },
    'New York': { x: 300, y: 200 },
    'Mexico City': { x: 150, y: 450 }
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
                {Object.keys(gameState.cities).map((city) => {
                    const position = cityPositions[city];
                    if (!position) return null;

                    return (
                        <div
                            key={city}
                            className="city"
                            style={{
                                left: `${position.x}px`,
                                top: `${position.y}px`,
                                background: getInfectionColor(gameState.cities[city].infectionLevel),
                                color: "black",
                                padding: "5px",
                                position: "absolute"
                            }}
                            onClick={() => setSelectedCity(city)}
                        >
                            {city} ({gameState.cities[city].infectionLevel})
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
