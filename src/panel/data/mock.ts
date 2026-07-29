import {
  qaBroomIcon,
  qaGiftIcon,
  qaPlusIcon,
  qaRefreshIcon,
  qaSendIcon,
} from "../../assets";

export const DASH_STATS = [
  { id: "servers", label: "Serveriai", value: "24", delta: "+2 šią savaitę" },
  { id: "users", label: "Vartotojai", value: "1,248", delta: "+156 šią savaitę" },
  { id: "commands", label: "Komandos", value: "58", delta: "+5 pridėta" },
  { id: "uptime", label: "Uptime", value: "99.9%", delta: "Puikus veikimas" },
  { id: "ping", label: "Ping", value: "42ms", delta: "Puikus" },
] as const;

export const BOT_STATUS = {
  connected: true,
  label: "Prisijungęs",
  api: "Puikus",
  database: "Puikus",
  uptime: "15d 7h 42m",
  sparkline: [12, 18, 14, 22, 19, 28, 24, 30, 26, 32, 29, 35],
} as const;

export const ACTIVITY = [
  { id: "1", type: "join", text: "Naujas narys prisijungė prie serverio", time: "prieš 2 min", user: "nova#4421" },
  { id: "2", type: "command", text: "Naudota komanda /help", time: "prieš 5 min", user: "mira#1200" },
  { id: "3", type: "warn", text: "Išduotas įspėjimas nariui", time: "prieš 12 min", user: "mod_team" },
  { id: "4", type: "filter", text: "Filtras užblokavo žinutę", time: "prieš 18 min", user: "Solidus" },
  { id: "5", type: "command", text: "Naudota komanda /level", time: "prieš 24 min", user: "kai#88" },
  { id: "6", type: "join", text: "Naujas narys prisijungė prie serverio", time: "prieš 31 min", user: "lina#204" },
] as const;

export const POPULAR_COMMANDS = [
  { name: "/help", uses: 842, pct: 92 },
  { name: "/play", uses: 610, pct: 74 },
  { name: "/level", uses: 480, pct: 58 },
  { name: "/warn", uses: 310, pct: 38 },
  { name: "/shop", uses: 220, pct: 27 },
] as const;

export const SERVER_INFO = {
  name: "Solidus HQ",
  owner: "EagWasTaken",
  created: "2024-03-12",
  region: "Europe",
  userLimit: "Unlimited",
  members: 1248,
} as const;

export const RESOURCES = [
  { id: "cpu", label: "CPU", value: 18 },
  { id: "memory", label: "Memory", value: 42 },
  { id: "api", label: "API", value: 23 },
  { id: "database", label: "Database", value: 31 },
] as const;

export const QUICK_ACTIONS = [
  { id: "add-cmd", label: "Pridėti komandą", to: "/panel/komandos", icon: qaPlusIcon },
  { id: "giveaway", label: "Sukurti giveaway", to: "/panel/giveaway", icon: qaGiftIcon },
  { id: "message", label: "Siųsti žinutę", to: "/panel/nustatymai", icon: qaSendIcon },
  { id: "clear", label: "Išvalyti kanalą", to: "/panel/filtrai", icon: qaBroomIcon },
  { id: "refresh", label: "Atnaujinti nustatymus", to: "/panel/nustatymai", icon: qaRefreshIcon },
] as const;

export const INITIAL_COMMANDS = [
  { id: "help", name: "/help", description: "Pagalbos meniu", enabled: true, category: "Bendra" },
  { id: "play", name: "/play", description: "Paleisti muziką", enabled: true, category: "Muzika" },
  { id: "level", name: "/level", description: "Rodyti lygį", enabled: true, category: "Ekonomika" },
  { id: "warn", name: "/warn", description: "Įspėti narį", enabled: true, category: "Moderavimas" },
  { id: "shop", name: "/shop", description: "Atidaryti parduotuvę", enabled: false, category: "Ekonomika" },
  { id: "ticket", name: "/ticket", description: "Sukurti ticket", enabled: true, category: "Įrankiai" },
] as const;

export const INITIAL_AUTOMATION = [
  { id: "welcome", name: "Welcome žinutė", trigger: "narys prisijungia", enabled: true },
  { id: "autorole", name: "Auto-role", trigger: "narys prisijungia", enabled: true },
  { id: "goodbye", name: "Goodbye žinutė", trigger: "narys išeina", enabled: false },
  { id: "boost", name: "Boost padėka", trigger: "server boost", enabled: true },
] as const;

export const INITIAL_ROLES = [
  { id: "mod", name: "Moderator", members: 8, color: "#49aefe" },
  { id: "vip", name: "VIP", members: 42, color: "#b849ff" },
  { id: "member", name: "Narys", members: 1104, color: "#6b7280" },
  { id: "muted", name: "Muted", members: 3, color: "#ef4444" },
  { id: "lvl10", name: "Aktyvus", members: 210, color: "#22c55e" },
  { id: "lvl25", name: "Veteranas", members: 64, color: "#f59e0b" },
  { id: "lvl50", name: "Legenda", members: 12, color: "#ef4444" },
] as const;

