import React, { useEffect, useMemo, useState } from 'react';
import { IonAvatar } from '@ionic/react';
import { imageObjectUrlService } from '../services/imageObjectUrlService';

type UserAvatarProps = {
  name: string | null | undefined;
  imageId: string | null | undefined;
  size?: number;
};

const UserAvatar: React.FC<UserAvatarProps> = ({ name, imageId, size = 24 }) => {
  const [url, setUrl] = useState<string | null>(null);

  const initials = useMemo(() => {
    const trimmed = (name ?? '').trim();
    if (!trimmed) return '?';
    return trimmed.charAt(0).toUpperCase();
  }, [name]);

  useEffect(() => {
    let canceled = false;

    const load = async () => {
      const objectUrl = await imageObjectUrlService.getObjectUrl(imageId);
      if (!canceled) {
        setUrl(objectUrl);
      }
    };

    void load();

    return () => {
      canceled = true;
    };
  }, [imageId]);

  return (
    <IonAvatar style={{ width: `${size}px`, height: `${size}px` }}>
      {url ? (
        <img src={url} alt={name ?? 'Profilbild'} />
      ) : (
        <div
          style={{
            width: '100%',
            height: '100%',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            background: 'var(--ion-color-step-150)',
            color: 'var(--ion-color-dark)',
            fontWeight: 800,
            fontSize: `${Math.max(10, Math.round(size * 0.42))}px`,
          }}
        >
          {initials}
        </div>
      )}
    </IonAvatar>
  );
};

export default UserAvatar;

