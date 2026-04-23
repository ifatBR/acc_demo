import { IconButton, Menu, Portal } from "@chakra-ui/react";
import { MoreVertical } from "lucide-react";
import type { BrowserNode } from "../BrowserPage";
import { COLORS, SHADOWS } from "@/styles/designTokens";

interface NodeMenuProps {
  node: BrowserNode;
  onDelete: (node: BrowserNode) => void;
}

export function NodeMenu({ node, onDelete }: NodeMenuProps) {
  return (
    <Menu.Root>
      <Menu.Trigger asChild>
        <IconButton
          aria-label="More options"
          size="xs"
          variant="ghost"
          onClick={(e) => e.stopPropagation()}
          bg="none"
        >
          <MoreVertical size={12} />
        </IconButton>
      </Menu.Trigger>
      <Portal>
        <Menu.Positioner>
          <Menu.Content shadow={SHADOWS.sm}>
            <Menu.Item
              value="delete"
              color={COLORS.semantic.error}
              onClick={(e) => {
                e.stopPropagation();
                onDelete(node);
              }}
            >
              Delete
            </Menu.Item>
          </Menu.Content>
        </Menu.Positioner>
      </Portal>
    </Menu.Root>
  );
}
