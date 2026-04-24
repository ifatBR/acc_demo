import { useRef, useState } from "react";
import { Box, Flex, Spinner, Text } from "@chakra-ui/react";
import { createTreeCollection } from "@ark-ui/react/collection";
import type { TreeCollection } from "@ark-ui/react/collection";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { getBucketObjects, deleteObjectById } from "@/api/bucket";
import type { BucketObject } from "@/api/bucket";
import { createFolder, getUrnToView, uploadFile } from "@/api/project";
import { UploadFileModal } from "@/components/UploadFileModal";
import { ViewerModal } from "./components/ViewerModal";
import { CreateItemModal } from "../../components/CreateItemModal";
import { DeleteModal } from "@/components/DeleteModal";
import { ProjectTree } from "./components/ProjectTree";
import { BodyText, PageTitle, SectionTitle } from "@/components/Typography";
import { SHADOWS } from "@/styles/designTokens";
import { AddFolderBtn } from "./components/AddFolderBtn";

// ─── Types ───────────────────────────────────────────────────────────────────

export type BrowserNodeType = "folder" | "file";

export type BrowserNode = {
  value: string;
  label: string;
  nodeType: BrowserNodeType;
  objectId?: string;
  children?: BrowserNode[];
  isLoading?: boolean;
};

// ─── Utilities ───────────────────────────────────────────────────────────────

function parseBucketObjects(objects: BucketObject[]): BrowserNode[] {
  type RootFolderEntry = {
    folders: Map<string, BrowserNode[]>;
    files: BrowserNode[];
  };

  const rootFolderMap = new Map<string, RootFolderEntry>();

  for (const obj of objects) {
    const parts = obj.objectKey.split("/");
    const rootFolderName = parts[0];

    if (!rootFolderMap.has(rootFolderName)) {
      rootFolderMap.set(rootFolderName, { folders: new Map(), files: [] });
    }
    const rootFolder = rootFolderMap.get(rootFolderName)!;

    if (parts.length === 2) {
      // file directly inside the folder: <rootFolder>/<file>
      const fileName = parts[1];
      if (fileName !== ".placeholder") {
        rootFolder.files.push({
          value: obj.objectKey,
          label: fileName,
          nodeType: "file",
          objectId: obj.objectId,
        });
      }
    } else if (parts.length === 3) {
      // file inside a folder: <rootFolder>/<folder>/<file>
      const folderName = parts[1];
      const fileName = parts[2];
      if (!rootFolder.folders.has(folderName)) {
        rootFolder.folders.set(folderName, []);
      }
      if (fileName !== ".placeholder") {
        rootFolder.folders.get(folderName)!.push({
          value: obj.objectKey,
          label: fileName,
          nodeType: "file",
          objectId: obj.objectId,
        });
      }
    }
  }

  // Build the tree: folder nodes containing folder nodes and/or file nodes
  return Array.from(rootFolderMap.entries()).map(([rootFolderName, data]) => {
    const rootFolderChildren: BrowserNode[] = [];

    for (const [folderName, folderFiles] of data.folders) {
      // Folder node — label is just the folder name, value is a unique path key
      rootFolderChildren.push({
        value: `${rootFolderName}/${folderName}`,
        label: folderName,
        nodeType: "folder",
        children: folderFiles,
      });
    }

    // Direct files under the head folder
    rootFolderChildren.push(...data.files);

    return {
      value: rootFolderName,
      label: rootFolderName,
      nodeType: "folder",
      children: rootFolderChildren,
    };
  });
}

function injectLoadingNode(
  nodes: BrowserNode[],
  targetValue: string,
): BrowserNode[] {
  return nodes.map((node) => {
    if (node.value === targetValue) {
      return {
        ...node,
        children: [
          ...(node.children ?? []),
          {
            value: "",
            label: "Uploading file...",
            nodeType: "file" as const,
            isLoading: true,
          },
        ],
      };
    }
    if (node.children) {
      return {
        ...node,
        children: injectLoadingNode(node.children, targetValue),
      };
    }
    return node;
  });
}

function buildCollection(nodes: BrowserNode[]): TreeCollection<BrowserNode> {
  return createTreeCollection<BrowserNode>({
    rootNode: {
      value: "root",
      label: "Root",
      nodeType: "folder",
      children: nodes,
    },
  });
}

function resolveObjectKeys(node: BrowserNode): string[] {
  if (node.nodeType === "file") {
    return [node.value];
  }

  if (!node.children || node.children.length === 0) {
    return [node.value];
  }
  return node.children.flatMap((child) => resolveObjectKeys(child));
}

// ─── Component ───────────────────────────────────────────────────────────────

