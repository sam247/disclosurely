import { Check, X, Users, Archive, Trash2, AlertTriangle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { useState } from 'react';

interface BulkActionsProps {
  selectedCount: number;
  onUpdateStatus: (status: string) => void;
  onAssign: (userId: string) => void;
  onArchive: () => void;
  onDelete: () => void;
  onClearSelection: () => void;
  teamMembers: any[];
  isProcessing: boolean;
}

const BulkActions = ({
  selectedCount,
  onUpdateStatus,
  onAssign,
  onArchive,
  onDelete,
  onClearSelection,
  teamMembers,
  isProcessing
}: BulkActionsProps) => {
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);

  if (selectedCount === 0) return null;

  const handleDelete = () => {
    onDelete();
    setShowDeleteDialog(false);
  };

  return (
    <>
      <div className="fixed bottom-6 left-1/2 transform -translate-x-1/2 z-50">
        <div className="bg-white border-2 border-primary shadow-2xl rounded-lg p-4 flex items-center gap-4 animate-in slide-in-from-bottom-5">
          <div className="flex items-center gap-2">
            <Badge variant="default" className="text-sm font-semibold px-3 py-1">
              {selectedCount} Selected
            </Badge>
          </div>

          <div className="h-6 w-px bg-gray-300" />

          {/* Status Update */}
          <div className="flex items-center gap-2">
            <span className="text-sm text-gray-600">Status:</span>
            <Select onValueChange={onUpdateStatus} disabled={isProcessing}>
              <SelectTrigger className="w-40 h-9">
                <SelectValue placeholder="Update status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="new">New</SelectItem>
                <SelectItem value="reviewing">In Review</SelectItem>
                <SelectItem value="investigating">Investigating</SelectItem>
                <SelectItem value="resolved">Resolved</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="h-6 w-px bg-gray-300" />

          {/* Assign */}
          <div className="flex items-center gap-2">
            <Users className="h-4 w-4 text-gray-600" />
            <Select onValueChange={onAssign} disabled={isProcessing}>
              <SelectTrigger className="w-48 h-9">
                <SelectValue placeholder="Assign to..." />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="unassigned">Unassigned</SelectItem>
                {teamMembers.map((member) => (
                  <SelectItem key={member.id} value={member.id}>
                    {member.first_name} {member.last_name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="h-6 w-px bg-gray-300" />

          {/* Quick Actions */}
          <Button
            variant="outline"
            size="sm"
            onClick={onArchive}
            disabled={isProcessing}
            className="h-9"
          >
            <Archive className="h-4 w-4 mr-2" />
            Archive
          </Button>

          <Button
            variant="outline"
            size="sm"
            onClick={() => setShowDeleteDialog(true)}
            disabled={isProcessing}
            className="h-9 text-red-600 hover:text-red-700 hover:bg-red-50"
          >
            <Trash2 className="h-4 w-4 mr-2" />
            Delete
          </Button>

          <div className="h-6 w-px bg-gray-300" />

          <Button
            variant="ghost"
            size="sm"
            onClick={onClearSelection}
            disabled={isProcessing}
            className="h-9"
          >
            <X className="h-4 w-4 mr-2" />
            Cancel
          </Button>
        </div>
      </div>

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle className="flex items-center gap-2">
              <AlertTriangle className="h-5 w-5 text-red-600" />
              Delete {selectedCount} Report{selectedCount !== 1 ? 's' : ''}?
            </AlertDialogTitle>
            <AlertDialogDescription>
              This action cannot be undone. The selected reports will be permanently deleted from
              your database.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDelete}
              className="bg-red-600 hover:bg-red-700"
            >
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
};

export default BulkActions;
