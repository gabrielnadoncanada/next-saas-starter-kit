import React from 'react';
import { useTranslations } from 'next-intl';

import Modal from '../shared/Modal';
import type { Team } from '@prisma/client';
import InviteViaEmail from './InviteViaEmail';
import InviteViaLink from './InviteViaLink';

interface InviteMemberProps {
  team: Team;
  visible: boolean;
  setVisible: (visible: boolean) => void;
}

const InviteMember = ({ visible, setVisible, team }: InviteMemberProps) => {
  const t = useTranslations();

  return (
    <Modal open={visible} close={() => setVisible(!visible)}>
      <Modal.Header>{t('invite-new-member')}</Modal.Header>
      <Modal.Body>
        <div className="grid grid-cols-1 divide-y py-2">
          <InviteViaEmail teamSlug={team.slug} onSuccess={() => setVisible(false)} />
          <InviteViaLink team={team} />
        </div>
      </Modal.Body>
    </Modal>
  );
};

export default InviteMember;
