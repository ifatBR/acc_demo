import { COLORS } from "@/styles/designTokens";
import { Box, Flex, Spinner } from "@chakra-ui/react";

export function Loader() {
  return (
    <Flex direction="column" align="center">
      <Spinner size="lg" />
      <Box color={COLORS.text.inverse} mt="40px">
        Loading...
      </Box>
    </Flex>
  );
}
