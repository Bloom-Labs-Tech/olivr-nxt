import { UserRole } from '@olivr-nxt/database';
import { createStore } from 'zustand/vanilla';
import { navigate } from '~/actions/common';
import { env } from '~/env';

type AuthSession = {
  id: string;
  expiresAt: string;
  user: {
    id: string;
    username: string;
    role: UserRole;
    avatar: string;
    banner: string | null;
    bannerColor: string;
  }
};

export type AuthState = {
  status: 'loading' | 'unauthenticated';
  session: null;
} | {
  status: 'authenticated';
  session: AuthSession;
}

export type AuthActions = {
  login: (callback?: string) => void;
  logout: () => void;
  invite: () => void;
}

export type AuthStore = AuthState & AuthActions;

export const defaultAuthState: AuthState = {
  status: 'loading',
  session: null,
}

export const createAuthStore = (
  initState: AuthState = defaultAuthState
) => {
  const state = createStore<AuthStore>((set) => ({
    ...initState,
    login: (returnTo?: string) => {
      const url = new URL(`${env.NEXT_PUBLIC_API_URL}/auth/login`);
      if (returnTo) {
        url.searchParams.append('callback', returnTo);
      }
      navigate(url.toString());
    },
    invite: () => {
      navigate('http://localhost:3001/auth/invite');
    },
    logout: () => fetch('http://localhost:3000/api/auth/signout').then(() => {
      set({ status: 'unauthenticated', session: null });
    }),
  }));

  fetch('http://localhost:3000/api/auth/session', {
    credentials: 'include',
  })
    .then((res) => res.json())
    .then((session) => {
      if (session?.id) {
        state.setState({ status: 'authenticated', session: session });
      } else {
        state.setState({ status: 'unauthenticated', session: null });
      }
    }).catch(() => {
      state.setState({ status: 'unauthenticated', session: null });
    });
  
  return state;
};
