import { Barbell, Camera, CaretRight, Timer, TrendUp } from 'phosphor-react-native';
import { Pressable, View } from 'react-native';

import { AppText } from '@/src/shared/components/ui/AppText';

import { HistoryWorkoutEntry } from '../types';
import { formatDateLabel, formatSeconds, formatShortNumber, getBestProgression, getWorkoutCompletion, getWorkoutVolume } from '../utils';

type HistoryWorkoutCardProps = {
  entry: HistoryWorkoutEntry;
  onPress: () => void;
};

export function HistoryWorkoutCard({ entry, onPress }: HistoryWorkoutCardProps) {
  const volume = getWorkoutVolume(entry);
  const completion = getWorkoutCompletion(entry);
  const bestProgression = getBestProgression(entry);

  return (
    <Pressable
      accessibilityRole="button"
      className="overflow-hidden rounded-[28px] border border-border-subtle bg-bg-surface px-5 py-5"
      onPress={onPress}
    >
      <View className="flex-row items-start justify-between gap-4">
        <View className="flex-1">
          <AppText className="text-sm text-text-muted">{formatDateLabel(entry.date)} - {entry.sheetTitle}</AppText>
          <AppText className="mt-2 text-2xl font-semibold leading-tight text-text-main">{entry.title}</AppText>
        </View>
        <View className="h-12 w-12 items-center justify-center rounded-2xl bg-brand-primary/12">
          <Barbell color="#A78BFA" size={23} weight="duotone" />
        </View>
      </View>

      <View className="mt-5 flex-row gap-2">
        <View className="flex-1 rounded-2xl bg-bg-base px-3 py-3">
          <Timer color="#A1A1AA" size={17} weight="duotone" />
          <AppText className="mt-2 text-base font-semibold text-text-main">{formatSeconds(entry.durationSeconds)}</AppText>
          <AppText className="text-xs text-text-muted">duracao</AppText>
        </View>
        <View className="flex-1 rounded-2xl bg-bg-base px-3 py-3">
          <TrendUp color="#34D399" size={17} weight="duotone" />
          <AppText className="mt-2 text-base font-semibold text-text-main">{entry.progressions}</AppText>
          <AppText className="text-xs text-text-muted">progressoes</AppText>
        </View>
        <View className="flex-1 rounded-2xl bg-bg-base px-3 py-3">
          <AppText className="text-xs text-text-muted">Volume</AppText>
          <AppText className="mt-2 text-base font-semibold text-text-main">{formatShortNumber(volume)}kg</AppText>
          <AppText className="text-xs text-text-muted">{completion}% feito</AppText>
        </View>
      </View>

      <View className="mt-5 flex-row items-center justify-between gap-4">
        <View className="flex-1">
          <AppText className="text-sm font-semibold text-text-main">
            {bestProgression?.delta > 0 ? `${bestProgression.exercise} +${bestProgression.delta}kg` : 'Sem progressao de carga'}
          </AppText>
          <AppText className="mt-1 text-sm text-text-muted" numberOfLines={1}>
            {entry.comment ?? 'Resumo completo do treino registrado.'}
          </AppText>
        </View>
        {entry.photoUri ? <Camera color="#A78BFA" size={19} weight="duotone" /> : null}
        <CaretRight color="#71717A" size={20} weight="bold" />
      </View>
    </Pressable>
  );
}
