import { CloseButton, Dialog, Portal } from "@chakra-ui/react";
import { UploadFileInput } from "@/components/UploadFileInput";
import { FileTypes } from "@/constants/fileTypes";

interface UploadFileModalProps {
  isOpen: boolean;
  title: string;
  uploadFile: (file: File) => void;
  onClose: () => void;
}

export function UploadFileModal({
  isOpen,
  title,
  uploadFile,
  onClose,
}: UploadFileModalProps) {
  const handleUpload = (file: File) => {
    uploadFile(file);
    onClose();
  };

  return (
    <Dialog.Root
      open={isOpen}
      onOpenChange={({ open }) => {
        if (!open) onClose();
      }}
    >
      <Portal>
        <Dialog.Backdrop />
        <Dialog.Positioner>
          <Dialog.Content maxW="480px">
            <Dialog.Header>
              <Dialog.Title>{title}</Dialog.Title>
              <Dialog.CloseTrigger asChild>
                <CloseButton size="sm" />
              </Dialog.CloseTrigger>
            </Dialog.Header>
            <Dialog.Body pb={6}>
              <UploadFileInput
                uploadFile={handleUpload}
                fileTypes={Object.values(FileTypes)}
              />
            </Dialog.Body>
          </Dialog.Content>
        </Dialog.Positioner>
      </Portal>
    </Dialog.Root>
  );
}
