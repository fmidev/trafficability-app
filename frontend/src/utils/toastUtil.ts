import { ReactNode } from "react";
import { useToast } from "@chakra-ui/react";

export const showToast = (
  toast: ReturnType<typeof useToast>,
  title: string,
  description: ReactNode | string,
  status: "error" | "success" | "info" | "warning"
) => { 
  toast({
    title,
    description: description,
    status,
    duration: 5000,
    isClosable: true,
  });
};