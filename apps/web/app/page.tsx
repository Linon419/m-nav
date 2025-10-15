import { SiteHeader } from '@/components/site-header';
import { SiteFooter } from '@/components/site-footer';
import { SiteContent } from '@/components/site-content';
import { SiteTitleProvider } from '@/components/site-title-context';
import { WallpaperBackground } from '@/components/wallpaper-background';
import { Suspense } from 'react';
import { GridSkeleton } from '@/components/GridSkeleton';
import { connection } from 'next/server';
import { getPageData } from '@/lib/notion';

export const revalidate = 3600; // Revalidate every 1 hour

export default async function Page() {
  await connection()

  return (
    <SiteTitleProvider>
      <WallpaperBackground keywords={process.env.WALLPAPER_KEYWORDS || undefined} />
      <div data-wrapper='' className='flex flex-1 flex-col min-h-svh'>
        <SiteHeader />

        <main className='flex flex-1 flex-col max-w-[1400px] min-[1800px]:max-w-screen-2xl mx-auto w-full p-4'>
          <Suspense fallback={<GridSkeleton />}>
            <SiteContent />
          </Suspense>
        </main>

        <SiteFooter />
      </div>
    </SiteTitleProvider>
  );
}
