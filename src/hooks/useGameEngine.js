import { useState, useEffect, useCallback, useRef } from 'react';
import { GameEngine, LEVELS } from '../game/GameEngine';

export function useGameEngine(initialLevel = 1) {
  const [gameState, setGameState] = useState({
    grid: [],
    robot: { x: 0, y: 0, direction: 'east' },
    inventory: [],
    applesCollected: 0,
    totalApples: 0,
    isRunning: false
  });

  const [level, setLevel] = useState(initialLevel);
  const [logs, setLogs] = useState([]);
  const engineRef = useRef(null);

  useEffect(() => {
    // Инициализируем игровой движок
    engineRef.current = new GameEngine(LEVELS[level]);
    
    // Подписываемся на обновления
    const unsubscribe = engineRef.current.subscribe((state) => {
      setGameState({
        ...state,
        isRunning: engineRef.current.isRunning
      });
    });

    // Получаем начальное состояние
    setGameState({
      grid: engineRef.current.grid,
      robot: engineRef.current.robot,
      inventory: engineRef.current.inventory,
      applesCollected: engineRef.current.applesCollected,
      totalApples: engineRef.current.totalApples,
      isRunning: false
    });

    return () => {
      unsubscribe();
      if (engineRef.current) {
        engineRef.current.stop();
      }
    };
  }, [level]);

  const runCode = useCallback((code) => {
    if (!engineRef.current) return;

    try {
      // Создаем безопасную функцию из кода пользователя
      const userCode = new Function('robot', `
        "use strict";
        ${code};
        return onTick;
      `);
      
      const onTick = userCode();
      
      if (typeof onTick !== 'function') {
        throw new Error('Функция onTick не найдена в коде');
      }

      engineRef.current.start(onTick);
    } catch (error) {
      console.error('Ошибка выполнения кода:', error);
      setLogs(prev => [...prev, {
        message: `Ошибка: ${error.message}`,
        timestamp: new Date().toLocaleTimeString()
      }]);
    }
  }, []);

  const stopGame = useCallback(() => {
    if (engineRef.current) {
      engineRef.current.stop();
    }
  }, []);

  const resetGame = useCallback(() => {
    if (engineRef.current) {
      engineRef.current.reset(LEVELS[level]);
    }
  }, [level]);

  const changeLevel = useCallback((newLevel) => {
    if (engineRef.current) {
      engineRef.current.stop();
    }
    setLevel(newLevel);
  }, []);

  const getRobotAPI = useCallback(() => {
    return engineRef.current ? engineRef.current.robotAPI : null;
  }, []);

  return {
    gameState,
    level,
    logs,
    runCode,
    stopGame,
    resetGame,
    changeLevel,
    getRobotAPI,
    currentLevel: LEVELS[level]
  };
}