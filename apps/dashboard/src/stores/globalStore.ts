import { create } from "zustand";


export type GlobalState = {
  width: number;
  height: number;
  scrollY: number;
  isMounted: boolean;
};

export type GlobalActions = {
  updateWindowSize: (width: number, height: number) => void;
  updateScrollY: (scrollY: number) => void;
  setMounted: (isMounted: boolean) => void;
};

export type WindowStore = GlobalState & GlobalActions;

export const defaultGlobalState: GlobalState = {
  width: 0,
  height: 0,
  scrollY: 0,
  isMounted: false,
};

export const createGlobalStore = (initState: GlobalState = defaultGlobalState) => {
  return create<WindowStore>((set) => ({
    ...initState,
    updateWindowSize: (width: number, height: number) => {
      set({ width, height, scrollY: window.scrollY });
    },
    updateScrollY: (scrollY: number) => {
      set({ width: window.innerWidth, height: window.innerHeight, scrollY });
    },
    setMounted: (isMounted: boolean) => {
      set({ isMounted });
    },
  }));
};