import type { RootState } from '@/store';
import { labelAdapter } from './labelSlice';
import { createSelector } from '@reduxjs/toolkit';

export const selectLabelsState = (state: RootState) => state.labels;

export const { selectAll: selectAllLabels } =
  labelAdapter.getSelectors<RootState>(selectLabelsState);

export const filterLabels = createSelector(
  [selectAllLabels, (state: RootState, searchTerm: string) => searchTerm],
  (labels, searchTerm) => {
    return searchTerm
      ? labels.filter(label => label?.title?.toLowerCase().includes(searchTerm.toLowerCase()))
      : labels;
  },
);
