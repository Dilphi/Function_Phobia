import React, { useState, useCallback, useEffect } from 'react';
import { useGameEngine } from '../hooks/useGameEngine';
import { CELL_TYPES, DIRECTIONS } from '../game/GameEngine';

// Компонент для отрисовки игрового поля
function GameGrid({ grid, robot }) {
  const getCellStyle = (cellType) => {
    switch (cellType) {
      case CELL_TYPES.WALL: return { background: '#4a5568' };
      case CELL_TYPES.APPLE: return { background: '#c53030' };
      case CELL_TYPES.WHEAT: return { background: '#d69e2e' };
      case CELL_TYPES.ROCK: return { background: '#718096' };
      default: return { background: '#1a202c' };
    }
  };

  const getCellEmoji = (cellType) => {
    switch (cellType) {
      case CELL_TYPES.WALL: return '🧱';
      case CELL_TYPES.APPLE: return '🍎';
      case CELL_TYPES.WHEAT: return '🌾';
      case CELL_TYPES.ROCK: return '🪨';
      default: return '';
    }
  };

  const getRobotEmoji = (direction) => {
    switch (direction) {
      case 'north': return '⬆️';
      case 'east': return '➡️';
      case 'south': return '⬇️';
      case 'west': return '⬅️';
      default: return '🤖';
    }
  };

  return (
    <div style={{
      display: 'grid',
      gridTemplateColumns: `repeat(${grid[0]?.length || 5}, 1fr)`,
      gap: '2px',
      background: '#4a5568',
      padding: '2px',
      borderRadius: '8px',
      overflow: 'hidden',
      maxWidth: '100%',
      margin: '0 auto'
    }}>
      {grid.map((row, y) =>
        row.map((cell, x) => (
          <div
            key={`${x}-${y}`}
            style={{
              aspectRatio: '1/1',
              minWidth: '40px',
              minHeight: '40px',
              maxWidth: '60px',
              maxHeight: '60px',
              width: '100%',
              ...getCellStyle(cell),
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              position: 'relative',
              borderRadius: '4px'
            }}
          >
            {cell !== CELL_TYPES.EMPTY && cell !== CELL_TYPES.WALL && (
              <span style={{ fontSize: 'clamp(16px, 4vw, 24px)' }}>{getCellEmoji(cell)}</span>
            )}
            
            {robot.x === x && robot.y === y && (
              <div style={{
                position: 'absolute',
                top: '50%',
                left: '50%',
                transform: 'translate(-50%, -50%)',
                fontSize: 'clamp(16px, 4vw, 24px)'
              }}>
                {getRobotEmoji(robot.direction)}
              </div>
            )}
          </div>
        ))
      )}
    </div>
  );
}

// Дебаг панель (только на десктопе)
function DebugPanel({ gameState }) {
  return (
    <div style={{
      position: 'fixed',
      bottom: '10px',
      right: '10px',
      background: 'rgba(0,0,0,0.9)',
      color: 'white',
      padding: '10px',
      borderRadius: '5px',
      fontSize: '12px',
      zIndex: 1000,
      maxWidth: '300px',
      maxHeight: '200px',
      overflow: 'auto',
      fontFamily: 'monospace',
      display: window.innerWidth > 768 ? 'block' : 'none'
    }}>
      <h4 style={{ margin: '0 0 5px 0' }}>Debug Info:</h4>
      <div>Robot: ({gameState.robot.x}, {gameState.robot.y}) - {gameState.robot.direction}</div>
      <div>Apples: {gameState.applesCollected}/{gameState.totalApples}</div>
      <div>Running: {gameState.isRunning ? 'Yes' : 'No'}</div>
      <div>Inventory: {gameState.inventory.length} items</div>
      <h5 style={{ margin: '10px 0 5px 0' }}>Last logs:</h5>
      {gameState.logs.slice(-3).map((log, i) => (
        <div key={i} style={{ marginBottom: '2px' }}>
          [{log.timestamp}] {log.message}
        </div>
      ))}
    </div>
  );
}

