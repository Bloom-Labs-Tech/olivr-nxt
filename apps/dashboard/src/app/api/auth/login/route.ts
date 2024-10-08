import { env } from "~/env";

export async function GET() {
  const url = new URL('/auth/login', env.API_URL);
  
  return Response.redirect(url.toString());
}