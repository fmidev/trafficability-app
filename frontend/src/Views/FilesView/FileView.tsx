import { FC } from "react";
import { Box, Flex } from "@chakra-ui/react";
import { Position } from "../../types";
import CameraComponent from "../../components/CameraAccessComponent/CameraAccessComponent.tsx";
import FileUploadComponent from "../../components/FileUploadComponent/FileUploadComponent.tsx";

interface FilesPageProps {
  buttonText: string
  isStreamActive: boolean
  pictureName: string;
  mobilePictureName: string;
  selectedFileName: string;
  setIsStreamActive: (active: boolean) => void
  fileUpdate: (file: {data: File | string, name: string}) => void
  updatePicture: (picture: { data: string | File; name: string }) => void
  setMobilePicture: (file: {data: File | string, name: string}) => void;
  setFileDateTimeOriginal: (fileDateTimeOriginal: string) => void;
  setFileGeoLocation: (fileGeoLocation: Position) => void;

}
const FilesPage: FC<FilesPageProps> = ({ 
  buttonText, 
  isStreamActive, 
  pictureName,
  mobilePictureName,
  selectedFileName,
  setIsStreamActive,
  fileUpdate,
  updatePicture,
  setMobilePicture,
  setFileDateTimeOriginal,
  setFileGeoLocation
}) => {
  return (
      <Flex flexDirection="row" gap="2" height={{ base: '26px', sm: '36px'}}>
        {!isStreamActive && (
          <Box w="80%">
            <FileUploadComponent
              setFileGeoLocation={setFileGeoLocation}
              setfileDateTimeOriginal={setFileDateTimeOriginal}
              selectedFileName={selectedFileName}
              onChange={(file: {data: File | string, name: string}) => {
                if (file.data instanceof File) {
                  fileUpdate({ data: file.data, name: file.name });
                  updatePicture({ data: "", name: "" });
                  setMobilePicture({ data: "", name: "" });
                }
              }}
              buttonText={buttonText}
            />
          </Box>
        )}
        <Box minW={isStreamActive ? "70%" : "20%"} marginLeft="auto">
          <CameraComponent
            mobilePictureName={mobilePictureName}
            setMobilePicture={setMobilePicture}
            setFile={fileUpdate}
            pictureName={pictureName}
            height={!isStreamActive ? "100%" : "360px"}
            isStreamActive={isStreamActive}
            setIsStreamActive={setIsStreamActive}
            updatePicture={updatePicture}
          />
        </Box>
      </Flex>
  );
};

export default FilesPage;
