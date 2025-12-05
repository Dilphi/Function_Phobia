import { useState, useRef, useEffect } from 'react';

// Типы клеток
export const CELL_TYPES = {
  EMPTY: 'empty',
  WALL: 'wall',
  APPLE: 'apple',
  WHEAT: 'wheat',
  ROCK: 'rock',
  ROBOT: 'robot'
};

// Направления
export const DIRECTIONS = {
  NORTH: 'north',
  EAST: 'east',
  SOUTH: 'south',
  WEST: 'west'
};

export class GameEngine {
  constructor(levelConfig) {
    this.grid = levelConfig.grid || this.createEmptyGrid(10, 10);
    this.robot = levelConfig.robot || { x: 0, y: 0, direction: DIRECTIONS.EAST };
    this.inventory = [];
    this.isRunning = false;
    this.tickInterval = null;
    this.tickDuration = 1000; // 1 секунда между тиками
    this.listeners = [];
    this.goal = levelConfig.goal || 'collectAllApples';
    this.applesCollected = 0;
    this.totalApples = this.countApples();
  }

  createEmptyGrid(width, height) {
    return Array(height).fill().map(() => 
      Array(width).fill(CELL_TYPES.EMPTY)
    );
  }

  countApples() {
    let count = 0;
    for (let y = 0; y < this.grid.length; y++) {
      for (let x = 0; x < this.grid[y].length; x++) {
        if (this.grid[y][x] === CELL_TYPES.APPLE) count++;
      }
    }
    return count;
  }

  // API для робота (будет доступно в коде игрока)
  robotAPI = {
    move: (direction) => this.moveRobot(direction),
    turn: (direction) => this.turnRobot(direction),
    sense: (direction) => this.sense(direction),
    collect: () => this.collectItem(),
    drop: () => this.dropItem(),
    getInventory: () => [...this.inventory],
    getPosition: () => ({ ...this.robot }),
    say: (message) => this.addLog(message)
  };

  moveRobot(direction) {
    const newPos = this.calculateNewPosition(direction);
    
    // Проверяем границы
    if (!this.isInBounds(newPos.x, newPos.y)) {
      this.addLog(`Не могу двигаться: достигнута граница мира`);
      return false;
    }

    // Проверяем препятствия
    if (this.grid[newPos.y][newPos.x] === CELL_TYPES.WALL) {
      this.addLog(`Не могу двигаться: здесь стена`);
      return false;
    }

    // Двигаем робота
    this.robot.x = newPos.x;
    this.robot.y = newPos.y;
    this.addLog(`Робот переместился на (${newPos.x}, ${newPos.y})`);
    
    // Собираем предметы на новой клетке
    this.collectIfPossible();
    
    this.notifyListeners();
    return true;
  }

  turnRobot(direction) {
    const directions = [DIRECTIONS.NORTH, DIRECTIONS.EAST, DIRECTIONS.SOUTH, DIRECTIONS.WEST];
    const currentIndex = directions.indexOf(this.robot.direction);
    
    let newIndex;
    if (direction === 'left') {
      newIndex = (currentIndex - 1 + 4) % 4;
    } else if (direction === 'right') {
      newIndex = (currentIndex + 1) % 4;
    } else {
      this.addLog(`Неизвестное направление: ${direction}`);
      return;
    }
    
    this.robot.direction = directions[newIndex];
    this.addLog(`Робот повернул на ${direction}, теперь смотрит на ${this.robot.direction}`);
    this.notifyListeners();
  }

  calculateNewPosition(direction) {
    const { x, y } = this.robot;
    let newX = x, newY = y;

    const moveDirection = direction || this.robot.direction;

    switch (moveDirection) {
      case DIRECTIONS.NORTH:
        newY--;
        break;
      case DIRECTIONS.EAST:
        newX++;
        break;
      case DIRECTIONS.SOUTH:
        newY++;
        break;
      case DIRECTIONS.WEST:
        newX--;
        break;
    }

    return { x: newX, y: newY };
  }

  sense(direction) {
    const pos = this.calculateNewPosition(direction || this.robot.direction);
    
    if (!this.isInBounds(pos.x, pos.y)) {
      return 'wall';
    }
    
    const cell = this.grid[pos.y][pos.x];
    
    // Преобразуем внутренний тип в понятное описание
    switch (cell) {
      case CELL_TYPES.EMPTY:
        return 'пусто';
      case CELL_TYPES.WALL:
        return 'стена';
      case CELL_TYPES.APPLE:
        return 'яблоко';
      case CELL_TYPES.WHEAT:
        return 'пшеница';
      case CELL_TYPES.ROCK:
        return 'камень';
      default:
        return 'неизвестно';
    }
  }

  collectIfPossible() {
    const cell = this.grid[this.robot.y][this.robot.x];
    
    if (cell === CELL_TYPES.APPLE || cell === CELL_TYPES.WHEAT) {
      this.collectItem();
    }
  }

