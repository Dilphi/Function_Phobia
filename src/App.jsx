import { Box, Flex, VStack, Heading, Text, Button } from '@chakra-ui/react'
import { BrowserRouter as Router, Routes, Route, Link } from 'react-router-dom'

import SandboxPage from './pages/SandboxPage'
import GamePage from './pages/GamePage'
import HomePage from './pages/HomePage'

function App() {
  return (
    <Router>
      <Box minHeight={'100vh'} bg={'gray.900'} color={'white'}>
        <Flex as={'nav'} bg={'gray.800'} p={4} justify={'space-between'} align={'center'} borderBottom={'1px solid'} borderColor={'gray.700'}>
          <Heading size={'md'} color={'teal.300'}>Function Phobia</Heading>
          <Flex gap={4}> 
            <Button as={Link} to={"/"} variant={'ghost'} colorScheme='teal'>Главная</Button>
            <Button as={Link} to={"/sandbox"} variant={'ghost'} colorScheme='teal'>Песочница</Button>
            <Button as={Link} to={"/game"} variant={'ghost'} colorScheme='teal'>Игра</Button>
          </Flex>
        </Flex>
        
        <Routes>
          <Route path='/' element={<HomePage />} />
          <Route path='/sandbox' element={<SandboxPage />} />
          <Route path='/game' element={<GamePage />} />
        </Routes>
      </Box>
    </Router>
  )
}

export default App