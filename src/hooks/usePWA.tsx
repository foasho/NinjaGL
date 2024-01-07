'use client';
import React, { createContext, useContext, useEffect, useRef } from 'react';

import { MySwal } from '@/commons/Swal';

type BrowserType = 'chrome' | 'safari' | 'edge' | 'firefox' | 'opera' | 'ie' | 'unknown';

type PWAContextType = {
  browser: React.MutableRefObject<BrowserType>;
  availablePWA: React.MutableRefObject<boolean>;
  InstallApplication: () => void;
  reqNotifPermission: () => void;
};

const PWAContext = createContext<PWAContextType>({
  browser: { current: 'unknown' },
  availablePWA: { current: false },
  InstallApplication: () => {},
  reqNotifPermission: () => {},
} as PWAContextType);

export const usePWA = () => useContext(PWAContext);

export const PWAProvider = ({ children }: { children: React.ReactNode }) => {
  const deferredPrompt = useRef<any>(null);
  const browser = useRef<BrowserType>('unknown');
  const availablePWA = useRef<boolean>(false);

  const checkedInstall = async () => {
    //check if browser version supports the api
    if ('getInstalledRelatedApps' in window.navigator) {
      const relatedApps = await (navigator as any).getInstalledRelatedApps();
      relatedApps.forEach((app: any) => {
        //if your PWA exists in the array it is installed
        // console.log(app.platform, app.url);
      });
    }
  };

  const detectBrowser = (): BrowserType => {
    const agent = window.navigator.userAgent.toLowerCase();
    switch (true) {
      case agent.indexOf('edge') > -1:
        return 'edge';
      case agent.indexOf('opr') > -1 && !!(window as any).opr:
        return 'opera';
      case agent.indexOf('chrome') > -1 && !!(window as any).chrome:
        return 'chrome';
      case agent.indexOf('trident') > -1:
        return 'ie';
      case agent.indexOf('firefox') > -1:
        return 'firefox';
      case agent.indexOf('safari') > -1:
        return 'safari';
      default:
        return 'unknown';
    }
  };

  useEffect(() => {
    const _browser = detectBrowser();
    browser.current = _browser;
    window.addEventListener('beforeinstallprompt', (e) => {
      e.preventDefault();
      deferredPrompt.current = e;
      availablePWA.current = false;
    });
    // PWAのインストールが完了したとき
    window.addEventListener('appinstalled', (evt) => {
      MySwal.fire({
        title: 'インストール完了',
        text: 'インストールが完了しました',
        icon: 'success',
        confirmButtonText: '閉じる',
      });
    });
    checkedInstall();
    return () => {
      window.removeEventListener('beforeinstallprompt', () => {});
      window.removeEventListener('appinstalled', () => {});
    };
  }, []);

  /**
   * PWAのインストール
   */
  const InstallApplication = () => {
    // 利用しているBrowserがSafariの場合は動画を表示
    if (browser.current === 'safari') {
      MySwal.fire({
        title: '<ruby>インストール方法<rt>お使いのブラウザでの</rt></ruby >',
        html: `
          <div class="flex mx-aut0 flex-col items-center">
            <a href=""></a>
          </div>
        `,
        showCancelButton: false,
        focusConfirm: false,
        confirmButtonText: '閉じる',
      });
      return;
    }
    if (deferredPrompt.current) {
      deferredPrompt.current.prompt();
      deferredPrompt.current.userChoice.then((choiceResult: any) => {
        if (choiceResult.outcome === 'accepted') {
          // console.log('User accepted the install prompt');
          // deferredPrompt.current = null; // 必要かどうかは不明
        } else {
          // console.log('User dismissed the install prompt');
        }
      });
    } else {
      let title = 'インストールできません';
      let text = 'このブラウザではインストールできません';
      let icon: 'error' | 'info' = 'error';
      MySwal.fire({
        title: title,
        text: text,
        icon: icon,
        confirmButtonText: '閉じる',
      });
    }
  };

  /**
   * 通知を許可
   */
  const reqNotifPermission = () => {
    if (Notification.permission === 'default') {
      Notification.requestPermission().then((permission) => {
        if (permission === 'granted') {
          // console.log('Notification permission granted.');
        }
      });
    }
  };

  /**
   * プッシュ通知を送信する
   */
  const sendPushNotification = ({ title = 'Hello world!', logo = 'img/logo.svg' }) => {
    if (Notification.permission === 'granted') {
      navigator.serviceWorker.getRegistration().then((reg) => {
        const options = {
          body: 'First notification!',
          icon: logo,
          vibrate: [100, 50, 100],
          data: {
            dateOfArrival: Date.now(),
            primaryKey: 1,
          },
          actions: [
            {
              action: 'explore',
              title: 'Explore this new world',
              icon: logo,
            },
            {
              action: 'close',
              title: 'Close notification',
              icon: logo,
            },
          ],
        };
        reg?.showNotification(title, options);
      });
    }
  };

  return (
    <PWAContext.Provider
      value={{
        browser: browser,
        availablePWA: availablePWA,
        InstallApplication: InstallApplication,
        reqNotifPermission: reqNotifPermission,
      }}
    >
      {children}
    </PWAContext.Provider>
  );
};
