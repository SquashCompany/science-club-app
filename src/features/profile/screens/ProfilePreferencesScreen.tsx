import { ArrowLeft, Bell, ChatCircleText, EnvelopeSimple, LockKey, Phone, ShieldCheck } from 'phosphor-react-native';
import { router } from 'expo-router';
import { Pressable, Switch, View } from 'react-native';
import Animated, { FadeInDown } from 'react-native-reanimated';

import { AppScreen } from '@/src/shared/components/ui/AppScreen';
import { AppText } from '@/src/shared/components/ui/AppText';
import { cn } from '@/src/shared/utils/cn';

import { useProfileStore } from '../services/profile.store';
import { ProfilePreferences } from '../types';

const channels: { label: string; value: ProfilePreferences['communicationChannel']; icon: typeof Phone }[] = [
  { label: 'WhatsApp', value: 'whatsapp', icon: Phone },
  { label: 'Email', value: 'email', icon: EnvelopeSimple },
  { label: 'App', value: 'app', icon: ChatCircleText },
];

export function ProfilePreferencesScreen() {
  const preferences = useProfileStore((state) => state.profile.preferences);
  const setPreference = useProfileStore((state) => state.setPreference);

  return (
    <AppScreen contentClassName="px-5 pb-12 pt-5">
      <Animated.View entering={FadeInDown.duration(420)}>
        <Pressable accessibilityRole="button" className="mb-8 h-12 w-12 items-center justify-center rounded-2xl bg-bg-surface" onPress={() => router.back()}>
          <ArrowLeft color="#FFFFFF" size={22} weight="bold" />
        </Pressable>

        <View className="mb-7 rounded-[32px] border border-border-subtle bg-bg-surface p-5">
          <View className="mb-5 h-14 w-14 items-center justify-center rounded-2xl bg-brand-primary/12">
            <ShieldCheck color="#A78BFA" size={28} weight="duotone" />
          </View>
          <AppText className="text-4xl font-semibold leading-tight text-text-main">Preferências</AppText>
          <AppText className="mt-3 text-base leading-snug text-text-soft">
            Ajuste como o app lembra você de treinos, refeições e reavaliações.
          </AppText>
        </View>
      </Animated.View>

      <Animated.View entering={FadeInDown.delay(80).duration(420)} className="gap-3">
        <PreferenceSwitch
          description="Avisos de treino do dia e início do horário planejado."
          icon={Bell}
          title="Lembretes de treino"
          value={preferences.workoutReminders}
          onValueChange={(value) => setPreference('workoutReminders', value)}
        />
        <PreferenceSwitch
          description="Alertas de refeições, água e registro com balança."
          icon={Bell}
          title="Lembretes de dieta"
          value={preferences.mealReminders}
          onValueChange={(value) => setPreference('mealReminders', value)}
        />
        <PreferenceSwitch
          description="Prazos de questionários, fotos e parecer final."
          icon={Bell}
          title="Alertas de avaliação"
          value={preferences.assessmentAlerts}
          onValueChange={(value) => setPreference('assessmentAlerts', value)}
        />
        <PreferenceSwitch
          description="Mantém evolução e fotos privadas por padrão."
          icon={LockKey}
          title="Progresso privado"
          value={preferences.privateProgress}
          onValueChange={(value) => setPreference('privateProgress', value)}
        />
      </Animated.View>

      <Animated.View entering={FadeInDown.delay(160).duration(420)} className="mt-8">
        <AppText className="mb-4 text-2xl font-semibold text-text-main">Canal preferido</AppText>
        <View className="rounded-[28px] border border-border-subtle bg-bg-surface p-3">
          <View className="flex-row gap-2">
            {channels.map((channel) => {
              const Icon = channel.icon;
              const active = preferences.communicationChannel === channel.value;

              return (
                <Pressable
                  key={channel.value}
                  accessibilityRole="button"
                  className={cn('min-h-[64px] flex-1 items-center justify-center rounded-[22px]', active ? 'bg-brand-primary' : 'bg-bg-base')}
                  onPress={() => setPreference('communicationChannel', channel.value)}
                >
                  <Icon color={active ? '#FFFFFF' : '#A78BFA'} size={21} weight="duotone" />
                  <AppText className={cn('mt-2 text-xs font-semibold', active ? 'text-white' : 'text-text-muted')}>{channel.label}</AppText>
                </Pressable>
              );
            })}
          </View>
        </View>
      </Animated.View>
    </AppScreen>
  );
}

function PreferenceSwitch({
  description,
  icon: Icon,
  onValueChange,
  title,
  value,
}: {
  description: string;
  icon: typeof Bell;
  onValueChange: (value: boolean) => void;
  title: string;
  value: boolean;
}) {
  return (
    <View className="flex-row items-center rounded-[24px] border border-border-subtle bg-bg-surface p-4">
      <View className="h-12 w-12 items-center justify-center rounded-2xl bg-brand-primary/12">
        <Icon color="#A78BFA" size={22} weight="duotone" />
      </View>
      <View className="ml-4 flex-1">
        <AppText className="text-base font-semibold text-text-main">{title}</AppText>
        <AppText className="mt-1 text-sm leading-snug text-text-muted">{description}</AppText>
      </View>
      <Switch
        ios_backgroundColor="#27272A"
        thumbColor="#FFFFFF"
        trackColor={{ false: '#27272A', true: '#8B5CF6' }}
        value={value}
        onValueChange={onValueChange}
      />
    </View>
  );
}
