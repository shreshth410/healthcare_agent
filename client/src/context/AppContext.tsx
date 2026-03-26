import { createContext, useContext, useState, type ReactNode } from "react";

interface AppContextType {
  injectedNote: string;
  setInjectedNote: (note: string) => void;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

export function AppProvider({ children }: { children: ReactNode }) {
  const [injectedNote, setInjectedNote] = useState("");

  return (
    <AppContext.Provider value={{ injectedNote, setInjectedNote }}>
      {children}
    </AppContext.Provider>
  );
}

export function useAppContext() {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error("useAppContext must be used within an AppProvider");
  }
  return context;
}
