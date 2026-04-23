import { AbsoluteCenter, Box } from "@chakra-ui/react";
import { UploadFileInput } from "./UploadFileInput";
import { COLORS, RADII, SHADOWS, SPACING } from "@/styles/designTokens";
import { FileTypes } from "@/constants/fileTypes";
import { Loader } from "./Loader";

interface UploadMenuProps {
  isLoading: boolean;
  uploadFile: (file: File) => void;
}
export function UploadMenu({ isLoading, uploadFile }: UploadMenuProps) {
  return (
    <AbsoluteCenter h="100vh" bg={COLORS.bg.base}>
      {isLoading ? (
        <Loader />
      ) : (
        <Box
          bg={COLORS.bg.surface}
          boxShadow={SHADOWS.popup}
          borderRadius={RADII.md}
          p={`${SPACING[4]} ${SPACING[5]}`}
        >
          <UploadFileInput
            uploadFile={uploadFile}
            fileTypes={[FileTypes.RVT, FileTypes.IFC]}
          />
        </Box>
      )}
    </AbsoluteCenter>
  );
}