// Мобильная панель управления
function MobileControls({ onRun, onStop, onReset, isRunning }) {
  return (
    <div style={{
      position: 'fixed',
      bottom: '0',
      left: '0',
      right: '0',
      background: 'rgba(45, 55, 72, 0.95)',
      backdropFilter: 'blur(10px)',
      padding: '10px',
      gap: '10px',
      justifyContent: 'center',
      borderTop: '1px solid #4a5568',
      zIndex: 1000,
      display: window.innerWidth <= 768 ? 'flex' : 'none'
    }}>
      <button
        onClick={onRun}
        disabled={isRunning}
        style={{
          padding: '12px 20px',
          background: isRunning ? '#2f855a' : '#38a169',
          color: 'white',
          border: 'none',
          borderRadius: '8px',
          fontSize: '14px',
          fontWeight: '600',
          flex: 1,
          maxWidth: '120px'
        }}
      >
        {isRunning ? '⏸' : '▶'}
      </button>
      <button
        onClick={onStop}
        disabled={!isRunning}
        style={{
          padding: '12px 20px',
          background: !isRunning ? '#718096' : '#e53e3e',
          color: 'white',
          border: 'none',
          borderRadius: '8px',
          fontSize: '14px',
          fontWeight: '600',
          flex: 1,
          maxWidth: '120px'
        }}
      >
        ⏹
      </button>
      <button
        onClick={onReset}
        style={{
          padding: '12px 20px',
          background: '#d69e2e',
          color: 'white',
          border: 'none',
          borderRadius: '8px',
          fontSize: '14px',
          fontWeight: '600',
          flex: 1,
          maxWidth: '120px'
        }}
      >
        ⟳
      </button>
    </div>
  );
}

// Разные стартовые коды для разных уровней
const getInitialCodeForLevel = (levelNum) => {
  switch(levelNum) {
    case 1:
      return `function onTick(robot) {
  // Уровень 1: Просто иди вперед и собирай яблоки
  const ahead = robot.sense('вперед');
  
  if (ahead === 'яблоко') {
    robot.move('вперед');
    robot.collect();
  } else if (ahead === 'пусто') {
    robot.move('вперед');
  } else if (ahead === 'стена') {
    robot.turn('направо');
  }
}`;
    
    case 2:
      return `function onTick(robot) {
  // Уровень 2: Поиск всех яблок на поле
  const directions = ['вперед', 'назад', 'влево', 'вправо'];
  
  for (let dir of directions) {
    const cell = robot.sense(dir);
    
    if (cell === 'яблоко') {
      robot.move(dir);
      robot.collect();
      return;
    }
  }
  
  if (robot.sense('вперед') === 'пусто') {
    robot.move('вперед');
  } else {
    robot.turn('направо');
  }
}`;
    
    case 3:
      return `function onTick(robot) {
  // Уровень 3: Обход стен
  const ahead = robot.sense('вперед');
  const left = robot.sense('влево');
  const right = robot.sense('вправо');
  
  if (ahead === 'яблоко') {
    robot.move('вперед');
    robot.collect();
  } else if (ahead === 'пусто') {
    robot.move('вперед');
  } else if (left === 'пусто') {
    robot.turn('влево');
    robot.move('вперед');
  } else if (right === 'пусто') {
    robot.turn('вправо');
    robot.move('вперед');
  } else {
    robot.turn('направо');
  }
}`;
    
    default:
      return `function onTick(robot) {
  // Начни программировать здесь
  const ahead = robot.sense('вперед');
  robot.say(\`Впереди: \${ahead}\`);
}`;
  }
};

