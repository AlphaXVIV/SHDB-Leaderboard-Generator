<template>
  <header class="flex align-center justify-center mb-2.5">
    <h1 class="text-3xl font-bold">Senseihood Database Leaderboard Generator</h1>
  </header>

  <main class="flex flex-col gap-5">

    <transition enter-active-class="transition ease-out duration-100" enter-from-class="opacity-0 translate-y-2"
      enter-to-class="opacity-100 translate-y-0" leave-active-class="transition ease-in duration-100"
      leave-from-class="opacity-100 translate-y-0" leave-to-class="opacity-0 translate-y-2">
      <div v-if="feedback" class="absolute top-8 left-1/2 -translate-x-1/2 z-50 alert"
        :class="feedback.type === 'success' ? 'alert-success' : 'alert-error'">
        <span>{{ feedback.message }}</span>
      </div>
    </transition>

    <div class="text-center">
      Make sure you fill the form below first
    </div>

    <div class="grid grid-cols-5 gap-2.5">
      <label class="input" for="club">
        <span class="label">Club #</span>
        <input type="number" name="club" id="club" v-model="club" value="1" min="1" max="11" required>
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
      <!-- <button class="btn h-full">Paste</button>
      <button class="btn h-full">Generate Images (Coming Soon)</button> -->
      <button @click="bGenerateMessage" class="btn h-full">Generate Discord Message<br>(will also sort before
        generating)</button>
      <!-- <button @click="bCsvCache" class="btn h-full">Cache CSV</button>
      <button @click="bFillForm" class="btn h-full">Fill Form from Cache</button> -->
      <button @click="bFetch" class="btn h-full">Fetch</button>
      <!-- <button @click="bClearForm" class="btn h-full">Clear Form</button>
      <button @click="bClearCache" class="btn h-full">Clear Cache</button> -->
      <button @click="bClearBoth" class="btn h-full">Clear</button>
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
              <th @click="sortRank(lbFormEntries)" class="">Rank<br>(click to sort)</th>
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

  <footer class="footer footer-center footer-horizontal p-4">415alpha for Senseihood. v0.2.0a</footer>
</template>

<script lang="ts" setup>

// OH DEAR GOD THIS IS A MESS

import { ref } from "vue";

import type { Entries, ProtoLeaderboard } from "./components/types";
import { raidBossList } from "./components/consts";

import { useClipboard } from "./composables/pasteHandler";
import { sortRank, generateMessage } from "./composables/buttonFunctions";
import { csvFetch } from "./composables/csvFetch";
// import MarkdownRenderer from "./components/MarkdownRenderer.vue";

// ==================
// Reactive variables
// ==================

const lbFormEntries = ref<Entries[]>([]);
// const rawPaste = ref("");
// const jsonPaste = ref("");
const generatedMessage = ref<string>("");
const club = ref<number>(1);
const raidType = ref<string>("TA");
const season = ref<number>(1);
const raidBoss = ref<string>("");
const environment = ref<string>("");

// Feedback for dialog box
const feedback = ref<{ type: string, message: string | unknown } | null>(null)

// Initialize functions
// useClipboard(lbFormEntries)

/**
 * Function wrapper for generateMessage button
 */
function bGenerateMessage(): void {
  generateMessage(lbFormEntries, generatedMessage, club, raidType, season, raidBoss, environment)
}

/**
 * Function wrapper for csvCache button; This only caches the fetched and processed CSV and puts it into storage.
 */
