import { createContext, useContext } from 'react';

export const PreloaderContext = createContext<boolean>(false);
export const usePreloader = () => useContext(PreloaderContext);

