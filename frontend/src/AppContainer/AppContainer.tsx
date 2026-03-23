import { MouseEvent, useContext, useEffect, useState } from "react";
import LanguageSelector from "../LanguageSelector/LanguageSelector";
import {
  Box,
  Flex,
  Grid,
  GridItem,
  useToast,
  Text,
  Image,
  HStack,
  useBreakpointValue,
} from "@chakra-ui/react";
import soil_boot_footprint from "../assets/soil_boot_footprint.png";
import { Position } from "../types";
import AppContext from "../context/AppContext/AppContext";
import {
  AddLocationAltOutlined,
  AddPhotoAlternateOutlined,
  WaterDropOutlined,
  AssessmentOutlined,
  EmojiEventsOutlined,
} from "@mui/icons-material";
import FilesView from "../Views/FilesView/FileView";
import Header from "../components/Header/Header";
import MapView from "../Views/MapView/MapView";
import InfoComponent from "../components/InfoComponent/InfoComponent";
import RadioInputComponent from "../components/RadioInputComponent/RadioInputComponent";
import SubmitButtonComponent from "../components/SubmitButtonComponent/SubmitButtonComponent";
import LogoComponent from "../components/LogoComponent/LogoComponent";
import ContactComponent from "../components/ContactComponent/ContactComponent";
import CheckboxComponent from "../components/CheckboxComponent/CheckboxComponent";
import { lang } from "../Lang/lang";
import { handleSubmit } from "../utils/handleSubmit";

