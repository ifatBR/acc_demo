import { useEffect, useState } from "react";
import { CloseButton, Dialog, Flex, Portal, Text } from "@chakra-ui/react";
import { Input } from "@/components/Input";
import { Button } from "@/components/Button";
import { COLORS, SHADOWS, SPACING } from "@/styles/designTokens";

interface CreateItemDialogProps {
  itemName: string;
  isOpen: boolean;
  onClose: () => void;
  onConfirm: (name: string) => Promise<void>;
}

export function CreateItemDialog({
  itemName,
  isOpen,
  onClose,
  onConfirm,
}: CreateItemDialogProps) {
  const [name, setName] = useState("");
  const [validationError, setValidationError] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState("");

  useEffect(() => {
    if (isOpen) {
      setName("");
      setValidationError("");
      setSubmitError("");
    }
  }, [isOpen]);

  const handleClose = () => {
    if (isSubmitting) return;
    onClose();
  };

  const handleCreate = async () => {
    if (!name.trim()) {
      setValidationError(`Please enter a ${itemName} name`);
      return;
    }
    setValidationError("");
    setSubmitError("");
    setIsSubmitting(true);
    try {
      await onConfirm(name.trim());
    } catch {
      setSubmitError("Something went wrong, try again");
    } finally {
      setIsSubmitting(false);
    }
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
                placeholder={`${itemName} name`}
                value={name}
                onChange={(e) => {
                  setName(e.target.value);
                  if (validationError) setValidationError("");
                }}
                error={validationError}
              />
              {validationError && (
                <Text color={COLORS.semantic.error} fontSize="sm" mt={SPACING[1]}>
                  {validationError}
                </Text>
              )}
              {submitError && (
                <Text color={COLORS.semantic.error} fontSize="sm" mt={SPACING[2]}>
                  {submitError}
                </Text>
              )}
            </Dialog.Body>
            <Dialog.Footer>
              <Flex gap={SPACING[2]} justify="flex-end">
                <Button
                  variant="secondary"
                  onClick={handleClose}
                  disabled={isSubmitting}
                >
                  Discard
                </Button>
                <Button
                  variant="primary"
                  onClick={handleCreate}
                  isLoading={isSubmitting}
                >
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
