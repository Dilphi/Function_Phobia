import { useState } from 'react';
import { 
  Box, 
  Flex, 
  VStack, 
  Heading, 
  Text, 
  Button, 
  IconButton, 
  Menu, 
  MenuButton, 
  MenuList, 
  MenuItem, 
  useMediaQuery,
  HStack 
} from '@chakra-ui/react'
import { 
  BrowserRouter as Router, 
  Routes, 
  Route, 
  Link,
  NavLink 
} from 'react-router-dom'
import { HamburgerIcon, ChevronDownIcon } from '@chakra-ui/icons'

import SandboxPage from './pages/SandboxPage'
import GamePage from './pages/GamePage'
import HomePage from './pages/HomePage'
import ProfilePage from './pages/ProfilePage'
import LoginPage from './pages/LoginPage'
import RegistrationPage from './pages/RegisterPage'
import AboutPage from './pages/AboutPage'
import FAQPage from './pages/FAQPage'

function App() {
  const [isMobile] = useMediaQuery("(max-width: 768px)")

  return (
    <Router>
      <Box minHeight={'100vh'} bg={'gray.900'} color={'white'} display="flex" flexDirection="column">
        {/* Навигация */}
        <Flex 
          as={'nav'} 
          bg={'gray.800'} 
          p={{ base: 3, md: 4 }} 
          justify={'space-between'} 
          align={'center'} 
          borderBottom={'1px solid'} 
          borderColor={'gray.700'}
          position="sticky"
          top={0}
          zIndex={10}
        >
          <Heading size={{ base: 'sm', md: 'md' }} color={'yellow.500'}>
            Function Phobia
          </Heading>
          
          {isMobile ? (
            <Menu>
              <MenuButton
                as={IconButton}
                icon={<HamburgerIcon />}
                variant="ghost"
                colorScheme="yellow"
                aria-label="Меню"
                size="md"
              />
              <MenuList bg="gray.800" borderColor="gray.700" minW="150px">
                <MenuItem as={Link} to="/" bg="transparent" _hover={{ bg: 'gray.700' }}>Главная</MenuItem>
                <MenuItem as={Link} to="/sandbox" bg="transparent" _hover={{ bg: 'gray.700' }}>Песочница</MenuItem>
                <MenuItem as={Link} to="/game" bg="transparent" _hover={{ bg: 'gray.700' }}>Игра</MenuItem>
                <MenuItem as={Link} to="/profile/:userId" bg="transparent" _hover={{ bg: 'gray.700' }}>Профиль</MenuItem>
                <MenuItem as={Link} to="/login" bg="transparent" _hover={{ bg: 'gray.700' }}>Вход</MenuItem>
                <MenuItem as={Link} to="/register" bg="transparent" _hover={{ bg: 'gray.700' }}>Регистрация</MenuItem>
                <MenuItem as={Link} to="/about" bg="transparent" _hover={{ bg: 'gray.700' }}>О проекте</MenuItem>
                <MenuItem as={Link} to="/faq" bg="transparent" _hover={{ bg: 'gray.700' }}>FAQ</MenuItem>
              </MenuList>
            </Menu>
          ) : (
            <Flex gap={{ base: 2, md: 4 }} flexWrap="wrap" align="center">
              <Button 
                as={Link} 
                to={"/"} 
                variant={'ghost'} 
                colorScheme='yellow'
                size={{ base: 'sm', md: 'md' }}
                _activeLink={{ bg: 'yellow.500', color: 'gray.900' }}
              >
                Главная
              </Button>
              <Button 
                as={Link} 
                to={"/sandbox"} 
                variant={'ghost'} 
                colorScheme='yellow'
                size={{ base: 'sm', md: 'md' }}
              >
                Песочница
              </Button>
              <Button 
                as={Link} 
                to={"/game"} 
                variant={'ghost'} 
                colorScheme='yellow'
                size={{ base: 'sm', md: 'md' }}
              >
                Игра
              </Button>
              <Button 
                as={Link} 
                to={"/profile"} 
                variant={'ghost'} 
                colorScheme='yellow'
                size={{ base: 'sm', md: 'md' }}
              >
                Профиль
              </Button>
              
              {/* Меню с дополнительными страницами */}
              <Menu>
                <MenuButton
                  as={Button}
                  rightIcon={<ChevronDownIcon />}
                  variant="ghost"
                  colorScheme="yellow"
                  size={{ base: 'sm', md: 'md' }}
                >
                  Ещё
                </MenuButton>
                <MenuList bg="gray.800" borderColor="gray.700">
                  <MenuItem as={Link} to="/about" bg="transparent" _hover={{ bg: 'gray.700' }}>О проекте</MenuItem>
                  <MenuItem as={Link} to="/faq" bg="transparent" _hover={{ bg: 'gray.700' }}>FAQ</MenuItem>
                </MenuList>
              </Menu>
              
              <HStack spacing={2}>
                <Button 
                  as={Link} 
                  to={"/login"} 
                  variant={'outline'} 
                  colorScheme='yellow'
                  size={{ base: 'sm', md: 'md' }}
                >
                  Вход
                </Button>
                <Button 
                  as={Link} 
                  to={"/register"} 
                  colorScheme='yellow'
                  size={{ base: 'sm', md: 'md' }}
                >
                  Регистрация
                </Button>
              </HStack>
            </Flex>
          )}
        </Flex>
        
        {/* Основной контент */}
        <Box flex="1" overflow="auto" p={{ base: 2, md: 4 }}>
          <Routes>
            <Route path='/' element={<HomePage />} />
            <Route path='/sandbox' element={<SandboxPage />} />
            <Route path='/game' element={<GamePage />} />
            <Route path='/profile/:userId' element={<ProfilePage />} />
            <Route path='/profile' element={<ProfilePage />} />
            <Route path='/login' element={<LoginPage />} />
            <Route path='/register' element={<RegistrationPage />} />
            <Route path='/about' element={<AboutPage />} />
            <Route path='/faq' element={<FAQPage />} />
          </Routes>
        </Box>

        {/* Футер */}
        <Box 
          bg="gray.800" 
          p={4} 
          borderTop="1px solid" 
          borderColor="gray.700"
          mt="auto"
        >
          <Flex 
            direction={{ base: 'column', md: 'row' }} 
            justify="space-between" 
            align="center" 
            maxW="1200px" 
            mx="auto"
            gap={4}
          >
            <Text fontSize="sm" color="gray.400">
              © {new Date().getFullYear()} Function Phobia. Обучайся программированию через игру.
            </Text>
            
            <HStack spacing={4}>
              <Button 
                as={Link} 
                to="/about" 
                variant="link" 
                color="gray.400" 
                _hover={{ color: 'yellow.500' }}
                size="sm"
              >
                О проекте
              </Button>
              <Button 
                as={Link} 
                to="/faq" 
                variant="link" 
                color="gray.400" 
                _hover={{ color: 'yellow.500' }}
                size="sm"
              >
                FAQ
              </Button>
              <Button 
                as={Link} 
                to="/login" 
                variant="link" 
                color="gray.400" 
                _hover={{ color: 'yellow.500' }}
                size="sm"
              >
                Вход
              </Button>
              <Button 
                as={Link} 
                to="/register" 
                variant="link" 
                color="gray.400" 
                _hover={{ color: 'yellow.500' }}
                size="sm"
              >
                Регистрация
              </Button>
            </HStack>
          </Flex>
        </Box>
      </Box>
    </Router>
  )
}

export default App