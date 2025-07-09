'use client';

import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/lib/components/ui/card';
import ConfirmationDialog from '@/components/shared/ConfirmationDialog';
import { Button } from '@/lib/components/ui/button';
import { useTranslations } from 'next-intl';

interface DeleteTeamViewProps {
  allowDelete: boolean;
  isPending: boolean;
  askConfirmation: boolean;
  onDeleteClick: () => void;
  onDeleteConfirm: () => void;
  onDeleteCancel: () => void;
}

export function DeleteTeamView({
  allowDelete,
  isPending,
  askConfirmation,
  onDeleteClick,
  onDeleteConfirm,
  onDeleteCancel,
}: DeleteTeamViewProps) {
  const t = useTranslations();

  return (
    <>
      <Card>
        <CardContent>
          <CardHeader>
            <CardTitle>{t('remove-team')}</CardTitle>
            <CardDescription>
              {allowDelete
                ? t('remove-team-warning')
                : t('remove-team-restricted')}
            </CardDescription>
          </CardHeader>
        </CardContent>
        {allowDelete && (
          <CardFooter>
            <Button
              variant="destructive"
              onClick={onDeleteClick}
              disabled={isPending}
            >
              {t('remove-team')}
            </Button>
          </CardFooter>
        )}
      </Card>
      {allowDelete && (
        <ConfirmationDialog
          visible={askConfirmation}
          title={t('remove-team')}
          onCancel={onDeleteCancel}
          onConfirm={onDeleteConfirm}
        >
          {t('remove-team-confirmation')}
        </ConfirmationDialog>
      )}
    </>
  );
}
