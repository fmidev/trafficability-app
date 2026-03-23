import { useEffect, useRef, useState } from "react";
import {
  Box,
  Button,
  Icon,
  useToast,
  Image,
  Input,
  InputGroup,
  Text,
} from "@chakra-ui/react";
import { FaCamera } from "react-icons/fa";
import { showToast } from "../../utils/toastUtil";

interface CameraComponentProps {
  height?: string;
  isStreamActive: boolean;
  pictureName: string;
  mobilePictureName: string;
  setIsStreamActive: (active: boolean) => void;
  setFile: (file: { data: File | string; name: string }) => void;
  updatePicture: (picture: { data: string | File; name: string }) => void;
  setMobilePicture: (file: { data: File | string; name: string }) => void;
}

const isMobileDevice = () => {
  return /Mobi|Android/i.test(navigator.userAgent);
};

const CameraComponent: React.FC<CameraComponentProps> = ({
  height,
  isStreamActive,
  pictureName,
  mobilePictureName,
  setIsStreamActive,
  updatePicture,
  setFile,
  setMobilePicture,
}) => {
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const inputRef = useRef<HTMLInputElement | null>(null);
  const [capturedImage, setCapturedImage] = useState<string | null>(null);
  const [showImage, setShowImage] = useState<boolean>(false);

  const toast = useToast();

  const handleOpenCamera = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ video: true });
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        setIsStreamActive(true);
      }
    } catch (error) {
      const errorMessage =
        error instanceof DOMException
          ? {
              NotAllowedError: "Camera access was denied. Please allow access.",
              NotFoundError: "No camera found on your device.",
              NotReadableError: "The camera is not readable. Please try again.",
            }[error.name] || "An unexpected error occurred."
          : "An unknown error occurred.";
      showToast(toast, "Camera Error", errorMessage, "error");
    }
  };

  const handleCapture = () => {
    if (videoRef.current) {
      const canvas = document.createElement("canvas");
      const context = canvas.getContext("2d");

      if (context) {
        canvas.width = videoRef.current.videoWidth;
        canvas.height = videoRef.current.videoHeight;
        context.drawImage(videoRef.current, 0, 0, canvas.width, canvas.height);
        const dataUrl = canvas.toDataURL("image/jpeg");
        setCapturedImage(dataUrl);
        setShowImage(true);

        const tracks = (videoRef.current.srcObject as MediaStream).getTracks();
        tracks.forEach((track) => track.stop());
        setIsStreamActive(false);
      }
    }
  };

  const handleRemoveImage = () => {
    setCapturedImage(null);
  };

  useEffect(() => {
    const videoElement = videoRef.current;
    return () => {
      if (videoElement && videoElement.srcObject) {
        const tracks = (videoElement.srcObject as MediaStream).getTracks();
        tracks.forEach((track) => track.stop());
      }
    };
  }, []);

  const saveFile = () => {
    if (capturedImage) {
      const uniqueFilename = `image_${Date.now()}.jpeg`;
      updatePicture({ data: capturedImage, name: uniqueFilename });
      setFile({ data: "", name: "" });
    }
    setShowImage(false);
  };

  return (
    <>
      {isMobileDevice() ? (
        <Box
          border="1px dashed"
          position="relative"
          display="flex"
          alignItems="center"
          justifyContent="center"
          borderColor="#A9A9A9"
          borderRadius="md"
          overflow="hidden"
          h={height}
        >
          <InputGroup onClick={() => inputRef.current?.click()}>
            <Input
              type="file"
              accept="image/jpeg"
              ref={inputRef}
              hidden
              capture="environment"
              onChange={(e) => {
                const file = e.target.files?.[0];
                if (!file) return;
                setMobilePicture({ data: file, name: file.name });
                setFile({ data: "", name: "" });
              }}
            />
            {mobilePictureName === "" ? (
              <Icon as={FaCamera} boxSize="4" pos="relative" left="40%" />
            ) : (
              <Text fontSize="0.8rem" width="100%" margin="auto">
                {mobilePictureName}
              </Text>
            )}
          </InputGroup>
        </Box>
      ) : (
        <Box
          border="1px dashed"
          position="relative"
          borderRadius="md"
          overflow="hidden"
          h={height}
          borderColor="#A9A9A9"
          backgroundColor="#f9f9f9"
          zIndex={isStreamActive ? 10 : 0}
          data-testid="camera-component"
        >
          <Box height="100%">
            <video
              data-testid="video"
              ref={videoRef}
              style={{
                objectFit: "cover",
                width: "100%",
                minHeight: "100%",
                display: isStreamActive ? "block" : "none",
              }}
              autoPlay
            />
            {isStreamActive && (
              <Button
                onClick={handleCapture}
                position="absolute"
                bottom="30px"
                left="50%"
                transform="translateX(-50%)"
                data-testid="capture-button"
              >
                Ota kuva
              </Button>
            )}
            {pictureName === "" && !isStreamActive ? (
              <Icon
                as={FaCamera}
                position="absolute"
                left="46%"
                top="20%"
                zIndex={10}
                boxSize="4"
                onClick={handleOpenCamera}
                data-testid="camera-icon" 
              />
            ) : (
              <Box  overflow="hidden" 
              textOverflow="ellipsis" 
              whiteSpace="nowrap" 
              fontSize="calc(8px + 1vmin)"
              maxWidth="100%" >{pictureName}</Box>
            )}
          </Box>
        </Box>
      )}
      {capturedImage && showImage && (
        <Box>
          <Image src={capturedImage} alt="captured"/>
          <Button onClick={handleRemoveImage} zIndex={1000}>
            Poista kuva
          </Button>
          <Button onClick={saveFile} zIndex={1000}>
            Tallenna kuva
          </Button>
        </Box>
      )}
    </>
  );
};

export default CameraComponent;
