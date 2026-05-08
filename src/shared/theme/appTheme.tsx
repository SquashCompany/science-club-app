import { createContext, PropsWithChildren, useContext } from 'react';
import type { ColorSchemeName } from 'react-native';

export type AppColorScheme = 'light' | 'dark';

type AppThemeContextValue = {
  colorScheme: AppColorScheme;
  isDark: boolean;
  isLight: boolean;
};

const AppThemeContext = createContext<AppThemeContextValue>({
  colorScheme: 'dark',
  isDark: true,
  isLight: false,
});

export function resolveAppColorScheme(colorScheme: ColorSchemeName): AppColorScheme {
  return colorScheme === 'light' ? 'light' : 'dark';
}

type AppThemeProviderProps = PropsWithChildren<{
  colorScheme: AppColorScheme;
}>;

export function AppThemeProvider({ children, colorScheme }: AppThemeProviderProps) {
  return (
    <AppThemeContext.Provider
      value={{
        colorScheme,
        isDark: colorScheme === 'dark',
        isLight: colorScheme === 'light',
      }}
    >
      {children}
    </AppThemeContext.Provider>
  );
}

export function useAppTheme() {
  return useContext(AppThemeContext);
}
