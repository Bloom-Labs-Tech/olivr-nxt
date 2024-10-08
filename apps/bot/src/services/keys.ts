import { generateApiKey, generateId, validateApiKey as vApiKey } from '@olivr-nxt/common';
import { apiKeySchema } from '@olivr-nxt/common/schemas';
import type { ApiKey } from '@olivr-nxt/database';
import type { z } from 'zod';
import { db } from '~/client/database';

export async function createApiKey(props: Omit<z.infer<typeof apiKeySchema>, 'key | id | uses | createdAt'>): Promise<ApiKey> {
  const apiKey = generateApiKey();
  const data = apiKeySchema.omit({ key: true, id: true, uses: true, createdAt: true }).safeParse(props);

  if (!data.success) {
    throw new Error(data.error.errors.map((e) => e.message).join('\n'));
  }

  const newKey = await db.apiKey.create({
    data: {
      id: generateId('key'),
      key: apiKey,
      ...data.data,
    },
  }).catch(() => null);

  if (!newKey) {
    throw new Error('An error occurred while creating the API key.');
  }

  return newKey;
}

export async function deleteApiKey(id: string, userId: string): Promise<boolean> {
  const apiKey = await db.apiKey.findUnique({ where: { id, userId } });
  if (!apiKey) return false;

  const result = await db.apiKey.delete({ where: { id } }).then(() => true).catch(() => false);
  return result;
}

export async function getApiKey(id: string, userId: string): Promise<ApiKey | null> {
  return db.apiKey.findUnique({ where: { id, userId } });
}

export async function getApiKeys(userId: string): Promise<ApiKey[]> {
  return db.apiKey.findMany({ where: { userId } });
}

export async function updateApiKey(id: string, userId: string, data: Partial<Omit<z.infer<typeof apiKeySchema>, 'key | id'>>): Promise<ApiKey | null> {
  const apiKey = await db.apiKey.findUnique({ where: { id, userId } });
  if (!apiKey) throw new Error('API key not found.');

  const updatedKey = await db.apiKey.update({
    where: { id },
    data,
  }).catch(() => null);
  if (!updatedKey) throw new Error('An error occurred while updating the API key.');
  return updatedKey;
}

export async function validateApiKey(apiKey?: string): Promise<{ isValid: true; key: ApiKey } | { isValid: false; key: null }> {
  if (!apiKey) return { isValid: false, key: null };
  if (!vApiKey(apiKey)) return { isValid: false, key: null };
  
  return await db.$transaction(async (tx) => {
    const key = await tx.apiKey.findUnique({ where: { key: apiKey } });
    if (!key) return { isValid: false, key: null };

    await tx.apiKey.update({
      where: { key: apiKey },
      data: {
        uses: {
          increment: 1,
        },
        lastUsed: new Date(),
      },
    });

    return { isValid: true, key };
  });
}