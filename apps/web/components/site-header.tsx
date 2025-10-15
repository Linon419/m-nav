import { MainNav } from '@/components/header/main-nav';
import { ModeSwitcher } from '@/components/header/mode-switcher';
import { Search } from './header/Search';

export function SiteHeader({ title }: { title?: string }) {
  return (
    <header className='border-grid sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60'>
      <div className='container-wrapper'>
        <div className='container flex h-14 items-center gap-2 md:gap-4'>
          <MainNav title={title} />
          <div className='ml-auto flex items-center gap-2 flex-1 justify-end'>
            <nav className='flex items-center gap-0.5'>
              <Search />
              <ModeSwitcher />
            </nav>
          </div>
        </div>
      </div>
    </header>
  );
}
