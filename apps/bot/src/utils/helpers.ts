import { readdir, stat } from 'node:fs/promises';
import { join } from 'node:path';

export async function getFiles(dir: string, fileList: string[] = []): Promise<string[]> {
  const files = await readdir(dir);

  await Promise.all(
    files.map(async (file) => {
      const filePath = join(dir, file);
      const fileStat = await stat(filePath);

      if (fileStat.isDirectory()) {
        await getFiles(filePath, fileList);
      } else if (file.endsWith('.ts')) {
        fileList.push(filePath.replace(/\\/g, '/'));
      }
    }),
  );

  return fileList;
}

export function formatEmoji(emoji?: { name: string; id: string; animated: boolean }) {
  if (!emoji) return '❔';
  return `<${emoji.animated ? 'a' : ''}:${emoji.name}:${emoji.id}>`;
}