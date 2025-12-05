import { Box, VStack, Heading, Text, Button, Grid, GridItem, Card, CardBody } from '@chakra-ui/react';
import { Link } from 'react-router-dom';

export default function HomePage() {
  return (
    <Box p={8}>
      <VStack spacing={8} align="center">
        <VStack spacing={4} textAlign="center">
          <Heading size="2xl" color="teal.300">Function Phobia</Heading>
          <Text fontSize="xl" color="gray.300">Изучай программирование через игру</Text>
        </VStack>

        <Grid templateColumns={{ base: "1fr", md: "repeat(2, 1fr)" }} gap={8} w="100%" maxW="1200px">
          <GridItem>
            <Card bg="gray.800" border="1px solid" borderColor="gray.700" h="100%">
              <CardBody>
                <VStack spacing={6} align="start" h="100%">
                  <Heading size="lg" color="blue.300">Песочница</Heading>
                  <Text color="gray.300">
                    Практикуйся в написании кода на разных языках программирования. Запускай код и сразу видишь результат.
                  </Text>
                  <Box flex={1} />
                  <Button as={Link} to="/sandbox" colorScheme="blue" w="100%">Открыть песочницу</Button>
                </VStack>
              </CardBody>
            </Card>
          </GridItem>

          <GridItem>
            <Card bg="gray.800" border="1px solid" borderColor="gray.700" h="100%">
              <CardBody>
                <VStack spacing={6} align="start" h="100%">
                  <Heading size="lg" color="green.300">Игра</Heading>
                  <Text color="gray.300">Решай задачи в игровой форме. Автоматизируй ферму, управляй роботами, программируй логику в стиле Factorio и Replicube.</Text>
                  <Box flex={1} />
                  <Button as={Link} to="/game" colorScheme="green" w="100%">Начать игру</Button>
                </VStack>
              </CardBody>
            </Card>
          </GridItem>
        </Grid>

        <VStack spacing={4} maxW="800px" textAlign="center">
          <Heading size="md" color="teal.200">Что ты найдешь в игре?</Heading>
          <Grid templateColumns={{ base: "1fr", md: "repeat(3, 1fr)" }} gap={6} w="100%">
            <VStack spacing={2}>
              <Text fontWeight="bold">Постепенное обучение</Text>
              <Text fontSize="sm" color="gray.400">От простых команд к сложным алгоритмам</Text>
            </VStack>
            <VStack spacing={2}>
              <Text fontWeight="bold">Виртуальные роботы</Text>
              <Text fontSize="sm" color="gray.400">Программируй поведение машин</Text>
            </VStack>
            <VStack spacing={2}>
              <Text fontWeight="bold">Задачи и уровни</Text>
              <Text fontSize="sm" color="gray.400">Решай головоломки и открывай новые возможности</Text>
            </VStack>
          </Grid>
        </VStack>
      </VStack>
    </Box>
  );
}