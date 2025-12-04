import { useState, useRef } from 'react'
import { Box, HStack } from '@chakra-ui/react'
import Editor from '@monaco-editor/react'
import LanguageSelector from './LanguageSelecror.jsx'
import { CODE_SNIPPETS } from './constans.js'
import Output from './Output.jsx'


export default function CodeEditor() {
    const editorRef = useRef()
    const [value, setValue] = useState('')
    const [language, setLanguage] = useState('javascript')

    const onMount = (editor) => {
        editorRef.current = editor
        editor.focus()
    }

    const onSelect = (lang) => {
        setLanguage(lang);
        setValue(CODE_SNIPPETS[lang] || '');
    };

    return (
        <Box>
            <HStack spacing={4}>
                <Box w="50%">
                    <LanguageSelector language={language} onSelect={onSelect}/>
                    <Editor height="90vh" theme="vs-dark" language={language} value={value} defaultValue= {CODE_SNIPPETS[language]} onMount={onMount} onChange={(v) => setValue(v)} />
                </Box>
                <Output editorRef={editorRef} language={language} />
            </HStack>
            
            
        </Box>
    )
}
