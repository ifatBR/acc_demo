import { Flex } from "@chakra-ui/react";
import { Button } from "@/components/Button";
import { COLORS, RADII, SHADOWS, SPACING } from "@/styles/designTokens";
import { BodyText, SectionTitle } from "@/components/Typography";
import { useNavigate } from "react-router-dom";
import { ROUTES } from "@/constants/routes";

export function LandingPage() {
  const navigate = useNavigate();
  const onStart = async () => {
    navigate(ROUTES.PROJECT);
  };
  return (
    <Flex minH="100vh" align="center" justify="center" bg={COLORS.bg.base}>
      <Flex
        direction="column"
        align="center"
        gap="20px"
        bg={COLORS.bg.surface}
        borderRadius={RADII.xl}
        boxShadow={SHADOWS.popup}
        p={SPACING[8]}
        w="100%"
        maxW="400px"
      >
        <SectionTitle>Welcome!</SectionTitle>
        <BodyText align="center">
          This is a demo app where I played with the ACC API
        </BodyText>
        <Button variant="primary" width="100%" onClick={onStart}>
          Check it out
        </Button>
      </Flex>
    </Flex>
  );
}
