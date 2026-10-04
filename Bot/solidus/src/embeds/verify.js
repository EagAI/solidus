import {
  ActionRowBuilder,
  ButtonBuilder,
  ButtonStyle,
  ContainerBuilder,
  MessageFlags,
  TextDisplayBuilder,
  formatEmoji,
} from 'discord.js';
import {
  THEME_ACCENT_COLOR,
  CUSTOM_ID,
  VERIFY_BULLET_EMOJI_ID,
  VERIFY_BULLET_EMOJI_NAME,
  VERIFY_BULLET_EMOJI_ANIMATED,
  VERIFY_CHECK_EMOJI_ID,
  VERIFY_CHECK_EMOJI_NAME,
  VERIFY_CHECK_EMOJI_ANIMATED,
} from '../constants.js';

const VERIFY_EMBED_TITLE = 'Serverio taisyklės';

const BULLET = formatEmoji({
  id: VERIFY_BULLET_EMOJI_ID,
  name: VERIFY_BULLET_EMOJI_NAME,
  animated: VERIFY_BULLET_EMOJI_ANIMATED,
});

/**
 * @param {string} title
 * @param {string[]} paragraphs
 */
function ruleBlock(title, paragraphs) {
  return [`${BULLET} **${title}**`, ...paragraphs].join('\n');
}

function buildVerifyBody() {
  const rules = [
    ruleBlock('Pagarba visiems nariams', [
      'Bendraukite mandagiai ir pagarbiai. Įžeidinėjimai, patyčios, žeminimas, diskriminacija ar sąmoningas kitų žmonių provokavimas nėra toleruojami.',
    ]),
    ruleBlock('Jokių konfliktų kurstymo', [
      'Draudžiama tyčia kiršinti žmones, skleisti apkalbas, burti grupeles prieš kitus narius ar kitaip kurstyti konfliktus. Asmeninius nesutarimus spręskite ramiai arba kreipkitės į administraciją.',
    ]),
    ruleBlock('Gerbkite merginas ir kitų žmonių ribas', [
      'Įkyrus kabinėjimasis, nepageidaujamas flirtas, seksualinio pobūdžio komentarai, spaudimas, užgauliojimas ar nuolatinis rašinėjimas nėra leidžiami. Tai galioja net tada, kai viskas pateikiama kaip juokas.',
      'Jeigu žmogus parodo ar pasako, kad jam nepatinka, prašo liautis arba neatsako – sustokite. „Aš tik juokavau“ nėra pasiteisinimas, jeigu kitam žmogui toks bendravimas nemalonus.',
    ]),
    ruleBlock('Taisyklės galioja ir privačiose žinutėse', [
      'Serverio narių persekiojimas, įkyrus rašinėjimas, kabinėjimasis, įžeidinėjimai ar grasinimai privačiose žinutėse taip pat gali būti vertinami kaip serverio taisyklių pažeidimas.',
      'Gavusi pagrįstą nusiskundimą ar įrodymus, administracija turi teisę imtis veiksmų, net jeigu pažeidimas įvyko ne viešame serverio kanale.',
    ]),
    ruleBlock('Grasinimai ir bauginimas – griežtai draudžiami', [
      'Bet kokie grasinimai, šantažas, bauginimas ar bandymas susidoroti su kitu žmogumi bus vertinami rimtai.',
    ]),
    ruleBlock('Gerbkite privatumą', [
      'Neviešinkite kitų žmonių asmeninės informacijos, nuotraukų, susirašinėjimų ar kitų privačių dalykų be jų leidimo.',
    ]),
    ruleBlock('Draudžiamas šlamštas ir reklama', [
      'Draudžiamas „spam“, „flood“, reklama bei kitų Discord serverių pakvietimų nuorodos be administracijos leidimo.',
    ]),
    ruleBlock('Jokių įtartinų nuorodų', [
      'Nesiųskite įtartinų nuorodų, apgavysčių, kenksmingų failų ar kito pavojingo turinio.',
    ]),
    ruleBlock('Klausykite administracijos', [
      'Laikykitės moderatorių ir administracijos nurodymų. Jeigu nesutinkate su priimtu sprendimu, aptarkite jį ramiai privačiai, o ne kurstykite konfliktą serveryje.',
    ]),
    ruleBlock('Praneškite apie pažeidimus', [
      'Jeigu jaučiatės nemaloniai, patiriate spaudimą, kabinėjimąsi, grasinimus ar matote netinkamą elgesį, kreipkitės į administraciją. Jei įmanoma, pridėkite ekrano nuotraukas. Apie situaciją pranešusio žmogaus privatumas bus saugomas.',
    ]),
  ].join('\n\n');

  const penalties = [
    'Atsižvelgiant į pažeidimo rimtumą ir pasikartojimą, gali būti skiriamas:',
    `${BULLET} įspėjimas;`,
    `${BULLET} laikinas žinučių ar balso kanalų apribojimas;`,
    `${BULLET} laikinas pašalinimas iš serverio;`,
    `${BULLET} nuolatinis užblokavimas.`,
    '',
    'Administracija pasilieka teisę už rimtą pažeidimą iš karto pašalinti narį be išankstinio įspėjimo.',
    '',
    'Pagrindinė taisyklė paprasta: elkitės taip, kad šioje bendruomenėje visi galėtų jaustis saugiai, jaukiai ir gerbiami.',
  ].join('\n');

  return [
    `## ${VERIFY_EMBED_TITLE}`,
    '',
    rules,
    '',
    '## Nuobaudos',
    '',
    penalties,
    '',
    'Paspausk **Sutinku**, kad patvirtintum, jog sutinki su taisyklėmis ir gautum prieigą prie viso serverio.',
    '',
    'Ačiū,',
    'Serverio administracija',
  ].join('\n');
}

function buildVerifyButton() {
  return new ButtonBuilder()
    .setCustomId(CUSTOM_ID.VERIFY_NARYS)
    .setLabel('Sutinku')
    .setEmoji({
      id: VERIFY_CHECK_EMOJI_ID,
      name: VERIFY_CHECK_EMOJI_NAME,
      animated: VERIFY_CHECK_EMOJI_ANIMATED,
    })
    .setStyle(ButtonStyle.Success);
}

/**
 * Discord Text Display limitas ~4000 simbolių — jei per ilgas, skaidome.
 * @param {string} body
 * @returns {string[]}
 */
function splitBodyChunks(body) {
  const MAX = 3900;
  if (body.length <= MAX) return [body];

  const chunks = [];
  let rest = body;
  while (rest.length > MAX) {
    let cut = rest.lastIndexOf('\n\n', MAX);
    if (cut < MAX * 0.5) cut = rest.lastIndexOf('\n', MAX);
    if (cut < MAX * 0.5) cut = MAX;
    chunks.push(rest.slice(0, cut).trimEnd());
    rest = rest.slice(cut).trimStart();
  }
  if (rest) chunks.push(rest);
  return chunks;
}

/** Container (embed-style) + custom emoji taisyklėse + Sutinku mygtukas. */
export function buildVerifyMessage() {
  const chunks = splitBodyChunks(buildVerifyBody());
  const container = new ContainerBuilder().setAccentColor(THEME_ACCENT_COLOR);

  for (const chunk of chunks) {
    container.addTextDisplayComponents(new TextDisplayBuilder().setContent(chunk));
  }

  container.addActionRowComponents(new ActionRowBuilder().addComponents(buildVerifyButton()));

  return {
    content: null,
    embeds: [],
    flags: MessageFlags.IsComponentsV2,
    components: [container],
  };
}

export { VERIFY_EMBED_TITLE };
