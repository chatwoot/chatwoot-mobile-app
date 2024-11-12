import type { RootState } from '@/store';
import { labelAdapter } from './labelSlice';

export const selectLabelsState = (state: RootState) => state.labels;

export const { selectAll: selectAllLabels } =
  labelAdapter.getSelectors<RootState>(selectLabelsState);