  collectItem() {
    const cell = this.grid[this.robot.y][this.robot.x];
    
    if (cell === CELL_TYPES.APPLE || cell === CELL_TYPES.WHEAT || cell === CELL_TYPES.ROCK) {
      this.inventory.push(cell);
      this.grid[this.robot.y][this.robot.x] = CELL_TYPES.EMPTY;
      
      if (cell === CELL_TYPES.APPLE) {
        this.applesCollected++;
        this.addLog(`Собрано яблоко! Всего собрано: ${this.applesCollected}/${this.totalApples}`);
        
        // Проверяем условие победы
        if (this.applesCollected >= this.totalApples) {
          this.addLog('🎉 Победа! Все яблоки собраны!');
          this.stop();
        }
      } else {
        this.addLog(`Собран предмет: ${cell}`);
      }
      
      this.notifyListeners();
      return true;
    }
    
    this.addLog('Здесь нечего собирать');
    return false;
  }

  dropItem() {
    if (this.inventory.length === 0) {
      this.addLog('Инвентарь пуст');
      return false;
    }
    
    const cell = this.grid[this.robot.y][this.robot.x];
    if (cell !== CELL_TYPES.EMPTY) {
      this.addLog('Нельзя положить предмет: клетка занята');
      return false;
    }
    
    const item = this.inventory.pop();
    this.grid[this.robot.y][this.robot.x] = item;
    this.addLog(`Предмет ${item} положен на землю`);
    
    this.notifyListeners();
    return true;
  }

  isInBounds(x, y) {
    return x >= 0 && x < this.grid[0].length && y >= 0 && y < this.grid.length;
  }

  addLog(message) {
    const logEntry = { message, timestamp: new Date().toLocaleTimeString() };
    console.log(logEntry);
    // Можно сохранять логи в state если нужно
  }

  subscribe(listener) {
    this.listeners.push(listener);
    return () => {
      this.listeners = this.listeners.filter(l => l !== listener);
    };
  }

  notifyListeners() {
    this.listeners.forEach(listener => listener({
      grid: this.grid,
      robot: this.robot,
      inventory: this.inventory,
      applesCollected: this.applesCollected,
      totalApples: this.totalApples
    }));
  }

  start(onTickCallback) {
    if (this.isRunning) return;
    
    this.isRunning = true;
    this.addLog('Игра началась!');
    
    this.tickInterval = setInterval(() => {
      try {
        // Вызываем код игрока
        if (typeof onTickCallback === 'function') {
          onTickCallback(this.robotAPI);
        }
      } catch (error) {
        this.addLog(`Ошибка в коде: ${error.message}`);
        console.error(error);
      }
    }, this.tickDuration);
  }

  stop() {
    if (this.tickInterval) {
      clearInterval(this.tickInterval);
      this.tickInterval = null;
    }
    this.isRunning = false;
    this.addLog('Игра остановлена');
    this.notifyListeners();
  }

  reset(levelConfig) {
    this.stop();
    this.grid = levelConfig.grid;
    this.robot = levelConfig.robot;
    this.inventory = [];
    this.applesCollected = 0;
    this.totalApples = this.countApples();
    this.notifyListeners();
  }
}

// Уровни игры
export const LEVELS = {
  1: {
    title: 'Движение к цели',
    description: 'Передвинь робота к яблоку',
    grid: [
      ['empty', 'empty', 'empty', 'empty', 'empty'],
      ['empty', 'wall', 'wall', 'wall', 'empty'],
      ['empty', 'wall', 'apple', 'wall', 'empty'],
      ['empty', 'wall', 'wall', 'wall', 'empty'],
      ['empty', 'empty', 'empty', 'empty', 'empty']
    ],
    robot: { x: 0, y: 0, direction: DIRECTIONS.EAST },
    goal: 'collectAllApples'
  },
  2: {
    title: 'Сбор ресурсов',
    description: 'Собери все яблоки на поле',
    grid: [
      ['empty', 'apple', 'empty', 'apple', 'empty'],
      ['empty', 'empty', 'empty', 'empty', 'empty'],
      ['apple', 'empty', 'wall', 'empty', 'apple'],
      ['empty', 'empty', 'empty', 'empty', 'empty'],
      ['empty', 'apple', 'empty', 'apple', 'empty']
    ],
    robot: { x: 2, y: 2, direction: DIRECTIONS.NORTH },
    goal: 'collectAllApples'
  },
  3: {
    title: 'Автоматизация фермы',
    description: 'Собери все яблоки и пшеницу',
    grid: [
      ['wheat', 'apple', 'wheat', 'apple', 'wheat'],
      ['empty', 'empty', 'wall', 'empty', 'empty'],
      ['apple', 'wall', 'empty', 'wall', 'apple'],
      ['empty', 'empty', 'wall', 'empty', 'empty'],
      ['wheat', 'apple', 'wheat', 'apple', 'wheat']
    ],
    robot: { x: 0, y: 0, direction: DIRECTIONS.EAST },
    goal: 'collectAllApples'
  }
};