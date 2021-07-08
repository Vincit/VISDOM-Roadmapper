import { RootState } from '../types';
import { ModalsState } from '../../components/modals/types';

export const modalStateSelector = (state: RootState): ModalsState =>
  state.modals;
