'use client';

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/lib/components/ui/dialog';
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
    <Dialog
      open={visible}
      onOpenChange={(isOpen) => !isOpen && setVisible(false)}
    >
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{t('invite-new-member')}</DialogTitle>
        </DialogHeader>
        <div className="py-3">
          <div className="grid grid-cols-1 divide-y py-2">
            <InviteViaEmail teamSlug={teamSlug} onSuccess={handleSuccess} />
            {/* TODO: Add InviteViaLink component when needed */}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
