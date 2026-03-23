import React from "react";
import {
  Box,
  Button,
  Menu,
  MenuButton,
  MenuItem,
  MenuList,
  Text,
} from "@chakra-ui/react";
import { FI, GB } from "country-flag-icons/react/3x2";
import { ChevronDownIcon } from "@chakra-ui/icons";

interface Language {
  abbreviation: string;
  setCurrentLanguage: (language: string) => void;
}
const LanguageSelector: React.FC<Language> = ({
  abbreviation,
  setCurrentLanguage,
}) => {

  const languages = [
    { abbreviation: "fi", nativeName: "Suomi" },
    { abbreviation: "en", nativeName: "English" }
  ];

  const getCorrectFlag = (
    language: { abbreviation: string; nativeName: string },
    width: string
  ) => {
    switch (language.abbreviation) {
      case "fi":
        return <FI width={width} title={language.nativeName} />;
      case "en":
        return <GB width={width} title={language.nativeName} />;
      default:
        return;
    }
  };

  return (
    <Box
      border="0.1px solid gray"
      fontSize="calc(0.6em + 0.5vw)"
      minW="max-content"
    >
      <Menu>
        <MenuButton
          as={Button}
          w={{ base: "38px", sm: "54px"}}
          height="34px"
          borderRadius="none"
          rightIcon={
            <Box
              width={{ base: "38px", sm: "54px"}}
              height="34px"
              display="flex"
              alignItems="center"
              p="1"
              ml="auto"
              justifyContent="center"
            >
              {abbreviation === "fi" ? <FI /> : <GB />}
              <ChevronDownIcon ml={{base: "0.5", sm: "2"}} />
            </Box>
          }
          m="0"
        ></MenuButton>
        <MenuList
          border="1px"
          borderColor="inherit"
          borderRadius="none"
          maxHeight="100px"
          minW="50px"
        >
          {languages.map((language) => (
            <MenuItem
              key={language.abbreviation}
              onClick={() => setCurrentLanguage(language.abbreviation)}
              _focus={{ bg: "gray.200", borderRadius: "none", border: "none" }}
            >
              {getCorrectFlag(language, "34px")}
              <Text marginLeft="0.2rem">{language.nativeName}</Text>
            </MenuItem>
          ))}
        </MenuList>
      </Menu>
    </Box>
  );
};
export default LanguageSelector;
