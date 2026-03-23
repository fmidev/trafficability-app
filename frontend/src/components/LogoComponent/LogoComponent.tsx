import { Flex, Image, useMediaQuery, Box } from "@chakra-ui/react";
import ulkoministerio_images from '../../assets/fmi.png';
import ulkoministeri from '../../assets/logo.png';

const LogoComponent = () => {
  const [isLargerThan768] = useMediaQuery("(min-width: 768px)");
  return (
  <Flex justifyContent="flex-end" flexDirection="row" w="100%">
    {isLargerThan768 ? <Box w="100%">
       <Image src={ulkoministeri} alt='Logo' h="auto" />
      </Box> :
    <Box w="100%">
      <Image src={ulkoministerio_images} alt='Logo' h="60px" ml="auto"/>
    </Box>}
  </Flex>
  )
}

export default LogoComponent;