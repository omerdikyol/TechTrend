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
  private readonly DEFAULT_IMAGES = [
    'https://images.unsplash.com/photo-1461749280684-dccba630e2f6?w=800&q=80', // coding
    'https://images.unsplash.com/photo-1498050108023-c5249f4df085?w=800&q=80', // laptop code
    'https://images.unsplash.com/photo-1555066931-4365d14bab8c?w=800&q=80', // code on screen
    'https://images.unsplash.com/photo-1517694712202-14dd9538aa97?w=800&q=80', // laptop lifestyle
    'https://images.unsplash.com/photo-1563986768711-b3bde3dc821e?w=800&q=80', // desk setup
    'https://images.unsplash.com/photo-1526374965328-7f61d4dc18c5?w=800&q=80', // binary code
    'https://images.unsplash.com/photo-1516116216624-53e697fedbea?w=800&q=80', // modern workspace
    'https://images.unsplash.com/photo-1504639725590-34d0984388bd?w=800&q=80', // code projection
    'https://images.unsplash.com/photo-1571171637578-41bc2dd41cd2?w=800&q=80', // computer desk
    'https://images.unsplash.com/photo-1542831371-29b0f74f9713?w=800&q=80', // code closeup
  ];

  private imagePool: string[] = [];
  private readonly POOL_SIZE = 20;

  constructor() {
    this.initializeImagePool();
  }

  private initializeImagePool() {
    // Start with all default images
    this.imagePool = [...this.DEFAULT_IMAGES];
    // Shuffle the pool
    this.shufflePool();
  }

  private shufflePool() {
    for (let i = this.imagePool.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [this.imagePool[i], this.imagePool[j]] = [this.imagePool[j], this.imagePool[i]];
    }
  }

  private getNextImage(): string {
    // If pool is empty or getting low, refill it
    if (this.imagePool.length < 3) {
      this.initializeImagePool();
    }
    return this.imagePool[Math.floor(Math.random() * this.imagePool.length)];
  }

  async getRelatedImage(title: string, tags: string[]): Promise<string> {
    // Simply return the next image from our pool
    return this.getNextImage();
  }
}

export const imageService = new ImageService();
