import React, { useEffect } from 'react';
import { useLocation } from 'react-router-dom';

const ScrollToTop: React.FC = () => {
  const { pathname, search, hash } = useLocation();

  useEffect(() => {
    const params = new URLSearchParams(search);
    if (params.get('scroll') === 'doctors' || hash === '#doctors') {
      return;
    }
    window.scrollTo(0, 0);
  }, [pathname, search, hash]);

  return null;
};

export default ScrollToTop;
