import { Box, Button, Menu, MenuButton, MenuList, MenuItem, Text } from '@chakra-ui/react'
import { LANGUAGE_VERSIONS } from './constans.js'

const Languages = Object.entries(LANGUAGE_VERSIONS);

const ACTIVE_COLOR = "yellow.500";

const LanguageSelector = ({ language, onSelect }) => {
  return (
    <Box ml={2} mb={4}>
      <Text mb={2} fontSize="lg">Language:</Text>

      <Menu isLazy>
        <MenuButton as={Button} colorScheme="yellow">
          {language}
        </MenuButton>

        <MenuList bg={"#110c1b"}>
          {Languages.map(([lang, versions]) => (
            <MenuItem key={lang} onClick={() => onSelect(lang)}
            color = {
                    lang === language ? ACTIVE_COLOR : ""
                }
                bg = {
                    lang === language ? "gray.900" : "transparent"
                }
                _hover = {{ color: ACTIVE_COLOR, bg: "gray.900" }}>  
                {lang}
                &nbsp;
              <Text as="span" fontSize="sm" color="gray.500">
                ({versions})
              </Text>
            </MenuItem>
          ))}
        </MenuList>
      </Menu>
    </Box>
  );
};

export default LanguageSelector;
