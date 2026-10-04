# Solidus botas

Vienas botas: `Bot/solidus`.

`solidus2 bot` nebe paleidžiamas. Jo funkcijos (tiketai, slap, entrance kortelė, parukom) gyvena čia ir valdomos iš svetainės panelės (`/panel`), kai botas veikia.

```bash
cd Bot/solidus
cp .env.example .env
npm start
```

Panelės API: `http://127.0.0.1:3847`. Svetainė (`npm run dev` projekto šaknyje) proxy'ina `/api` į tą portą.

`GUILD_ID` turi būti serveris, į kurį kvieti botą, kad slash komandos atsirastų iš karto. Kvietimo nuoroda rodoma panelės pagrindiniame puslapyje, kai botas prisijungęs.

## Panelė su Discord prisijungimu

1. [Discord Developer Portal](https://discord.com/developers/applications) → tavo aplikacija:
   - **Bot** → Reset Token → į `.env` kaip `DISCORD_TOKEN`. Įjunk *Server Members Intent* ir *Message Content Intent*.
   - **OAuth2** → `Client ID` → `DISCORD_CLIENT_ID`, `Client Secret` → `DISCORD_CLIENT_SECRET`.
   - **OAuth2 → Redirects**: `http://localhost:5173/api/auth/callback` ir `https://solidus.bot/api/auth/callback`.
2. `npm start` (botas + API ant `:3847`), projekto šaknyje `npm run dev`, atidaryk `/panel`.

## Produkcija (solidus.bot)

Du konteineriai:

- **Svetainė** (šaknies `Dockerfile`, nginx :8080). Env: `BOT_API_URL=http://<boto-adresas>:3847` – nginx `/api/*` persiunčia botui, todėl cookie lieka tame pačiame domene.
- **Botas** (`Bot/solidus/Dockerfile`, :3847). Env: tokenas, client id/secret, `PANEL_URL=https://solidus.bot`, `PANEL_API_HOST=0.0.0.0`. Prijunk nuolatinį diską prie `/app/data` – ten DB ir panelės nustatymai.

Prisijungimo sesijos laikomos atmintyje: perkrovus botą reikia prisijungti iš naujo.
