import type { ClubClass } from "./types";

// Club role IDs for role tags in Discord
export const clubMetadata = new Map<number, { name: string; roleID: string; class: ClubClass }>([
  [1, { name: "Headquarters", roleID: "1006513071189143613", class: "Competitive" }],
  [2, { name: "Millennium", roleID: "1006513084204064778", class: "Competitive" }],
  [3, { name: "Trinity", roleID: "1026354983848902707", class: "Competitive" }],
  [4, { name: "Gehenna", roleID: "1071348729736613908", class: "Competitive" }],
  [5, { name: "Hyakkiyako", roleID: "1084796980280184944", class: "Semi-Competitive" }],
  [6, { name: "Abydos", roleID: "1099342326075236473", class: "Semi-Competitive" }],
  [7, { name: "RedWinter", roleID: "1124962519899967558", class: "Semi-Competitive" }],
  [8, { name: "SRT", roleID: "1124962583946997791", class: "Semi-Competitive" }],
  [9, { name: "Shanhaijing", roleID: "1158052131111178320", class: "Casual" }],
  [10, { name: "Valkyrie", roleID: "1190063734324994179", class: "Casual" }],
  [11, { name: "Highlander", roleID: "1217822204683620483", class: "Newbie" }],
]);

// Club class thresholds
export const clubThresholds = new Map<ClubClass, number>([
  ["Competitive", 7500],
  ["Semi-Competitive", 12500],
  ["Casual", 25000],
  ["Newbie", 0],
]);

// Raid bosses
export const raidBossList: { [key: string]: string } = {
    "binah": "Binah",
    "chesed": "Chesed",
    "shiro_kuro": "Shiro & Kuro",
    "hieronymus": "Hieronymus",
    "kaiten": "KAITEN FX Mk. 0",
    "perorodzilla": "Perorodzilla",
    "hod": "Hod",
    "goz": "Goz",
    "gregorius": "Gregorius",
    "wakamo_hovercraft": "Wakamo Hovercraft",
    "kurokage": "Kurokage",
    "geburah": "Geburah",
    "yesod": "Yesod"
}