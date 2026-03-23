import { FC, useState } from "react";
import {
  Box,
  ListItem,
  Radio,
  RadioGroup,
  Stack,
  Text,
  UnorderedList
} from "@chakra-ui/react";
import parse from "html-react-parser";

interface RadioInputProps {
  symbol?: string;
  answers: string[];
  updateValue: (value: string) => void;
  info?: {
    [key: string]: {
      label1?: string;
      label2?: string;
      label3?: string;
      label4?: string;
    };
  };
}

const RadioInputComponent: FC<RadioInputProps> = ({
  answers,
  info,
  updateValue,
}) => {
  const [selectedAnswer, setSelectedAnswer] = useState<string | null>(null);

  const handleChange = (value: string) => {
    setSelectedAnswer(value);
    updateValue(value);
  };

  return (
    <Box position="relative" lineHeight="auto">
      <RadioGroup onChange={handleChange} mt="2">
        <Stack direction="column" spacing={1}>
          {answers.length > 0 &&
            answers.map((answer, index) => (
              <Box key={`${index}_`}>
                <Radio
                  data-testid={`radio-${index}`}
                  value={answer}
                  border="1px solid grey"
                  sx={{ 
                    width: { base: "calc(10px + 1vmin)", md: "calc(12px + 1vmin)", lg: "calc(7px + 1vmin)" }, 
                    height: { base: "calc(10px + 1vmin)", md: "calc(12px + 1vmin)", lg: "calc(7px + 1vmin)" } }}
                >
                  <Text fontSize="calc(0.6rem + 0.9vmin)">{answer}</Text>
                </Radio>
                {info !== undefined &&
                  selectedAnswer === answer &&
                  info[answer] && (
                    <UnorderedList ml="8" fontSize="calc(0.5rem + 0.8vmin)">
                      {info[answer].label1 && (
                        <ListItem>{parse(info[answer].label1)}</ListItem>
                      )}
                      {info[answer].label2 && (
                        <ListItem>{parse(info[answer].label2)}</ListItem>
                      )}
                      {info[answer].label3 && (
                        <ListItem>{parse(info[answer].label3)}</ListItem>
                      )}
                      {info[answer].label4 && (
                        <ListItem>{parse(info[answer].label4)}</ListItem>
                      )}
                    </UnorderedList>
                  )}
              </Box>
            ))}
        </Stack>
      </RadioGroup>
    </Box>
  );
};

export default RadioInputComponent;
