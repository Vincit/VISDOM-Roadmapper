import { RootState } from '../types';
import { Roadmap } from './types';

export const roadmapsSelector = (state: RootState): Roadmap[] =>
  state.roadmaps.roadmaps;
