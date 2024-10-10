import { z } from "zod";

export class OliverError extends Error {
  constructor(message: string, public readonly code?: number) {
    super(message);
    this.name = this.constructor.name;
  }
}

export const validate = <T>(schema: z.ZodType<T>, data: unknown): T => {
  try {
    return schema.parse(data);
  } catch (error) {
    if (error instanceof z.ZodError) {
      throw new OliverError(error.errors.map((e) => e.message).join("\n"));
    }
    throw new OliverError("An error occurred while validating the data.");
  }
};

export const capitalize = (str: string) => str.charAt(0).toUpperCase() + str.slice(1).toLowerCase();
export const generateRandomString = (length = 10) => {
  let result = '';
  while (result.length < length) {
    result += Math.random().toString(36).slice(2);
  }
  return result.slice(0, length);
};

export const replaceText = (text: string, replacements: Record<string, string>) => {
  return text.replace(/{([^}]+)}/g, (match, key) => {
    return replacements[key] ?? match ?? "undefined";
  });
}

export const apiKeyRegex = /^olivr-[a-z0-9]{4}-[a-z0-9]{5}-[a-z0-9]{4}-[a-z0-9]{6}$/;
export const generateApiKey = (prefix = "olivr") => {
  return `${prefix}-${generateRandomString(4)}-${generateRandomString(5)}-${generateRandomString(4)}-${generateRandomString(6)}`;
}

export const validateApiKey = (apiKey: string) => apiKeyRegex.test(apiKey);

export const generateId = (prefix: string, length = 10) => `${prefix}-${generateRandomString(length)}`;
export const generateSessionToken = () => generateId("session", 64);

export const  getTimeBetweenDates = (date1: Date, date2: Date, unit: 's' | 'm' | 'h' | 'd' | 'w' | 'y') => {
  const diff = date2.getTime() - date1.getTime();
  const ms = {
    s: 1000,
    m: 1000 * 60,
    h: 1000 * 60 * 60,
    d: 1000 * 60 * 60 * 24,
    w: 1000 * 60 * 60 * 24 * 7,
    y: 1000 * 60 * 60 * 24 * 365,
  }[unit];

  return diff / ms;
}

export const coerceBoolean = z
  .enum(["true", "false"])
  .catch("false")
  .transform((value) => value === "true");

export const handleError = (error: unknown): { message: string, status: number } => {
  if (error instanceof z.ZodError) {
    return {
      message: error.errors.map((e) => e.message).join("\n"),
      status: 400,
    }
  }
  if (error instanceof OliverError) {
    return {
      message: error.message,
      status: error.code ?? 400,
    }
  }
  if (error instanceof Error) {
    return {
      message: error.message,
      status: 500,
    }
  }

  return {
    message: "An error occurred while processing the request.",
    status: 500,
  }
};

export const parseNumber = (value: string | undefined | null, defaultValue: number) => {
  const parsed = Number(value);
  return Number.isNaN(parsed) ? defaultValue : parsed;
}