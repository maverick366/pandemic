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

    // Log when gameState updates
    useEffect(() => {
        console.log("Updated gameState:", gameState);
    }, [gameState]);

    if (!gameState || !gameState.cities || Object.keys(gameState.cities).length === 0) {
        return <div>Loading game...</div>;
    }

    return (
        <div className="game-container">
            <h1>Pandemic Game</h1>
            <div className="game-info">
                <h2>Outbreaks: {gameState.outbreaks}</h2>
                <h2>Cures Discovered: {gameState.curesDiscovered}</h2>
            </div>

            <div className="game-board">
                {Object.keys(gameState.cities).map((city) => {
                    const position = cityPositions[city];
                    if (!position) return null;

                    console.log("Rendering city:", city, gameState.cities[city]); // Debugging

                    return (
                        <div
                            key={city}
                            className="city"
                            style={{
                                left: `${position.x}px`,
                                top: `${position.y}px`,
                                background: "blue",
                                color: "white",
                                padding: "5px",
                                position: "absolute"
                            }}
                        >
                            {city}
                        </div>
                    );
                })}
            </div>

            <div className="controls">
                <h3>Selected City: {selectedCity || 'None'}</h3>
                <button onClick={() => console.log("Move action")} disabled={!selectedCity}>Move Here</button>
                <button onClick={() => console.log("Treat action")} disabled={!selectedCity}>Treat Disease</button>
                <button onClick={() => console.log("Build action")} disabled={!selectedCity}>Build Research Station</button>
            </div>
        </div>
    );
};

export default GameBoard;
