import { Button } from "@chakra-ui/react";
import React from "react";

interface SubmitButtonProps {
  handleSubmit: (e: React.MouseEvent<HTMLButtonElement>) => void;
  send: string
}

const SubmitButtonComponent: React.FC<SubmitButtonProps> = ({ handleSubmit, send }) => {
  return (
    <Button
      onClick={handleSubmit}
      width="30%"
      bg="#f9f9f9"
      border="1px dashed"
      borderColor="#C0C0C0"
      p="0"
      h={{ base: "30px", sm: "40px" }}
      borderRadius="md"
    >
     {send}
    </Button>
  );
};

export default SubmitButtonComponent;
