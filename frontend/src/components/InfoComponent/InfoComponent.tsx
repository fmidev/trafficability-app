import { useState, FC } from "react";
import { ChevronDownIcon, ChevronRightIcon } from "@chakra-ui/icons";
import { Box } from "@chakra-ui/react";
import { lang } from "../../Lang/lang";
import Markdown from "react-markdown";

interface InfoComponentProps {
  currentLanguage: string;
}

const InfoComponent: FC<InfoComponentProps> = ({ currentLanguage }) => {
  const [isOpen, setIsOpen] = useState(false);

  const toggleOpen = () => {
    setIsOpen(!isOpen);
  };

  type LanguageKeys = keyof typeof lang;
  const language = lang[currentLanguage as LanguageKeys] || lang["fi"]

  return (
    <Box>
      <Box className="info-header" onClick={toggleOpen} cursor="pointer">
        {isOpen ? <ChevronDownIcon fontWeight="900" pos="relative" marginLeft="-8px" fontSize="2em"/> : 
          <ChevronRightIcon fontWeight="900" pos="relative" marginLeft="-8px" fontSize="2em"/>}
        <Box as="span" fontSize={{ base: 'md', md: 'md', lg: 'lg'}}>{language.info.header}</Box>
      </Box>
      {isOpen && (
        <Box fontSize="0.8em">

          {isOpen && (
        <Box fontSize="0.8em">
          <br />
          {language.info.body.map((info, index) => (
            <Box key={index} className="info-text" mb="2">
              {info.markdown === true ? <Markdown>{info.text}</Markdown> : info.text}
            </Box>
          ))}
        </Box>
      )}
        </Box>
      )}
    </Box>
  );
};

export default InfoComponent;