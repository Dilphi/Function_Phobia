import { useState, useCallback, useEffect } from 'react';
import { 
  Box, 
  Container, 
  Grid, 
  GridItem, 
  VStack, 
  Heading, 
  Text, 
  Button, 
  Select,
  Tab,
  Tabs,
  TabList,
  TabPanel,
  TabPanels,
  Card,
  CardBody,
  HStack,
  Badge,
  Progress,
  useToast,
  Code,
  Flex
} from '@chakra-ui/react';
import Editor from '@monaco-editor/react';
import { useGameEngine } from '../hooks/useGameEngine';
import { DIRECTIONS, CELL_TYPES } from '../game/GameEngine';

// Компонент для отрисовки игрового поля
function GameGrid({ grid, robot }) {
  const getCellColor = (cellType) => {
    switch (cellType) {
      case CELL_TYPES.WALL: return 'gray.700';
      case CELL_TYPES.APPLE: return 'red.500';
      case CELL_TYPES.WHEAT: return 'yellow.500';
      case CELL_TYPES.ROCK: return 'gray.500';
      default: return 'gray.900';
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
      case DIRECTIONS.NORTH: return '⬆️';
      case DIRECTIONS.EAST: return '➡️';
      case DIRECTIONS.SOUTH: return '⬇️';
      case DIRECTIONS.WEST: return '⬅️';
      default: return '🤖';
    }
  };

  return (
    <Box
      display="grid"
      gridTemplateColumns={`repeat(${grid[0]?.length || 5}, 1fr)`}
      gap="1px"
      bg="gray.600"
      p="1px"
      borderRadius="md"
      overflow="hidden"
    >
      {grid.map((row, y) =>
        row.map((cell, x) => (
          <Box
            key={`${x}-${y}`}
            w="40px"
            h="40px"
            bg={getCellColor(cell)}
            display="flex"
            alignItems="center"
            justifyContent="center"
            position="relative"
            borderRadius="sm"
          >
            {cell !== CELL_TYPES.EMPTY && cell !== CELL_TYPES.WALL && (
              <Text fontSize="xl">{getCellEmoji(cell)}</Text>
            )}
            
            {robot.x === x && robot.y === y && (
              <Box
                position="absolute"
                top="50%"
                left="50%"
                transform="translate(-50%, -50%)"
                fontSize="xl"
              >
                {getRobotEmoji(robot.direction)}
              </Box>
            )}
          </Box>
        ))
      )}
    </Box>
  );
}

