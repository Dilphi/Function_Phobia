import axios from 'axios';
import {LANGUAGE_VERSIONS} from './components/constans.js';
const API = axios.create ({ baseURL:'https://emkc.org/api/v2/piston' });

export const executeCode = async (language, code) => {
    const res = await API.post('/execute', {
        'language': language,
        'version': LANGUAGE_VERSIONS[language],
        'files': [{
            'content': code,
        }]
    });
    return res.data;
}