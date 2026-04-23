import { useState } from "react";
import { CloseButton, Dialog, Flex, Portal, Text } from "@chakra-ui/react";
import { Input } from "@/components/Input";
import { Button } from "@/components/Button";
import { COLORS, SHADOWS, SPACING } from "@/styles/designTokens";

interface CreateProjectDialogProps {
  itemName: string;
  isOpen: boolean;
  onClose: () => void;
  onConfirm: (name: string) => void;
}

export function CreateItemDialog({
  itemName,
  isOpen,
  onClose,
  onConfirm,
}: CreateProjectDialogProps) {
  const [name, setName] = useState("");
  const [error, setError] = useState("");

  const handleClose = () => {
    setName("");
    setError("");
    onClose();
  };

  const handleCreate = () => {
    if (!name.trim()) {
      setError("Please enter a project name");
      return;
    }
    onConfirm(name.trim());
  };

  return (
    <Dialog.Root
      open={isOpen}
      onOpenChange={({ open }) => {
        if (!open) handleClose();
      }}
    >
      <Portal>
        <Dialog.Backdrop />
        <Dialog.Positioner>
          <Dialog.Content
            maxW="440px"
            shadow={SHADOWS.md}
            bg={COLORS.bg.elevated}
          >
            <Dialog.Header>
              <Dialog.Title>{`Create new ${itemName}`}</Dialog.Title>
              <Dialog.CloseTrigger asChild>
                <CloseButton size="sm" />
              </Dialog.CloseTrigger>
            </Dialog.Header>
            <Dialog.Body>
              <Input
                placeholder="project name"
                value={name}
                onChange={(e) => {
                  setName(e.target.value);
                  if (error) setError("");
                }}
                error={error}
              />
            </Dialog.Body>
            <Dialog.Footer>
              <Flex gap={SPACING[2]} justify="flex-end">
                <Button variant="secondary" onClick={handleClose}>
                  Discard
                </Button>
                <Button variant="primary" onClick={handleCreate}>
                  Create
                </Button>
              </Flex>
            </Dialog.Footer>
          </Dialog.Content>
        </Dialog.Positioner>
      </Portal>
    </Dialog.Root>
  );
}
