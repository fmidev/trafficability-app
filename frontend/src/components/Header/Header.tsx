import { FC } from 'react';
import { Box, Heading, Text } from '@chakra-ui/react';

interface HeaderProps {
  title: string;
  showAsterisk?: boolean;
  fontSize?: string;
}

const Header: FC<HeaderProps> = ({ title, showAsterisk = false, fontSize }) => {
    return (
      <Box position="relative" w="100%" display="flex" alignItems="center">
        <Heading fontSize={ fontSize || "calc(0.9rem + 1vmin)"} fontFamily="'Source Sans Pro', sans-serif;">
          {title}
          {showAsterisk && <Text as="span" color="red">*</Text>}
        </Heading>
      </Box>
    );
}

export default Header;