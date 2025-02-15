import axios from 'axios';

const UNSPLASH_API_KEY = process.env.EXPO_PUBLIC_UNSPLASH_API_KEY;
const UNSPLASH_API_URL = 'https://api.unsplash.com';

export interface UnsplashImage {
  id: string;
  urls: {
    regular: string;
    small: string;
  };
  alt_description: string;
}

class ImageService {
  private async searchImage(query: string): Promise<UnsplashImage | null> {
    if (!UNSPLASH_API_KEY) {
      console.error('Unsplash API key not configured');
      return null;
    }
    try {
      const response = await axios.get(`${UNSPLASH_API_URL}/search/photos`, {
        params: {
          query,
          per_page: 1,
        },
        headers: {
          Authorization: `Client-ID ${UNSPLASH_API_KEY}`,
        },
      });

      const images = response.data.results;
      if (images.length > 0) {
        const image = images[0];
        return {
          ...image,
          urls: {
            ...image.urls,
            regular: image.urls.regular + '&w=800&q=80'
          }
        };
      }
      return null;
    } catch (error) {
      console.error('Error fetching image from Unsplash:', error);
      return null;
    }
  }

  private readonly techKeywords = [
    'programming',
    'coding',
    'developer',
    'software',
    'technology',
    'computer',
    'development',
    'code',
    'tech',
  ];

  private readonly excludedWords = [
    'a', 'an', 'the', 'in', 'on', 'at', 'to', 'for', 'of', 'with',
    'by', 'from', 'up', 'about', 'into', 'over', 'after'
  ];

  private cleanAndExtractKeywords(text: string): string[] {
    return text
      .toLowerCase()
      .replace(/[^\w\s]/g, '')
      .split(' ')
      .filter(word => 
        word.length > 2 && 
        !this.excludedWords.includes(word)
      );
  }

  private async searchWithTechContext(query: string): Promise<UnsplashImage | null> {
    // First try with the exact query + tech context
    const techQuery = `${query} ${this.techKeywords[0]}`;
    const result = await this.searchImage(techQuery);
    if (result) return result;

    // If no results, try with different tech keywords
    for (const keyword of this.techKeywords.slice(1)) {
      const contextQuery = `${query} ${keyword}`;
      const contextResult = await this.searchImage(contextQuery);
      if (contextResult) return contextResult;
    }

    return null;
  }

  async getRelatedImage(title: string, tags: string[]): Promise<string | null> {
    try {
      // Try searching with tech-related tags first
      const techTags = tags.filter(tag => 
        this.techKeywords.some(keyword => 
          tag.toLowerCase().includes(keyword)
        )
      );
      
      if (techTags.length > 0) {
        const tagQuery = techTags.slice(0, 2).join(' ');
        const tagImage = await this.searchImage(tagQuery);
        if (tagImage) {
          return tagImage.urls.regular;
        }
      }

      // If no tech tags, try with title + tech context
      const titleKeywords = this.cleanAndExtractKeywords(title)
        .slice(0, 3)
        .join(' ');
      
      const titleImage = await this.searchWithTechContext(titleKeywords);
      if (titleImage) {
        return titleImage.urls.regular;
      }

      // If still no image, use a rotating set of tech-related queries
      const defaultQueries = [
        'programming code screen',
        'software development workspace',
        'technology computer modern',
        'coding developer setup',
        'tech workspace modern'
      ];
      
      const randomQuery = defaultQueries[Math.floor(Math.random() * defaultQueries.length)];
      const defaultImage = await this.searchImage(randomQuery);
      const imageUrl = defaultImage?.urls.regular;
      return imageUrl;
    } catch (error) {
      console.error('Error getting related image:', error);
      return null;
    }
  }
}

export const imageService = new ImageService();
