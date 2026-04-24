import { ApsViewer } from "@/components/ApsViewer";
import { Loader } from "@/components/Loader";
import { ErrorText } from "@/components/Typography";
import { AbsoluteCenter, CloseButton, Dialog, Portal } from "@chakra-ui/react";

interface ViewerModalProps {
  fileName: string | null;
  urn: string | null;
  error: string | null;
  isFetchingUrn: boolean;
  onClose: () => void;
}

export function ViewerModal({
  fileName,
  urn,
  error,
  isFetchingUrn,
  onClose,
}: ViewerModalProps) {
  return (
    <Dialog.Root
      open={!!urn || isFetchingUrn || !!error}
      onOpenChange={({ open }) => {
        if (!open) onClose();
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
            <Dialog.Body position="relative" mb="80px">
              {isFetchingUrn && <Loader />}
              {error && (
                <AbsoluteCenter>
                  <ErrorText>{error}</ErrorText>
                </AbsoluteCenter>
              )}
              {urn && <ApsViewer urn={urn} />}
            </Dialog.Body>
          </Dialog.Content>
        </Dialog.Positioner>
      </Portal>
    </Dialog.Root>
  );
}
