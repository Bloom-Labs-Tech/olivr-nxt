import { cookies } from "next/headers";
import { env } from "~/env";

export async function GET() {
  const cookieStore = cookies();
  const sessionToken = cookieStore.get('x-session-token');
  if (!sessionToken?.value) return Response.json(null, { status: 401 });

  const url = new URL('/auth/signout', env.API_URL);
  const response = await fetch(url.toString(), {
    method: 'POST',
    headers: {
      'x-session-token': sessionToken.value,
    },
  });

  if (response.ok) {
    cookieStore.delete('x-session-token');
    return Response.json({
      success: true,
    }, { status: 200 });
  }

  return Response.json({
    success: false,
  }, { status: 401 });
}