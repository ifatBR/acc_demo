import { ApsViewer } from "@/components/ApsViewer";
import { Loader } from "@/components/Loader";
import { CloseButton, Dialog, Portal } from "@chakra-ui/react";
import { useState } from "react";

interface ViewerModalProps {
  fileName: string | null;
  browseUrn: string | null;
  setUrn: (value: string | null) => void;
}
export function ViewerModal({ fileName, browseUrn, setUrn }: ViewerModalProps) {
  const [isLoading, setIsLoading] = useState<boolean>(false);

  return isLoading ? (
    <Loader />
  ) : (
    <Dialog.Root
      open={!!browseUrn && !isLoading}
      onOpenChange={({ open }) => {
        if (!open) {
          setUrn(null);
        }
      }}
    >
      <Portal>
        <Dialog.Backdrop />
        <Dialog.Positioner>
          <Dialog.Content h="80vh" maxW="80vw">
            <Dialog.Header>
              <Dialog.Title>{fileName}</Dialog.Title>
              <Dialog.CloseTrigger asChild>
                <CloseButton size="sm" />
              </Dialog.CloseTrigger>
            </Dialog.Header>
            <Dialog.Body>
              <ApsViewer urn={browseUrn} setIsLoading={setIsLoading} />
            </Dialog.Body>
          </Dialog.Content>
        </Dialog.Positioner>
      </Portal>
    </Dialog.Root>
  );
}
