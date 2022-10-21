import { writable } from "svelte/store";

type Page =
  | "INIT"
  | "PROMPT"
  | "ANALYZE_ONE"
  | "INPUT_SECOND"
  | "COMPARE_TWO"
  | "FATAL"

type Mode = "ANALYZE_ONE" | "COMPARE_TWO" | undefined;


interface GlobalState {
  page: Page,
  mode: Mode
}

function globalStateStore() {
  const { subscribe, set, update } = writable<GlobalState>({ page: 'INIT', mode: undefined});

  return {
    subscribe,
    gotoPage: (newPage: Page) => update(old => { return { ...old, page: newPage} }),
    init: () => set({ page: 'INIT', mode: undefined }),
  }
}

export const globalState = globalStateStore();
