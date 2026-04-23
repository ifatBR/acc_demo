import { ApsViewer } from "@/components/ApsViewer";
import { Loader } from "@/components/Loader";
import { CloseButton, Dialog, Portal } from "@chakra-ui/react";
import { useState } from "react";

interface ViewerModalProps {
  fileName: string | null;
  urn: string | null;
  setUrn: (value: string | null) => void;
  isFetchingUrn: boolean;
}
export function ViewerModal({
  fileName,
  urn,
  setUrn,
  isFetchingUrn,
}: ViewerModalProps) {
  return (
    <Dialog.Root
      open={!!urn || isFetchingUrn}
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
            <Dialog.Body position="relative" mb="80px">
              {isFetchingUrn ? <Loader /> : <ApsViewer urn={urn} />}
            </Dialog.Body>
          </Dialog.Content>
        </Dialog.Positioner>
      </Portal>
    </Dialog.Root>
  );
}
