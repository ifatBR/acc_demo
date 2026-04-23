import { useState } from "react";
import { Box, Flex, TreeView, type TreeCollection } from "@chakra-ui/react";
import type { BrowserNode, BrowserNodeType } from "../BrowserPage";
import { Layers, Folder, FileText } from "lucide-react";
import { NodeMenu } from "./NodeMenu";
import { COLORS } from "@/styles/designTokens";

const ICONS: Record<BrowserNodeType, React.ElementType> = {
  project: Layers,
  folder: Folder,
  file: FileText,
};

function NodeIcon({ type }: { type: BrowserNodeType }) {
  const Icon = ICONS[type];
  return <Icon size={14} />;
}

interface BrowserTreeProps {
  collection: TreeCollection<BrowserNode>;
  onFileClick: (node: BrowserNode) => void;
  onDelete: (node: BrowserNode) => void;
}

export function BrowserTree({
  collection,
  onFileClick,
  onDelete,
}: BrowserTreeProps) {
  const [hoveredNodeId, setHoveredNodeId] = useState<string | null>(null);

  return (
    <Box p={4} overflowY="auto" h="full" w="600px">
      <TreeView.Root collection={collection}>
        <TreeView.Tree>
          <TreeView.Node<BrowserNode>
            indentGuide={<TreeView.BranchIndentGuide />}
            render={({ node, nodeState }) => {
              const isHovered = hoveredNodeId === node.value;

              if (nodeState.isBranch) {
                return (
                  <TreeView.BranchControl
                    onMouseEnter={() => setHoveredNodeId(node.value)}
                    onMouseLeave={() => setHoveredNodeId(null)}
                    _selected={{
                      bg: COLORS.highlight.dark,
                    }}
                    _hover={{
                      bg: COLORS.highlight.tertiary,
                    }}
                  >
                    <TreeView.BranchTrigger flex="1">
                      <TreeView.BranchIndicator />
                      <NodeIcon type={node.nodeType} />
                      <TreeView.BranchText>{node.label}</TreeView.BranchText>
                    </TreeView.BranchTrigger>
                    <Box visibility={isHovered ? "visible" : "hidden"}>
                      <NodeMenu node={node} onDelete={onDelete} />
                    </Box>
                  </TreeView.BranchControl>
                );
              }

              return (
                <TreeView.Item
                  onMouseEnter={() => setHoveredNodeId(node.value)}
                  onMouseLeave={() => setHoveredNodeId(null)}
                  onClick={() => onFileClick(node)}
                  _selected={{
                    bg: COLORS.highlight.dark,
                  }}
                  _hover={{
                    bg: COLORS.highlight.tertiary,
                  }}
                >
                  <NodeIcon type={node.nodeType} />
                  <TreeView.ItemText flex="1">{node.label}</TreeView.ItemText>
                  <Box visibility={isHovered ? "visible" : "hidden"}>
                    <NodeMenu node={node} onDelete={onDelete} />
                  </Box>
                </TreeView.Item>
              );
            }}
          />
        </TreeView.Tree>
      </TreeView.Root>
    </Box>
  );
}
