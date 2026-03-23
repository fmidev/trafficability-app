import { useRef, ChangeEvent, useState, FC, DragEvent } from "react";
import { Box, Input, InputGroup, Flex } from "@chakra-ui/react";
import { Position } from "../../types";
import * as exifr from 'exifr';

type UploadViewProps = {
  onChange: (file: { data: File | string; name: string }) => void;
  setfileDateTimeOriginal: (fileDateTimeOriginal: string) => void;
  setFileGeoLocation: (fileGeoLocation: Position) => void;
  accept?: string;
  multiple?: boolean;
  buttonText: string;
  selectedFileName: string;
};

const FileUploadComponent: FC<UploadViewProps> = ({
  accept = "*/*",
  multiple,
  buttonText,
  selectedFileName,
  onChange,
  setfileDateTimeOriginal,
  setFileGeoLocation,
}) => {
  const inputRef = useRef<HTMLInputElement | null>(null);
  const [isDraggingOver, setIsDraggingOver] = useState<boolean>(false);
  // const [selectedFileName, setSelectedFileName] = useState<string | null>(null);

  const handleClick = () => inputRef.current?.click();

  const handleFileUpload = async (file: File) => {
   
    try {
      const exifData = await exifr.parse(file);
      
      if (exifData) {
        onChange({ data: file, name: file.name});
        setfileDateTimeOriginal(exifData.DateTimeOriginal || "");
        setFileGeoLocation({
          lat: exifData.latitude || null,
          lon: exifData.longitude || null,
        });
      }
      
    } catch (error) {
      console.error("Error reading EXIF data:", error);
    }
  };

  const handleDrop = (event: DragEvent<HTMLDivElement>) => {
    event.preventDefault();
    event.stopPropagation();
    setIsDraggingOver(false);
    const files = event.dataTransfer.files;
    if (files && files.length > 0) {
      handleFileUpload(files[0]);
    }
  };

  const handleDragLeave = (event: DragEvent<HTMLDivElement>) => {
    event.preventDefault();
    event.stopPropagation();
    setIsDraggingOver(false);
  };

  const handleInputChange = (event: ChangeEvent<HTMLInputElement>) => {
    if (event.target.files && event.target.files.length > 0) {
      const selectedFile = event.target.files[0];
      handleFileUpload(selectedFile);
    }
  };

  return (
    <Box
      border={isDraggingOver ? "1px solid" : "1px dashed"}
      position="relative"
      backgroundColor={isDraggingOver ? "#A0A0A0" : "#f9f9f9"}
      height="100%"
      borderColor="#A9A9A9"
      borderRadius="md"
    >
      <InputGroup
        data-testid="drop-zone"
        position="relative"
        alignItems="center"
        fontSize="calc(8px + 1vmin)"
        minHeight="100%"
        onClick={handleClick}
        onDragOver={(event) => {
          event.preventDefault();
          event.stopPropagation();
          setIsDraggingOver(true);
        }}
        onDrop={handleDrop}
        onDragLeave={handleDragLeave}
      >
        <Flex
          position="relative"
          width="100%"
          textAlign="center"
          justifyContent="center"
          alignItems="center"
          height="100%"
        >
          {selectedFileName ? selectedFileName : buttonText}
          <Input
            data-testid="file-input"
            type="file"
            value=""
            onChange={handleInputChange}
            hidden
            accept={accept}
            multiple={multiple || false}
            ref={inputRef}
          />
        </Flex>
      </InputGroup>
    </Box>
  );
};

export default FileUploadComponent;
