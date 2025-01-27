export interface Haiku {
  id: string;
  date: string;
  lines: string[];
  sourceHeadline: string;
  sourceUrl: string;
}

export interface HaikuStore {
  [date: string]: Haiku;
}

export interface NewsApiResponse {
  status: string;
  totalResults: number;
  articles: NewsArticle[];
}

export interface NewsArticle {
  title: string;
  url: string;
  source: {
    id: string | null;
    name: string;
  };
  author: string | null;
  description: string | null;
  publishedAt: string;
}

export type ApiError = {
  message: string;
  status?: number;
  code?: string;
}