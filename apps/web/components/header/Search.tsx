'use client';

import { Input } from '@m-nav/ui/components/input';
import { SearchIcon } from 'lucide-react';
import { useSearchContext } from '../search-context';

export function Search() {
  const { searchQuery, setSearchQuery } = useSearchContext();

  return (
    <div className='relative flex items-center gap-2 w-full max-w-[140px] sm:max-w-[180px] md:max-w-[240px]'>
      <Input
        type='text'
        placeholder='Search'
        className='w-full pr-8 h-9 text-sm'
        value={searchQuery}
        onChange={(e) => setSearchQuery(e.target.value)}
      />
      <SearchIcon className='size-3.5 sm:size-4 absolute right-2 top-1/2 -translate-y-1/2 text-muted-foreground' />
    </div>
  );
}