import React, { useEffect, useState } from 'react';
import { imageObjectUrlService } from '../services/imageObjectUrlService';

type Props = {
  imageId: string | null | undefined;
  alt: string;
  style?: React.CSSProperties;
  className?: string;
};

const AuthenticatedImage: React.FC<Props> = ({ imageId, alt, style, className }) => {
  const [url, setUrl] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;

    const load = async () => {
      const nextUrl = await imageObjectUrlService.getObjectUrl(imageId);
      if (!cancelled) {
        setUrl(nextUrl);
      }
    };

    void load();

    return () => {
      cancelled = true;
    };
  }, [imageId]);

  if (!url) {
    return null;
  }

  return <img src={url} alt={alt} style={style} className={className} />;
};

export default AuthenticatedImage;

