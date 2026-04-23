import { useState, useEffect, useCallback, useRef } from "react";
import { Box, Flex, Spinner, Text, TreeView } from "@chakra-ui/react";
import { createTreeCollection } from "@ark-ui/react/collection";
import type { TreeCollection } from "@ark-ui/react/collection";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { Building2, Layers, Folder, FileText } from "lucide-react";
import {
  fetchHubs,
  fetchProjects,
  fetchTopFolders,
  fetchFolderContents,
  getItemVersions,
} from "@/api/browser";
import type { FolderItem } from "@/api/browser";
import { ViewerModal } from "./components/ViewerModal";
import { Buffer } from "buffer";

// ─── Types ───────────────────────────────────────────────────────────────────

type BrowserNodeType = "hub" | "project" | "folder" | "file";

type BrowserNode = {
  value: string;
  label: string;
  nodeType: BrowserNodeType;
  projectId?: string;
  hubId?: string;
  children?: BrowserNode[]; // undefined = leaf (file), [] = expandable branch
  childrenCount?: number; // non-null value tells Ark UI this is a branch even when children: []
};

// ─── Utilities ───────────────────────────────────────────────────────────────

function mapContents(
  items: FolderItem[],
  projectId: string,
  hubId?: string,
): BrowserNode[] {
  return items
    .filter((i) => !i.hidden)
    .map((item) => ({
      value: item.id,
      label: item.name,
      nodeType: (item.type === "folders"
        ? "folder"
        : "file") as BrowserNodeType,
      projectId,
      hubId,
      children: item.type === "folders" ? [] : undefined,
      childrenCount: item.type === "folders" ? 1 : undefined,
    }));
}

function buildCollection(
  hubs: { id: string; name: string }[],
): TreeCollection<BrowserNode> {
  return createTreeCollection<BrowserNode>({
    rootNode: {
      value: "root",
      label: "Root",
      nodeType: "hub",
      children: hubs.map((h) => ({
        value: h.id,
        label: h.name,
        nodeType: "hub",
        children: [],
        childrenCount: 1, // marks as branch even before children are loaded
      })),
    },
  });
}

const EMPTY_COLLECTION = buildCollection([]);

// ─── Icon helper ─────────────────────────────────────────────────────────────

const ICONS: Record<BrowserNodeType, React.ElementType> = {
  hub: Building2,
  project: Layers,
  folder: Folder,
  file: FileText,
};

function NodeIcon({ type }: { type: BrowserNodeType }) {
  const Icon = ICONS[type];
  return <Icon size={14} />;
}

// ─── Component ───────────────────────────────────────────────────────────────

