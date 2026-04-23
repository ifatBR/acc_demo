import { Box, FileUpload, Flex, Icon } from "@chakra-ui/react";
import { LuUpload } from "react-icons/lu";
import { HiUpload } from "react-icons/hi";
import { BodyText, ErrorText } from "./Typography";
import { Button } from "./Button";
import { useState } from "react";
import type { FileType } from "@/constants/fileTypes";

interface UploadFileInputProps {
  uploadFile: (file: File) => void;
  fileTypes: FileType[];
}

export function UploadFileInput({
  uploadFile,
  fileTypes,
}: UploadFileInputProps) {
  const [showError, setShowError] = useState(false);

  const onChange = async (details: {
    acceptedFiles: File[];
    rejectedFiles: FileUpload.FileRejection[];
  }) => {
    setShowError(false);
    const file = details.acceptedFiles?.[0];
    if (!file) return;

    const ext = "." + file.name.split(".").pop()?.toLowerCase();

    if (!fileTypes.includes(ext as FileType)) {
      setShowError(true);
      return;
    }
    uploadFile(file);
  };

  return (
    <FileUpload.Root
      onFileChange={onChange}
      maxW="xl"
      alignItems="stretch"
      maxFiles={1}
      allowDrop
    >
      <FileUpload.HiddenInput />
      <FileUpload.Trigger asChild>
        <Button variant="secondary" size="sm">
          <HiUpload /> Upload file
        </Button>
      </FileUpload.Trigger>
      <Flex justify="center">
        <BodyText>OR</BodyText>
      </Flex>
      <FileUpload.Dropzone>
        <Icon size="md" color="fg.muted">
          <LuUpload />
        </Icon>
        <FileUpload.DropzoneContent>
          {showError ? (
            <>
              <Box>
                <ErrorText bold> Wrong file type</ErrorText>
              </Box>
              <Box>
                <ErrorText>{`Viewer accepts types:`}</ErrorText>
              </Box>
              <Box>
                <ErrorText>{`${fileTypes.join("  ")}`}</ErrorText>
              </Box>
            </>
          ) : (
            <>
              <Box>Drag and drop files here</Box>
              <Box color="fg.muted">{fileTypes.join("  ")}</Box>
            </>
          )}
        </FileUpload.DropzoneContent>
      </FileUpload.Dropzone>
      <FileUpload.List />
    </FileUpload.Root>
  );
}