export function ProjectPage() {
  const queryClient = useQueryClient();

  const {
    data: objects,
    isLoading,
    error,
  } = useQuery({
    queryKey: ["bucketObjects"],
    queryFn: getBucketObjects,
  });

  const [urn, setUrn] = useState<string | null>(null);
  const [previewFileName, setPreviewFileName] = useState<string | null>(null);
  const [urnError, setUrnError] = useState<string | null>(null);
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [nodeToDelete, setNodeToDelete] = useState<BrowserNode | null>(null);
  const [nodeForUpload, setNodeForUpload] = useState<BrowserNode | null>(null);
  const [expandedValues, setExpandedValues] = useState<string[]>([]);
  const [uploadingFolderValue, setUploadingFolderValue] = useState<
    string | null
  >(null);
  const [isFetchingUrn, setIsFetchingUrn] = useState<boolean>(false);
  const abortControllerRef = useRef<AbortController | null>(null);

  const parsedNodes = objects ? parseBucketObjects(objects) : [];
  const collection = buildCollection(
    uploadingFolderValue
      ? injectLoadingNode(parsedNodes, uploadingFolderValue)
      : parsedNodes,
  );

  const viewItem = async (node: BrowserNode) => {
    if (!node.objectId) return;
    abortControllerRef.current?.abort();
    const controller = new AbortController();
    abortControllerRef.current = controller;
    setPreviewFileName(node.label);
    setIsFetchingUrn(true);
    setUrn(null);
    setUrnError(null);
    try {
      const { urn: urnToView } = await getUrnToView(
        { objectId: node.objectId },
        controller.signal,
      );
      setUrn(urnToView);
    } catch (err) {
      if (err instanceof Error && err.name === "AbortError") return;
      setUrnError(err instanceof Error ? err.message : "Something went wrong");
    } finally {
      setIsFetchingUrn(false);
    }
  };

  const handleViewerClose = () => {
    abortControllerRef.current?.abort();
    abortControllerRef.current = null;
    setUrn(null);
    setUrnError(null);
  };

  const deleteNode = async (node: BrowserNode) => {
    const objectKeys = resolveObjectKeys(node);
    await Promise.all(objectKeys.map(deleteObjectById));
    queryClient.invalidateQueries({ queryKey: ["bucketObjects"] });
  };

  const handleDeleteRequest = (node: BrowserNode) => setNodeToDelete(node);

  const handleDeleteConfirm = async () => {
    if (!nodeToDelete) return;
    await deleteNode(nodeToDelete);
    setNodeToDelete(null);
  };

  const handleUploadFile = async (file: File) => {
    const uploadNode = nodeForUpload;
    if (!uploadNode) return;

    // Expand and show spinner immediately, before the network call
    setUploadingFolderValue(uploadNode.value);
    setExpandedValues((prev) => {
      const next = new Set(prev);
      next.add(uploadNode.value);
      const parts = uploadNode.value.split("/");
      if (parts.length > 1) next.add(parts[0]);
      return Array.from(next);
    });

    const formData = new FormData();
    formData.append("file", file);
    await uploadFile(formData, `${uploadNode.value}/${file.name}`);

    await queryClient.invalidateQueries({ queryKey: ["bucketObjects"] });
    setUploadingFolderValue(null);
  };

  const createNewFolder = async (name: string) => {
    await createFolder({ folderName: name });
    queryClient.invalidateQueries({ queryKey: ["bucketObjects"] });
    setIsCreateOpen(false);
  };

  const getDeleteMessage = () => {
    return `Are you sure you want to delete the ${nodeToDelete?.nodeType}: ${nodeToDelete?.label}?${nodeToDelete?.nodeType === "folder" ? "\nAll the content of this folder will be deleted with it." : ""}`;
  };

  if (isLoading) {
    return (
      <Flex justify="center" align="center" h="full" p={8}>
        <Spinner />
      </Flex>
    );
  }

  if (error) {
    return (
      <Box p={4}>
        <Text color="red.400" fontSize="sm">
          Failed to load bucket objects: {(error as Error).message}
        </Text>
      </Box>
    );
  }

  return (
    <Box>
      <Flex p="20px" justify="space-between" align="center" shadow={SHADOWS.sm}>
        <PageTitle>Project 1</PageTitle>
        <AddFolderBtn
          setIsCreateOpen={setIsCreateOpen}
          {...{ variant: "secondary" }}
        />
      </Flex>
      {objects?.length ? (
        <Box h="full">
          <ProjectTree
            collection={collection}
            onFileClick={viewItem}
            onDelete={handleDeleteRequest}
            onUploadFile={(node) => setNodeForUpload(node)}
            expandedValues={expandedValues}
            onExpandedChange={setExpandedValues}
          />
          <ViewerModal
            fileName={previewFileName}
            urn={urn}
            error={urnError}
            isFetchingUrn={isFetchingUrn}
            onClose={handleViewerClose}
          />
          <DeleteModal
            isOpen={!!nodeToDelete}
            msg={getDeleteMessage()}
            onDelete={handleDeleteConfirm}
            onClose={() => setNodeToDelete(null)}
          />
          <UploadFileModal
            isOpen={!!nodeForUpload}
            title={`Upload a file to ${nodeForUpload?.label}`}
            uploadFile={handleUploadFile}
            onClose={() => setNodeForUpload(null)}
          />
        </Box>
      ) : (
        <Flex h="100vh" align="center" justify="center" direction="column">
          <SectionTitle>This project is empty</SectionTitle>
          <BodyText secondary>
            Click on the button below to add a new folder
          </BodyText>
          <AddFolderBtn setIsCreateOpen={setIsCreateOpen} />
        </Flex>
      )}
      <CreateItemModal
        itemName="folder"
        isOpen={isCreateOpen}
        onClose={() => setIsCreateOpen(false)}
        onConfirm={createNewFolder}
      />
    </Box>
  );
}
