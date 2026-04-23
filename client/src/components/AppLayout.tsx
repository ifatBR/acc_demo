import { Outlet } from "react-router-dom";
import { Box } from "@chakra-ui/react";
import { Sidebar } from "./Sidebar";
import { SIDEBAR } from "@/styles/designTokens";
import { useLayout } from "@/context/LayoutContext";

export function AppLayout() {
  const { isCollapsed, setIsCollapsed } = useLayout();
  return (
    <>
      <Sidebar
        isCollapsed={isCollapsed}
        onToggle={() => setIsCollapsed(!isCollapsed)}
      />

      <Box
        as="main"
        ml={isCollapsed ? SIDEBAR.widthCollapsed : SIDEBAR.widthExpanded}
        minH="100vh"
        overflowY="auto"
        w={`calc(100% - ${isCollapsed ? SIDEBAR.widthCollapsed : SIDEBAR.widthExpanded})`}
        style={{
          transition: "margin-left 0.2s ease",
        }}
      >
        <Outlet />
      </Box>
    </>
  );
}
