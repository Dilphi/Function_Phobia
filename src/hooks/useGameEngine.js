import { useState, useEffect, useCallback, useRef } from 'react';
import { GameEngine, LEVELS } from '../game/GameEngine';

export function useGameEngine(initialLevel = 1) {
  const [gameState, setGameState] = useState({
    grid: [],
    robot: { x: 0, y: 0, direction: 'east' },
    inventory: [],
    applesCollected: 0,
    totalApples: 0,
    isRunning: false,
    logs: []
  });

  const [level, setLevel] = useState(initialLevel);
  const engineRef = useRef(null);

  useEffect(() => {
    // Инициализируем игровой движок
    console.log('Initializing game engine with level:', level);
    engineRef.current = new GameEngine(LEVELS[level]);
    
    // Подписываемся на обновления
    const unsubscribe = engineRef.current.subscribe((state) => {
      console.log('Game state update received:', state);
      setGameState({
        ...state,
        isRunning: engineRef.current?.isRunning || false
      });
    });

    // Получаем начальное состояние
    const initialState = {
      grid: engineRef.current.grid,
      robot: engineRef.current.robot,
      inventory: engineRef.current.inventory,
      applesCollected: engineRef.current.applesCollected,
      totalApples: engineRef.current.totalApples,
      isRunning: false,
      logs: engineRef.current.logs
    };
    console.log('Setting initial state:', initialState);
    setGameState(initialState);

    return () => {
      unsubscribe();
      if (engineRef.current) {
        engineRef.current.stop();
      }
    };
  }, [level]);

  const runCode = useCallback((code) => {
    if (!engineRef.current) {
      console.error('Game engine not initialized');
      return;
    }
    
    console.log('runCode called with:', code.substring(0, 100) + '...');
    
    try {
      // В новом GameEngine start принимает строку с кодом
      engineRef.current.start(code);
      console.log('Game started successfully');
    } catch (error) {
      console.error('Ошибка запуска кода:', error);
      // Добавляем ошибку в логи через сам движок
      if (engineRef.current) {
        engineRef.current.addLog(`Ошибка запуска: ${error.message}`);
      }
    }
  }, []);

  const stopGame = useCallback(() => {
    console.log('stopGame called');
    if (engineRef.current) {
      engineRef.current.stop();
    }
  }, []);

  const resetGame = useCallback(() => {
    console.log('resetGame called for level:', level);
    if (engineRef.current) {
      engineRef.current.reset(LEVELS[level]);
    }
  }, [level]);

  const changeLevel = useCallback((newLevel) => {
    console.log('changeLevel called:', newLevel);
    if (engineRef.current) {
      engineRef.current.stop();
    }
    setLevel(newLevel);
  }, []);

  return {
    gameState,
    level,
    runCode,
    stopGame,
    resetGame,
    changeLevel,
    currentLevel: LEVELS[level]
  };
}