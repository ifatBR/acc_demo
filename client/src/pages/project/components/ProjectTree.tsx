import { useState } from "react";
import {
  Box,
  Flex,
  Spinner,
  Text,
  TreeView,
  type TreeCollection,
} from "@chakra-ui/react";
import type { BrowserNode, BrowserNodeType } from "../ProjectPage";
import { Folder, FileText, FolderKanban } from "lucide-react";
import { NodeMenu } from "./NodeMenu";
import { COLORS } from "@/styles/designTokens";

const ICONS: Record<BrowserNodeType, React.ElementType> = {
  folder: Folder,
  file: FileText,
};

function NodeIcon({ type }: { type: BrowserNodeType }) {
  const Icon = ICONS[type];
  return <Icon size={14} />;
}

interface ProjectTreeProps {
  collection: TreeCollection<BrowserNode>;
  onFileClick: (node: BrowserNode) => void;
  onDelete: (node: BrowserNode) => void;
  onUploadFile: (node: BrowserNode) => void;
  expandedValues: string[];
  onExpandedChange: (vals: string[]) => void;
}

export function ProjectTree({
  collection,
  onFileClick,
  onDelete,
  onUploadFile,
  expandedValues,
  onExpandedChange,
}: ProjectTreeProps) {
  const [hoveredNodeId, setHoveredNodeId] = useState<string | null>(null);

  return (
    <Box p={4} overflowY="auto" h="full" w="600px">
      <TreeView.Root
        collection={collection}
        expandedValue={expandedValues}
        onExpandedChange={({ expandedValue }) =>
          onExpandedChange(expandedValue)
        }
      >
        <TreeView.Tree>
          <TreeView.Node<BrowserNode>
            indentGuide={<TreeView.BranchIndentGuide />}
            render={({ node, nodeState }) => {
              if (node.isLoading) {
                return (
                  <TreeView.Item cursor="default" pointerEvents="none">
                    <Flex align="center" gap={2} py={1}>
                      <Spinner size="xs" />
                      <Text fontSize="xs" color="gray.500">
                        Uploading file...
                      </Text>
                    </Flex>
                  </TreeView.Item>
                );
              }

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
                      <FolderKanban />
                      <TreeView.BranchText ml="10px">
                        {node.label}
                      </TreeView.BranchText>
                    </TreeView.BranchTrigger>
                    <Box visibility={isHovered ? "visible" : "hidden"}>
                      <NodeMenu
                        node={node}
                        onDelete={onDelete}
                        onUploadFile={onUploadFile}
                      />
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
                    <NodeMenu
                      node={node}
                      onDelete={onDelete}
                      onUploadFile={onUploadFile}
                    />
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
