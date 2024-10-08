import type { ApiKey } from '@olivr-nxt/database';
import { type Context as HonoContext, Hono } from 'hono';
import { getCookie } from 'hono/cookie';
import { cors } from 'hono/cors';
import { OliverBot } from '~/client';
import { getOrSet, rKey } from '~/client/database';
import { env } from '~/env';
import { validateApiKey } from '~/services/keys';
import { getSession, getUserInfo, validateSession } from '~/services/session';

type KeyContext = {
  isValid: true;
  key: ApiKey;
} | {
  isValid: false;
  key: null;
};

type Env = {
  Variables: {
    client: OliverBot;
    session: Awaited<ReturnType<typeof getSession>> | null;
    user: Awaited<ReturnType<typeof getUserInfo>> | null;
    key: KeyContext;
  };
};

export type Context = HonoContext<Env>;

export const useKey = async (c: Context, next: () => Promise<void>) => {
  const session = c.get('session');
  if (session?.id) return await next();

  const apiKeyString = c.req.header('x-api-key');

  if (typeof apiKeyString === 'string') {
    const result = await validateApiKey(apiKeyString);

    if (!result.isValid || !result.key) {
      return c.json({ error: 'Invalid API key.' }, 401);
    }

    const redisKey = rKey('key', result.key.id, 'rate-limit');
    const defaultRateLimit = result.key.rateLimit ?? 60;
    const keyRateLimit = await getOrSet(redisKey, { uses: 0, startedAt: new Date() }, defaultRateLimit);

    const remainingUses = result.key.usesPerRateLimit - keyRateLimit.uses;
    const rateLimitReset = keyRateLimit.startedAt.getTime() + defaultRateLimit * 1000;

    c.res.headers.set('x-rate-limit-remaining', String(remainingUses));
    c.res.headers.set('x-rate-limit-reset', String(rateLimitReset));
    c.res.headers.set('x-rate-limit-limit', String(result.key.usesPerRateLimit));

    if (keyRateLimit.uses >= result.key.usesPerRateLimit) {
      return c.json({ error: 'Rate limit exceeded.' }, 429);
    }

    c.set('key', { isValid: true, key: result.key });
    return await next();
  }

  c.set('key', { isValid: false, key: null });
  return c.json({ error: 'Missing API key or session token.' }, 401);
};

export const useSession = async (c: Context, next: () => Promise<void>) => {
  const client = c.get('client');
  const possiblyEncrpytedToken = getCookie(c, 'x-session-token') ?? c.req.header('x-session-token');
  
  if (possiblyEncrpytedToken) {
    const isEncrypted = client.encoding.isEncrypted(possiblyEncrpytedToken);
    const sessionToken = isEncrypted ? client.encoding.decrypt(possiblyEncrpytedToken) : possiblyEncrpytedToken;
    const session = await validateSession(c, sessionToken);
    if (session.isValid) {
      c.set('session', session.session);
      return await next();
    }
  }
  
  c.set('session', null);
  return await next();
}

export const useUser = async (c: Context, next: () => Promise<void>) => {
  const session = c.get('session');
  if (session) {
    const user = await getUserInfo(session.accessToken);
    c.set('user', user);
  }

  return await next();
};

export const createFactory = (): Hono<Env> => {
  const app = new Hono<Env>();

  app.use(cors({
    origin: env.DASHBOARD_URL,
    credentials: true,
  }));
  app.use((c, next) => {
    c.set('client', OliverBot.getInstance());
    return next();
  });

  app.use(useSession);
  app.use(useUser);

  return app;
};