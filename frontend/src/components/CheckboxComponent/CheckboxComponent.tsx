import { useState } from "react";
import {
  Box,
  HStack,
  Checkbox,
  Link,
  Modal,
  ModalOverlay,
  ModalContent,
  ModalHeader,
  ModalBody,
  ModalCloseButton,
  OrderedList,
  ListItem,
} from "@chakra-ui/react";

type CheckboxProps = {
  text: string;
  checkboxValue: boolean;
  readMore: string;
  modalContent: {
    header: string;
    body: Array<{ heading: string; content: string}>;
  };
  setChecked: (value: boolean) => void;
};

const CheckboxComponent = ({
  text,
  readMore,
  checkboxValue,
  modalContent,
  setChecked,
}: CheckboxProps) => {
  const [isOpen, setIsOpen] = useState<boolean>(false);
  const onClose = () => setIsOpen(false);
  const onOpen = () => setIsOpen(true);

  return (
    <HStack fontSize="calc(8px + 1vmin)">
      <Checkbox
        borderColor="gray.500"
        size="sm"
        type="checkbox"
        checked={checkboxValue}
        onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
          setChecked(e.target.checked)
        }
      >
        {text}
      </Checkbox>
      <Box as="span">
        <Link
          textDecoration="underline"
          color="#3674B5"
          onClick={onOpen}
        >
         {readMore}
        </Link>
        <Modal isOpen={isOpen} onClose={onClose}>
          <ModalOverlay />
          <ModalContent>
            <ModalHeader>{modalContent.header}</ModalHeader>
            <ModalCloseButton />
            <ModalBody mb="4">
              <OrderedList spacing={3} fontSize="calc(10px + 0.8vmin)">
                {modalContent.body.map((item, i) => (
                  <ListItem key={item.heading}>
                    <Box fontWeight="bold">{item.heading}</Box>
                    {i === modalContent.body.length -1 ? (
                      <>
                       {item.content} <Link href="mailto:vettakengassa@fmi.fi" color="blue.500">vettakengassa@fmi.fi</Link>
                      </>
                    ) : (
                      item.content
                    )}
                  </ListItem>
                ))}
              </OrderedList>
            </ModalBody>
          </ModalContent>
        </Modal>
      </Box>
    </HStack>
  );
};

export default CheckboxComponent;
