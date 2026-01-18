'use client';

import React, { createContext, useContext, useEffect, useState } from 'react';

interface TelegramUser {
  id: number;
  first_name: string;
  last_name?: string;
  username?: string;
  language_code?: string;
}

interface TelegramContextType {
  user: TelegramUser | null;
  initData: string | null;
  isReady: boolean;
}

const TelegramContext = createContext<TelegramContextType | null>(null);

export function TelegramProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<TelegramUser | null>(null);
  const [initData, setInitData] = useState<string | null>(null);
  const [isReady, setIsReady] = useState(false);

  useEffect(() => {
    if (typeof window !== 'undefined') {
      const script = document.createElement('script');
      script.src = 'https://telegram.org/js/telegram-web-app.js';
      script.async = true;
      script.onload = () => {
        if ((window as any).Telegram?.WebApp) {
          const WebApp = (window as any).Telegram.WebApp;
          WebApp.ready();
          WebApp.expand();

          const userData = WebApp.initDataUnsafe?.user;
          if (userData) {
            setUser(userData);
          }
          setInitData(WebApp.initData);
          setIsReady(true);
        }
      };
      document.body.appendChild(script);
    }
  }, []);

  return (
    <TelegramContext.Provider value={{ user, initData, isReady }}>
      {children}
    </TelegramContext.Provider>
  );
}

export function useTelegram() {
  const context = useContext(TelegramContext);
  if (!context) {
    throw new Error('useTelegram must be used within TelegramProvider');
  }
  return context;
}
