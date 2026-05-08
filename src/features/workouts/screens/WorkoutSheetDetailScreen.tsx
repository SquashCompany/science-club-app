import { ArrowLeft, CaretRight, Play } from 'phosphor-react-native';
import { router, type Href, useLocalSearchParams } from 'expo-router';
import { Pressable, View } from 'react-native';
import Animated, { FadeInDown } from 'react-native-reanimated';

import { AppScreen } from '@/src/shared/components/ui/AppScreen';
import { AppText } from '@/src/shared/components/ui/AppText';
import { useAppTheme } from '@/src/shared/theme/appTheme';
import { cn } from '@/src/shared/utils/cn';

import { WorkoutExerciseListItem } from '../components/WorkoutExerciseListItem';
import { getTotalSets, getWorkoutSession, getWorkoutSheet } from '../data/workoutSheets';

export function WorkoutSheetDetailScreen() {
  const { id, sessionId } = useLocalSearchParams<{ id: string; sessionId?: string }>();
  const { isDark } = useAppTheme();
  const sheet = getWorkoutSheet(id);
  const session = getWorkoutSession(id, sessionId);
  const sessionExercises = session.exercises.filter(Boolean);
  const totalSets = getTotalSets({ ...session, exercises: sessionExercises });

  return (
    <AppScreen contentClassName="px-6 pb-36 pt-8">
      {/* Minimal Header */}
      <View className="mb-10 flex-row items-center justify-between">
        <Pressable
          accessibilityRole="button"
          className="h-11 w-11 items-center justify-center rounded-full bg-bg-surface border border-border-subtle"
          onPress={() => router.back()}
        >
          <ArrowLeft color={isDark ? '#FFFFFF' : '#111827'} size={20} weight="bold" />
        </Pressable>
        <AppText className="text-xs font-bold uppercase tracking-[0.2em] text-text-muted">
          {sheet.title}
        </AppText>
        <View className="w-11" />
      </View>

      {/* Session Hero */}
      <Animated.View entering={FadeInDown.duration(600)}>
        <View className="mb-4">
          <AppText className="text-text-muted text-xs font-bold tracking-[0.3em] uppercase mb-3">
            {session.type} • {session.days}
          </AppText>
          <AppText className="font-heading text-5xl font-bold text-text-main tracking-tight leading-[1.05]">
            {session.title}
          </AppText>
        </View>

        {/* Inline stats */}
        <View className="flex-row items-center gap-4 mt-4 mb-10">
          {[
            { value: String(sessionExercises.length), label: 'exercícios' },
            { value: String(totalSets), label: 'séries' },
            { value: `${session.estimatedMinutes}min`, label: 'estimado' },
          ].map((item) => (
            <View key={item.label} className="flex-row items-baseline gap-1.5">
              <AppText className="text-xl font-bold text-text-main">{item.value}</AppText>
              <AppText className="text-xs text-text-muted">{item.label}</AppText>
            </View>
          ))}
        </View>

        {/* Start button */}
        <Pressable
          accessibilityRole="button"
          className="min-h-[56px] flex-row items-center justify-center gap-2.5 rounded-2xl bg-brand-primary"
          onPress={() => router.push(`/(app)/workouts/${sheet.id}/session?sessionId=${session.id}` as Href)}
        >
          <Play color="#FFFFFF" size={18} weight="fill" />
          <AppText className="text-base font-bold text-white">Iniciar Treino</AppText>
        </Pressable>
      </Animated.View>

      {/* Exercises */}
      <Animated.View entering={FadeInDown.delay(100).duration(600)} className="mt-12">
        <View className="flex-row items-end justify-between border-b border-border-subtle pb-4 mb-2">
          <AppText className="text-[11px] font-bold text-text-muted uppercase tracking-[0.25em]">
            Exercícios
          </AppText>
          <AppText className="text-xs text-text-muted">{sessionExercises.length} no total</AppText>
        </View>

        <View>
          {sessionExercises.map((exercise) => (
            <WorkoutExerciseListItem
              key={exercise.id}
              exercise={exercise}
              isDark={isDark}
              onPress={() => router.push(`/(app)/workouts/${sheet.id}/session?sessionId=${session.id}&exerciseId=${exercise.id}` as Href)}
            />
          ))}
        </View>
      </Animated.View>

      {/* Other sessions in this plan */}
      {sheet.sessions.length > 1 ? (
        <Animated.View entering={FadeInDown.delay(200).duration(600)} className="mt-12">
          <View className="flex-row items-end justify-between border-b border-border-subtle pb-4 mb-2">
            <AppText className="text-[11px] font-bold text-text-muted uppercase tracking-[0.25em]">
              Mesmo Plano
            </AppText>
          </View>
          <View>
            {sheet.sessions.map((item, index) => (
              <Pressable
                key={item.id}
                accessibilityRole="button"
                className="flex-row items-center py-4"
                style={index < sheet.sessions.length - 1 ? { borderBottomWidth: 1, borderBottomColor: isDark ? '#1A1A1A' : '#F3F4F6' } : undefined}
                onPress={() => router.push(`/(app)/workouts/${sheet.id}?sessionId=${item.id}` as Href)}
              >
                <View className={cn(
                  'h-2 w-2 rounded-full mr-4',
                  item.id === session.id ? 'bg-brand-primary' : 'bg-text-muted/30',
                )} />
                <View className="flex-1">
                  <AppText className={cn(
                    'text-base font-semibold',
                    item.id === session.id ? 'text-brand-secondary' : 'text-text-main',
                  )}>
                    {item.title}
                  </AppText>
                  <AppText className="mt-0.5 text-sm text-text-muted">{item.days}</AppText>
                </View>
                {item.id !== session.id && (
                  <CaretRight color={isDark ? '#555555' : '#9CA3AF'} size={16} weight="bold" />
                )}
              </Pressable>
            ))}
          </View>
        </Animated.View>
      ) : null}
    </AppScreen>
  );
}
