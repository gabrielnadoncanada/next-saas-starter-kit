'use client';

import { useTranslations } from 'next-intl';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/lib/components/ui/alert-dialog';

interface ConfirmationDialogProps {
  title: string;
  visible: boolean;
  onConfirm: () => void | Promise<any>;
  onCancel: () => void;
  confirmText?: string;
  cancelText?: string;
  children: React.ReactNode;
}

const ConfirmationDialog = ({
  title,
  children,
  visible,
  onConfirm,
  onCancel,
  confirmText,
  cancelText,
}: ConfirmationDialogProps) => {
  const t = useTranslations();

  const handleConfirm = async () => {
    await onConfirm();
    onCancel();
  };

  return (
    <AlertDialog
      open={visible}
      onOpenChange={(isOpen) => !isOpen && onCancel()}
    >
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>{title}</AlertDialogTitle>
          <AlertDialogDescription asChild>
            <div className="text-sm leading-6">{children}</div>
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel onClick={onCancel}>
            {cancelText || t('cancel')}
          </AlertDialogCancel>
          <AlertDialogAction
            onClick={handleConfirm}
            className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
          >
            {confirmText || t('delete')}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
};

export default ConfirmationDialog;
