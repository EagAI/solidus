import { config } from '../config.js';

export const SIGNALS = [
  { pattern: /activate\s+code\s+for\s+bonus/i, weight: 3, label: 'Premijos kodo aktyvavimas' },
  { pattern: /promo\s*code/i, weight: 2, label: 'Promo kodo paminėjimas' },
  { pattern: /enter\s+(the\s+)?(promo|bonus|referral)\s+code/i, weight: 3, label: 'Instrukcija įvesti kodą' },
  { pattern: /exclusive\s+reward/i, weight: 2, label: 'Ekskluzyvus prizas' },
  { pattern: /giving\s+away\s+\$[\d,]+/i, weight: 3, label: 'Pinigų dalijimo skelbimas' },
  { pattern: /i\s+am\s+giving\s+away/i, weight: 3, label: 'Dalijimosi skelbimas' },
  { pattern: /receive\s+your\s+\$[\d,]+\s+bonus/i, weight: 3, label: 'Netikras premijos gavimas' },
  { pattern: /\$[\d,]+\s+to\s+everyone\s+who\s+registers/i, weight: 4, label: 'Masinis mokėjimas už registraciją' },
  { pattern: /withdrawal\s+successful/i, weight: 3, label: 'Netikras išmokėjimo ekranas' },
  { pattern: /withdraw\s+the\s+bonus\s+immediately/i, weight: 4, label: 'Skubus išmokėjimo raginimas' },
  { pattern: /receive\s+usdt/i, weight: 3, label: 'USDT gavimo teiginys' },
  { pattern: /\busdt\b/i, weight: 1, label: 'USDT paminėjimas' },
  { pattern: /\bbtc\s+wallet\b/i, weight: 2, label: 'BTC piniginės paminėjimas' },
  { pattern: /\bcrypto\s+casino\b/i, weight: 3, label: 'Kripto kazino paminėjimas' },
  { pattern: /cryptocurrency\s+casino/i, weight: 3, label: 'Kriptovaliutų kazino paminėjimas' },
  { pattern: /this\s+post\s+will\s+be\s+deleted/i, weight: 3, label: 'Skubumas: postas bus ištrintas' },
  { pattern: /offer\s+is\s+limited/i, weight: 2, label: 'Riboto pasiūlymo spaudimas' },
  { pattern: /only\s+the\s+fastest\s+people/i, weight: 3, label: 'Greičio spaudimo taktika' },
  { pattern: /promotion\s+will\s+last\s+for\s+several\s+days/i, weight: 2, label: 'Trumpa akcijos trukmė' },
  { pattern: /https?:\/\/[^\s]*\.(at|ru|cn|tk|ml|ga|cf|gq)[\s/]/i, weight: 2, label: 'Įtartinas domenas nuorodoje' },
  { pattern: /go\s+to\s*:\s*https?/i, weight: 2, label: 'Nukreipimo instrukcija' },
  { pattern: /balance[\s:]+\$?[\d,]+(\.\d{2})?/i, weight: 1, label: 'Balanso rodymas' },
  { pattern: /bonus\s+balance/i, weight: 2, label: 'Premijos balansas' },
  { pattern: /vip.?club/i, weight: 1, label: 'VIP klubo paminėjimas' },
  { pattern: /click\s+(here|the\s+link)\s+to\s+(claim|receive|collect)/i, weight: 3, label: 'Spustelėk ir gauk nuorodą' },
  { pattern: /launch\s+of\s+my\s+own\s+.{0,20}\s+casino/i, weight: 4, label: 'Asmeninio kazino paleidimo teiginys' },
];

function normalise(text) {
  return text.toLowerCase().replace(/\s+/g, ' ').trim();
}

/**
 * @param {string} text
 */
export function scoreText(text) {
  const threshold = config.scamScoreThreshold;
  if (!text || !text.trim()) return { score: 0, reasons: [], triggered: false };

  const norm = normalise(text);
  let score = 0;
  const reasons = [];

  for (const signal of SIGNALS) {
    if (signal.pattern.test(norm)) {
      score += signal.weight;
      if (!reasons.includes(signal.label)) reasons.push(signal.label);
    }
  }

  return {
    score,
    reasons: reasons.slice(0, 6),
    triggered: score >= threshold,
  };
}
