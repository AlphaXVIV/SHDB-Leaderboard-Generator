// Types, because I like my data types consistent
export interface Entries {
  friend_code: string;
  name: string;
  rank: number;
  student_rep?: string;
  is_new?: boolean;
}

// Club class explicit typing
export type ClubClass = "Competitive" | "Semi-Competitive" | "Casual" | "Newbie";