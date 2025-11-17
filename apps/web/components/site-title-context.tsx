'use client';

import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { siteConfig } from '@/config/site';

interface SiteTitleContextType {
  title: string;
  setTitle: (title: string) => void;
  icon?: string;
  iconType?: 'emoji' | 'external' | 'file';
  setIcon: (icon?: string, iconType?: 'emoji' | 'external' | 'file') => void;
}

const SiteTitleContext = createContext<SiteTitleContextType>({
  title: siteConfig.name,
  setTitle: () => {},
  icon: undefined,
  iconType: undefined,
  setIcon: () => {},
});

export function SiteTitleProvider({ children }: { children: ReactNode }) {
  const [title, setTitle] = useState(siteConfig.name);
  const [icon, setIconState] = useState<string | undefined>();
  const [iconType, setIconType] = useState<'emoji' | 'external' | 'file' | undefined>();

  const setIcon = (newIcon?: string, newIconType?: 'emoji' | 'external' | 'file') => {
    setIconState(newIcon);
    setIconType(newIconType);
  };

  // 更新浏览器标题
  useEffect(() => {
    document.title = title;
  }, [title]);

  // 更新 favicon
  useEffect(() => {
    if (!icon) return;

    const updateFavicon = () => {
      // Remove existing favicons
      const existingLinks = document.querySelectorAll("link[rel*='icon']");
      existingLinks.forEach((link) => link.remove());

      if (iconType === 'emoji') {
        // For emoji, create an SVG favicon
        const svg = `
          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100">
            <text y="0.9em" font-size="90">${icon}</text>
          </svg>
        `;
        const blob = new Blob([svg], { type: 'image/svg+xml' });
        const url = URL.createObjectURL(blob);

        const link = document.createElement('link');
        link.rel = 'icon';
        link.type = 'image/svg+xml';
        link.href = url;
        document.head.appendChild(link);
      } else if (iconType === 'external' || iconType === 'file') {
        // For image URLs
        const link = document.createElement('link');
        link.rel = 'icon';
        link.type = 'image/png';
        link.href = icon;
        document.head.appendChild(link);
      }
    };

    updateFavicon();
  }, [icon, iconType]);

  return (
    <SiteTitleContext.Provider value={{ title, setTitle, icon, iconType, setIcon }}>
      {children}
    </SiteTitleContext.Provider>
  );
}

export const useSiteTitle = () => useContext(SiteTitleContext); 