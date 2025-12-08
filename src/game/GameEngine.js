// Типы клеток
export const CELL_TYPES = {
  EMPTY: 'empty',
  WALL: 'wall',
  APPLE: 'apple',
  WHEAT: 'wheat',
  ROCK: 'rock',
};

// Направления
export const DIRECTIONS = {
  NORTH: 'north',
  EAST: 'east',
  SOUTH: 'south',
  WEST: 'west'
};

// Простой и безопасный интерпретатор
export class GameEngine {
  constructor(levelConfig) {
    this.grid = levelConfig.grid || this.createEmptyGrid(5, 5);
    this.robot = { 
      x: levelConfig.robot.x || 0, 
      y: levelConfig.robot.y || 0, 
      direction: levelConfig.robot.direction || DIRECTIONS.EAST 
    };
    this.inventory = [];
    this.isRunning = false;
    this.tickInterval = null;
    this.tickDuration = 500; // 0.5 секунды между тиками
    this.listeners = [];
    this.applesCollected = 0;
    this.totalApples = this.countApples();
    this.logs = [];
    
    // Инициализируем API робота
    this.initRobotAPI();
  }

  initRobotAPI() {
    this.robotAPI = {
      move: (direction) => {
        console.log('move called with:', direction);
        return this.moveRobot(direction);
      },
      turn: (direction) => {
        console.log('turn called with:', direction);
        return this.turnRobot(direction);
      },
      sense: (direction) => {
        console.log('sense called with:', direction);
        return this.sense(direction);
      },
      collect: () => {
        console.log('collect called');
        return this.collectItem();
      },
      drop: () => this.dropItem(),
      getInventory: () => [...this.inventory],
      getPosition: () => ({ ...this.robot }),
      say: (message) => this.addLog(message)
    };
  }

  createEmptyGrid(width, height) {
    const grid = [];
    for (let y = 0; y < height; y++) {
      const row = [];
      for (let x = 0; x < width; x++) {
        row.push(CELL_TYPES.EMPTY);
      }
      grid.push(row);
    }
    return grid;
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

  moveRobot(direction) {
    console.log('Current robot position:', this.robot);
    console.log('Move direction:', direction);
    
    // Определяем куда двигаться
    let newX = this.robot.x;
    let newY = this.robot.y;
    
    // Преобразуем текстовое направление в относительное движение
    const dirMap = {
      'forward': this.robot.direction,
      'вперед': this.robot.direction,
      'backward': this.getOppositeDirection(this.robot.direction),
      'назад': this.getOppositeDirection(this.robot.direction),
      'left': this.getLeftDirection(this.robot.direction),
      'влево': this.getLeftDirection(this.robot.direction),
      'right': this.getRightDirection(this.robot.direction),
      'вправо': this.getRightDirection(this.robot.direction)
    };
    
    const actualDirection = dirMap[direction] || direction || this.robot.direction;
    console.log('Actual direction:', actualDirection);

    // Рассчитываем новую позицию
    switch (actualDirection) {
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
      default:
        // Если передано абсолютное направление напрямую
        if (Object.values(DIRECTIONS).includes(direction)) {
          switch (direction) {
            case DIRECTIONS.NORTH: newY--; break;
            case DIRECTIONS.EAST: newX++; break;
            case DIRECTIONS.SOUTH: newY++; break;
            case DIRECTIONS.WEST: newX--; break;
          }
        }
    }

    console.log('New position:', { x: newX, y: newY });

    // Проверяем границы
    if (!this.isInBounds(newX, newY)) {
      this.addLog(`Не могу двигаться: граница мира`);
      return false;
    }

    // Проверяем препятствия
    if (this.grid[newY][newX] === CELL_TYPES.WALL) {
      this.addLog(`Не могу двигаться: здесь стена`);
      return false;
    }

    // Двигаем робота
    this.robot.x = newX;
    this.robot.y = newY;
    
    // Обновляем направление робота, если двигались по абсолютным направлениям
    if (Object.values(DIRECTIONS).includes(direction)) {
      this.robot.direction = direction;
    }
    
    this.addLog(`Робот переместился на (${newX}, ${newY})`);
    
    // Собираем предметы на новой клетке
    this.collectIfPossible();
    this.notifyListeners();
    return true;
  }

  turnRobot(direction) {
    const directions = [DIRECTIONS.NORTH, DIRECTIONS.EAST, DIRECTIONS.SOUTH, DIRECTIONS.WEST];
    const currentIndex = directions.indexOf(this.robot.direction);
    
    let newIndex;
    if (direction === 'left' || direction === 'влево' || direction === 'налево') {
      newIndex = (currentIndex - 1 + 4) % 4;
    } else if (direction === 'right' || direction === 'вправо' || direction === 'направо') {
      newIndex = (currentIndex + 1) % 4;
    } else {
      this.addLog(`Неизвестное направление: ${direction}`);
      return;
    }
    
    this.robot.direction = directions[newIndex];
    this.addLog(`Робот повернул ${direction}, теперь смотрит на ${this.robot.direction}`);
    this.notifyListeners();
  }

  getOppositeDirection(dir) {
    switch (dir) {
      case DIRECTIONS.NORTH: return DIRECTIONS.SOUTH;
      case DIRECTIONS.EAST: return DIRECTIONS.WEST;
      case DIRECTIONS.SOUTH: return DIRECTIONS.NORTH;
      case DIRECTIONS.WEST: return DIRECTIONS.EAST;
      default: return dir;
    }
  }

  getLeftDirection(dir) {
    switch (dir) {
      case DIRECTIONS.NORTH: return DIRECTIONS.WEST;
      case DIRECTIONS.EAST: return DIRECTIONS.NORTH;
      case DIRECTIONS.SOUTH: return DIRECTIONS.EAST;
      case DIRECTIONS.WEST: return DIRECTIONS.SOUTH;
      default: return dir;
    }
  }

  getRightDirection(dir) {
    switch (dir) {
      case DIRECTIONS.NORTH: return DIRECTIONS.EAST;
      case DIRECTIONS.EAST: return DIRECTIONS.SOUTH;
      case DIRECTIONS.SOUTH: return DIRECTIONS.WEST;
      case DIRECTIONS.WEST: return DIRECTIONS.NORTH;
      default: return dir;
    }
  }

  sense(direction = null) {
    console.log('Sense called, robot direction:', this.robot.direction);
    
    // Определяем направление для сканирования
    let senseDirection;
    if (!direction) {
      senseDirection = this.robot.direction;
    } else {
      const dirMap = {
        'forward': this.robot.direction,
        'вперед': this.robot.direction,
        'backward': this.getOppositeDirection(this.robot.direction),
        'назад': this.getOppositeDirection(this.robot.direction),
        'left': this.getLeftDirection(this.robot.direction),
        'влево': this.getLeftDirection(this.robot.direction),
        'right': this.getRightDirection(this.robot.direction),
        'вправо': this.getRightDirection(this.robot.direction)
      };
      senseDirection = dirMap[direction] || direction;
    }
    
    console.log('Sense direction:', senseDirection);

    // Рассчитываем позицию для сканирования
    let checkX = this.robot.x;
    let checkY = this.robot.y;
    
    switch (senseDirection) {
      case DIRECTIONS.NORTH:
        checkY--;
        break;
      case DIRECTIONS.EAST:
        checkX++;
        break;
      case DIRECTIONS.SOUTH:
        checkY++;
        break;
      case DIRECTIONS.WEST:
        checkX--;
        break;
    }
    
    console.log('Check position:', { x: checkX, y: checkY });

    // Проверяем границы
    if (!this.isInBounds(checkX, checkY)) {
      return 'стена';
    }
    
    const cell = this.grid[checkY][checkX];
    console.log('Cell type:', cell);
    
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
        this.addLog(`Яблоко собрано! (${this.applesCollected}/${this.totalApples})`);
        
        if (this.applesCollected >= this.totalApples) {
          this.addLog('Все яблоки собраны! Уровень пройден!');
          this.stop();
        }
      } else {
        this.addLog(`Собрано: ${cell}`);
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
      this.addLog('Нельзя положить: клетка занята');
      return false;
    }
    
    const item = this.inventory.pop();
    this.grid[this.robot.y][this.robot.x] = item;
    this.addLog(`Положил: ${item}`);
    
    this.notifyListeners();
    return true;
  }

