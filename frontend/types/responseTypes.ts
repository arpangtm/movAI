export interface Recommendation {
  title: string;
  year: string;
  genre: string;
  link: string;
}

export interface BotResponse {
  content: {
    recommendations: Recommendation[];
  };
  type: "bot";
}

export interface UserResponse {
  content: string;
  type: string;
}

export interface Movie {
  title: string;
  year: string;
  genre: string;
  link: string;
  backdrop_path: string;
  poster_path: string;
  trailer: string;
}

export interface TMDBMovie {
  id: number;
  title: string;
  tagline?: string;
  year: number;
  rating: number;
  duration?: string;
  genre: string[];
  poster?: string;
  backdrop?: string;
  trailer?: string;
  description?: string;
  director?: string;
  cast: string[];
  trending?: boolean;
  status?: string;
  budget?: number;
  revenue?: number;
}

export interface featuredMovie {
  id: string | number;
  title: string;
  year: number;
  rating: number;
  genre: string[];
  director?: string;
  duration?: string;
  poster?: string;
  description?: string;
  cast: string[];
  trending: boolean;
  aiRecommended: boolean;
  poster_path?: string;
  trailer?: string;
}

export type ResponseType = BotResponse | UserResponse;
