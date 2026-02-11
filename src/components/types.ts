// Types, because I like my data types consistent
export interface Entries {
  friend_code: string
  name: string
  rank: number
  student_rep?: string
  is_new?: boolean
}

// Club class explicit typing
export type ClubClass = 'Competitive' | 'Semi-Competitive' | 'Casual' | 'Newbie'

export type NameTuple = [string, string, number]
export interface Name {
  name: string
  friend_code: string
  club: number
}

export type RankTuple = [string, number?]
export interface Rank {
  friend_code: string
  rank?: number
}

export interface ProtoLeaderboard {
  name: string
  friend_code: string
  club: number
  rank?: number
}
