'use client';

import { EmptyState } from '@/components/shared';
import ConfirmationDialog from '@/components/shared/ConfirmationDialog';
import { Table } from '@/components/shared/table/Table';
import { Button } from 'react-daisyui';
import { useTranslations } from 'next-intl';

interface ApiKeysListViewProps {
  apiKeys: any[];
  selectedApiKey: any | null;
  confirmationDialogVisible: boolean;
  isPending: boolean;
  onCreateClick: () => void;
  onDeleteClick: (apiKey: any) => void;
  onDeleteConfirm: () => void;
  onDeleteCancel: () => void;
}

export function ApiKeysListView({
  apiKeys,
  selectedApiKey,
  confirmationDialogVisible,
  isPending,
  onCreateClick,
  onDeleteClick,
  onDeleteConfirm,
  onDeleteCancel,
}: ApiKeysListViewProps) {
  const t = useTranslations();

  return (
    <div className="space-y-3">
      <div className="flex justify-between items-center">
        <div className="space-y-3">
          <h2 className="text-xl font-medium leading-none tracking-tight">
            {t('api-keys')}
          </h2>
          <p className="text-sm text-gray-500 dark:text-gray-400">
            {t('api-keys-description')}
          </p>
        </div>
        <Button color="primary" size="md" onClick={onCreateClick}>
          {t('create-api-key')}
        </Button>
      </div>

      {apiKeys.length === 0 ? (
        <EmptyState
          title={t('no-api-key-title')}
          description={t('api-key-description')}
        />
      ) : (
        <>
          <Table
            cols={[t('name'), t('status'), t('created'), t('actions')]}
            body={apiKeys.map((apiKey) => {
              return {
                id: apiKey.id,
                cells: [
                  { wrap: true, text: apiKey.name },
                  {
                    badge: {
                      color: 'success',
                      text: t('active'),
                    },
                  },
                  {
                    wrap: true,
                    text: new Date(apiKey.createdAt).toLocaleDateString(),
                  },
                  {
                    buttons: [
                      {
                        color: 'error',
                        text: t('revoke'),
                        disabled: isPending,
                        onClick: () => onDeleteClick(apiKey),
                      },
                    ],
                  },
                ],
              };
            })}
          />
          <ConfirmationDialog
            title={t('revoke-api-key')}
            visible={confirmationDialogVisible}
            onConfirm={onDeleteConfirm}
            onCancel={onDeleteCancel}
            cancelText={t('cancel')}
            confirmText={t('revoke-api-key')}
          >
            {t('revoke-api-key-confirm')}
          </ConfirmationDialog>
        </>
      )}
    </div>
  );
}
