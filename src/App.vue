<template>
  <header class="flex align-center justify-center mb-2.5">
    <h1 class="text-3xl font-bold">Senseihood Database Leaderboard Generator</h1>
  </header>

  <main class="flex flex-col gap-5">

    <div class="text-center">
      Copy the following cells from the
        <a href="https://docs.google.com/spreadsheets/d/1w4-dcMNSNgrxWkUFbgQMKyQfGq3FrceimEqAy-RbBXQ/edit?gid=715673586#gid=715673586" class="link link-info">Google Sheets database</a>
        <span class="font-bold"> in the same order</span> and simply paste anywhere in the page. <br>
      Alternatively, you can use the button to paste.<br>
      You can then make corrections in the generated table as needed.
    </div>

    <div class="grid grid-cols-5 gap-2.5">
      <label class="input" for="clubNumber">
        <span class="label">Club #</span>
        <input type="number" name="clubNumber" id="clubNumber" v-model="clubNumber" value="1" min="1" max="11" required>
      </label>

      <!-- <label for="raid">TA/GA: </label> -->
      <select class="select" name="raid" id="raid" v-model="raidType" required>
        <option disabled selected value="">TA/GA</option>
        <option value="TA">Total Assault</option>
        <option value="GA">Grand Assault</option>
      </select>

      <label class="input" for="season">
        <span class="label">Season</span>
        <input type="number" name="season" id="season" v-model="season" value="1" min="1" required>
      </label>


      <!-- <label for="raidBoss">Raid: </label> -->
      <select class="select" name="raidBoss" id="raidBoss" v-model="raidBoss" required>
        <option disabled selected value="">Raid</option>
        <option v-for="boss in raidBossList" :key="boss" :value="boss">{{ boss }}</option>
      </select>

      <!-- <label for="environment">Environment: </label> -->
      <select class="select" name="environment" id="environment" v-model="environment" required>
        <option disabled selected value="">Environment</option>
        <option value="Urban">Urban</option>
        <option value="Outdoor">Field (Outdoor)</option>
        <option value="Indoor">Indoor</option>
      </select>
    </div>

    <div class="flex justify-center gap-2.5 h-15">
      <button class="btn h-full">Paste</button>
      <button class="btn h-full">Generate Images (Coming Soon)</button>
      <button v-on:click="generateMessage" class="btn h-full">Generate Discord Message<br>(will also sort before
        generating)</button>
      <button v-on:click="clearForm" class="btn h-full">Clear</button>
    </div>

    <!-- Debug elements for copy-paste function -->
    <!-- <div>
      <textarea v-model="rawPaste" class="textarea w-full h-100" name="debugPaste" id="debugPaste"></textarea>
    </div>

    <div>
      <textarea v-model="jsonPaste" class="textarea w-full h-100" name="debugPaste" id="debugPaste"></textarea>
    </div> -->

    <div>
      <form>
        <table class="table table-pin-rows">
          <thead>
            <tr>
              <th class="">Friend ID</th>
              <th class="">Name</th>
              <th v-on:click="sortRank" class="">Rank<br>(click to sort)</th>
              <th class="">Student Rep<br>(optional, currently unused)</th>
              <th class="">New<br>member?</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="(entry, index) in lbFormEntries" :key="index">
              <td><input class="input" name="friend_code" id="friend_code" v-model="entry.friend_code" /></td>
              <td><input class="input" name="name" id="name" v-model="entry.name" /></td>
              <td><input class="input" name="rank" id="rank" v-model="entry.rank" /></td>
              <td><input class="input" name="student_rep" id="student_rep" v-model="entry.student_rep" /></td>
              <td class="text-center">
                <label class="block w-full h-full cursor-pointer">
                  <input name="is_new" id="is_new" type="checkbox" class="checkbox" v-model="entry.is_new" />
                </label>
              </td>
            </tr>
          </tbody>
        </table>
      </form>
    </div>

    <div class="grid grid-cols-1 gap-5">
      <div class="flex flex-col gap-2.5">
        <span class="">Discord Text Output</span>
        <textarea @click="copyToClipboard" class="textarea w-full h-100" readonly name="discordMessage"
          id="discordMessage"></textarea>
      </div>

      <!-- WIP: Expected Formatted Discord Message Output (requires a bunch of style tweaking) -->
      <!-- <div class="flex flex-col">
        <span class="">Expected Formatted Discord Message Output</span>
        <MarkdownRenderer :content="generatedMessage"/>
      </div> -->
    </div>

  </main>
</template>

<script lang="ts" setup>

import { ref, onMounted, onBeforeUnmount } from "vue";
import type { Entries } from "./components/types";
import { clubMetadata, clubThresholds, raidBossList } from "./components/consts";
// import MarkdownRenderer from "./components/MarkdownRenderer.vue";

// ==================
// Reactive variables
// ==================

const lbFormEntries = ref<Entries[]>([]);
// const rawPaste = ref("");
// const jsonPaste = ref("");
const generatedMessage = ref<string>("");
const clubNumber = ref<number>();
const raidType = ref<string>("");
const season = ref<number>();
const raidBoss = ref<string>("");
const environment = ref<string>("");

