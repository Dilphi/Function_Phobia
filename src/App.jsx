import { useState } from 'react'
import reactLogo from './assets/react.svg'
import viteLogo from '/vite.svg'
import './App.css'
import { Box } from '@chakra-ui/react'

import CodeEditor from './components/CodeEditor.jsx'

function App() {
  return <Box
    minHeight="100vh"
    bg = "black"
    color = "gray.500"
    px={6}
    py={8}>
    <CodeEditor/>
  </Box>
}

export default App
