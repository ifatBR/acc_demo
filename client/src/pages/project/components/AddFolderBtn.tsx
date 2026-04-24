import { Button } from "@/components/Button";
import { SPACING } from "@/styles/designTokens";
import { Plus } from "lucide-react";

interface AddFolderBtnProps {
  setIsCreateOpen: (value: boolean) => void;
}

export function AddFolderBtn({ setIsCreateOpen, ...rest }: AddFolderBtnProps) {
  return (
    <Button mt={SPACING[4]} onClick={() => setIsCreateOpen(true)} {...rest}>
      <Plus />
      New Folder
    </Button>
  );
}
