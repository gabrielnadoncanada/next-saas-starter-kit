import { useTranslations } from 'next-intl';

interface EventTypesViewProps {
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  values: string[];
  error?: string;
}

export function EventTypesView({
  onChange,
  values,
  error,
}: EventTypesViewProps) {
  const t = useTranslations();

  const eventTypes = [
    'user.created',
    'user.updated',
    'user.deleted',
    'team.created',
    'team.updated',
    'team.deleted',
    'member.created',
    'member.updated',
    'member.deleted',
    'invitation.created',
    'invitation.deleted',
  ];

  return (
    <>
      {eventTypes.map((eventType) => (
        <div key={eventType} className="form-control">
          <label className="label cursor-pointer justify-start">
            <input
              type="checkbox"
              className="checkbox checkbox-sm mr-2"
              value={eventType}
              checked={values.includes(eventType)}
              onChange={onChange}
            />
            <span className="label-text text-sm">{eventType}</span>
          </label>
        </div>
      ))}
      {error && <div className="text-red-500 text-sm mt-1">{error}</div>}
    </>
  );
}
