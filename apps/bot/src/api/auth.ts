import { generateRandomString } from "@olivr-nxt/common";
import { deleteCookie, getCookie, setCookie } from "hono/cookie";
import { env } from "~/env";
import { createSession, deleteSession, exchangeCode, generateOAuthLoginUrl, getUserInfo } from "~/services/session";
import { type Context, createFactory } from "~/utils/api";

const app = createFactory();

async function handleSignout(c: Context) {
  const session = c.get("session");
  if (session) deleteSession(c, session.token);
  return true;
}

app.get("/login", async (c) => {
  const client = c.get('client');
  await handleSignout(c);
  const returnTo = c.req.query('callback') ?? '/';
  const state = generateRandomString(24);

  setCookie(c, 'state', state, { httpOnly: true });
  setCookie(c, 'returnTo', returnTo, { httpOnly: true });

  return c.redirect(generateOAuthLoginUrl(state, 'login'));
});

app.get("/invite", async (c) => {
  const guildId = c.req.query('guildId');
  const state = generateRandomString(24);
  setCookie(c, 'state', state, { httpOnly: true });
  if (guildId) setCookie(c, 'returnTo', `/g/${guildId}`, { httpOnly: true });
  return c.redirect(generateOAuthLoginUrl(state, 'invite', guildId));
});

app.get("/callback", async (c) => {
  const client = c.get('client');
  const { code, state } = c.req.query();

  if (!code || !state) return c.redirect('/auth/login');

  const savedState = getCookie(c, 'state');
  if (state !== savedState) return c.redirect('/auth/login');

  try {
    const token = await exchangeCode(code);

    const user = await getUserInfo(token.access_token);
    if (!user.id) c.redirect('/auth/login');

    const session = await createSession({
      accessToken: token.access_token,
      expiresAt: new Date(Date.now() + token.expires_in * 1000),
      refreshToken: token.refresh_token,
      userId: user.id,
    });

    const encodedSession = client.encoding.encrypt(session.token);

    setCookie(c, 'x-session-token', encodedSession, { httpOnly: true });
    deleteCookie(c, 'state');

    const returnTo = getCookie(c, 'returnTo') ?? '/';
    const url = new URL(returnTo, env.DASHBOARD_URL);
    deleteCookie(c, 'returnTo');

    return c.redirect(url.toString());
  } catch (error) {
    client.logger.error('Error during OAuth2 exchange', error);
    return c.redirect('/auth/login');
  }
});

app.get("/session", async (c) => {
  const session = c.get('session');
  const user = c.get('user');
  if (!session || !user) return c.json(null);

  return c.json({
    id: session.id,
    expiresAt: session.expiresAt,
    user: {
      id: user.id,
      username: user.username,
      role: session.user.role,
      avatar: `https://cdn.discordapp.com/avatars/${user.id}/${user.avatar}.${user.avatar.startsWith('a_') ? 'gif' : 'png'}`,
      banner: user.banner ? `https://cdn.discordapp.com/banners/${user.id}/${user.banner}.${user.banner.startsWith('a_') ? 'gif' : 'png'}` : null,
      bannerColor: user.banner_color,
    }
  });
});

app.all("/signout", async (c) => {
  await handleSignout(c);
  return c.json({ success: true });
});

export default app;