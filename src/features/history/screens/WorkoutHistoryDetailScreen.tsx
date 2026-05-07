import { ArrowLeft, Barbell, Camera, Timer, TrendUp } from 'phosphor-react-native';
import { router, useLocalSearchParams } from 'expo-router';
import { Pressable, View } from 'react-native';
import Animated, { FadeInDown } from 'react-native-reanimated';

import { AppScreen } from '@/src/shared/components/ui/AppScreen';
import { AppText } from '@/src/shared/components/ui/AppText';

import { workoutHistory } from '../data/workoutHistory';
import { formatDateLabel, formatSeconds, formatShortNumber, getExerciseVolume, getWorkoutCompletion, getWorkoutVolume } from '../utils';

export function WorkoutHistoryDetailScreen() {
  const { historyId } = useLocalSearchParams<{ historyId: string }>();
  const entry = workoutHistory.find((item) => item.id === historyId) ?? workoutHistory[0];
  const volume = getWorkoutVolume(entry);
  const completion = getWorkoutCompletion(entry);

  return (
    <AppScreen contentClassName="px-5 pb-32 pt-8">
      <View className="mb-8 flex-row items-center justify-between">
        <Pressable
          accessibilityRole="button"
          className="h-14 w-14 items-center justify-center rounded-full border border-border-subtle bg-bg-surface"
          onPress={() => router.back()}
        >
          <ArrowLeft color="#FFFFFF" size={26} weight="bold" />
        </Pressable>
        <View className="flex-1 px-4">
          <AppText className="text-center text-base font-semibold text-text-main">{formatDateLabel(entry.date)}</AppText>
          <AppText className="mt-1 text-center text-xs text-text-muted">{entry.sheetTitle}</AppText>
        </View>
        <View className="h-14 w-14 items-center justify-center rounded-full border border-border-subtle bg-bg-surface">
          <Barbell color="#A78BFA" size={23} weight="duotone" />
        </View>
      </View>

      <Animated.View entering={FadeInDown.duration(420)}>
        <View className="mb-6 rounded-[32px] border border-border-subtle bg-bg-surface p-5">
          <AppText className="text-sm text-text-muted">Treino realizado</AppText>
          <AppText className="mt-2 text-4xl font-semibold leading-tight text-text-main">{entry.title}</AppText>
          <AppText className="mt-3 text-base leading-relaxed text-text-muted">
            {entry.comment ?? 'Treino registrado para acompanhamento de performance.'}
          </AppText>

          <View className="mt-6 flex-row gap-2">
            {[
              { icon: Timer, label: 'Tempo', value: formatSeconds(entry.durationSeconds) },
              { icon: TrendUp, label: 'Volume', value: `${formatShortNumber(volume)}kg` },
              { icon: Camera, label: 'Feito', value: `${completion}%` },
            ].map((item) => {
              const Icon = item.icon;

              return (
                <View key={item.label} className="flex-1 rounded-2xl bg-bg-base px-3 py-3">
                  <Icon color="#A78BFA" size={17} weight="duotone" />
                  <AppText className="mt-2 text-base font-semibold text-text-main">{item.value}</AppText>
                  <AppText className="text-xs text-text-muted">{item.label}</AppText>
                </View>
              );
            })}
          </View>
        </View>
      </Animated.View>

      <Animated.View entering={FadeInDown.delay(80).duration(420)}>
        <View className="mb-4 flex-row items-center justify-between">
          <AppText className="text-2xl font-semibold text-text-main">Exercícios</AppText>
          <AppText className="text-sm text-text-muted">{entry.completedSets}/{entry.totalSets} séries</AppText>
        </View>

        <View className="gap-4">
          {entry.exercises.map((exercise) => (
            <View key={exercise.id} className="rounded-[28px] border border-border-subtle bg-bg-surface px-4 py-4">
              <View className="mb-4 flex-row items-start justify-between gap-3">
                <View className="flex-1">
                  <AppText className="text-xl font-semibold text-text-main">{exercise.name}</AppText>
                  <AppText className="mt-1 text-sm text-text-muted">
                    {exercise.muscle} - {formatShortNumber(getExerciseVolume(exercise))}kg de volume
                  </AppText>
                </View>
                <View className="rounded-2xl bg-brand-primary/12 px-3 py-2">
                  <AppText className="text-sm font-semibold text-brand-secondary">
                    {exercise.sets.filter((set) => set.weightKg && set.previousWeightKg && set.weightKg > set.previousWeightKg).length} prog.
                  </AppText>
                </View>
              </View>

              <View className="overflow-hidden rounded-2xl bg-bg-base">
                {exercise.sets.map((set, index) => {
                  const progressed = set.weightKg && set.previousWeightKg && set.weightKg > set.previousWeightKg;

                  return (
                    <View key={set.id} className="flex-row items-center border-b border-border-subtle px-4 py-3 last:border-b-0">
                      <View className="h-9 w-9 items-center justify-center rounded-full bg-bg-surface">
                        <AppText className="text-sm font-semibold text-text-main">{index + 1}</AppText>
                      </View>
                      <View className="ml-4 flex-1">
                        <AppText className="text-base font-semibold text-text-main">
                          {set.actualReps}/{set.targetReps} reps
                        </AppText>
                        <AppText className="mt-1 text-sm text-text-muted">
                          {set.weightKg ? `${set.weightKg}kg` : `${set.durationSeconds ?? 0}s`} {set.completed ? 'registrado' : 'nao feito'}
                        </AppText>
                      </View>
                      {progressed ? <AppText className="text-sm font-semibold text-emerald-300">+{set.weightKg! - set.previousWeightKg!}kg</AppText> : null}
                    </View>
                  );
                })}
              </View>
            </View>
          ))}
        </View>
      </Animated.View>
    </AppScreen>
  );
}