export default function GamePage() {
  const [isMobile, setIsMobile] = useState(window.innerWidth <= 768);
  const [showCodeEditor, setShowCodeEditor] = useState(false);

 useEffect(() => {
    const handleResize = () => {
      const mobile = window.innerWidth <= 768;
      setIsMobile(mobile);
      if (!mobile && showCodeEditor) {
        setShowCodeEditor(false); // Закрыть редактор при переходе на десктоп
      }
    };
    
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, [showCodeEditor]);

  const styles = {
    card: {
      background: '#2d3748',
      padding: isMobile ? '15px' : '20px',
      borderRadius: '10px',
      boxShadow: '0 4px 6px rgba(0,0,0,0.1)'
    },
    cardTitle: {
      fontSize: isMobile ? '16px' : '18px',
      fontWeight: 'bold',
      margin: '0 0 12px 0',
      color: '#e2e8f0'
    },
    button: {
      padding: isMobile ? '8px 12px' : '10px 15px',
      border: 'none',
      borderRadius: '6px',
      color: 'white',
      cursor: 'pointer',
      fontSize: isMobile ? '12px' : '14px',
      fontWeight: '600',
      transition: 'all 0.2s'
    },
    statCard: {
      background: '#4a5568',
      padding: isMobile ? '10px' : '15px',
      borderRadius: '8px',
      textAlign: 'center'
    },
    statNumber: {
      fontSize: isMobile ? '18px' : '24px',
      fontWeight: 'bold',
      color: '#68d391',
      marginBottom: '5px'
    },
    statLabel: {
      fontSize: isMobile ? '10px' : '12px',
      color: '#cbd5e0'
    },
    code: {
      background: '#4a5568',
      color: '#90cdf4',
      padding: '6px 10px',
      borderRadius: '4px',
      fontFamily: 'monospace',
      fontSize: isMobile ? '12px' : '13px',
      display: 'block',
      marginBottom: '3px',
      overflowX: 'auto',
      whiteSpace: 'nowrap'
    },
    codeHint: {
      fontSize: isMobile ? '10px' : '11px',
      color: '#a0aec0',
      marginBottom: '8px'
    }
  };

  const { 
    gameState, 
    level, 
    runCode, 
    stopGame, 
    resetGame, 
    changeLevel,
    currentLevel 
  } = useGameEngine(1);

  const [code, setCode] = useState(() => getInitialCodeForLevel(1));

  useEffect(() => {
    setCode(getInitialCodeForLevel(level));
  }, [level]);

  const handleRunCode = useCallback(() => {
    runCode(code);
  }, [runCode, code, level]);

  const handleStop = useCallback(() => {
    stopGame();
  }, [stopGame]);

  const handleReset = useCallback(() => {
    stopGame();
    resetGame();
    setCode(getInitialCodeForLevel(level));
  }, [stopGame, resetGame, level]);

  const handleLevelChange = useCallback((newLevel) => {
    stopGame();
    changeLevel(newLevel);
  }, [stopGame, changeLevel]);

  const levels = [
    { id: 1, title: 'Движение к цели', difficulty: 'легко' },
    { id: 2, title: 'Сбор ресурсов', difficulty: 'легко' },
    { id: 3, title: 'Автоматизация фермы', difficulty: 'средне' },
  ];

  return (
    <div style={{
      minHeight: '100vh',
      background: '#1a202c',
      color: 'white',
      fontFamily: 'Arial, sans-serif',
      paddingBottom: isMobile ? '70px' : '20px'
    }}>
      <div style={{ 
        maxWidth: '1200px', 
        margin: '0 auto', 
        padding: isMobile ? '10px' : '20px' 
      }}>
        {/* Заголовок */}
        <div style={{ marginBottom: '20px' }}>
          <h1 style={{ 
            fontSize: isMobile ? '24px' : '32px', 
            color: '#68d391', 
            margin: '0 0 8px 0',
            textAlign: isMobile ? 'center' : 'left'
          }}>
            Уровень {level}
          </h1>
          <h2 style={{ 
            fontSize: isMobile ? '16px' : '20px', 
            color: '#cbd5e0', 
            margin: '0 0 8px 0',
            textAlign: isMobile ? 'center' : 'left'
          }}>
            {currentLevel.title}
          </h2>
          <p style={{ 
            color: '#a0aec0', 
            marginBottom: '10px',
            fontSize: isMobile ? '14px' : '16px',
            textAlign: isMobile ? 'center' : 'left'
          }}>
            {currentLevel.description}
          </p>
          <div style={{ 
            display: 'flex', 
            alignItems: 'center', 
            gap: '10px',
            flexDirection: isMobile ? 'column' : 'row'
          }}>
            <div style={{
              flex: 1,
              height: '8px',
              background: '#4a5568',
              borderRadius: '4px',
              overflow: 'hidden',
              width: isMobile ? '100%' : 'auto'
            }}>
              <div style={{
                width: `${(gameState.applesCollected / gameState.totalApples) * 100}%`,
                height: '100%',
                background: '#68d391',
                transition: 'width 0.3s'
              }} />
            </div>
            <span style={{ 
              fontSize: '14px',
              whiteSpace: 'nowrap'
            }}>
              Яблоки: {gameState.applesCollected}/{gameState.totalApples}
            </span>
          </div>
        </div>

        <div style={{
          display: 'grid',
          gridTemplateColumns: isMobile ? '1fr' : '1fr 1fr',
          gap: isMobile ? '15px' : '20px'
        }}>
          {/* Игровое поле */}
          <div style={styles.card}>
            <h3 style={styles.cardTitle}>Игровое поле</h3>
            <div style={{ marginBottom: '15px' }}>
              <span style={{
                padding: '5px 10px',
                background: gameState.isRunning ? '#38a169' : '#718096',
                borderRadius: '4px',
                fontSize: isMobile ? '12px' : '14px'
              }}>
                {gameState.isRunning ? 'Выполняется' : 'Остановлено'}
              </span>
            </div>
            
            <div style={{ overflowX: 'auto', padding: '5px' }}>
              <GameGrid grid={gameState.grid} robot={gameState.robot} />
            </div>
            
            <div style={{ 
              display: 'flex', 
              justifyContent: 'space-between',
              marginTop: '15px',
              fontSize: isMobile ? '12px' : '14px',
              color: '#cbd5e0',
              flexWrap: 'wrap',
              gap: '10px'
            }}>
              <div>Позиция: ({gameState.robot.x}, {gameState.robot.y})</div>
              <div>Направление: {gameState.robot.direction}</div>
            </div>

            {/* Подсказка */}
            <div style={{
              marginTop: '15px',
              padding: '10px',
              background: '#4a5568',
              borderRadius: '6px',
              fontSize: isMobile ? '12px' : '14px'
            }}>
              <div style={{ 
                fontWeight: 'bold', 
                marginBottom: '5px', 
                color: '#68d391',
                fontSize: isMobile ? '13px' : '14px'
              }}>
                Подсказка для уровня {level}:
              </div>
              {level === 1 && 'Используйте robot.move() и robot.sense() для поиска пути к яблоку.'}
              {level === 2 && 'Проверяйте все направления (вперед, назад, влево, вправо) для поиска яблок.'}
              {level === 3 && 'Обходите стены используя robot.turn(). Проверяйте все стороны перед движением.'}
            </div>
          </div>

          {/* Редактор кода (скрыт на мобилке в отдельной вкладке) */}
          <div style={{
            ...styles.card,
            display: isMobile ? 'none' : 'block'
          }}>
            <h3 style={styles.cardTitle}>Код робота</h3>
            
            <textarea
              value={code}
              onChange={(e) => setCode(e.target.value)}
              style={{
                width: '100%',
                height: '300px',
                background: '#2d3748',
                color: '#e2e8f0',
                border: '1px solid #4a5568',
                borderRadius: '6px',
                padding: '15px',
                fontFamily: 'monospace',
                fontSize: '14px',
                resize: 'vertical',
                marginBottom: '15px',
                minHeight: '200px'
              }}
              spellCheck="false"
            />
            
            <div style={{ 
              display: 'flex', 
              gap: '10px', 
              flexWrap: 'wrap',
              justifyContent: 'center'
            }}>
              <button
                onClick={handleRunCode}
                disabled={gameState.isRunning}
                style={{
                  ...styles.button,
                  background: gameState.isRunning ? '#2f855a' : '#38a169',
                  flex: isMobile ? '1' : 'none',
                  minWidth: '140px'
                }}
              >
                {gameState.isRunning ? 'Выполняется...' : '▶ Запустить код'}
              </button>
              <button
                onClick={handleStop}
                disabled={!gameState.isRunning}
                style={{
                  ...styles.button,
                  background: !gameState.isRunning ? '#718096' : '#e53e3e',
                  flex: isMobile ? '1' : 'none',
                  minWidth: '140px'
                }}
              >
                Остановить
              </button>
              <button
                onClick={handleReset}
                style={{
                  ...styles.button,
                  background: '#d69e2e',
                  flex: isMobile ? '1' : 'none',
                  minWidth: '140px'
                }}
              >
                Сбросить
              </button>
            </div>
          </div>
        </div>

        {/* Статистика и уровни */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: isMobile ? '1fr' : '1fr 1fr',
          gap: isMobile ? '15px' : '20px',
          marginTop: '20px'
        }}>
          {/* Статистика */}
          <div style={styles.card}>
            <h3 style={styles.cardTitle}>Статистика</h3>
            <div style={{
              display: 'grid',
              gridTemplateColumns: isMobile ? 'repeat(2, 1fr)' : 'repeat(2, 1fr)',
              gap: '15px'
            }}>
              <div style={styles.statCard}>
                <div style={styles.statNumber}>{gameState.applesCollected}/{gameState.totalApples}</div>
                <div style={styles.statLabel}>Яблоки</div>
              </div>
              <div style={styles.statCard}>
                <div style={styles.statNumber}>{gameState.inventory.length}</div>
                <div style={styles.statLabel}>Инвентарь</div>
              </div>
              <div style={styles.statCard}>
                <div style={styles.statNumber}>
                  {gameState.inventory.slice(0, 3).map((item, i) => (
                    <span key={i} style={{ marginRight: '5px', fontSize: isMobile ? '16px' : '20px' }}>
                      {item === 'apple' ? '🍎' : item === 'wheat' ? '🌾' : '🪨'}
                    </span>
                  ))}
                  {gameState.inventory.length === 0 && '—'}
                </div>
                <div style={styles.statLabel}>Предметы</div>
              </div>
              <div style={styles.statCard}>
                <div style={styles.statNumber}>{level}/3</div>
                <div style={styles.statLabel}>Уровень</div>
              </div>
            </div>
          </div>

          {/* Уровни */}
          <div style={styles.card}>
            <h3 style={styles.cardTitle}>Уровни</h3>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
              {levels.map((lvl) => (
                <button
                  key={lvl.id}
                  onClick={() => handleLevelChange(lvl.id)}
                  style={{
                    ...styles.button,
                    background: level === lvl.id ? '#4fd1c7' : '#4a5568',
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    padding: '12px 15px',
                    textAlign: 'left'
                  }}
                >
                  <span style={{ fontSize: isMobile ? '13px' : '14px' }}>{lvl.id}. {lvl.title}</span>
                  <span style={{
                    padding: '3px 10px',
                    background: lvl.difficulty === 'легко' ? '#38a169' : 
                               lvl.difficulty === 'средне' ? '#d69e2e' : '#e53e3e',
                    borderRadius: '4px',
                    fontSize: isMobile ? '10px' : '11px',
                    fontWeight: 'bold'
                  }}>
                    {lvl.difficulty}
                  </span>
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Логи и справка */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: isMobile ? '1fr' : '1fr 1fr',
          gap: isMobile ? '15px' : '20px',
          marginTop: '20px'
        }}>
          {/* Логи */}
          <div style={styles.card}>
            <h3 style={styles.cardTitle}>Логи выполнения</h3>
            <div style={{
              height: isMobile ? '150px' : '200px',
              overflowY: 'auto',
              background: '#2d3748',
              padding: '15px',
              borderRadius: '6px',
              fontFamily: 'monospace',
              fontSize: isMobile ? '11px' : '13px'
            }}>
              {gameState.logs.length === 0 ? (
                <div style={{ color: '#718096', fontStyle: 'italic' }}>
                  Логи появятся здесь при выполнении кода...
                </div>
              ) : (
                gameState.logs.slice().reverse().map((log, i) => (
                  <div 
                    key={i}
                    style={{
                      marginBottom: '5px',
                      color: log.message.includes('') ? '#fc8181' : 
                             log.message.includes('') ? '#68d391' :
                             log.message.includes('') ? '#e53e3e' :
                             log.message.includes('') ? '#d69e2e' : '#cbd5e0',
                      borderLeft: log.message.includes('') ? '3px solid #fc8181' :
                                 log.message.includes('') ? '3px solid #68d391' :
                                 log.message.includes('') ? '3px solid #e53e3e' :
                                 log.message.includes('') ? '3px solid #d69e2e' : 'none',
                      paddingLeft: '5px',
                      wordBreak: 'break-word'
                    }}
                  >
                    [{log.timestamp}] {log.message}
                  </div>
                ))
              )}
            </div>
          </div>

          {/* API справка */}
          <div style={styles.card}>
            <h3 style={styles.cardTitle}>API Робота</h3>
            <div style={{ 
              display: 'flex', 
              flexDirection: 'column', 
              gap: '8px',
              maxHeight: isMobile ? '150px' : '200px',
              overflowY: 'auto'
            }}>
              <div>
                <code style={styles.code}>robot.move('направление')</code>
                <div style={styles.codeHint}>Движение: 'вперед', 'назад', 'влево', 'вправо'</div>
              </div>
              <div>
                <code style={styles.code}>robot.turn('направление')</code>
                <div style={styles.codeHint}>Поворот: 'налево', 'направо'</div>
              </div>
              <div>
                <code style={styles.code}>robot.sense('направление')</code>
                <div style={styles.codeHint}>Сканирование: 'вперед', 'назад', 'влево', 'вправо'</div>
              </div>
              <div>
                <code style={styles.code}>robot.collect()</code>
                <div style={styles.codeHint}>Собрать предмет под роботом</div>
              </div>
              {!isMobile && (
                <>
                  <div>
                    <code style={styles.code}>robot.getPosition()</code>
                    <div style={styles.codeHint}>Получить текущую позицию</div>
                  </div>
                  <div>
                    <code style={styles.code}>robot.say('текст')</code>
                    <div style={styles.codeHint}>Вывести сообщение в логи</div>
                  </div>
                </>
              )}
            </div>
          </div>
        </div>

        {/* КНОПКА ДЛЯ ОТКРЫТИЯ МОБИЛЬНОГО РЕДАКТОРА */}
        {isMobile && !showCodeEditor && (
          <div style={{ 
            marginTop: '15px',
            textAlign: 'center'
          }}>
            <button
              onClick={() => setShowCodeEditor(true)}
              style={{
                ...styles.button,
                background: '#4299e1',
                width: '100%',
                padding: '15px',
                fontSize: '16px',
                fontWeight: 'bold'
              }}
            >
              Открыть редактор кода
            </button>
          </div>
        )}
      </div>

        {/* Мобильный редактор кода (отдельная вкладка) */}
        {isMobile && showCodeEditor && (
          <div style={{
            position: 'fixed',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            background: '#1a202c',
            zIndex: 2000,
            display: 'flex',
            flexDirection: 'column',
            padding: '10px',
            paddingTop: '60px'
          }}>
            <div style={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              marginBottom: '15px',
              position: 'fixed',
              top: 0,
              left: 0,
              right: 0,
              background: '#2d3748',
              padding: '15px',
              zIndex: 2001
            }}>
              <h3 style={{ 
                fontSize: '18px', 
                fontWeight: 'bold', 
                color: '#e2e8f0',
                margin: 0
              }}>
                Редактор кода
              </h3>
              <button
                onClick={() => setShowCodeEditor(false)}
                style={{
                  background: '#e53e3e',
                  color: 'white',
                  border: 'none',
                  borderRadius: '6px',
                  padding: '8px 12px',
                  fontSize: '14px',
                  fontWeight: '600',
                  cursor: 'pointer'
                }}
              >
                Закрыть
              </button>
            </div>
            
            <textarea
              value={code}
              onChange={(e) => setCode(e.target.value)}
              style={{
                width: '100%',
                flex: 1,
                background: '#2d3748',
                color: '#e2e8f0',
                border: '1px solid #4a5568',
                borderRadius: '6px',
                padding: '15px',
                fontFamily: 'monospace',
                fontSize: '14px',
                resize: 'none',
                marginBottom: '15px'
              }}
              spellCheck="false"
            />
            
            <div style={{ 
              display: 'flex', 
              gap: '10px',
              marginTop: '15px'
            }}>
              <button
                onClick={() => {
                  handleRunCode();
                  setShowCodeEditor(false); // Закрыть после запуска
                }}
                disabled={gameState.isRunning}
                style={{
                  ...styles.button,
                  background: gameState.isRunning ? '#2f855a' : '#38a169',
                  flex: 1
                }}
              >
                Запустить
              </button>
              <button
                onClick={() => {
                  handleStop();
                  setShowCodeEditor(false); // Закрыть после остановки
                }}
                disabled={!gameState.isRunning}
                style={{
                  ...styles.button,
                  background: !gameState.isRunning ? '#718096' : '#e53e3e',
                  flex: 1
                }}
              >
                Стоп
              </button>
              <button
                onClick={() => {
                  handleReset();
                  setShowCodeEditor(false); // Закрыть после сброса
                }}
                style={{
                  ...styles.button,
                  background: '#d69e2e',
                  flex: 1
                }}
              >
                ⟳ Сбросить
              </button>
            </div>
          </div>
        )}
   

      {/* Дебаг панель (только на десктопе) */}
      <DebugPanel gameState={gameState} />
      
      {/* Мобильные контролы */}
      <MobileControls 
        onRun={handleRunCode}
        onStop={handleStop}
        onReset={handleReset}
        isRunning={gameState.isRunning}
      />
    </div>
  );
}