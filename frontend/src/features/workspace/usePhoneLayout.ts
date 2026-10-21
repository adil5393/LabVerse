import { useEffect, useState } from 'react';

/** Keep a single live canvas mounted, including across rotation and browser resizing. */
export function usePhoneLayout() {
  const [phone, setPhone] = useState(() => typeof window !== 'undefined' && window.innerWidth < 768);
  useEffect(() => {
    const media = window.matchMedia('(max-width: 767px)');
    const update = () => setPhone(media.matches);
    update();
    media.addEventListener('change', update);
    return () => media.removeEventListener('change', update);
  }, []);
  return phone;
}
