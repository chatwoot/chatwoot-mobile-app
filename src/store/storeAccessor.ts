import { Store } from '@reduxjs/toolkit';

let store: Store;

export const setStore = (s: Store) => {
  store = s;
};

export const getStore = () => {
  if (!store) {
    throw new Error('Store not initialized');
  }
  return store;
};
