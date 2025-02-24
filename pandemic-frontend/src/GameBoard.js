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
            setGameState(response.data);
        } catch (error) {
            console.error('Error fetching game state:', error);
        }
    };
    
    const handleAction = async (action) => {
        if (!selectedCity) return;
        try {
            await axios.post(`${API_URL}/action`, {
                player: 'Player 1',
                action,
                city: selectedCity,
            });
            fetchGameState(); // Refresh game state
        } catch (error) {
            console.error('Error performing action:', error);
        }
    };
    
    console.log("Game State Data:", gameState);
    console.log("City Positions Data:", cityPositions);
    console.log("Cities in State:", gameState?.cities ? Object.keys(gameState.cities) : "No cities found");


    if (!gameState) return <div>Loading game...</div>;
    
    return (
        <div className="game-container">
            <h1>Pandemic Game - Test Update</h1>
            <div className="game-info">
                <h2>Outbreaks: {gameState.outbreaks}</h2>
                <h2>Cures Discovered: {gameState.curesDiscovered}</h2>
            </div>
            
            <div className="game-board">
                {Object.keys(gameState.cities).map((city) => {
                    const position = cityPositions[city];
                    if (!position) return null; // Skip cities without positions

                    return (
                        <div 
                            key={city} 
                            className="city" 
                            style={{ left: `${position.x}px`, top: `${position.y}px` }}
                            onClick={() => setSelectedCity(city)}
                        >
                            {city}
                            <div className="infection">Infections: {gameState.cities[city].infectionLevel}</div>
                        </div>
                    );
                })}

            </div>
            
            <div className="controls">
                <h3>Selected City: {selectedCity || 'None'}</h3>
                <button onClick={() => handleAction('move')} disabled={!selectedCity}>Move Here</button>
                <button onClick={() => handleAction('treat')} disabled={!selectedCity}>Treat Disease</button>
                <button onClick={() => handleAction('build')} disabled={!selectedCity}>Build Research Station</button>
            </div>
        </div>
    );
};

export default GameBoard;
