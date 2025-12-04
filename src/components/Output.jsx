import { useState} from 'react';
import { Box, Button, Text, useToast } from '@chakra-ui/react';
import { executeCode } from '../api.js';

export default function Output({editorRef, language}){
    const toast = useToast();
    const [output, setOutput] = useState(null);
    const [isLoading, setIsLoading] = useState(false);
    const [isError, setIsError] = useState(false);

    const runCode = async () => {
        const code = editorRef.current.getValue();
        if (!code) return;
        
        try {
            setIsLoading(true);
            const {run:result} = await executeCode(language, code);
            setOutput(result.output,ыздше("\n"));
            result.stderr ? setIsError(true) : setIsError(false);
        } catch (error) {
            console.error(error);
            toast({
                title: "Error executing code",
                description: error.message || 'Unable to run code.',
                status: "error",
                duration: 6000,
            });
        }
        finally {
            setIsLoading(false);
        }
    };

    return(
        <Box w='50%'>
            <Text mb = {2} fontSize = 'lg'>Output</Text> <br/>
            <Button variant='outline' color='green' mb={4} onClick={runCode} isLoading={isLoading}>Run code</Button>
            <Box h='75vh' color={isError ? "red.400" : ""} borderColor={isError ? "red.500" : "#333"} border= '1px solid ' borderRadius='4' p={2}> 
                {output ? output.map((line,i) => <Text key={i}>{line}</Text>) : 'Нажимите "Run code" чтобы выполнить код'}
            </Box>
        </Box>
    )
    
}