import React, { useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import { SEOStructuredData } from './SEOStructuredData';

interface SEOHeadProps {
  title: string;
  description: string;
}

export const SEOHead: React.FC<SEOHeadProps> = ({ title, description }) => {
  const location = useLocation();

  useEffect(() => {
    const fullTitle = title.includes('Naveen Minerals')
      ? title
      : `${title} | Naveen Minerals`;
    document.title = fullTitle;

    const setMeta = (selector: string, attr: string, value: string) => {
      let el = document.querySelector(selector);
      if (!el) {
        el = document.createElement('meta');
        if (selector.includes('property=')) {
          const propMatch = selector.match(/property="([^"]+)"/);
          if (propMatch) el.setAttribute('property', propMatch[1]);
        } else if (selector.includes('name=')) {
          const nameMatch = selector.match(/name="([^"]+)"/);
          if (nameMatch) el.setAttribute('name', nameMatch[1]);
        }
        document.head.appendChild(el);
      }
      el.setAttribute(attr, value);
    };

    setMeta('meta[name="description"]', 'content', description);
    setMeta('meta[property="og:title"]', 'content', fullTitle);
    setMeta('meta[property="og:description"]', 'content', description);
    setMeta('meta[name="twitter:title"]', 'content', fullTitle);
    setMeta('meta[name="twitter:description"]', 'content', description);

    const canonicalUrl = window.location.origin + location.pathname;
    setMeta('meta[property="og:url"]', 'content', canonicalUrl);

    let linkCanonical = document.querySelector('link[rel="canonical"]');
    if (!linkCanonical) {
      linkCanonical = document.createElement('link');
      linkCanonical.setAttribute('rel', 'canonical');
      document.head.appendChild(linkCanonical);
    }
    linkCanonical.setAttribute('href', canonicalUrl);
  }, [title, description, location.pathname]);

  return <SEOStructuredData />;
};
