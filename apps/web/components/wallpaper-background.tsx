'use client';

import { useEffect, useState } from 'react';

interface WallpaperBackgroundProps {
  keywords?: string;
}

const STORAGE_KEY = 'wallpaper_data';
const CHANGE_INTERVAL = 3 * 60 * 60 * 1000; // 3 hours in milliseconds

interface WallpaperData {
  url: string;
  nextChangeTime: number;
}

export function WallpaperBackground({ keywords }: WallpaperBackgroundProps) {
  const [currentWallpaper, setCurrentWallpaper] = useState<string>('');
  const [isLoading, setIsLoading] = useState(true);
  const [opacity, setOpacity] = useState(0);

  const fetchNewWallpaper = async () => {
    try {
      const query = keywords ? `query=${encodeURIComponent(keywords)}` : '';
      const response = await fetch(`/api/wallpaper?${query}`);

      if (!response.ok) {
        console.error('Failed to fetch wallpaper');
        return null;
      }

      const data = await response.json();
      return data.url;
    } catch (error) {
      console.error('Error fetching wallpaper:', error);
      return null;
    }
  };

  const updateWallpaper = async () => {
    setOpacity(0);

    const url = await fetchNewWallpaper();

    if (url) {
      const nextChangeTime = Date.now() + CHANGE_INTERVAL;
      const wallpaperData: WallpaperData = { url, nextChangeTime };

      localStorage.setItem(STORAGE_KEY, JSON.stringify(wallpaperData));

      // Preload image before showing
      const img = new Image();
      img.onload = () => {
        setCurrentWallpaper(url);
        setTimeout(() => setOpacity(1), 100);
      };
      img.src = url;
    }
  };

  useEffect(() => {
    const initWallpaper = async () => {
      const stored = localStorage.getItem(STORAGE_KEY);

      if (stored) {
        try {
          const data: WallpaperData = JSON.parse(stored);
          const now = Date.now();

          if (now < data.nextChangeTime && data.url) {
            // Use stored wallpaper
            setCurrentWallpaper(data.url);
            setOpacity(1);
            setIsLoading(false);

            // Set timer for next change
            const timeUntilChange = data.nextChangeTime - now;
            const timer = setTimeout(() => {
              updateWallpaper();
            }, timeUntilChange);

            return () => clearTimeout(timer);
          }
        } catch (error) {
          console.error('Error parsing stored wallpaper data:', error);
        }
      }

      // Fetch new wallpaper if no valid stored data
      await updateWallpaper();
      setIsLoading(false);
    };

    initWallpaper();

    // Set up interval for automatic changes
    const interval = setInterval(() => {
      updateWallpaper();
    }, CHANGE_INTERVAL);

    return () => clearInterval(interval);
  }, [keywords]);

  if (!currentWallpaper || isLoading) {
    return null;
  }

  return (
    <>
      <div
        className="fixed inset-0 -z-10 bg-cover bg-center bg-no-repeat transition-opacity duration-1000"
        style={{
          backgroundImage: `url(${currentWallpaper})`,
          opacity,
        }}
      />
      <div className="fixed inset-0 -z-10 bg-black/40" />
    </>
  );
}
