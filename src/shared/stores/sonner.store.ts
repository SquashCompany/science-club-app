import { create } from 'zustand';

export type SonnerType = 'success' | 'error' | 'warning' | 'info';

interface SonnerState {
  visible: boolean;
  type: SonnerType;
  message: string;
  duration: number;
}

interface SonnerStore {
  state: SonnerState;
  showSonner: (config: { type: SonnerType; message: string; duration?: number }) => void;
  hideSonner: () => void;
}

const initialState: SonnerState = {
  visible: false,
  type: 'info',
  message: '',
  duration: 3000,
};

export const useSonnerStore = create<SonnerStore>((set) => ({
  state: initialState,

  showSonner: ({ type, message, duration = 3000 }) => {
    set({
      state: { visible: true, type, message, duration },
    });
  },

  hideSonner: () => {
    set({
      state: { ...initialState, visible: false },
    });
  },
}));

/**
 * Helper para mostrar sonner de qualquer lugar.
 *
 * ```ts
 * import { showSonner } from '@/src/shared/stores/sonner.store';
 *
 * showSonner({ type: 'error', message: 'Algo deu errado!' });
 * showSonner({ type: 'success', message: 'Salvo com sucesso!' });
 * ```
 */
export const showSonner = useSonnerStore.getState().showSonner;
