export interface BookChapter {
  title: string;
  text: string;
}

export interface FullBookDef {
  id: string;
  title: string;
  author: string;
  year?: string;
  category: string;
  description: string;
  difficulty: 'Beginner' | 'Intermediate' | 'Advanced';
  coverAccent?: string;
  estimatedMinutes: number;
  chapters: BookChapter[];
}
