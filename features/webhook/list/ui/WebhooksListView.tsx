'use client';

import { WithLoadingAndError, EmptyState } from '@/components/shared';
import ConfirmationDialog from '@/components/shared/ConfirmationDialog';
import { Table } from '@/components/shared/table/Table';
import { Button } from '@/lib/components/ui/button';
import { useTranslations } from 'next-intl';
import type { EndpointOut } from 'svix';

interface WebhooksListViewProps {
  webhooks: EndpointOut[] | undefined;
  isLoading: boolean;
  isError: any;
  isPending: boolean;
  confirmationDialogVisible: boolean;
  onCreateClick: () => void;
  onEditClick: (webhook: EndpointOut) => void;
  onDeleteClick: (webhook: EndpointOut) => void;
  onDeleteConfirm: () => void;
  onDeleteCancel: () => void;
}

export function WebhooksListView({
  webhooks,
  isLoading,
  isError,
  isPending,
  confirmationDialogVisible,
  onCreateClick,
  onEditClick,
  onDeleteClick,
  onDeleteConfirm,
  onDeleteCancel,
}: WebhooksListViewProps) {
  const t = useTranslations();

  return (
    <WithLoadingAndError isLoading={isLoading} error={isError}>
      <div className="space-y-3">
        <div className="flex justify-between items-center">
          <div className="space-y-3">
            <h2 className="text-xl font-medium leading-none tracking-tight">
              {t('webhooks')}
            </h2>
            <p className="text-sm text-gray-500 dark:text-gray-400">
              {t('webhooks-description')}
            </p>
          </div>
          <Button onClick={onCreateClick}>{t('add-webhook')}</Button>
        </div>
        {webhooks?.length === 0 ? (
          <EmptyState title={t('no-webhook-title')} />
        ) : (
          <div className="overflow-x-auto">
            <Table
              cols={[t('name'), t('url'), t('created-at'), t('actions')]}
              body={
                webhooks
                  ? webhooks.map((webhook) => {
                      return {
                        id: webhook.id,
                        cells: [
                          {
                            wrap: true,
                            text: webhook.description,
                          },
                          {
                            wrap: true,
                            text: webhook.url,
                          },
                          {
                            wrap: true,
                            text: webhook.createdAt.toLocaleString(),
                          },
                          {
                            buttons: [
                              {
                                text: t('edit'),
                                onClick: () => onEditClick(webhook),
                              },
                              {
                                color: 'error',
                                text: t('remove'),
                                disabled: isPending,
                                onClick: () => onDeleteClick(webhook),
                              },
                            ],
                          },
                        ],
                      };
                    })
                  : []
              }
            />
          </div>
        )}
        <ConfirmationDialog
          visible={confirmationDialogVisible}
          onCancel={onDeleteCancel}
          onConfirm={onDeleteConfirm}
          title={t('confirm-delete-webhook')}
        >
          {t('delete-webhook-warning')}
        </ConfirmationDialog>
      </div>
    </WithLoadingAndError>
  );
}