async function bCsvCache(): Promise<void> {
  try {
    // Try if the fetch is successful in the first place
    const protoLeaderboard = await csvFetch(raidType, season)

    // Clear cache if successful
    localStorage.clear()

    // Set cache to a "prototype Leaderboard"
    localStorage.setItem("protoLeaderboard", JSON.stringify(protoLeaderboard))

    // Further checks if it got something, as well as popping up alert boxes
    const cProtoLeaderboard = localStorage.getItem("protoLeaderboard")
    if (cProtoLeaderboard) {
      const oProtoLeaderboard = JSON.parse(cProtoLeaderboard)
      console.log("If this works, here's a slice: ", oProtoLeaderboard.slice(1, 10))
      feedback.value = { type: "success", message: "CSV fetch successfully cached!" }
    }

    // this is probably redundant lool
    else {
      console.log("Cache missing!")
      feedback.value = { type: "error", message: "Cache missing!" }
    }
  }
  catch (err) {
    console.log(err)
    feedback.value = { type: "error", message: err }
  }

  setTimeout(() => (feedback.value = null), 3000)
}

/**
 * Function wrapper for csvCache button; This only caches the fetched and processed CSV and puts it into storage.
 */
async function bFillForm(): Promise<void> {
  const cProtoLeaderboard = localStorage.getItem("protoLeaderboard")

  if (!cProtoLeaderboard) {
    feedback.value = { type: "error", message: "Cache missing! Fetch CSV first" }
    return
  }

  // This also shouldn't happen unless you erase the club form
  if (!club.value) {
    feedback.value = { type: "error", message: "Club is undefined! Define Club No. first" }
    return
  }

  const oProtoLeaderboard: ProtoLeaderboard[] = JSON.parse(cProtoLeaderboard)
  const clubLeaderboard = oProtoLeaderboard.filter(entry => entry.club === club.value)

  lbFormEntries.value = clubLeaderboard.map((entry) => {
    return {
      friend_code: entry.friend_code || '',
      name: entry.name || '',
      rank: entry.rank || 99999,
      student_rep: '', // Currently unavailable
      is_new: false, // currently unavailable
    }
  })
}


/**
 * Function wrapper for bFetch button; This does both bCsvCache and bFillForm
 */
async function bFetch(): Promise<void> {

  // Does everything bCsvCache already does
  // There is a bit of a funny where the cached results aren't deleted and it still generates the form, whatever it's funnier that way
  await bCsvCache()

  const cProtoLeaderboard = localStorage.getItem("protoLeaderboard")

  // This shouldn't happen because bCsvCache will cancel everything if it fails to run
  if (!cProtoLeaderboard) {
    feedback.value = { type: "error", message: "Cache missing! Fetch CSV first" }
    return
  }

  // This also shouldn't happen unless you erase the club form
  if (!club.value) {
    feedback.value = { type: "error", message: "Club is undefined! Define Club No. first" }
    return
  }

  const oProtoLeaderboard: ProtoLeaderboard[] = JSON.parse(cProtoLeaderboard)
  const clubLeaderboard = oProtoLeaderboard.filter(entry => entry.club === club.value)
  console.log("DEBUG FILTERED ClubLB:", clubLeaderboard)

  lbFormEntries.value = clubLeaderboard.map((entry) => {
    return {
      friend_code: entry.friend_code || '',
      name: entry.name || '',
      rank: entry.rank || 99999,
      student_rep: '', // Currently unavailable
      is_new: false, // currently unavailable
    }
  })

  setTimeout(() => (feedback.value = null), 3000)
}


// futureproofing
// function submitForm() {
//   console.log("Submitting:", lbFormEntries.value);
// }

/**
 * Clears form
 */
function bClearForm() {
  lbFormEntries.value = [];
  generatedMessage.value = "";
  club.value = 1;
  raidType.value = "TA";
  season.value = 1;
  raidBoss.value = "";
  environment.value = "";
}

/**
 * Clears cache on-demand
 */
function bClearCache() {
  localStorage.clear()
  if (localStorage.length === 0) { feedback.value = { type: 'success', message: 'Cache cleared!' } }
  setTimeout(() => (feedback.value = null), 3000)
}

/**
 * Clears both cache and form
 */
function bClearBoth() {
  bClearForm()
  bClearCache()
}


/**
 * Simple function to copy to clipboard
 */
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

</script>
