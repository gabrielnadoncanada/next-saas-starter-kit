'use client';

import Modal from '@/components/shared/Modal';
import { useTranslations } from 'next-intl';
import { InviteViaEmail } from '@/features/invitation/send/InviteViaEmail';

interface InviteMemberProps {
  teamSlug: string;
  visible: boolean;
  setVisible: (visible: boolean) => void;
}

export function InviteMember({
  teamSlug,
  visible,
  setVisible,
}: InviteMemberProps) {
  const t = useTranslations();

  const handleSuccess = () => {
    setVisible(false);
  };

  return (
    <Modal open={visible} close={() => setVisible(false)}>
      <Modal.Header>{t('invite-new-member')}</Modal.Header>
      <Modal.Body>
        <div className="grid grid-cols-1 divide-y py-2">
          <InviteViaEmail teamSlug={teamSlug} onSuccess={handleSuccess} />
          {/* TODO: Add InviteViaLink component when needed */}
        </div>
      </Modal.Body>
    </Modal>
  );
}
