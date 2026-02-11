import type { Ref } from 'vue'
import type { Name, NameTuple, Rank, RankTuple } from '@/components/types'
// import type { Entries } from '@/components/types'
import Papa from 'papaparse'

// don't worry this whole thing is public anyway
const base = `https://docs.google.com/spreadsheets/d/1w4-dcMNSNgrxWkUFbgQMKyQfGq3FrceimEqAy-RbBXQ/gviz/tq`

/**
 * URL builder to fetch raid ranks data in the form of a CSV:
 * ?tq=select B, E where C = {raidType} and D = {season} & tqx=out:csv & gid=1099721804
 * @param raidType Raid type (TA or GA)
 * @param season Raid season
 * @returns Google Sheets URL for the exported CSV
 */
function urlRanks(raidType: string, season: number) {
  // ?tq=select B, E where C = 'TA' and D = 78 & tqx=out:csv & gid=1099721804
  const params = new URLSearchParams()

  // build tq parameter
  const query = `select B, E where C = '${raidType}' and D = ${season}`
  params.set('tq', query)
  params.set('tqx', 'out:csv')
  params.set('gid', '1099721804')

  // https://docs.google.com/spreadsheets/d/1w4-dcMNSNgrxWkUFbgQMKyQfGq3FrceimEqAy-RbBXQ/gviz/tq?tq=select%20B%2C%20E%20where%20C%20%3D%20'TA'%20and%20D%20%3D%2078&tqx=out:csv&gid=1099721804
  return `${base}?${params.toString()}`
}

/**
 * URL builder to fetch club member data in the form of a CSV:
 * ?tq=select B, D, F & tqx=out:csv & gid=1875180266
 * @returns Google Sheets URL for the exported CSV
 */
function urlNames() {
  // ?tq=select B, D, F & tqx=out:csv & gid=1875180266
  // https://docs.google.com/spreadsheets/d/1w4-dcMNSNgrxWkUFbgQMKyQfGq3FrceimEqAy-RbBXQ/gviz/tq?tq=select%20B%2C%20D%2C%20F&tqx=out:csv&gid=1875180266&
  const params = new URLSearchParams()

  // build tq parameter
  const query = `select B, D, F`
  params.set('tq', query)
  params.set('tqx', 'out:csv')
  params.set('gid', '1875180266')

  return `${base}?${params.toString()}`
}

/**
 * Fetches data from URLs, then parses the CSV. Header not included.
 * @param url Google Doc URL
 * @returns
 */
async function fetchCsv(url: string) {
  try {
    const response = await fetch(url)
    if (!response.ok) throw new Error(`HTTP error ${response.status}`)
    const text = await response.text()

    const parsed = Papa.parse(text, {
      dynamicTyping: true,
      skipEmptyLines: true,
    })

    return parsed.data
  } catch (err) {
    console.error('Error fetching or parsing CSV:', err)
    return []
  }
}

/**
 * Fetches two CSVs from two separate sheets (in the same spreadsheet)
 * @param raidType Raid type (TA/GA)
 * @param season Raid season
 * @returns A "prototype" leaderboard of type: {name, friend_code, club, rank}
 */
export async function csvFetch(raidType: Ref<string>, season: Ref<number>) {
  const ranksRows = (await fetchCsv(urlRanks(raidType.value, season.value))).slice(1) as RankTuple[]
  const ranks: Rank[] = ranksRows.map(([friend_code, rank]) => ({
    friend_code,
    rank,
  }))

  if (ranks.length === 0) {
    throw new Error('Season ranks are not available; have you set the correct season?')
  }

  console.log('DEBUG RANKS: ', ranks)

  const namesRows = (await fetchCsv(urlNames())).slice(2) as NameTuple[]
  const names: Name[] = namesRows.map(([name, friend_code, club]) => ({
    name,
    friend_code,
    club,
  }))

  console.log('DEBUG NAMES: ', names)

  // LUT for ranks
  const lutRank = new Map(ranks.map((rank) => [rank.friend_code, rank.rank]))

  // Merge by friend_code
  const protoLeaderboard = names.map((name) => ({
    ...name,
    rank: lutRank.get(name.friend_code) ?? null, // null if not found
  }))

  console.log('DEBUG PROTOLB: ', protoLeaderboard)
  return protoLeaderboard
}
