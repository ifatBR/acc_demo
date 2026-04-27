import { Flex, Spinner } from "@chakra-ui/react";
import { BodyText } from "./Typography";

export function Loader() {
  return (
    <Flex direction="column" justify="center" align="center" h="100%">
      <Spinner size="lg" />
      <BodyText {...{ mt: "40px" }}>Loading...</BodyText>
    </Flex>
  );
}