export function BrowserPage() {
  const queryClient = useQueryClient();

  const {
    data: hubs,
    isLoading: hubsLoading,
    error: hubsError,
  } = useQuery({
    queryKey: ["hubs"],
    queryFn: fetchHubs,
  });

  const [urn, setUrn] = useState<string | null>(null);
  const [previewFileName, setPreviewFileName] = useState<string | null>(null);
  const [collection, setCollection] =
    useState<TreeCollection<BrowserNode>>(EMPTY_COLLECTION);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const hubsInitialized = useRef(false);

  const viewItem = async (itemName: string, itemId: string, projectId: any) => {
    const itemVersions = await getItemVersions(projectId, itemId);
    const viewUrn = itemVersions[0]?.id;
    const encodedUrn = Buffer.from(viewUrn).toString("base64");
    setPreviewFileName(itemName);
    setUrn(encodedUrn);
  };

  // Populate the collection with hubs exactly once (prevents re-creation on refetch)
  useEffect(() => {
    if (hubs && !hubsInitialized.current) {
      hubsInitialized.current = true;
      setCollection(buildCollection(hubs));
    }
  }, [hubs]);

  // Called by the TreeView when a branch is expanded for the first time
  const loadChildren = useCallback(
    async ({ node }: { node: BrowserNode }): Promise<BrowserNode[]> => {
      // Clear any previous error for this node
      setErrors((prev) => {
        const { [node.value]: _removed, ...rest } = prev;
        return rest;
      });

      if (node.nodeType === "hub") {
        const projects = await queryClient.fetchQuery({
          queryKey: ["projects", node.value],
          queryFn: () => fetchProjects(node.value),
        });
        return projects.map((p) => ({
          value: p.id,
          label: p.name,
          nodeType: "project" as const,
          hubId: node.value,
          children: [],
          childrenCount: 1,
        }));
      }

      if (node.nodeType === "project") {
        const topFolders = await queryClient.fetchQuery({
          queryKey: ["topFolders", node.value],
          queryFn: () => fetchTopFolders(node.hubId!, node.value),
        });
        if (topFolders.length === 0) return [];

        // Use the first top folder as the project root — do NOT render it as a node
        const rootFolderId = topFolders[0].id;
        const contents = await queryClient.fetchQuery({
          queryKey: ["folderContents", node.value, rootFolderId],
          queryFn: () => fetchFolderContents(node.value, rootFolderId),
        });
        return mapContents(contents, node.value, node.hubId);
      }

      if (node.nodeType === "folder") {
        const contents = await queryClient.fetchQuery({
          queryKey: ["folderContents", node.projectId, node.value],
          queryFn: () => fetchFolderContents(node.projectId!, node.value),
        });
        return mapContents(contents, node.projectId!, node.hubId);
      }

      return [];
    },
    [queryClient],
  );

  // Sync the collection after children load so controlled state stays accurate
  const handleLoadChildrenComplete = useCallback(
    ({ collection: updated }: { collection: TreeCollection<BrowserNode> }) => {
      setCollection(updated);
    },
    [],
  );

  // Track per-node errors for inline display
  const handleLoadChildrenError = useCallback(
    ({ nodes }: { nodes: { node: BrowserNode; error: Error }[] }) => {
      const newErrors: Record<string, string> = {};
      for (const { node, error } of nodes) {
        newErrors[node.value] = error.message || "Failed to load";
      }
      setErrors((prev) => ({ ...prev, ...newErrors }));
    },
    [],
  );

  if (hubsLoading) {
    return (
      <Flex justify="center" align="center" h="full" p={8}>
        <Spinner />
      </Flex>
    );
  }

  if (hubsError) {
    return (
      <Box p={4}>
        <Text color="red.400" fontSize="sm">
          Failed to load hubs: {(hubsError as Error).message}
        </Text>
      </Box>
    );
  }

  return (
    <Box p={4} overflowY="auto" h="full">
      <TreeView.Root
        collection={collection}
        loadChildren={loadChildren}
        onLoadChildrenComplete={handleLoadChildrenComplete}
        onLoadChildrenError={handleLoadChildrenError}
      >
        <TreeView.Tree>
          <TreeView.Node<BrowserNode>
            indentGuide={<TreeView.BranchIndentGuide />}
            render={({ node, nodeState }) => {
              const error = errors[node.value];

              if (nodeState.isBranch) {
                return (
                  <TreeView.BranchControl>
                    <TreeView.BranchTrigger>
                      <TreeView.BranchIndicator />
                      <NodeIcon type={node.nodeType} />
                      <TreeView.BranchText>{node.label}</TreeView.BranchText>
                      {nodeState.loading && (
                        <Spinner size="xs" ml={2} flexShrink={0} />
                      )}
                    </TreeView.BranchTrigger>
                    {error && (
                      <Text color="red.400" fontSize="xs" pl={6} lineClamp={1}>
                        {error}
                      </Text>
                    )}
                  </TreeView.BranchControl>
                );
              }

              return (
                <TreeView.Item
                  onClick={() => {
                    viewItem(node.label, node.value, node.projectId);
                  }}
                >
                  <NodeIcon type={node.nodeType} />
                  <TreeView.ItemText>{node.label}</TreeView.ItemText>
                </TreeView.Item>
              );
            }}
          />
        </TreeView.Tree>
      </TreeView.Root>
      <ViewerModal fileName={previewFileName} browseUrn={urn} setUrn={setUrn} />
    </Box>
  );
}
