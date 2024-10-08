import { cookies } from "next/headers";
import { env } from "~/env";

export async function GET() {
  const cookieStore = cookies();
  const sessionToken = cookieStore.get('x-session-token');
  if (!sessionToken?.value) return Response.json(null, { status: 401 });
  const url = new URL('/auth/session', env.API_URL);
  const response = await fetch(url.toString(), {
    method: 'GET',
    headers: {
      'x-session-token': sessionToken.value,
    },
  });

  if (response.ok) {
    const data = await response.json();
    if (data) return Response.json(data, { status: 200 });
  }

  cookieStore.delete('x-session-token');
  return Response.json(null, { status: 401 });
}