  isInBounds(x, y) {
    return x >= 0 && x < this.grid[0].length && y >= 0 && y < this.grid.length;
  }

  addLog(message) {
    const logEntry = { 
      message, 
      timestamp: new Date().toLocaleTimeString(),
      type: 'info'
    };
    console.log('LOG:', logEntry);
    this.logs.push(logEntry);
    if (this.logs.length > 50) this.logs.shift();
  }

  subscribe(listener) {
    this.listeners.push(listener);
    return () => {
      this.listeners = this.listeners.filter(l => l !== listener);
    };
  }

  notifyListeners() {
    const state = {
      grid: this.grid,
      robot: this.robot,
      inventory: this.inventory,
      applesCollected: this.applesCollected,
      totalApples: this.totalApples,
      logs: [...this.logs],
      isRunning: this.isRunning
    };
    
    console.log('Notifying listeners with state:', state);
    this.listeners.forEach(listener => listener(state));
  }

  async start(userCode) {
  if (this.isRunning) return;
  
  this.isRunning = true;
  this.addLog('Игра началась!');
  this.notifyListeners();
  
  // Безопасное выполнение кода
  try {
    // Создаем контекст для выполнения
    const context = {
      robot: this.robotAPI,
      console: {
        log: (...args) => this.addLog(args.join(' '))
      }
    };
    
    // Инкапсулируем пользовательский код
    const safeCode = `
      (function(robot, console) {
        try {
          ${userCode}
          if (typeof onTick === 'function') {
            onTick(robot);
          }
        } catch (error) {
          console.log('Ошибка: ' + error.message);
        }
      })
    `;
    
    const userFunction = eval(safeCode);
    
    this.tickInterval = setInterval(() => {
      if (!this.isRunning) return;
      
      try {
        userFunction(context.robot, context.console);
      } catch (error) {
        this.addLog(`Ошибка выполнения: ${error.message}`);
        this.stop();
      }
    }, this.tickDuration);
    
  } catch (error) {
    this.addLog(`Ошибка компиляции: ${error.message}`);
    this.stop();
  }
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
    this.logs = [];
    this.addLog('Игра сброшена');
    this.notifyListeners();
  }
}

// Уровни игры
export const LEVELS = {
  1: {
    title: 'Движение к цели',
    description: 'Передвинь робота к яблоку',
    grid: [
      ['empty', 'empty', 'empty', 'empty', 'apple'],
      ['empty', 'wall', 'wall', 'wall', 'empty'],
      ['empty', 'wall', 'empty', 'wall', 'empty'],
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
      ['apple', 'empty', 'apple', 'empty', 'apple'],
      ['empty', 'empty', 'empty', 'empty', 'empty'],
      ['apple', 'empty', 'empty', 'empty', 'apple'],
      ['empty', 'empty', 'empty', 'empty', 'empty'],
      ['apple', 'empty', 'apple', 'empty', 'apple']
    ],
    robot: { x: 2, y: 2, direction: DIRECTIONS.NORTH },
    goal: 'collectAllApples'
  },
  3: {
    title: 'Автоматизация фермы',
    description: 'Собери все яблоки, избегая стен',
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