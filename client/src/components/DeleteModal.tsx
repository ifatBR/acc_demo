import { CloseButton, Dialog, Flex, Portal, Text } from "@chakra-ui/react";
import { Button } from "@/components/Button";
import { COLORS, SPACING } from "@/styles/designTokens";

interface DeleteModalProps {
  isOpen: boolean;
  msg: string;
  onDelete: () => void;
  onClose: () => void;
}

export function DeleteModal({ isOpen, msg, onDelete, onClose }: DeleteModalProps) {
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
          <Dialog.Content
            maxW="440px"
            border={`2px solid ${COLORS.semantic.error}`}
          >
            <Dialog.Header>
              <Dialog.Title>Confirm Delete</Dialog.Title>
              <Dialog.CloseTrigger asChild>
                <CloseButton size="sm" />
              </Dialog.CloseTrigger>
            </Dialog.Header>
            <Dialog.Body>
              <Text>{msg}</Text>
            </Dialog.Body>
            <Dialog.Footer>
              <Flex gap={SPACING[2]} justify="flex-end">
                <Button variant="secondary" onClick={onClose}>
                  Cancel
                </Button>
                <Button variant="danger" onClick={onDelete}>
                  Delete
                </Button>
              </Flex>
            </Dialog.Footer>
          </Dialog.Content>
        </Dialog.Positioner>
      </Portal>
    </Dialog.Root>
  );
}
