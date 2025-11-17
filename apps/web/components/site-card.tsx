import Image from 'next/image';
import Link from 'next/link';
import {
  Card,
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from '@m-nav/ui/components/card';
import { Button } from '@m-nav/ui/components/button';
import { ArrowUpRightIcon } from 'lucide-react';

export function SiteCard({
  title,
  description,
  href,
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  category,
}: {
  title: string;
  description: string;
  href: string;
  category: string;
}) {
  // Safely get hostname from href
  const getHostname = (url: string) => {
    if (!url) return 'default';
    try {
      return new URL(url).hostname;
    } catch {
      return 'default';
    }
  };

  return (
    <Card className='group hover:shadow-md transition-shadow rounded-sm shadow-none'>
      <CardHeader className='p-3 sm:p-4 md:p-6'>
        <CardTitle className='flex items-center flex-row justify-between gap-2'>
          <div className='flex items-center flex-row gap-2 min-w-0 flex-1'>
            <Image
              src={`/favicon/${getHostname(href)}`}
              alt={title}
              width={20}
              height={20}
              className='object-cover overflow-hidden flex-shrink-0 w-4 h-4 sm:w-5 sm:h-5'
            />
            <span className='truncate text-sm sm:text-base'>{title}</span>
          </div>

          <Link
            href={href}
            target='_blank'
            rel='noopener noreferrer'
            className='block flex-shrink-0'
          >
            <Button
              variant='ghost'
              size='icon'
              className='opacity-0 group-hover:opacity-100 transition-opacity max-sm:opacity-100 max-sm:bg-accent h-8 w-8 sm:h-10 sm:w-10'
            >
              <ArrowUpRightIcon className='w-3.5 h-3.5 sm:w-4 sm:h-4' />
            </Button>
          </Link>
        </CardTitle>
        <CardDescription className='text-xs sm:text-sm line-clamp-2'>{description}</CardDescription>
      </CardHeader>
    </Card>
  );
}
