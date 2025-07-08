import { zodResolver } from '@hookform/resolvers/zod';
import { mutate } from 'swr';
import toast from 'react-hot-toast';
import React, { useState } from 'react';
import { Button, Input } from 'react-daisyui';
import { useTranslations } from 'next-intl';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { Role } from '@prisma/client';

import type { ApiResponse } from 'types';
import useInvitations from 'hooks/useInvitations';
import type { Team } from '@prisma/client';
import { defaultHeaders, isValidDomain } from '@/lib/common';
import { InputWithCopyButton } from '../shared';
import ConfirmationDialog from '../shared/ConfirmationDialog';

interface InviteViaLinkProps {
  team: Team;
}

const linkInviteSchema = z.object({
  domains: z
    .string()
    .optional()
    .refine((domains) => {
      if (!domains) return true;
      return domains.split(',').every(isValidDomain);
    }, 'Enter one or more valid domains, separated by commas.'),
  role: z.nativeEnum(Role),
});

type LinkInviteFormData = z.infer<typeof linkInviteSchema>;

const InviteViaLink = ({ team }: InviteViaLinkProps) => {
  const [showDelDialog, setShowDelDialog] = useState(false);
  const t = useTranslations();
  const { invitations } = useInvitations({
    slug: team.slug,
    sentViaEmail: false,
  });

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting, isValid },
    reset,
    watch,
  } = useForm<LinkInviteFormData>({
    resolver: zodResolver(linkInviteSchema),
    defaultValues: {
      domains: '',
      role: Role.MEMBER,
    },
    mode: 'onChange',
  });

  const watchedValues = watch();

  const onSubmit = async (values: LinkInviteFormData) => {
    const response = await fetch(`/api/teams/${team.slug}/invitations`, {
      method: 'POST',
      headers: defaultHeaders,
      body: JSON.stringify({
        ...values,
        sentViaEmail: false,
      }),
    });

    if (!response.ok) {
      const result = (await response.json()) as ApiResponse;
      toast.error(result.error.message);
      return;
    }

    mutate(`/api/teams/${team.slug}/invitations?sentViaEmail=false`);
    toast.success(t('invitation-link-created'));
    reset();
  };

  // Delete an existing invitation link
  const deleteInvitationLink = async (id: string) => {
    const response = await fetch(
      `/api/teams/${team.slug}/invitations?id=${id}`,
      {
        method: 'DELETE',
        headers: defaultHeaders,
      }
    );

    if (!response.ok) {
      const result = (await response.json()) as ApiResponse;
      toast.error(result.error.message);
      return;
    }

    mutate(`/api/teams/${team.slug}/invitations?sentViaEmail=false`);
    toast.success(t('invitation-link-deleted'));
    setShowDelDialog(false);
  };

  const invitation = invitations ? invitations[0] : null;

  if (invitation) {
    return (
      <div className="pt-4">
        <InputWithCopyButton
          label={t('share-invitation-link')}
          value={invitation.url}
          className="text-sm w-full"
        />
        <p className="text-sm text-slate-500 my-2">
          {invitation.allowedDomains.length > 0
            ? `Anyone with an email address ending with ${invitation.allowedDomains} can use this link to join your team.`
            : 'Anyone can use this link to join your team.'}
          <Button
            className="btn btn-xs btn-link link-error"
            onClick={() => setShowDelDialog(true)}
          >
            {t('delete-link')}
          </Button>
        </p>
        <ConfirmationDialog
          visible={showDelDialog}
          onCancel={() => setShowDelDialog(false)}
          onConfirm={() => deleteInvitationLink(invitation.id)}
          title={t('delete-invitation-link')}
        >
          {t('delete-invitation-warning')}
        </ConfirmationDialog>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} method="POST" className="pt-4">
      <h3 className="font-medium text-[14px] pb-2">{t('invite-via-link')}</h3>
      <div className="flex gap-1">
        <Input
          {...register('domains')}
          placeholder="Restrict domain: boxyhq.com"
          className="text-sm w-1/2"
        />
        <select
          {...register('role')}
          className="select-bordered select rounded"
          required
        >
          <option value={Role.MEMBER}>{t('member')}</option>
          <option value={Role.ADMIN}>{t('admin')}</option>
          <option value={Role.OWNER}>{t('owner')}</option>
        </select>
        <Button
          type="submit"
          color="primary"
          loading={isSubmitting}
          disabled={!isValid}
          className="flex-grow"
        >
          {t('create-link')}
        </Button>
      </div>
      <p className="text-sm text-slate-500 my-2">
        {watchedValues.domains && !errors.domains
          ? `Anyone with an email address ending with ${watchedValues.domains} can use this link to join your team.`
          : 'Anyone can use this link to join your team.'}
      </p>
    </form>
  );
};

export default InviteViaLink;
