import { RootState } from '../types';
import { ModalsState } from './types';

export const modalStateSelector = (state: RootState): ModalsState =>
  state.modals;
