import { useReducer } from 'react';
export const useRerender = () => useReducer(x => x + 1, 0)[1];