export const INITIAL_LEVEL_MILESTONES = [
  {
    id: "m1",
    level: 5,
    roleId: "member",
    roleName: "Narys",
    rewardXp: 0,
    rewardCoins: 50,
    announce: true,
    removePrevious: false,
  },
  {
    id: "m2",
    level: 10,
    roleId: "lvl10",
    roleName: "Aktyvus",
    rewardXp: 0,
    rewardCoins: 150,
    announce: true,
    removePrevious: true,
  },
  {
    id: "m3",
    level: 25,
    roleId: "lvl25",
    roleName: "Veteranas",
    rewardXp: 0,
    rewardCoins: 500,
    announce: true,
    removePrevious: true,
  },
  {
    id: "m4",
    level: 50,
    roleId: "lvl50",
    roleName: "Legenda",
    rewardXp: 0,
    rewardCoins: 2000,
    announce: true,
    removePrevious: true,
  },
] as const;

export const INITIAL_LEADERBOARD = [
  { rank: 1, user: "kai#88", level: 42, xp: 18420 },
  { rank: 2, user: "mira#1200", level: 38, xp: 15200 },
  { rank: 3, user: "nova#4421", level: 31, xp: 12110 },
  { rank: 4, user: "lina#204", level: 27, xp: 9800 },
  { rank: 5, user: "EagWasTaken", level: 55, xp: 24100 },
] as const;

export const INITIAL_WARNINGS = [
  { id: "w1", user: "spam_bot#0001", reason: "Spam kanale #general", by: "mira#1200", date: "2026-07-28" },
  { id: "w2", user: "troll#99", reason: "Netinkama kalba", by: "EagWasTaken", date: "2026-07-27" },
  { id: "w3", user: "guest#12", reason: "Reklama DM", by: "mod_team", date: "2026-07-25" },
] as const;

export const INITIAL_FILTERS = [
  { id: "links", name: "Nuorodų filtras", enabled: true, hits: 128 },
  { id: "invites", name: "Discord invite blokavimas", enabled: true, hits: 64 },
  { id: "caps", name: "Caps lock limitas", enabled: false, hits: 12 },
  { id: "mentions", name: "Mention spam apsauga", enabled: true, hits: 31 },
] as const;

export const INITIAL_BLACKLIST = [
  { id: "b1", word: "badword1", addedBy: "EagWasTaken", date: "2026-06-01" },
  { id: "b2", word: "scam-link", addedBy: "mira#1200", date: "2026-06-14" },
  { id: "b3", word: "raid-term", addedBy: "mod_team", date: "2026-07-02" },
] as const;

export const INITIAL_LOGS = [
  { id: "l1", event: "MESSAGE_DELETE", channel: "#general", detail: "Žinutė ištrinta", time: "14:02" },
  { id: "l2", event: "MEMBER_BAN", channel: "—", detail: "Narys užblokuotas", time: "13:40" },
  { id: "l3", event: "ROLE_UPDATE", channel: "—", detail: "VIP role priskirta", time: "12:18" },
  { id: "l4", event: "COMMAND", channel: "#bot", detail: "/warn paleista", time: "11:55" },
] as const;

export const INITIAL_SHOP = [
  {
    id: "s1",
    name: "VIP 7 dienos",
    price: 500,
    stock: 20,
    rewardType: "role",
    roleId: "vip",
    roleName: "VIP",
    durationDays: 7,
    temporary: true,
    stackable: false,
    announce: true,
    description: "Laikina VIP rolė 7 dienoms",
  },
  {
    id: "s2",
    name: "Custom role",
    price: 1200,
    stock: 5,
    rewardType: "role",
    roleId: "vip",
    roleName: "VIP",
    durationDays: 0,
    temporary: false,
    stackable: false,
    announce: true,
    description: "Nuolatinė custom rolė",
  },
  {
    id: "s3",
    name: "XP boost x2",
    price: 300,
    stock: 50,
    rewardType: "xp_boost",
    roleId: "",
    roleName: "",
    durationDays: 1,
    temporary: true,
    stackable: true,
    announce: false,
    description: "2x XP 24 valandoms",
  },
] as const;

export const INITIAL_GIVEAWAYS = [
  { id: "g1", prize: "Nitro Classic", ends: "2026-08-01", entries: 214, active: true },
  { id: "g2", prize: "Solidus merch", ends: "2026-07-20", entries: 88, active: false },
] as const;

export const INITIAL_POLLS = [
  {
    id: "p1",
    question: "Koks kitas eventas?",
    channel: "#general",
    votes: 156,
    active: true,
    answers: ["Movie night", "Game tournament", "Q&A su savininku"],
  },
  {
    id: "p2",
    question: "Naujas kanalų layout?",
    channel: "#suggestions",
    votes: 72,
    active: false,
    answers: ["Taip", "Ne", "Vėliau"],
  },
] as const;

export const POLL_CHANNELS = [
  { value: "#general", label: "#general" },
  { value: "#announcements", label: "#announcements" },
  { value: "#suggestions", label: "#suggestions" },
  { value: "#polls", label: "#polls" },
  { value: "#bot", label: "#bot" },
] as const;

export const INITIAL_VOICE = [
  { id: "v1", name: "Lobby", users: 4, limit: 10 },
  { id: "v2", name: "Gaming", users: 7, limit: 12 },
  { id: "v3", name: "AFK", users: 1, limit: 0 },
] as const;
