import { useState } from "react";
import { UploadMenu } from "../../components/UploadMenu";
import { Box } from "@chakra-ui/react";
import { Button } from "../../components/Button";
import { SIDEBAR } from "@/styles/designTokens";
import { useLayout } from "@/context/LayoutContext";
import { uploadModel } from "@/api/model";
import { ApsViewer } from "@/components/ApsViewer";
import "@/styles/css/ViewerButton.scss";

declare global {
  interface Window {
    Autodesk: any;
  }
}

export function ViewerPage() {
  const { isCollapsed } = useLayout();
  const [urn, setUrn] = useState<string>("");
  const [isLoading, setIsLoading] = useState<boolean>(false);

  const uploadFile = async (file: File) => {
    setIsLoading(true);

    const formData = new FormData();
    formData.append("file", file);

    const resData = await uploadModel(formData);
    const { urn } = resData;
    setUrn(urn);
  };

  const onClearModel = () => {
    setUrn("");
    setIsLoading(false);
  };

  return urn ? (
    <Box
      w={`calc(100% - ${isCollapsed ? SIDEBAR.widthCollapsed : SIDEBAR.widthExpanded})`}
      h="100vh"
      position="absolute"
    >
      <Box
        position="absolute"
        left="40px"
        top="40px"
        zIndex="2"
        w="300px"
        h="300px"
      >
        <Button onClick={onClearModel}>Clear model</Button>
      </Box>
      <ApsViewer urn={urn} setIsLoading={setIsLoading} onError={onClearModel} />
    </Box>
  ) : (
    <UploadMenu isLoading={isLoading} uploadFile={uploadFile} />
  );
}
