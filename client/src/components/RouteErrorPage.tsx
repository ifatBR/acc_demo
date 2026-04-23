import { Box, Flex } from "@chakra-ui/react";
import { Button } from "./Button";
import { RotateCcw } from "lucide-react";
import { ROUTES } from "@/constants/routes";
import { useNavigate } from "react-router-dom";

export function RouteErrorPage() {
  const navigate = useNavigate();
  return (
    <Flex
      h="100vh"
      color="white"
      direction="column"
      align="center"
      justify="center"
    >
      <Box>Something went wrong</Box>
      <Button
        mt="20px"
        variant="reversed"
        onClick={() => navigate(ROUTES.LANDING)}
      >
        Restart <RotateCcw />
      </Button>
    </Flex>
  );
}
