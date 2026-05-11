import { Button } from "@/components/Button";
import { ROUTES } from "@/constants/routes";
import { SPACING, RADII, COLORS } from "@/styles/designTokens";
import { Box, Flex } from "@chakra-ui/react";
import { useNavigate } from "react-router-dom";

export function ProjectListPage() {
  const navigate = useNavigate();
  const projects = [
    { id: "proj1", name: "Project 1" },
    { id: "proj2", name: "Project 2" },
  ];
  return (
    <Box>
      <Flex
        align="center"
        gap={SPACING[3]}
        px={SPACING[3]}
        py={SPACING[2]}
        borderRadius={RADII.sm}
        maxW="600px"
        transition="background-color 0.15s ease"
        _hover={{ bg: COLORS.highlight.secondary }}
      >
        {projects.map(({ id, name }) => (
          <Button
            onClick={() => navigate(`${ROUTES.PROJECT.replace(":id", id)}`)}
          >
            {name}
          </Button>
        ))}
      </Flex>
    </Box>
  );
}
