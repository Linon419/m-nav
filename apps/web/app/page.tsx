import { SiteHeader } from '@/components/site-header';
import { SiteFooter } from '@/components/site-footer';
import { SiteContent } from '@/components/site-content';
import { SiteTitleProvider } from '@/components/site-title-context';
import { WallpaperBackground } from '@/components/wallpaper-background';
import { Suspense } from 'react';
import { GridSkeleton } from '@/components/GridSkeleton';
import { connection } from 'next/server';
import { getPageData } from '@/lib/notion';

export default async function Page() {
  await connection()

  const pageData = await getPageData();

  return (
    <SiteTitleProvider>
      <WallpaperBackground keywords={pageData.wallpaperKeywords} />
      <div data-wrapper='' className='border-grid flex flex-1 flex-col min-h-svh'>
        <SiteHeader />

        <main className='flex flex-1 flex-col container-wrapper p-4'>
          <Suspense fallback={<GridSkeleton />}>
            <SiteContent />
          </Suspense>
        </main>

        <SiteFooter />
      </div>
    </SiteTitleProvider>
  );
}
