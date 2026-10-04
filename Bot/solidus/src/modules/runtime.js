/** @type {import('discord.js').Client | null} */
let client = null;

export function setBotClient(next) {
  client = next;
}

export function getBotClient() {
  return client;
}

export function botStatusPayload() {
  const user = client?.user;
  const online = Boolean(user);
  const inviteUrl = user
    ? `https://discord.com/api/oauth2/authorize?client_id=${user.id}&permissions=8&scope=bot%20applications.commands`
    : null;
  return {
    online,
    username: user?.username ?? null,
    tag: user?.tag ?? null,
    inviteUrl,
  };
}