export default function GamePage() {
  const [code, setCode] = useState(`// Добро пожаловать в Function Phobia!
// Программируй робота для сбора яблок

function onTick(robot) {
  // Проверяем, что впереди
  const ahead = robot.sense('вперед');
  
  if (ahead === 'яблоко') {
    // Если впереди яблоко - идем и собираем
    robot.move('вперед');
    robot.collect();
  } else if (ahead === 'пусто') {
    // Если пусто - идем вперед
    robot.move('вперед');
  } else if (ahead === 'стена') {
    // Если стена - поворачиваем направо
    robot.turn('направо');
  }
}`);
  
  const toast = useToast();
  const { 
    gameState, 
    level, 
    logs, 
    runCode, 
    stopGame, 
    resetGame, 
    changeLevel,
    currentLevel 
  } = useGameEngine(1);

  const [isRunning, setIsRunning] = useState(false);

  const handleRunCode = () => {
    setIsRunning(true);
    runCode(code);
    
    toast({
      title: 'Код запущен!',
      description: 'Робот начал выполнение программы',
      status: 'success',
      duration: 3000,
    });
  };

  const handleStop = () => {
    setIsRunning(false);
    stopGame();
    
    toast({
      title: 'Выполнение остановлено',
      status: 'info',
      duration: 3000,
    });
  };

  const handleReset = () => {
    setIsRunning(false);
    resetGame();
    setCode(`function onTick(robot) {
  // Начни программировать здесь
  // Доступные команды:
  // robot.move('направление') - движение
  // robot.turn('направление') - поворот
  // robot.sense('направление') - сканирование
  // robot.collect() - сбор предмета
  // robot.drop() - положить предмет
  // robot.getInventory() - получить инвентарь
}`);
    
    toast({
      title: 'Игра сброшена',
      description: 'Все вернулось в исходное состояние',
      status: 'info',
      duration: 3000,
    });
  };

  const levels = [
    { id: 1, title: 'Движение к цели', difficulty: 'легко', completed: true },
    { id: 2, title: 'Сбор ресурсов', difficulty: 'легко', completed: false },
    { id: 3, title: 'Автоматизация фермы', difficulty: 'средне', completed: false },
  ];

  return (
    <Container maxW="container.xl" p={4}>
      <Grid templateColumns={{ base: "1fr", lg: "3fr 2fr" }} gap={8}>
        {/* Левая колонка: Игровой мир и редактор */}
        <GridItem>
          <VStack spacing={6} align="stretch">
            {/* Заголовок уровня */}
            <Box>
              <Heading size="lg" color="green.300" mb={2}>
                🎮 Уровень {level}: {currentLevel.title}
              </Heading>
              <Text color="gray.300" mb={2}>
                {currentLevel.description}
              </Text>
              <Progress 
                value={(gameState.applesCollected / gameState.totalApples) * 100} 
                colorScheme="green" 
                size="sm" 
                borderRadius="full"
                mb={2}
              />
              <Text fontSize="sm" color="gray.400">
                Собрано яблок: {gameState.applesCollected} / {gameState.totalApples}
              </Text>
            </Box>

            {/* Игровое поле */}
            <Card bg="gray.800" border="1px solid" borderColor="gray.700">
              <CardBody>
                <VStack spacing={4}>
                  <HStack justify="space-between" w="100%">
                    <Text fontWeight="bold">Игровое поле</Text>
                    <Badge colorScheme={isRunning ? "green" : "gray"}>
                      {isRunning ? "Выполняется" : "Остановлено"}
                    </Badge>
                  </HStack>
                  
                  <GameGrid grid={gameState.grid} robot={gameState.robot} />

                  <HStack w="100%" justify="space-between">
                    <Text fontSize="sm" color="gray.400">
                      Позиция робота: ({gameState.robot.x}, {gameState.robot.y})
                    </Text>
                    <Text fontSize="sm" color="gray.400">
                      Направление: {gameState.robot.direction}
                    </Text>
                  </HStack>
                </VStack>
              </CardBody>
            </Card>

            {/* Редактор кода */}
            <Card bg="gray.800" border="1px solid" borderColor="gray.700">
              <CardBody>
                <VStack spacing={4} align="stretch">
                  <HStack justify="space-between">
                    <Text fontWeight="bold">Код робота</Text>
                    <Select 
                      size="sm" 
                      w="auto" 
                      defaultValue="javascript"
                      onChange={(e) => {
                        // Можно добавить поддержку других языков
                      }}
                    >
                      <option value="javascript">JavaScript</option>
                    </Select>
                  </HStack>
                  
                  <Box h="300px" border="1px solid" borderColor="gray.600" borderRadius="md" overflow="hidden">
                    <Editor
                      height="100%"
                      theme="vs-dark"
                      language="javascript"
                      value={code}
                      onChange={(value) => setCode(value)}
                      options={{
                        minimap: { enabled: false },
                        fontSize: 14,
                        lineNumbers: 'on',
                        scrollBeyondLastLine: false,
                        automaticLayout: true,
                      }}
                    />
                  </Box>

                  <HStack spacing={4}>
                    <Button 
                      colorScheme="green" 
                      onClick={handleRunCode} 
                      isLoading={isRunning}
                      loadingText="Выполнение..."
                      isDisabled={isRunning}
                    >
                      ▶ Запустить код
                    </Button>
                    <Button 
                      onClick={handleStop} 
                      variant="outline"
                      isDisabled={!isRunning}
                    >
                      ⏹ Остановить
                    </Button>
                    <Button onClick={handleReset} variant="outline">
                      ⟳ Сбросить
                    </Button>
                  </HStack>
                </VStack>
              </CardBody>
            </Card>
          </VStack>
        </GridItem>

        {/* Правая колонка: Информация и уровни */}
        <GridItem>
          <VStack spacing={6} align="stretch">
            {/* Статистика */}
            <Card bg="gray.800" border="1px solid" borderColor="gray.700">
              <CardBody>
                <VStack spacing={4}>
                  <Heading size="md" color="teal.300">📊 Статистика</Heading>
                  <Grid templateColumns="repeat(2, 1fr)" gap={4} w="100%">
                    <VStack spacing={1}>
                      <Text fontSize="2xl">🎯</Text>
                      <Text fontWeight="bold">{gameState.applesCollected}/{gameState.totalApples}</Text>
                      <Text fontSize="sm" color="gray.400">Яблок собрано</Text>
                    </VStack>
                    <VStack spacing={1}>
                      <Text fontSize="2xl">🤖</Text>
                      <Text fontWeight="bold">{gameState.inventory.length}</Text>
                      <Text fontSize="sm" color="gray.400">Предметов в инвентаре</Text>
                    </VStack>
                    <VStack spacing={1}>
                      <Text fontSize="2xl">📦</Text>
                      <Flex wrap="wrap" gap={1} justify="center">
                        {gameState.inventory.map((item, i) => (
                          <Text key={i} fontSize="lg">
                            {item === 'apple' ? '🍎' : item === 'wheat' ? '🌾' : '🪨'}
                          </Text>
                        ))}
                      </Flex>
                      <Text fontSize="sm" color="gray.400">Инвентарь</Text>
                    </VStack>
                    <VStack spacing={1}>
                      <Text fontSize="2xl">🏆</Text>
                      <Text fontWeight="bold">{levels.filter(l => l.completed).length}/{levels.length}</Text>
                      <Text fontSize="sm" color="gray.400">Уровней пройдено</Text>
                    </VStack>
                  </Grid>
                </VStack>
              </CardBody>
            </Card>

            {/* Уровни */}
            <Card bg="gray.800" border="1px solid" borderColor="gray.700">
              <CardBody>
                <VStack spacing={4} align="stretch">
                  <Heading size="md" color="teal.300">📚 Уровни</Heading>
                  <VStack spacing={3} align="stretch">
                    {levels.map((lvl) => (
                      <Button
                        key={lvl.id}
                        variant={level === lvl.id ? 'solid' : 'outline'}
                        colorScheme={lvl.completed ? 'green' : 'gray'}
                        onClick={() => {
                          changeLevel(lvl.id);
                          setIsRunning(false);
                        }}
                        justifyContent="space-between"
                      >
                        <HStack spacing={2}>
                          <Text>{lvl.title}</Text>
                          <Badge 
                            size="sm" 
                            colorScheme={
                              lvl.difficulty === 'легко' ? 'green' : 
                              lvl.difficulty === 'средне' ? 'yellow' : 'red'
                            }
                          >
                            {lvl.difficulty}
                          </Badge>
                        </HStack>
                      </Button>
                    ))}
                  </VStack>
                </VStack>
              </CardBody>
            </Card>

            {/* API робота */}
            <Card bg="gray.800" border="1px solid" borderColor="gray.700">
              <CardBody>
                <Tabs>
                  <TabList>
                    <Tab>🤖 Робот</Tab>
                    <Tab>🌍 Мир</Tab>
                    <Tab>📝 Логи</Tab>
                  </TabList>
                  <TabPanels>
                    <TabPanel>
                      <VStack spacing={2} align="stretch">
                        <Code fontSize="sm" p={2} bg="gray.900">
                          robot.move('направление')
                        </Code>
                        <Text fontSize="sm" color="gray.400">Движение: вперед, назад, влево, вправо</Text>
                        
                        <Code fontSize="sm" p={2} bg="gray.900">
                          robot.turn('направление')
                        </Code>
                        <Text fontSize="sm" color="gray.400">Поворот: налево, направо</Text>
                        
                        <Code fontSize="sm" p={2} bg="gray.900">
                          robot.sense('направление')
                        </Code>
                        <Text fontSize="sm" color="gray.400">Сканирование: вперед, назад, слева, справа</Text>
                        
                        <Code fontSize="sm" p={2} bg="gray.900">
                          robot.collect()
                        </Code>
                        <Text fontSize="sm" color="gray.400">Собрать предмет под роботом</Text>
                        
                        <Code fontSize="sm" p={2} bg="gray.900">
                          robot.getInventory()
                        </Code>
                        <Text fontSize="sm" color="gray.400">Получить массив предметов в инвентаре</Text>
                      </VStack>
                    </TabPanel>
                    <TabPanel>
                      <Text fontSize="sm" color="gray.300" mb={2}>
                        Мир состоит из клеток. Каждая клетка может содержать:
                      </Text>
                      <VStack align="start" spacing={1}>
                        <HStack>
                          <Text fontSize="sm">🧱</Text>
                          <Text fontSize="sm">- Стена (непроходима)</Text>
                        </HStack>
                        <HStack>
                          <Text fontSize="sm">🍎</Text>
                          <Text fontSize="sm">- Яблоко (цель)</Text>
                        </HStack>
                        <HStack>
                          <Text fontSize="sm">🌾</Text>
                          <Text fontSize="sm">- Пшеница (ресурс)</Text>
                        </HStack>
                        <HStack>
                          <Text fontSize="sm">🪨</Text>
                          <Text fontSize="sm">- Камень (ресурс)</Text>
                        </HStack>
                        <HStack>
                          <Text fontSize="sm">⬛</Text>
                          <Text fontSize="sm">- Пустая клетка</Text>
                        </HStack>
                      </VStack>
                    </TabPanel>
                    <TabPanel>
                      <Box h="200px" overflowY="auto">
                        {logs.length === 0 ? (
                          <Text color="gray.500" fontSize="sm">
                            Логи появятся здесь при выполнении кода
                          </Text>
                        ) : (
                          logs.map((log, i) => (
                            <Text key={i} fontSize="sm" color="gray.300" mb={1}>
                              [{log.timestamp}] {log.message}
                            </Text>
                          ))
                        )}
                      </Box>
                    </TabPanel>
                  </TabPanels>
                </Tabs>
              </CardBody>
            </Card>
          </VStack>
        </GridItem>
      </Grid>
    </Container>
  );
}