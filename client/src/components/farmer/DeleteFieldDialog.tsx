import { useState } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Loader2, Trash2, AlertTriangle } from "lucide-react";
import { toast } from "@/hooks/use-toast";

interface Field {
  id: number;
  name: string;
  location: string | null;
}

interface DeleteFieldDialogProps {
  field: Field;
  trigger?: React.ReactNode;
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
  onDeleted?: (field: Field) => void;
  cropCount?: number;
}

export default function DeleteFieldDialog({
  field,
  trigger,
  open: controlledOpen,
  onOpenChange: controlledOnOpenChange,
  onDeleted,
  cropCount = 0,
}: DeleteFieldDialogProps) {
  const [internalOpen, setInternalOpen] = useState(false);
  const open = controlledOpen !== undefined ? controlledOpen : internalOpen;
  const setOpen = controlledOnOpenChange || setInternalOpen;

  const queryClient = useQueryClient();

  const deleteFieldMutation = useMutation({
    mutationFn: async () => {
      const response = await fetch(`/api/fields/${field.id}`, {
        method: "DELETE",
        credentials: "include",
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || "Failed to delete field");
      }

      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/fields"] });
      queryClient.invalidateQueries({ queryKey: ["fields-with-locations"] });
      toast({
        title: "Field deleted",
        description: `${field.name} has been deleted successfully`,
      });
      setOpen(false);
      onDeleted?.(field);
    },
    onError: (error: Error) => {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const handleDelete = () => {
    deleteFieldMutation.mutate();
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        {trigger || (
          <Button variant="destructive" size="sm">
            <Trash2 className="h-4 w-4 mr-2" />
            Delete Field
          </Button>
        )}
      </DialogTrigger>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <AlertTriangle className="h-5 w-5 text-destructive" />
            Delete Field
          </DialogTitle>
          <DialogDescription>
            Are you sure you want to delete the field "{field.name}"?
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          {cropCount > 0 && (
            <Alert className="border-destructive/50 text-destructive dark:border-destructive">
              <AlertTriangle className="h-4 w-4" />
              <AlertDescription>
                <strong>Warning:</strong> This field contains {cropCount} crop
                {cropCount === 1 ? "" : "s"}. Deleting this field will also
                remove all associated crops and their data.
              </AlertDescription>
            </Alert>
          )}

          <Alert>
            <AlertTriangle className="h-4 w-4" />
            <AlertDescription>
              This action cannot be undone. All field data including location,
              boundaries, and associated information will be permanently
              deleted.
            </AlertDescription>
          </Alert>

          <div className="bg-muted p-3 rounded-md">
            <h4 className="font-medium mb-2">Field Details:</h4>
            <div className="text-sm space-y-1">
              <p>
                <strong>Name:</strong> {field.name}
              </p>
              {field.location && (
                <p>
                  <strong>Location:</strong> {field.location}
                </p>
              )}
              {cropCount > 0 && (
                <p>
                  <strong>Crops:</strong> {cropCount} crop
                  {cropCount === 1 ? "" : "s"} will be deleted
                </p>
              )}
            </div>
          </div>
        </div>

        <DialogFooter>
          <Button
            variant="outline"
            onClick={() => setOpen(false)}
            disabled={deleteFieldMutation.isPending}
          >
            Cancel
          </Button>
          <Button
            variant="destructive"
            onClick={handleDelete}
            disabled={deleteFieldMutation.isPending}
          >
            {deleteFieldMutation.isPending ? (
              <>
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                Deleting...
              </>
            ) : (
              <>
                <Trash2 className="h-4 w-4 mr-2" />
                Delete Field
              </>
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
