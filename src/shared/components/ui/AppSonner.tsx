import { useEffect, useRef } from 'react';
import { Animated, Pressable, View } from 'react-native';
import { CheckCircle, Warning, XCircle, Info } from 'phosphor-react-native';

import { AppText } from '@/src/shared/components/ui/AppText';
import { useAppTheme } from '@/src/shared/theme/appTheme';
import { useSonnerStore, type SonnerType } from '@/src/shared/stores/sonner.store';

const ICON_SIZE = 22;

function getSonnerConfig(type: SonnerType, isLight: boolean) {
  const configs = {
    success: {
      icon: <CheckCircle size={ICON_SIZE} weight="fill" color={isLight ? '#059669' : '#34D399'} />,
      bg: isLight ? '#ECFDF5' : '#064E3B',
      border: isLight ? '#A7F3D0' : '#065F46',
      textColor: isLight ? '#065F46' : '#A7F3D0',
    },
    error: {
      icon: <XCircle size={ICON_SIZE} weight="fill" color={isLight ? '#DC2626' : '#F87171'} />,
      bg: isLight ? '#FEF2F2' : '#450A0A',
      border: isLight ? '#FECACA' : '#7F1D1D',
      textColor: isLight ? '#991B1B' : '#FCA5A5',
    },
    warning: {
      icon: <Warning size={ICON_SIZE} weight="fill" color={isLight ? '#D97706' : '#FBBF24'} />,
      bg: isLight ? '#FFFBEB' : '#451A03',
      border: isLight ? '#FDE68A' : '#78350F',
      textColor: isLight ? '#92400E' : '#FDE68A',
    },
    info: {
      icon: <Info size={ICON_SIZE} weight="fill" color={isLight ? '#7C3AED' : '#A78BFA'} />,
      bg: isLight ? '#F5F3FF' : '#1E1B4B',
      border: isLight ? '#DDD6FE' : '#312E81',
      textColor: isLight ? '#5B21B6' : '#C4B5FD',
    },
  };

  return configs[type];
}

/**
 * Componente Sonner reutilizável para notificações in-app.
 * Deve ser colocado no root layout para estar disponível globalmente.
 *
 * Características:
 * - Centralizado na tela
 * - Animação de entrada/saída suave
 * - Suporte a success, error, warning, info
 * - Auto-dismiss configurável
 * - Segue o design system do app
 */
export function AppSonner() {
  const { state, hideSonner } = useSonnerStore();
  const { isLight } = useAppTheme();

  const opacity = useRef(new Animated.Value(0)).current;
  const translateY = useRef(new Animated.Value(-30)).current;
  const scale = useRef(new Animated.Value(0.9)).current;
  const timeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    if (state.visible) {
      // Animação de entrada
      Animated.parallel([
        Animated.timing(opacity, {
          toValue: 1,
          duration: 280,
          useNativeDriver: true,
        }),
        Animated.spring(translateY, {
          toValue: 0,
          damping: 18,
          stiffness: 200,
          useNativeDriver: true,
        }),
        Animated.spring(scale, {
          toValue: 1,
          damping: 18,
          stiffness: 200,
          useNativeDriver: true,
        }),
      ]).start();

      // Auto-dismiss
      if (timeoutRef.current) clearTimeout(timeoutRef.current);
      timeoutRef.current = setTimeout(() => {
        dismissSonner();
      }, state.duration);
    }

    return () => {
      if (timeoutRef.current) clearTimeout(timeoutRef.current);
    };
  }, [state.visible, state.message]);

  const dismissSonner = () => {
    Animated.parallel([
      Animated.timing(opacity, {
        toValue: 0,
        duration: 200,
        useNativeDriver: true,
      }),
      Animated.timing(translateY, {
        toValue: -30,
        duration: 200,
        useNativeDriver: true,
      }),
      Animated.timing(scale, {
        toValue: 0.9,
        duration: 200,
        useNativeDriver: true,
      }),
    ]).start(() => {
      hideSonner();
    });
  };

  if (!state.visible) return null;

  const config = getSonnerConfig(state.type, isLight);

  return (
    <View
      className="absolute inset-0 z-50 items-center justify-center"
      pointerEvents="box-none"
      style={{ paddingTop: 80 }}
    >
      <Animated.View
        style={{
          opacity,
          transform: [{ translateY }, { scale }],
        }}
      >
        <Pressable onPress={dismissSonner}>
          <View
            style={{
              backgroundColor: config.bg,
              borderColor: config.border,
              borderWidth: 1,
              borderRadius: 18,
              paddingHorizontal: 20,
              paddingVertical: 14,
              flexDirection: 'row',
              alignItems: 'center',
              gap: 12,
              maxWidth: 340,
              minWidth: 240,
              shadowColor: '#000',
              shadowOpacity: isLight ? 0.08 : 0.3,
              shadowOffset: { width: 0, height: 8 },
              shadowRadius: 24,
              elevation: 12,
            }}
          >
            {config.icon}
            <AppText
              className="font-sans font-semibold text-sm flex-1"
              style={{ color: config.textColor }}
              numberOfLines={3}
            >
              {state.message}
            </AppText>
          </View>
        </Pressable>
      </Animated.View>
    </View>
  );
}
