
export interface Post {
  id: number;
  content: string;
  author: {
    name: string;
    avatar: string;
    personalityType: string;
    badges: string[];
    points: number;
  };
  likes: number;
  comments: number;
  timestamp: string;
  isReported?: boolean;
}

export interface Event {
  id: string;
  title: string;
  date: string;
  host: string;
  participants: number;
}

export interface Poll {
  id: string;
  question: string;
  options: string[];
  votes: number[];
}

export interface CommunityStatsData {
  question_id: string;
  total_attempts: number;
  correct_count: number;
  incorrect_count: number;
  average_time_seconds: number;
}