// =============
// Paste handler
// =============
function handlePaste(e: ClipboardEvent) {
  e.preventDefault();

  // Get clipboard text
  const clipboardData = e.clipboardData;
  const clipboardPaste = clipboardData?.getData("text/plain") || "";

  // rawPaste.value = escapeWhitespace(clipboardPaste);

  // const textarea = document.getElementById("debugPaste") as HTMLTextAreaElement;
  // if (textarea) {
  //   textarea.value = clipboardData?.getData("text/plain") || "";
  // }

  // Split by rows (entries)
  // Google Sheets uses \n for new rows
  const rows = clipboardPaste?.trim().split("\n") || [];

  // Process each row
  lbFormEntries.value = rows.map(row => {

    // Google Sheets uses tab-delimited values
    const cols = row.split("\t");
    // Handle #N/A for rank
    if (cols[2] === "#N/A") { cols[2] = "-DNF-" }

    return {
      friend_code: cols[0] || "",
      name: cols[1] || "",
      rank: Number(cols[2]) || 99999,
      student_rep: cols[3] || "",
      is_new: !!(cols[4]?.trim())
    };
  });

  // jsonPaste.value = JSON.stringify(lbFormEntries.value, null, 2);
}

// futureproofing
// function submitForm() {
//   console.log("Submitting:", lbFormEntries.value);
// }

// Clear form button
function clearForm() {
  lbFormEntries.value = [];
  generatedMessage.value = "";
  clubNumber.value = 1;
  raidType.value = "";
  season.value = 1;
  raidBoss.value = "";
  environment.value = "";
}

// ================
// Sort rank button
// ================
function sortRank() {
  lbFormEntries.value.sort((a, b) => {
    if (a === null && b === null) return 0;
    if (a.rank === null) return 1;
    if (b.rank === null) return -1;

    return a.rank - b.rank;
  });
}

function splitTop5(leaderboard: Entries[]): [Entries[], Entries[]] {
  const top5 = leaderboard.slice(0, 5); // Top 5
  const minusTop5 = leaderboard.slice(5);  // Everyone else
  return [top5, minusTop5];
}

// ===============================
// Generate Discord message button
// ===============================
function generateMessage() {

  let message = "";
  let clubSelected = clubMetadata.get(clubNumber.value || 1);

  // Button will sort by rank "automatically" using an existing function
  // This may reflect the form order as well (this is intended)
  sortRank();

  // Slice the leaderboards into separate parts: Top 5, Platinum, Gold, Warning
  const [top5, minusTop5Lb] = splitTop5(lbFormEntries.value);
  const platinum = minusTop5Lb.filter((entry) => entry.rank !== null && entry.rank <= 10000)
  const gold = minusTop5Lb.filter((entry) => entry.rank !== null && entry.rank > 10000 && entry.rank <= clubThresholds.get(clubSelected!.class)!)
  const warning = minusTop5Lb.filter((entry) => entry.rank === null || entry.rank > clubThresholds.get(clubSelected!.class)!)

  // PENDING: Make a warning popup or some shit
  if (!clubSelected) {
    clubSelected = clubMetadata.get(1)!;
  }

  // Message Header - Club
  message += `# <@&${clubSelected.roleID}> Leaderboard\n`;

  // Message Header - Raid
  message += `## ${raidType.value} S${season.value} ${raidBoss.value} ${environment.value}\n`;

  // Platinum Rank (Top 10000)
  message += `### :1_: **Plat Trophy** :1_:\n`;
  top5.forEach(entry => {
    // Output: **`  415` 「SH」415a**
    message += `**\`${entry.rank.toString().padStart(5, " ")}\` ${entry.name}**`;
    if (entry.is_new) {
      message += ` :wave:`;
    }

    message += `\n`;
  });

  platinum.forEach(entry => {
    // Output: `  415` 「SH」415a
    message += `\`${entry.rank.toString().padStart(5, " ")}\` ${entry.name}`;
    if (entry.is_new) {
      message += ` :wave:`;
    }

    message += `\n`;
  });

  // Gold Rank (10000 - Threshold)
  // Does not pop up in Competitive
  if (gold.length > 0) {
    message += `### :2_: **Gold Trophy** :2_:\n`;
    gold.forEach(entry => {

      // Output: `10415` 「SH」415a
      message += `\`${entry.rank.toString().padStart(5, " ")}\` ${entry.name}`;
      if (entry.is_new) {
        message += ` :wave:`;
      }

      message += `\n`;
    });
  }

  // Danger Zone (Below Threshold)
  message += `### :rotating_light: **Warning** :rotating_light:\n`;
  warning.forEach(entry => {

    // Output: `99999` 「SH」415a
    message += `\`${entry.rank.toString().padStart(5, " ")}\` ${entry.name}`;

    message += `\n`;
  });

  // Set generated message
  generatedMessage.value = message;

  // Update textarea
  const textarea = document.getElementById("discordMessage") as HTMLTextAreaElement;
  if (textarea) {
    textarea.value = generatedMessage.value;
  }

  // Copy to clipboard
  navigator.clipboard.writeText(textarea.value)
}

// Clipboard copy function
const copyToClipboard = async (): Promise<void> => {
  try {
    await navigator.clipboard.writeText(generatedMessage.value)
    // copied.value = true

    // Reset feedback after 2 seconds
    // setTimeout(() => {
    //   copied.value = false
    // }, 2000)
  } catch (err) {
    // Type-safe error handling
    console.error('Failed to copy:', (err as Error).message)
  }
}
// Listeners
onMounted(() => {
  window.addEventListener("paste", handlePaste);
});

onBeforeUnmount(() => {
  window.removeEventListener("paste", handlePaste);
});

</script>
