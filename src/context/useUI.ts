import { useContext } from 'react';
import { UIContext } from './uiContextDef';

export const useUI = () => {
  const context = useContext(UIContext);
  if (!context) {
    throw new Error('useUI must be used within a UIProvider');
  }
  return context;
};
