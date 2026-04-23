import { useState } from "react";
import { Box, Flex, Spinner, Text } from "@chakra-ui/react";
import { createTreeCollection } from "@ark-ui/react/collection";
import type { TreeCollection } from "@ark-ui/react/collection";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { getBucketObjects, deleteObjectById } from "@/api/bucket";
import type { BucketObject } from "@/api/bucket";
import { ViewerModal } from "./components/ViewerModal";
import { Buffer } from "buffer";
import { BrowserTree } from "./components/BrowserTree";

// ─── Types ───────────────────────────────────────────────────────────────────

export type BrowserNodeType = "project" | "folder" | "file";

export type BrowserNode = {
  value: string; // unique key within the collection
  label: string; // display name
  nodeType: BrowserNodeType;
  objectId?: string;
  children?: BrowserNode[];
};

// ─── Utilities ───────────────────────────────────────────────────────────────

function parseBucketObjects(objects: BucketObject[]): BrowserNode[] {
  type ProjectEntry = {
    folders: Map<string, BrowserNode[]>;
    files: BrowserNode[];
  };

  const projectMap = new Map<string, ProjectEntry>();

  for (const obj of objects) {
    const parts = obj.objectKey.split("/");
    const projectName = parts[0];

    if (!projectMap.has(projectName)) {
      projectMap.set(projectName, { folders: new Map(), files: [] });
    }
    const project = projectMap.get(projectName)!;

    if (parts.length === 2) {
      // file directly inside the project: <project>/<file>
      const fileName = parts[1];
      if (fileName !== ".placeholder") {
        project.files.push({
          value: obj.objectKey,
          label: fileName,
          nodeType: "file",
          objectId: obj.objectId,
        });
      }
    } else if (parts.length === 3) {
      // file inside a folder: <project>/<folder>/<file>
      const folderName = parts[1];
      const fileName = parts[2];
      if (!project.folders.has(folderName)) {
        project.folders.set(folderName, []);
      }
      if (fileName !== ".placeholder") {
        project.folders.get(folderName)!.push({
          value: obj.objectKey,
          label: fileName,
          nodeType: "file",
          objectId: obj.objectId,
        });
      }
    }
  }

  // Build the tree: project nodes containing folder nodes and/or file nodes
  return Array.from(projectMap.entries()).map(([projectName, data]) => {
    const projectChildren: BrowserNode[] = [];

    for (const [folderName, folderFiles] of data.folders) {
      // Folder node — label is just the folder name, value is a unique path key
      projectChildren.push({
        value: `${projectName}/${folderName}`,
        label: folderName,
        nodeType: "folder",
        children: folderFiles,
      });
    }

    // Direct files under the project
    projectChildren.push(...data.files);

    return {
      value: projectName,
      label: projectName,
      nodeType: "project",
      children: projectChildren,
    };
  });
}

function buildCollection(nodes: BrowserNode[]): TreeCollection<BrowserNode> {
  return createTreeCollection<BrowserNode>({
    rootNode: {
      value: "root",
      label: "Root",
      nodeType: "project",
      children: nodes,
    },
  });
}

function resolveObjectKeys(node: BrowserNode): string[] {
  if (node.nodeType === "file") {
    return [node.value];
  }

  if (node.nodeType === "folder") {
    if (!node.children || node.children.length === 0) {
      return [`${node.value}/.placeholder`];
    }
    return node.children.map((child) => child.value);
  }

  // project
  if (!node.children || node.children.length === 0) {
    return [`${node.value}/.placeholder`];
  }
  return node.children.flatMap((child) => resolveObjectKeys(child));
}

// ─── Component ───────────────────────────────────────────────────────────────

export function BrowserPage() {
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

  const collection = buildCollection(objects ? parseBucketObjects(objects) : []);

  const viewItem = (node: BrowserNode) => {
    if (!node.objectId) return;
    const encodedUrn = Buffer.from(node.objectId).toString("base64");
    setPreviewFileName(node.label);
    setUrn(encodedUrn);
  };

  const deleteNode = async (node: BrowserNode) => {
    const objectKeys = resolveObjectKeys(node);
    await Promise.all(objectKeys.map(deleteObjectById));
    queryClient.invalidateQueries({ queryKey: ["bucketObjects"] });
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
    <Box h="full">
      <BrowserTree
        collection={collection}
        onFileClick={viewItem}
        onDelete={deleteNode}
      />
      <ViewerModal fileName={previewFileName} browseUrn={urn} setUrn={setUrn} />
    </Box>
  );
}
