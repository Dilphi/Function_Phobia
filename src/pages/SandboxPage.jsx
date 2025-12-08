import { Box, Container, VStack, Heading, Text } from '@chakra-ui/react';
import CodeEditor from '../components/CodeEditor';

export default function SandboxPage() {
  return (
    <Container maxW="container.xl" p={4}>
      <VStack spacing={6} align="stretch">
        <Box>
          <Heading size="lg" color="yellow.300" mb={2}>Песочница для программирования</Heading>
          <Text color="gray.300">Выбери язык программирования и начни писать код. Нажми "Run code" чтобы увидеть результат.</Text>
        </Box>
        
        <Box borderRadius="lg" overflow="hidden" border="1px solid" borderColor="gray.700">
          <CodeEditor />
        </Box>

        <Box bg="gray.800" p={4} borderRadius="md" borderLeft="4px solid" borderColor="yellow.500">
          <Text fontSize="sm" color="gray.300">
            Совет: Используй песочницу для экспериментов с кодом перед тем как 
            применять его в игре. Здесь ты можешь тестировать идеи без ограничений.
          </Text>
        </Box>
      </VStack>
    </Container>
  );
}