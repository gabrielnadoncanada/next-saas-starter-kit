'use client';

import { Card } from '@/components/shared';
import ConfirmationDialog from '@/components/shared/ConfirmationDialog';
import { Button } from 'react-daisyui';
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
        <Card.Body>
          <Card.Header>
            <Card.Title>{t('remove-team')}</Card.Title>
            <Card.Description>
              {allowDelete
                ? t('remove-team-warning')
                : t('remove-team-restricted')}
            </Card.Description>
          </Card.Header>
        </Card.Body>
        {allowDelete && (
          <Card.Footer>
            <Button
              color="error"
              onClick={onDeleteClick}
              loading={isPending}
              variant="outline"
              size="md"
            >
              {t('remove-team')}
            </Button>
          </Card.Footer>
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
