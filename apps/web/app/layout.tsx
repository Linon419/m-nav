import { Metadata, Viewport } from 'next'
import '@m-nav/ui/styles/globals.css'
import { Providers } from '@/components/providers'
import { Analytics } from '@/components/analytics'
import { fontSans, fontMono } from '@/lib/fonts'
import { META_THEME_COLORS, siteConfig } from '@/config/site'
import { getPageData } from '@/lib/notion'

// 生成 metadata 的辅助函数
function createMetadata(title: string, description: string): Metadata {
  return {
    title: {
      default: title,
      template: `%s - ${title}`
    },
    metadataBase: new URL(siteConfig.url),
    description,
    keywords: ['Next.js', 'React'],
    authors: [
      {
        name: 'busyhe',
        url: 'https://github.com/busyhe'
      }
    ],
    creator: 'busyhe',
    openGraph: {
      type: 'website',
      locale: 'en_US',
      url: siteConfig.url,
      title,
      description,
      siteName: title,
      images: [
        {
          url: siteConfig.ogImage,
          width: 1200,
          height: 630,
          alt: title
        }
      ]
    },
    twitter: {
      card: 'summary_large_image',
      title,
      description,
      images: [siteConfig.ogImage],
      creator: '@busyhe'
    },
    icons: {
      icon: '/favicon.ico',
      shortcut: '/logo.png'
    }
  }
}

export async function generateMetadata(): Promise<Metadata> {
  try {
    const siteData = await getPageData()
    const dynamicTitle = siteData.title || siteConfig.name
    const dynamicDescription = siteData.description || siteConfig.description
    
    return createMetadata(dynamicTitle, dynamicDescription)
  } catch (error) {
    // Fallback to static config if getPageData fails
    console.error('Failed to generate dynamic metadata:', error)
    return createMetadata(siteConfig.name, siteConfig.description)
  }
}

export const viewport: Viewport = {
  themeColor: META_THEME_COLORS.light,
  width: 'device-width',
  initialScale: 1,
  maximumScale: 5,
  userScalable: true,
  viewportFit: 'cover'
}

export default function RootLayout({
  children
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={`${fontSans.variable} ${fontMono.variable} font-sans antialiased `}>
        <Providers>{children}</Providers>
        <Analytics />
      </body>
    </html>
  )
}
