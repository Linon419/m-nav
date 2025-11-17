import { Skeleton } from '@m-nav/ui/components/skeleton';
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
} from '@m-nav/ui/components/card';

export const GridSkeleton = () => {
  // 定义不同的标题和描述宽度以增加视觉变化
  const titleWidths = ['w-20', 'w-24', 'w-28', 'w-32'];
  const descriptionWidths = ['w-2/3', 'w-3/4', 'w-4/5', 'w-full'];

  return (
    <div className='animate-pulse'>
      <Skeleton className='h-6 sm:h-7 w-20 sm:w-24 mb-3 sm:mb-4' />
      <div className='grid gap-3 sm:gap-4 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4'>
        {Array.from({ length: 8 }).map((_, index) => (
          <Card key={index} className='rounded-sm shadow-none border-accent'>
            <CardHeader className='p-3 sm:p-4 md:p-6'>
              <CardTitle className='flex items-center flex-row justify-between gap-2'>
                <div className='flex items-center flex-row gap-2 min-w-0 flex-1'>
                  <Skeleton className='h-4 w-4 sm:h-5 sm:w-5 rounded-sm flex-shrink-0' />
                  <Skeleton
                    className={`h-4 sm:h-5 ${titleWidths[index % titleWidths.length]}`}
                  />
                </div>
                <Skeleton className='h-8 w-8 sm:h-10 sm:w-10 rounded-md flex-shrink-0' />
              </CardTitle>
              <CardDescription>
                <div className='space-y-1.5 sm:space-y-2'>
                  <Skeleton
                    className={`h-3 sm:h-4 ${descriptionWidths[index % descriptionWidths.length]}`}
                  />
                  <Skeleton
                    className={`h-3 sm:h-4 ${descriptionWidths[(index + 1) % descriptionWidths.length]}`}
                  />
                </div>
              </CardDescription>
            </CardHeader>
          </Card>
        ))}
      </div>
    </div>
  );
};
