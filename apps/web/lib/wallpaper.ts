export interface UnsplashImage {
  id: string;
  urls: {
    regular: string;
    full: string;
  };
  user: {
    name: string;
    username: string;
  };
  links: {
    html: string;
  };
}

export async function fetchRandomWallpaper(query?: string): Promise<string> {
  const accessKey = process.env.UNSPLASH_ACCESS_KEY;

  if (!accessKey) {
    console.warn('UNSPLASH_ACCESS_KEY is not configured');
    return '';
  }

  try {
    const endpoint = query
      ? `https://api.unsplash.com/photos/random?query=${encodeURIComponent(query)}&orientation=landscape`
      : 'https://api.unsplash.com/photos/random?orientation=landscape';

    const response = await fetch(endpoint, {
      headers: {
        Authorization: `Client-ID ${accessKey}`,
      },
      next: { revalidate: 10800 }, // Cache for 3 hours
    });

    if (!response.ok) {
      console.error('Unsplash API error:', response.statusText);
      return '';
    }

    const data: UnsplashImage = await response.json();

    // Trigger download tracking as per Unsplash API guidelines
    if (data.links?.html) {
      fetch(`${data.links.html}/download`, {
        headers: {
          Authorization: `Client-ID ${accessKey}`,
        },
      }).catch(() => {
        // Silently fail download tracking
      });
    }

    return data.urls.regular;
  } catch (error) {
    console.error('Error fetching wallpaper:', error);
    return '';
  }
}
