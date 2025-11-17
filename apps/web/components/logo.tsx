'use client';

import Image from 'next/image'
import logoImage from '@/assets/images/logo.jpg'
import { useSiteTitle } from '@/components/site-title-context'

export const Logo = ({ className }: { className?: string }) => {
  const { icon, iconType } = useSiteTitle();

  // If there's a Notion icon, use it
  if (icon) {
    // For emoji icons, render as text
    if (iconType === 'emoji') {
      return (
        <div
          className={`flex items-center justify-center ${className}`}
          style={{ fontSize: 'inherit' }}
        >
          {icon}
        </div>
      );
    }

    // For image icons (external or Notion file), use Next Image
    if (iconType === 'external' || iconType === 'file') {
      return (
        <Image
          src={icon}
          alt="Logo"
          className={className}
          width={24}
          height={24}
          unoptimized={iconType === 'external'}
        />
      );
    }
  }

  // Fallback to default logo
  return <Image src={logoImage} alt="Logo" className={className} />
}
