import create from 'zustand';

type Page = 'INIT' | 'PROMPT' | 'ANALYZE_ONE' | 'INPUT_SECOND' | 'COMPARE_TWO' | 'FATAL';
type Mode = 'ANALYZE_ONE' | 'COMPARE_TWO';

type GlobalStateHandler = {
  page: Page;
  gotoPage(newPage: Page): void;

  pageDone: boolean;
  setPageDone(): void;

  mode?: Mode;
  setMode(newMode: Mode | undefined): void;
};

const useGlobalStateStore = create<GlobalStateHandler>(set => ({
  page: 'INIT',
  gotoPage: newPage => set(state => ({ ...state, page: newPage, pageDone: false })),

  pageDone: false,
  setPageDone: () => set(state => ({ ...state, pageDone: true })),

  mode: undefined,
  setMode: newMode => set(state => ({ ...state, mode: newMode })),
}));

export default useGlobalStateStore;