const AppContainer = () => {
  const [initPosition, setOriginalPosition] = useState<Position>({
    lat: null,
    lon: null,
  });
  const [userObservedPosition, setObservedPosition] = useState<Position>({
    lat: null,
    lon: null,
  });
  const [fileGeoLocationField, setFileGeoLocationField] = useState<Position>({
    lat: null,
    lon: null,
  });
  const [mapAccuracy, setMapAccuracy] = useState<number | null>(null);
  const [answerField, setAnswer] = useState<string>("");
  const [certainty, setCertainty] = useState<string>("");
  const [localStateCrossHair, setLocalStateCrosshair] =
    useState<boolean>(false);

  const [fileField, setFileField] = useState<{
    data: File | string;
    name: string;
  }>({ data: "", name: "" });
  const [pictureField, setPictureField] = useState<{
    data: File | string;
    name: string;
  }>({ data: "", name: "" });
  const [isStreamActive, setIsStreamActive] = useState<boolean>(false);
  const [uploadedPhotoCreatedDate, setUploadedPhotoCreatedDate] = useState<string>("");
  const [mobilePictureField, setMobilePictureField] = useState<{
    data: File | string;
    name: string;
  }>({ data: "", name: "" });

  const toast = useToast();

  const appContext = useContext(AppContext);
  if (!appContext) {
    throw new Error("Context is needed");
  }

  const {
    crosshair,
    fileDateTime,
    answer,
    initialLocation,
    userAdjustedLocation,
    fileGeoLocation,
    file,
    picture,
    evaluateAnswer,
    mobilePicture,
    strokeColor,
    check,
    contestantName,
    currentLanguage,
    setLanguage,
    updatePicture,
    updateAnswer,
    updateEvaluateAnswer,
    updateCrosshair,
    updateStrokeColor,
    updateCheck,
    updateContestantName,
    setfileDateTime,
    updateFileGeoLocation
  } = appContext;

  type LanguageKeys = keyof typeof lang;

  const language = lang[currentLanguage as LanguageKeys] || lang["fi"];

  // VITE_BACKEND_PROD_API_URL
  const apiURL =
    import.meta.env.DEV === true
      ? import.meta.env.VITE_BACKEND_DEV_API_URL
      : import.meta.env.VITE_BACKEND_PROD_API_URL;

  useEffect(() => {
    setOriginalPosition({ lat: initialLocation.lat, lon: initialLocation.lon });
    setObservedPosition({
      lon: userAdjustedLocation.lon,
      lat: userAdjustedLocation.lat,
    });
    setMapAccuracy(initialLocation.accurracy || null);
    setAnswer(answer);
    setCertainty(evaluateAnswer);
    setLocalStateCrosshair(crosshair);
  }, [
    answer,
    evaluateAnswer,
    crosshair,
    initialLocation.lat,
    initialLocation.lon,
    initialLocation.accurracy,
    userAdjustedLocation.lat,
    userAdjustedLocation.lon,
  ]);

  useEffect(() => {
    if (mobilePicture instanceof File) {
      setMobilePictureField({ data: mobilePicture, name: mobilePicture.name });
    }
  }, [mobilePicture]);

  useEffect(() => {
    if (file instanceof File) {
      setFileField({ data: file, name: file.name });
    }
  }, [file]);

  useEffect(() => {
    if (typeof picture.data === "string") {
      setPictureField({ data: picture.data, name: picture.name });
    }
  }, [picture]);

  useEffect(() => {
    if (fileDateTime !== "") {
      const newDate = new Date(fileDateTime).toISOString();
      setUploadedPhotoCreatedDate(newDate);
    }
  }, [fileDateTime]);

  useEffect(() => {
    if (fileGeoLocation.lat !== null && fileGeoLocation.lon !== null) {
      setFileGeoLocationField({
        lat: fileGeoLocation.lat,
        lon: fileGeoLocation.lon,
      });
    }
  }, [fileGeoLocation.lat, fileGeoLocation.lon]);

  const handleSubmitWrapper = async (e: MouseEvent) => {
    e.preventDefault();
    const button = e.currentTarget;
    button.setAttribute("disabled", "true");
    const result = await handleSubmit(
      initPosition,
      fileField,
      pictureField,
      mobilePictureField,
      uploadedPhotoCreatedDate,
      certainty,
      answerField,
      check,
      contestantName,
      mapAccuracy,
      fileGeoLocationField,
      userObservedPosition,
      apiURL,
      currentLanguage,
      toast
    );
    button.removeAttribute("disabled");
    return result;
  };

  const showTakenPicture =
    fileField.data || pictureField.data || mobilePictureField.data;
  const isMobile = useBreakpointValue({ base: true, sm: false });

  const renderImage = (imageData: File | string) => {
    if (!imageData) return null;

    const src =
      imageData instanceof File
        ? URL.createObjectURL(imageData)
        : typeof imageData === "string"
        ? imageData
        : undefined;

    return src ? (
      <Image
        src={src}
        alt="kuva"
        objectFit="cover"
        borderRadius="md"
        height="100%"
        width="100%"
      />
    ) : null;
  };

  return (
    <Grid
      minH="100vh"
      maxW="900px"
      m="auto"
      p="2"
      rowGap="1"
      templateAreas={`
        "header"
        "info"
        "map"
        "exampleFileArea"
        "uploadFileArea"
        "uploadedFileArea"
        "radioButton"
        "radioButton2"
        "contestantNameArea"
        "checkoxArea"
        "send"
        `}
      gridTemplateRows={{
        base: `
          minmax(20px, max-content)
          minmax(20px, max-content)
          minmax(400px, max-content)   
          minmax(300px, max-content)
          minmax(30px, max-content)
          minmax(auto, max-content)
          minmax(auto, max-content) 
          auto
          auto
          auto 
          auto`,
        sm: `
          minmax(20px, max-content)
          minmax(20px, max-content)
          minmax(400px, max-content) 
          minmax(400px, max-content) 
          minmax(auto, max-content) 
          minmax(auto, max-content) 
          minmax(auto, max-content) 
          auto
          auto
          auto 
          auto`,
      }}
      gridTemplateColumns={"100%"}
      fontFamily="Poppins"
    >
      <GridItem
        area={"header"}
        height={{ base: "80px", sm: "100px", md: "120px" }}
      >
        <Flex
          direction="row"
          alignItems="start"
          position="relative"
          height="100%"
          width="100%"
          wrap="nowrap"
          gap="4"
          justifyContent="space-between"
        >
          <Box w="55%">
            <Flex alignItems="center">
              <Header
                title={language?.mainTitle.header}
                fontSize="calc(0.9rem + 1.3vmin)"
              />
            </Flex>
          </Box>
          <Box w="35%">
            <Flex alignItems="center" flexDirection="row">
              <LogoComponent />
            </Flex>
          </Box>
          <Box w="10%">
            <Flex
              alignItems="center"
              flexDirection="row"
              justifyContent="flex-end"
              pt={{ base: "0.4rem", sm: "0" }}
            >
              <LanguageSelector
                abbreviation={currentLanguage}
                setCurrentLanguage={setLanguage}
              />
            </Flex>
          </Box>
        </Flex>
      </GridItem>

      <GridItem area={"info"} height="100%">
        <InfoComponent currentLanguage={currentLanguage} />
      </GridItem>
      <GridItem area={"map"} height={{ base: "400px", sm: "550px" }}>
        <Box>
          <HStack w="100%">
            <Box>
              <AddLocationAltOutlined
                fontSize={isMobile ? "medium" : "large"}
                sx={{ marginLeft: "-6px", marginRight: "-4px" }}
              />
            </Box>
            <Header title={language.mapTexts.header} showAsterisk />
          </HStack>
          <Box>
            <Text fontSize="small">{language.mapTexts.subHeader}</Text>
          </Box>
        </Box>
        <Box height="86%">
          <MapView
            mapInfoText={language.mapTexts.mapInfoText}
            setCrosshair={updateCrosshair}
            crosshair={localStateCrossHair}
            setStrokeColor={updateStrokeColor}
            strokeColor={strokeColor}
            setMapStrokeColor={updateStrokeColor}
          />
        </Box>
      </GridItem>

      <GridItem
        area={"exampleFileArea"}
        height={{ base: "320px", sm: "450px" }}
      >
        <Box h="100%">
          <HStack h="10%">
            <AddPhotoAlternateOutlined
              fontSize={isMobile ? "medium" : "large"}
              sx={{ marginLeft: "-2px", marginRight: "-4px" }}
            />
            <Header title={language.examplePictureText.header} showAsterisk />
          </HStack>

          <Box h="90%" w="100%" flex="1" borderRadius="md" boxShadow="sm">
            <Image
              src={soil_boot_footprint}
              h="100%"
              w="100%"
              objectFit="cover"
              border="1px solid"
              borderColor="inherit"
              borderRadius="md"
            />
          </Box>
        </Box>
      </GridItem>

      <GridItem
        area={"uploadFileArea"}
        h="100%"
        height={{ base: "auto", sm: "auto" }}
        w="auto"
        mt="2"
      >
        <Box h="100%">
          <FilesView
            buttonText={language.fileField.text}
            isStreamActive={isStreamActive}
            setIsStreamActive={setIsStreamActive}
            fileUpdate={setFileField}
            pictureName={pictureField.name}
            updatePicture={updatePicture}
            setMobilePicture={setMobilePictureField}
            mobilePictureName={mobilePictureField.name}
            selectedFileName={fileField.name}
            setFileDateTimeOriginal={setfileDateTime}
            setFileGeoLocation={updateFileGeoLocation}
          />
        </Box>
      </GridItem>

      {showTakenPicture && (
        <GridItem
          area={"uploadedFileArea"}
          minH="250px"
          height={{ base: "288px", sm: "405px" }}
          mt="2"
          boxSizing="border-box"
        >
          <Flex
            h="100%"
            flexDirection={isMobile ? "row" : "column"}
            justifyContent="center"
            wrap="nowrap"
            gap="2"
            mt="1"
            width="100%"
            ml="auto"
            mr="auto"
          >
            <Box
              h="100%"
              w="100%"
              flex="1"
              borderRadius="md"
              overflow="hidden"
              boxShadow="sm"
            >
              {renderImage(fileField.data) ||
                renderImage(pictureField.data) ||
                renderImage(mobilePictureField.data)}
            </Box>
          </Flex>
        </GridItem>
      )}
      <GridItem
        area={"radioButton"}
        mt={showTakenPicture ? { base: "2" } : { base: "2", sm: "4" }}
        height={{ base: "100%", sm: "100%" }}
      >
        <Box h="100%">
          <HStack>
            <WaterDropOutlined
              fontSize={isMobile ? "medium" : "large"}
              sx={{ marginLeft: "-6px", marginRight: "-4px" }}
            />
            <Header title={language.soilMoisture.header} showAsterisk />
          </HStack>
          <RadioInputComponent
            answers={language.soilMoisture.options}
            info={language.soilMoisture.moreInfo}
            updateValue={updateAnswer}
          />
        </Box>
      </GridItem>

      <GridItem area={"radioButton2"} mt={{ base: "2", sm: "6" }}>
        <Box>
          <HStack>
            <AssessmentOutlined
              fontSize={isMobile ? "medium" : "large"}
              sx={{ marginLeft: "-2.5px", marginRight: "-4px" }}
            />
            <Header
              title={language.certaintyOfObservationAssessment.header}
              showAsterisk
            />
          </HStack>
          <RadioInputComponent
            answers={language.certaintyOfObservationAssessment.options}
            updateValue={updateEvaluateAnswer}
          />
        </Box>
      </GridItem>
      <GridItem area={"contestantNameArea"} mt={{ base: "2", sm: "6" }}>
        <HStack pb="2">
          <EmojiEventsOutlined
            fontSize={isMobile ? "medium" : "large"}
            sx={{ marginLeft: "-2.5px", marginRight: "-4px" }}
          />
          <Header title={language.commentComponent.header} />
        </HStack>
        <ContactComponent
          contestantName={contestantName}
          setContestantName={updateContestantName}
          header={language.commentComponent.header}
          subHeaderText={language.commentComponent.subHeaderText}
        />
        <GridItem area={"checkoxArea"} mt="2">
          <CheckboxComponent
            text={language.checkboxComponent.text}
            readMore={language.checkboxComponent.readMore}
            checkboxValue={check}
            setChecked={updateCheck}
            modalContent={language.checkboxComponent.modalContent}
          />
        </GridItem>
      </GridItem>
      <GridItem area={"send"}>
        <Flex
          position="relative"
          mt="3"
          mb="4"
          w="100%"
          justifyContent="center"
        >
          <SubmitButtonComponent
            handleSubmit={handleSubmitWrapper}
            send={language.sendButton.text}
          />
        </Flex>
      </GridItem>
    </Grid>
  );
};

export default AppContainer;
