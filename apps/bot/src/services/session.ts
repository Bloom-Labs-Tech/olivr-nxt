import { generateId, generateSessionToken } from '@olivr-nxt/common';
import type { Session } from '@olivr-nxt/database';
import { deleteCookie } from 'hono/cookie';
import { db } from '~/client/database';
import { env } from '~/env';
import type { Context } from '~/utils/api';

export function generateOAuthLoginUrl(state: string, type: 'invite' | 'login', guildId?: string) {
  const scopes = ['identify', 'guilds', 'email']; 
  if (type === 'invite') scopes.push('bot');
  const permissions = '581936125094001';
  const integrationType = '0';

  const url = new URL('https://discord.com/oauth2/authorize');
  url.searchParams.set('response_type', 'code');
  url.searchParams.set('client_id', env.DISCORD_CLIENT_ID);
  url.searchParams.set('redirect_uri', `${env.BASE_URL}/auth/callback`);
  url.searchParams.set('scope', scopes.join(' '));
  url.searchParams.set('state', state);
  if (type === "invite") {
    url.searchParams.set('permissions', permissions);
    url.searchParams.set('integration_type', integrationType);
    if (guildId) {
      url.searchParams.set('guild_id', guildId);
    }
  }

  return url.toString();
}

const API_ENDPOINT = 'https://discord.com/api/v10';
export async function exchangeCode(code: string): Promise<DiscordOAuth2AccessToken> {
  const data = new URLSearchParams({
    grant_type: 'authorization_code',
    code: code,
    redirect_uri: `${env.BASE_URL}/auth/callback`,
  });

  const headers = {
    'Content-Type': 'application/x-www-form-urlencoded',
    Authorization: `Basic ${Buffer.from(`${env.DISCORD_CLIENT_ID}:${env.DISCORD_CLIENT_SECRET}`).toString('base64')}`,
  };

  const response = await fetch(`${API_ENDPOINT}/oauth2/token`, {
    method: 'POST',
    headers: headers,
    body: data,
  }).catch(() => null);

  if (!response?.ok) {
    throw new Error(`HTTP error! status: ${response?.status ?? 'unknown'}`);
  }

  return (await response.json()) as DiscordOAuth2AccessToken;
}

export async function getUserInfo(accessToken: string): Promise<DiscordOAuth2UserInfo> {
  const response = await fetch(`${API_ENDPOINT}/users/@me`, {
    headers: {
      Authorization: `Bearer ${accessToken}`,
    },
  }).catch(() => null);

  if (!response?.ok) {
    throw new Error(`HTTP error! status: ${response?.status ?? 'unknown'}`);
  }

  return (await response.json()) as DiscordOAuth2UserInfo;
}

export async function refreshToken(refreshToken: string) {
  const data = new URLSearchParams({
    grant_type: 'refresh_token',
    refresh_token: refreshToken,
  });

  const headers = {
    'Content-Type': 'application/x-www-form-urlencoded',
    Authorization: `Basic ${Buffer.from(`${env.DISCORD_CLIENT_ID}:${env.DISCORD_CLIENT_SECRET}`).toString('base64')}`,
  };

  const response = await fetch(`${API_ENDPOINT}/oauth2/token`, {
    method: 'POST',
    headers: headers,
    body: data,
  }).catch(() => null);

  if (!response?.ok) {
    throw new Error(`HTTP error! status: ${response?.status ?? 'unknown'}`);
  }

  return (await response.json()) as DiscordOAuth2AccessToken;
}

export async function revokeToken(token: string) {
  const data = new URLSearchParams({
    token: token,
  });

  const headers = {
    'Content-Type': 'application/x-www-form-urlencoded',
    Authorization: `Basic ${Buffer.from(`${env.DISCORD_CLIENT_ID}:${env.DISCORD_CLIENT_SECRET}`).toString('base64')}`,
  };

  const response = await fetch(`${API_ENDPOINT}/oauth2/token/revoke`, {
    method: 'POST',
    headers: headers,
    body: data,
  }).catch(() => null);

  if (!response?.ok) {
    return false;
  }

  return true;
}

export async function createSession(props: Omit<Session, 'id' | 'token' | 'createdAt'>): Promise<Session> {
  const session = await db.session.create({
    data: {
      id: generateId('session'),
      token: generateSessionToken(),
      ...props
    },
  }).catch(() => null);

  if (!session) {
    throw new Error('An error occurred while creating the session.');
  }

  return session;
}

export async function getSession(token: string) {
  return db.session.findUnique({ where: { token }, include: { user: true } });
}

export async function deleteSession(c: Context, token: string): Promise<boolean> {
  deleteCookie(c, 'x-session-token');
  const session = await db.session.findUnique({ where: { token } });
  if (!session) return false;

  const result = await db.session.delete({ where: { token } }).then(() => true).catch(() => false);
  await revokeToken(session.accessToken).catch(() => null);

  return result;
}

export async function updateSession(token: string, data: Partial<Omit<Session, 'id' | 'token' | 'createdAt'>>): Promise<Session> {
  const session = await db.session.findUnique({ where: { token } });
  if (!session) throw new Error('Session not found.');

  const updatedSession = await db.session.update({
    where: { token },
    data,
  }).catch(() => null);
  if (!updatedSession) throw new Error('An error occurred while updating the session.');
  return updatedSession;
}

export async function validateSession(c: Context, token?: string): Promise<{ isValid: true; session: Awaited<ReturnType<typeof getSession>> } | { isValid: false; session: null }> {
  if (!token) return { isValid: false, session: null };

  const session = await db.session.findUnique({
    where: { token },
    include: { user: true },
  });
  if (!session) {
    await deleteSession(c, token);
    return { isValid: false, session: null };
  };

  if (session.expiresAt.getTime() < Date.now()) {
    const newSession = await refreshToken(session.refreshToken).catch(() => null);
    if (!newSession) {
      await deleteSession(c, token);
      return { isValid: false, session: null };
    }

    await updateSession(token, {
      accessToken: newSession.access_token,
      expiresAt: new Date(Date.now() + newSession.expires_in * 1000),
      refreshToken: newSession.refresh_token,
    });

    return await validateSession(c, token);
  }

  return { isValid: true, session };
}