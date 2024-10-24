import React from 'react';

import { changeSetting } from 'pl-fe/actions/settings';
import { useAppDispatch, useSettings } from 'pl-fe/hooks';

import ThemeSelector from './theme-selector';

/** Stateful theme selector. */
const ThemeToggle: React.FC = () => {
  const dispatch = useAppDispatch();
  const { themeMode } = useSettings();

  const handleChange = (themeMode: string) => {
    dispatch(changeSetting(['themeMode'], themeMode));
  };

  return (
    <ThemeSelector
      value={themeMode}
      onChange={handleChange}
    />
  );
};

export { ThemeToggle as default };
