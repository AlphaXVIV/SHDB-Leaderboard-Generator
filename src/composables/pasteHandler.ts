import type { Entries } from '@/components/types'
import { onMounted, onBeforeUnmount } from 'vue'
import type { Ref } from 'vue'

/**
 * Initializer function to read clipboard from paste.
 * @param lbFormEntries Reactive variable for form entries
 */
export function useClipboard(lbFormEntries: Ref<Entries[]>) {
  function handlePaste(e: ClipboardEvent) {
    e.preventDefault()

    // Get clipboard text
    const clipboardPaste = e.clipboardData?.getData('text/plain') || ''

    // rawPaste.value = escapeWhitespace(clipboardPaste);

    // const textarea = document.getElementById("debugPaste") as HTMLTextAreaElement;
    // if (textarea) {
    //   textarea.value = clipboardData?.getData("text/plain") || "";
    // }

    // Split by rows (entries)
    // Google Sheets uses \n for new rows
    const rows = clipboardPaste?.trim().split('\n') || []

    lbFormEntries.value = rows.map((row) => {
      // Google Sheets uses tab-delimited values
      const cols = row.split('\t')
      // Handle #N/A for rank
      if (cols[2] === '#N/A') {
        cols[2] = '-DNF-'
      }

      return {
        friend_code: cols[0] || '',
        name: cols[1] || '',
        rank: Number(cols[2]) || 99999,
        student_rep: cols[3] || '',
        is_new: !!cols[4]?.trim(),
      }
    })
    // jsonPaste.value = JSON.stringify(lbFormEntriesEntries.value, null, 2);
  }

  onMounted(() => {
    window.addEventListener('paste', handlePaste)
  })

  onBeforeUnmount(() => {
    window.removeEventListener('paste', handlePaste)
  })
}
