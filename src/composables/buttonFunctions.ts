import { clubMetadata, clubThresholds } from '@/components/consts'
import type { Entries } from '@/components/types'
import type { Ref } from 'vue'
// import type { Ref } from 'vue'

/**
 * Sorts leaderboard rank
 * @param lbFormEntries Leaderboard array
 * @returns Sorted leaderboard by ascending rank order
 */
export function sortRank(lbFormEntries: Entries[]) {
  const sortedEntries = lbFormEntries

  sortedEntries.sort((a, b) => {
    if (a === null && b === null) return 0
    if (a.rank === null) return 1
    if (b.rank === null) return -1

    return a.rank - b.rank
  })

  return sortedEntries
}

/**
 * Generates Discord message with Markdown formatting and emojis.
 * @param lbFormEntries Leaderboard, ideally already sorted but it goes through sorting anyway
 * @param generatedMessage Reactive variable for the generated message
 * @param clubNumber Club number, from form
 * @param raidType Raid type, from form
 * @param season Season number, from form
 * @param raidBoss Raid boss, from form
 * @param environment Environment, from form
 */
export function generateMessage(
  lbFormEntries: Ref<Entries[]>,
  generatedMessage: Ref<string>,
  clubNumber: Ref<number>,
  raidType: Ref<string>,
  season: Ref<number>,
  raidBoss: Ref<string>,
  environment: Ref<string>,
) {
  let message = ''
  let clubSelected = clubMetadata.get(clubNumber.value || 1)

  // Button will sort by rank "automatically" using an existing function
  // This may reflect the form order as well (this is intended)
  sortRank(lbFormEntries.value)

  function splitTop5(leaderboard: Entries[]): [Entries[], Entries[]] {
    const top5 = leaderboard.slice(0, 5) // Top 5
    const minusTop5 = leaderboard.slice(5) // Everyone else
    return [top5, minusTop5]
  }

  // Slice the leaderboards into separate parts: Top 5, Platinum, Gold, Warning
  const [top5, minusTop5Lb] = splitTop5(lbFormEntries.value)
  const platinum = minusTop5Lb.filter((entry) => entry.rank !== null && entry.rank <= 10000)
  const gold = minusTop5Lb.filter(
    (entry) =>
      entry.rank !== null &&
      entry.rank > 10000 &&
      entry.rank <= clubThresholds.get(clubSelected!.class)!,
  )
  const warning = minusTop5Lb.filter(
    (entry) => entry.rank === null || entry.rank > clubThresholds.get(clubSelected!.class)!,
  )

  // PENDING: Make a warning popup or some shit
  if (!clubSelected) {
    clubSelected = clubMetadata.get(1)!
  }

  // Message Header - Club
  message += `# <@&${clubSelected.roleID}> Leaderboard\n`

  // Message Header - Raid
  message += `## ${raidType.value} S${season.value} ${raidBoss.value} ${environment.value}\n`

  // Platinum Rank (Top 10000)
  message += `### :1_: **Plat Trophy** :1_:\n`
  top5.forEach((entry) => {
    // Output: **`  415` 「SH」415a**
    message += `**\`${entry.rank.toString().padStart(5, ' ')}\` ${entry.name}**`
    if (entry.is_new) {
      message += ` :wave:`
    }

    message += `\n`
  })

  platinum.forEach((entry) => {
    // Output: `  415` 「SH」415a
    message += `\`${entry.rank.toString().padStart(5, ' ')}\` ${entry.name}`
    if (entry.is_new) {
      message += ` :wave:`
    }

    message += `\n`
  })

  // Gold Rank (10000 - Threshold)
  // Does not pop up in Competitive
  if (gold.length > 0) {
    message += `### :2_: **Gold Trophy** :2_:\n`
    gold.forEach((entry) => {
      // Output: `10415` 「SH」415a
      message += `\`${entry.rank.toString().padStart(5, ' ')}\` ${entry.name}`
      if (entry.is_new) {
        message += ` :wave:`
      }

      message += `\n`
    })
  }

  // Danger Zone (Below Threshold)
  message += `### :rotating_light: **Warning** :rotating_light:\n`
  warning.forEach((entry) => {
    // Output: `99999` 「SH」415a
    message += `\`${entry.rank.toString().padStart(5, ' ')}\` ${entry.name}`

    message += `\n`
  })

  // Set generated message
  generatedMessage.value = message

  // Update textarea
  const textarea = document.getElementById('discordMessage') as HTMLTextAreaElement
  if (textarea) {
    textarea.value = generatedMessage.value
  }

  // Copy to clipboard
  navigator.clipboard.writeText(textarea.value)
}
