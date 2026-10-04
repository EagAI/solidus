export const EMBED_COLOR = 0x5865f2;
/** #f26522 — leaderboard, lygis, patvirtinimas */
export const THEME_ACCENT_COLOR = 0xf26522;

export const CUSTOM_ID = {
  VERIFY_NARYS: 'verify_narys',
  PARUKOM_PREFIX: 'parukom:',
};

/** /parukom — default XP jei .env nėra RUKALIAI_GIVEN_XP */
export const RUKALIAI_GIVEN_XP_DEFAULT = 35;
export const PARUKOM_DURATION_MS = 10 * 60 * 1000;
export const RUKALIAI_ROLE_ID_DEFAULT = '1548120206466093188';

/** Boto custom emoji bullet point'ams patvirtinimo žinutėje. */
export const VERIFY_BULLET_EMOJI_ID = '1520817044059328542';
export const VERIFY_BULLET_EMOJI_NAME = 'bulletpoint';
export const VERIFY_BULLET_EMOJI_ANIMATED = true;

/** Patvirtinimo mygtuko emoji. */
export const VERIFY_CHECK_EMOJI_ID = '1520820944040497332';
export const VERIFY_CHECK_EMOJI_NAME = 'checkmark';
export const VERIFY_CHECK_EMOJI_ANIMATED = true;

export const YOUTUBE_POLL_MS_DEFAULT = 120_000;

export const TIKTOK_LIVE_URL = 'https://www.tiktok.com/@kampainis1/live';

/** Atsitiktinis YouTube skelbimo tekstas (content virš embed). */
export const YOUTUBE_ANNOUNCE_MESSAGES = [
  '🔴 Pradejau live! Uzeik, bus veiksmo.',
  '🔴 Pakuriau kontenta, laikas susirinkt!',
  '🔴 Live jau eina - junkis prie chebros.',
  '🔴 Transliacija paleista, ateik paziuret kas vyksta.',
  '🔴 Kontentas jau verda - nepraleisk live!',
];

/** YouTube kanalo @handle → UC id (tik paleidimo metu, jei .env nėra UC…). */
export const YT_FETCH_HEADERS = {
  'User-Agent':
    'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/122.0.0.0 Safari/537.36',
};

export const YOUTUBE_RSS_START_DELAY_MS = 10_000;

export const HUB_CHANNEL_NAME = '➕ Sukurti kanalą';

export const VC_LOCK = 'vc_lock';
export const VC_UNLOCK = 'vc_unlock';

export const XP_BASE = 100;
export const XP_MULTIPLIER = 1.3;
export const XP_PER_MESSAGE_DEFAULT = 15;
export const XP_COOLDOWN_MS_DEFAULT = 5000;
export const LEVEL_MILESTONE = 5;

/** Lygio rolės — Discord role ID. */
export const LEVEL_ROLE_TIERS = [
  { level: 5, name: 'Trikampis', roleId: '1520790458370887802' },
  { level: 10, name: 'Keturkampis', roleId: '1520790696217411644' },
  { level: 15, name: 'Penkiakampis', roleId: '1520790725531402342' },
  { level: 20, name: 'Šešiakampis', roleId: '1520790754333823136' },
  { level: 25, name: 'Septynkampis', roleId: '1520790782099849327' },
  { level: 30, name: 'Aštuonkampis', roleId: '1520790809069228164' },
  { level: 35, name: 'Devynkampis', roleId: '1520790849837858906' },
  { level: 40, name: 'Dešimtkampis', roleId: '1520790883853795479' },
  { level: 45, name: 'Daugiakampis', roleId: '1520790904166809660' },
  { level: 50, name: 'Tobulas Daugiakampis', roleId: '1520790923448025161' },
];
