import { Flex } from "@chakra-ui/react";
import { useLocation } from "react-router-dom";
import { Tooltip } from "./ui/tooltip";

import {
  FolderTree,
  ChevronLeft,
  ChevronRight,
  LogOut,
  Binoculars,
} from "lucide-react";
import {
  COLORS,
  ICON_SIZES,
  RADII,
  SHADOWS,
  SIDEBAR,
  SPACING,
  Z_INDEX,
} from "@/styles/designTokens";
import { ROUTES } from "@/constants/routes";
import { NavItem } from "./NavItem";

interface SidebarProps {
  isCollapsed: boolean;
  onToggle: () => void;
}

interface NavItemDef {
  label: string;
  to: string;
  Icon: React.ComponentType<{ size?: number }>;
}

const NAV_ITEMS: NavItemDef[] = [
  { label: "Browser", to: ROUTES.BROWSER, Icon: FolderTree },
  { label: "Viewer", to: ROUTES.VIEWER, Icon: Binoculars },
];

export function Sidebar({ isCollapsed, onToggle }: SidebarProps) {
  const { pathname } = useLocation();

  return (
    <Flex
      as="nav"
      direction="column"
      justify="space-between"
      position="fixed"
      top={0}
      left={0}
      h="100vh"
      w={isCollapsed ? SIDEBAR.widthCollapsed : SIDEBAR.widthExpanded}
      bg={COLORS.sidebar.bg}
      boxShadow={SHADOWS.sidebar}
      py={SPACING[4]}
      zIndex={Z_INDEX.sidebar}
      transition="width 0.2s ease"
      overflow="hidden"
    >
      {/* Nav items */}
      <Flex direction="column" gap={SPACING[1]} px={SPACING[2]}>
        {NAV_ITEMS.map(({ label, to, Icon }) => (
          <NavItem
            key={to}
            icon={Icon}
            label={label}
            to={to}
            isActive={pathname.startsWith(to)}
            isCollapsed={isCollapsed}
          />
        ))}
      </Flex>
      <Flex direction="column" gap={SPACING[1]} px={SPACING[2]}>
        {/* Logout */}
        <NavItem
          icon={LogOut}
          label="Log out"
          to={"/"}
          isCollapsed={isCollapsed}
        />

        {/* Toggle button — kept separate due to flex-end alignment when expanded */}
        <Flex
          as="button"
          onClick={onToggle}
          align="center"
          justify={isCollapsed ? "center" : "flex-end"}
          px={SPACING[3]}
          py={SPACING[3]}
          borderRadius={RADII.md}
          color={COLORS.sidebar.itemColor}
          bg="transparent"
          border="none"
          cursor="pointer"
          _hover={{ bg: COLORS.sidebar.itemHoverBg }}
          transition="background-color 0.15s ease"
          aria-label={isCollapsed ? "Expand sidebar" : "Collapse sidebar"}
        >
          <Tooltip content={isCollapsed ? "Expand" : "Collapse"}>
            {isCollapsed ? (
              <ChevronRight size={ICON_SIZES.md} />
            ) : (
              <ChevronLeft size={ICON_SIZES.md} />
            )}
          </Tooltip>
        </Flex>
      </Flex>
    </Flex>
  );
}
