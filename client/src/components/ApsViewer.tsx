import { Box } from "@chakra-ui/react";
import Fish from "./Fish";
import { useEffect, useRef, useState } from "react";
import { getAccessToken } from "@/api/auth";
import { setupViewerToolbar } from "@/utils/viewer.utils";
import { useLayout } from "@/context/LayoutContext";
import { SIDEBAR } from "@/styles/designTokens";
import "@/styles/css/ViewerButton.scss";

interface ApsViewerProps {
  urn: string | null;
  onError?: (err?: string) => void;
  onViewerReady?: (viewer: Autodesk.Viewing.GuiViewer3D) => void;
  onFilterToggle?: () => void;
}

export function ApsViewer({ urn, onError, onViewerReady, onFilterToggle }: ApsViewerProps) {
  const [showFish, setShowFish] = useState<boolean>(false);
  const { isCollapsed } = useLayout();

  const containerRef = useRef<HTMLDivElement | null>(null);
  const viewerRef = useRef<Autodesk.Viewing.GuiViewer3D>(null);
  const toolbarCleanupRef = useRef<(() => void) | null>(null);

  const onClickBtn = () => {
    setShowFish(true);
  };

  useEffect(() => {
    let cancelled = false;
    async function initViewer() {
      if (!containerRef.current || !window.Autodesk || !urn) onError?.();

      if (cancelled) onError?.();
      const accessToken = await getAccessToken();
      if (!accessToken) onError?.();

      window.Autodesk.Viewing.Initializer(
        {
          accessToken: accessToken,
          env: "AutodeskProduction2",
          api: "streamingV2_EU",
        },
        () => {
          if (!containerRef.current || cancelled) return;
          const viewer = new window.Autodesk.Viewing.GuiViewer3D(
            containerRef.current,
          );

          viewerRef.current = viewer;
          if (!viewer) return;
          viewer.start();

          toolbarCleanupRef.current = setupViewerToolbar(viewer, onClickBtn, onFilterToggle ?? (() => {}));

          window.Autodesk.Viewing.Document.load(
            `urn:${urn}`,
            (doc: any) => {
              const defaultModel = doc.getRoot().getDefaultGeometry();
              viewer.loadDocumentNode(doc, defaultModel);
            },
            (errCode: number, errMsg: string) => {
              console.error("Viewer load error:", errCode, errMsg);
            },
          );

          viewer.addEventListener(
            window.Autodesk.Viewing.GEOMETRY_LOADED_EVENT,
            () => onViewerReady?.(viewer),
            { once: true },
          );
        },
      );
    }

    initViewer();

    return () => {
      cancelled = true;
      if (toolbarCleanupRef.current) {
        toolbarCleanupRef.current();
        toolbarCleanupRef.current = null;
      }

      if (viewerRef.current) {
        viewerRef.current.finish();
        viewerRef.current = null;
      }
    };
  }, [urn]);

  return (
    <Box
      w={`calc(100% - ${isCollapsed ? SIDEBAR.widthCollapsed : SIDEBAR.widthExpanded})`}
      h="100%"
      position="absolute"
    >
      <Box ref={containerRef} position="absolute" w="100%" h="100%" />
      {showFish && (
        <Box position="absolute" zIndex="2" bottom="70px" ml="30%" w={"40%"}>
          <Fish setPlay={setShowFish} />
        </Box>
      )}
    </Box>
  );
}
