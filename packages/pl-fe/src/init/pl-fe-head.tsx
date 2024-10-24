import clsx from 'clsx';
import React, { useEffect } from 'react';

import {
  useSettings,
  usePlFeConfig,
  useTheme,
  useLocale,
  useAppSelector,
} from 'pl-fe/hooks';
import { userTouching } from 'pl-fe/is-mobile';
import { normalizePlFeConfig } from 'pl-fe/normalizers';
import { startSentry } from 'pl-fe/sentry';
import { generateThemeCss } from 'pl-fe/utils/theme';

const Helmet = React.lazy(() => import('pl-fe/components/helmet'));

interface IPlFeHead {
  children: React.ReactNode;
}

/** Injects metadata into site head with Helmet. */
const PlFeHead: React.FC<IPlFeHead> = ({ children }) => {
  const { locale, direction } = useLocale();
  const { demo, reduceMotion, underlineLinks, demetricator, systemFont } = useSettings();
  const plFeConfig = usePlFeConfig();
  const theme = useTheme();

  const withModals = useAppSelector((state) => !state.modals.isEmpty() || (state.dropdown_menu.isOpen && userTouching.matches));

  const themeCss = generateThemeCss(demo ? normalizePlFeConfig({ brandColor: '#d80482' }) : plFeConfig);
  const dsn = plFeConfig.sentryDsn;

  const bodyClass = clsx('h-full bg-white text-base antialiased black:bg-black dark:bg-gray-800', {
    'no-reduce-motion': !reduceMotion,
    'underline-links': underlineLinks,
    'demetricator': demetricator,
    'system-font': systemFont,
    'overflow-hidden': withModals,
  });

  useEffect(() => {
    if (dsn) {
      startSentry(dsn).catch(console.error);
    }
  }, [dsn]);

  return (
    <>
      <Helmet>
        <html lang={locale} className={clsx('h-full', { 'dark': theme === 'dark', 'dark black': theme === 'black' })} />
        <body className={bodyClass} dir={direction} />
        {themeCss && <style id='theme' type='text/css'>{`:root{${themeCss}}`}</style>}
        {['dark', 'black'].includes(theme) && <style type='text/css'>{':root { color-scheme: dark; }'}</style>}
        <meta name='theme-color' content={plFeConfig.brandColor} />
      </Helmet>

      {children}
    </>
  );
};

export { PlFeHead as default };
