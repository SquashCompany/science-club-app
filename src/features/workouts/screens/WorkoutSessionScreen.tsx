import { ArrowLeft, CheckCircle, Info, LinkSimple, Pause, Play, PlayCircle, X } from 'phosphor-react-native';
import { router, type Href, useLocalSearchParams } from 'expo-router';
import { useEffect, useRef, useState } from 'react';
import { Alert, KeyboardAvoidingView, Linking, Modal, Platform, Pressable, ScrollView, TextInput, View, type ScrollView as ScrollViewType } from 'react-native';
import Animated, { FadeInDown } from 'react-native-reanimated';
import { SafeAreaView } from 'react-native-safe-area-context';
import { WebView } from 'react-native-webview';

import { AppText } from '@/src/shared/components/ui/AppText';
import { useAppTheme } from '@/src/shared/theme/appTheme';
import { cn } from '@/src/shared/utils/cn';

import { ExerciseVisual } from '../components/ExerciseVisual';
import { WorkoutExerciseListItem } from '../components/WorkoutExerciseListItem';
import { getTotalSets, getWorkoutSession } from '../data/workoutSheets';

type SetEditorState = {
  exerciseIndex: number;
  setIndex: number;
};

function formatSeconds(total: number) {
  const minutes = Math.floor(total / 60);
  const seconds = total % 60;
  return `${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`;
}

function weightKey(exerciseId: string, setId: string) {
  return `${exerciseId}:${setId}`;
}

function repsKey(exerciseId: string, setId: string) {
  return `${exerciseId}:${setId}`;
}

function parseWeight(value?: string) {
  const match = value?.replace(',', '.').match(/\d+(\.\d+)?/);
  return match ? Number(match[0]) : 0;
}

function formatWeight(value: string) {
  const cleanValue = value.trim().replace(',', '.');
  if (!cleanValue) {
    return '0kg';
  }

  return /[a-zA-Z]/.test(cleanValue) ? cleanValue : `${cleanValue}kg`;
}

export function WorkoutSessionScreen() {
  const { id, sessionId, exerciseId } = useLocalSearchParams<{ id: string; sessionId?: string; exerciseId?: string }>();
  const { isDark } = useAppTheme();
  const session = getWorkoutSession(id, sessionId);
  const sessionExercises = session.exercises.filter(Boolean);
  const initialIndex = Math.max(0, sessionExercises.findIndex((exercise) => exercise.id === exerciseId));
  const scrollRef = useRef<ScrollViewType>(null);
  const seriesYRef = useRef(0);
  const intervalYRef = useRef(0);
  const [viewMode, setViewMode] = useState<'workout' | 'exercise'>(exerciseId ? 'exercise' : 'workout');
  const [currentIndex, setCurrentIndex] = useState(initialIndex);
  const [completedByExercise, setCompletedByExercise] = useState<Record<string, number>>({});
  const [elapsed, setElapsed] = useState(0);
  const [restLeft, setRestLeft] = useState(0);
  const [workoutStarted, setWorkoutStarted] = useState(false);
  const [workoutFinished, setWorkoutFinished] = useState(false);
  const [paused, setPaused] = useState(false);
  const [infoOpen, setInfoOpen] = useState(false);
  const [weightOverrides, setWeightOverrides] = useState<Record<string, string>>({});
  const [repsOverrides, setRepsOverrides] = useState<Record<string, string>>({});
  const [setEditor, setSetEditor] = useState<SetEditorState | null>(null);
  const [weightDraft, setWeightDraft] = useState('');
  const [repsDraft, setRepsDraft] = useState('');

  const exercise = sessionExercises[currentIndex] ?? sessionExercises[0];
  const exerciseVideos = exercise.videos ?? [];
  const embeddableVideo = exerciseVideos.find((video) => video.embedUrl && (video.provider === 'own' || video.provider === 'youtube'));
  const externalVideos = exerciseVideos.filter((video) => video.provider === 'reels' || video.provider === 'tiktok' || !video.embedUrl);
  const completedSets = completedByExercise[exercise.id] ?? 0;
  const restRunning = restLeft > 0;
  const totalSets = getTotalSets({ ...session, exercises: sessionExercises });
  const completedSetsTotal = sessionExercises.reduce((total, item) => total + (completedByExercise[item.id] ?? 0), 0);
  const completedExercisesTotal = sessionExercises.filter((item) => (completedByExercise[item.id] ?? 0) >= item.sets.length).length;
  const progressionsTotal = sessionExercises.reduce((total, item) => {
    const completedCount = completedByExercise[item.id] ?? 0;
    const progressedSets = item.sets.filter((set, index) => {
      const override = weightOverrides[weightKey(item.id, set.id)];
      return index < completedCount && override && parseWeight(override) > parseWeight(set.weight);
    });
    return total + progressedSets.length;
  }, 0);
  const exerciseDone = completedSets >= exercise.sets.length;
  const allWorkoutSetsDone = completedSetsTotal >= totalSets;
  const isLastExercise = currentIndex >= sessionExercises.length - 1;
  const timerRunning = workoutStarted && !workoutFinished && !paused;
  const progressPercent = completedSetsTotal === 0 ? 0 : Math.max(3, (completedSetsTotal / Math.max(1, totalSets)) * 100);

  useEffect(() => {
    if (!timerRunning) return undefined;
    const timer = setInterval(() => setElapsed((value) => value + 1), 1000);
    return () => clearInterval(timer);
  }, [timerRunning]);

  useEffect(() => {
    if (!timerRunning || restLeft <= 0) return undefined;
    const timer = setInterval(() => {
      setRestLeft((value) => Math.max(0, value - 1));
    }, 1000);
    return () => clearInterval(timer);
  }, [timerRunning, restLeft]);

  function startWorkout() {
    setWorkoutStarted(true);
    setWorkoutFinished(false);
    setPaused(false);
  }

  function startCurrentExercise() {
    const firstIncompleteIndex = sessionExercises.findIndex((item) => (completedByExercise[item.id] ?? 0) < item.sets.length);
    startWorkout();
    setCurrentIndex(firstIncompleteIndex >= 0 ? firstIncompleteIndex : sessionExercises.length - 1);
    setViewMode('exercise');
    requestAnimationFrame(() => {
      scrollRef.current?.scrollTo({ y: 0, animated: false });
    });
  }

  function handlePrimaryAction() {
    if (!workoutStarted) { startWorkout(); return; }
    if (exerciseDone) {
      if (isLastExercise) { finishWorkout(); return; }
      nextExercise(); return;
    }
    markSet();
  }

  function markSet() {
    const nextValue = Math.min(exercise.sets.length, completedSets + 1);
    setCompletedByExercise((current) => ({ ...current, [exercise.id]: nextValue }));
    if (nextValue < exercise.sets.length) {
      setRestLeft(exercise.restSeconds);
    } else {
      setRestLeft(0);
    }
    requestAnimationFrame(() => {
      scrollRef.current?.scrollTo({ y: Math.max(0, intervalYRef.current - 24), animated: true });
    });
  }

  function nextExercise() {
    setCurrentIndex((value) => Math.min(sessionExercises.length - 1, value + 1));
    setRestLeft(0);
    setInfoOpen(false);
    setViewMode('exercise');
  }

  function previousExercise() {
    setCurrentIndex((value) => Math.max(0, value - 1));
    setRestLeft(0);
    setInfoOpen(false);
    setViewMode('exercise');
  }

  function openExercise(index: number) {
    setCurrentIndex(index);
    setRestLeft(0);
    setInfoOpen(false);
    setViewMode('exercise');
    requestAnimationFrame(() => {
      scrollRef.current?.scrollTo({ y: 0, animated: false });
    });
  }

  function getSetWeight(exerciseId: string, setId: string, prescribedWeight?: string) {
    return weightOverrides[weightKey(exerciseId, setId)] ?? prescribedWeight;
  }

  function getSetReps(exerciseId: string, setId: string, prescribedReps: string) {
    return repsOverrides[repsKey(exerciseId, setId)] ?? prescribedReps;
  }

  function openSetEditor(setIndex: number) {
    const set = exercise.sets[setIndex];
    if (!set) return;
    setRepsDraft(getSetReps(exercise.id, set.id, set.reps));
    setWeightDraft(set.weight ? parseWeight(getSetWeight(exercise.id, set.id, set.weight)).toString() : '');
    setSetEditor({ exerciseIndex: currentIndex, setIndex });
  }

  function applySetExecution(scope: 'single' | 'exercise-next' | 'workout-next') {
    if (!setEditor) return;
    const nextWeight = weightDraft ? formatWeight(weightDraft) : '';
    const nextReps = repsDraft.trim();
    setWeightOverrides((current) => {
      const next = { ...current };
      sessionExercises.forEach((item, itemIndex) => {
        if (scope === 'single' && itemIndex !== setEditor.exerciseIndex) return;
        if (scope === 'exercise-next' && itemIndex !== setEditor.exerciseIndex) return;
        if (scope === 'workout-next' && itemIndex < setEditor.exerciseIndex) return;
        item.sets.forEach((set, si) => {
          if (!set.weight) return;
          if (scope === 'single' && si !== setEditor.setIndex) return;
          if ((scope === 'exercise-next' || scope === 'workout-next') && itemIndex === setEditor.exerciseIndex && si < setEditor.setIndex) return;
          if (nextWeight) next[weightKey(item.id, set.id)] = nextWeight;
        });
      });
      return next;
    });
    setRepsOverrides((current) => {
      const next = { ...current };
      if (!nextReps) return next;
      sessionExercises.forEach((item, itemIndex) => {
        if (scope === 'single' && itemIndex !== setEditor.exerciseIndex) return;
        if (scope === 'exercise-next' && itemIndex !== setEditor.exerciseIndex) return;
        if (scope === 'workout-next' && itemIndex < setEditor.exerciseIndex) return;
        item.sets.forEach((set, si) => {
          if (scope === 'single' && si !== setEditor.setIndex) return;
          if ((scope === 'exercise-next' || scope === 'workout-next') && itemIndex === setEditor.exerciseIndex && si < setEditor.setIndex) return;
          next[repsKey(item.id, set.id)] = nextReps;
        });
      });
      return next;
    });
    setSetEditor(null);
  }

  function openVideo(url: string) { Linking.openURL(url); }

  function finishWorkout() {
    setWorkoutFinished(true);
    setPaused(true);
    setRestLeft(0);
    router.push(
      `/(app)/workouts/${id}/finish?sessionId=${session.id}&elapsed=${elapsed}&sets=${completedSetsTotal}&totalSets=${totalSets}&exercises=${completedExercisesTotal}&progressions=${progressionsTotal}` as Href,
    );
  }

  function confirmCloseWorkout() {
    if (!workoutStarted && completedSetsTotal === 0) { router.back(); return; }
    Alert.alert('Encerrar treino?', 'Você pode salvar o progresso ou descartar.', [
      { text: 'Continuar', style: 'cancel' },
      { text: 'Descartar', style: 'destructive', onPress: () => router.replace('/(app)/(tabs)/workouts') },
      { text: 'Salvar e sair', onPress: finishWorkout },
    ]);
  }

  function toggleTimer() {
    if (workoutFinished) return;
    if (!workoutStarted) { startWorkout(); return; }
    setPaused((value) => !value);
  }

  const primaryActionLabel = !workoutStarted
    ? 'Iniciar treino'
    : exerciseDone
      ? isLastExercise ? 'Finalizar treino' : 'Próximo exercício'
      : 'Marcar série';

  return (
    <View className="flex-1 bg-bg-base">
      <SafeAreaView className="flex-1" edges={['top', 'bottom']}>
        <ScrollView
          ref={scrollRef}
          alwaysBounceVertical={false}
          bounces
          contentContainerClassName="px-6 pb-48 pt-8"
          keyboardShouldPersistTaps="handled"
          overScrollMode="never"
          showsVerticalScrollIndicator={false}
        >
          {/* Header */}
          <View className="mb-10 flex-row items-center justify-between">
            <Pressable
              accessibilityRole="button"
              className="h-11 w-11 items-center justify-center rounded-full bg-bg-surface border border-border-subtle"
              onPress={() => (viewMode === 'exercise' ? setViewMode('workout') : router.back())}
            >
              <ArrowLeft color={isDark ? '#FFFFFF' : '#111827'} size={20} weight="bold" />
            </Pressable>
            <View className="flex-1 px-4 items-center">
              <AppText className="text-xs font-bold uppercase tracking-[0.2em] text-text-muted">
                {viewMode === 'exercise' ? `${currentIndex + 1} / ${sessionExercises.length}` : session.title}
              </AppText>
              {workoutStarted && (
                <View className="mt-1.5 h-1 w-16 rounded-full bg-bg-surface overflow-hidden">
                  <View className="h-full rounded-full bg-brand-primary" style={{ width: `${progressPercent}%` }} />
                </View>
              )}
            </View>
            <View className="w-11" />
          </View>

          {viewMode === 'workout' ? (
            <>
              {/* Workout Overview */}
              <Animated.View entering={FadeInDown.duration(500)}>
                <View className="mb-4">
                  <AppText className="text-text-muted text-xs font-bold tracking-[0.3em] uppercase mb-3">
                    {workoutFinished ? 'Finalizado' : allWorkoutSetsDone ? 'Pronto' : workoutStarted ? 'Em andamento' : 'Pronto para iniciar'}
                  </AppText>
                  <AppText className="font-heading text-5xl font-bold text-text-main tracking-tight leading-[1.05]">
                    {session.title}
                  </AppText>
                  <AppText className="mt-2 text-base text-text-muted">
                    {session.type} • {session.estimatedMinutes}min • {session.days}
                  </AppText>
                </View>

                {/* Progress stats */}
                <View className="flex-row items-center gap-6 mt-6 mb-10">
                  <View className="flex-row items-baseline gap-1.5">
                    <AppText className="text-2xl font-bold text-text-main">{formatSeconds(elapsed)}</AppText>
                    <AppText className="text-xs text-text-muted">tempo</AppText>
                  </View>
                  <View className="flex-row items-baseline gap-1.5">
                    <AppText className="text-2xl font-bold text-text-main">{completedSetsTotal}/{totalSets}</AppText>
                    <AppText className="text-xs text-text-muted">séries</AppText>
                  </View>
                  <View className="flex-row items-baseline gap-1.5">
                    <AppText className="text-2xl font-bold text-text-main">{completedExercisesTotal}/{sessionExercises.length}</AppText>
                    <AppText className="text-xs text-text-muted">feitos</AppText>
                  </View>
                </View>

                {/* CTA */}
                {!workoutFinished && (
                  <Pressable
                    accessibilityRole="button"
                    className="min-h-[56px] flex-row items-center justify-center gap-2.5 rounded-2xl bg-brand-primary"
                    onPress={allWorkoutSetsDone ? finishWorkout : startCurrentExercise}
                  >
                    {allWorkoutSetsDone ? <CheckCircle color="#FFFFFF" size={18} weight="bold" /> : <Play color="#FFFFFF" size={18} weight="fill" />}
                    <AppText className="text-base font-bold text-white">
                      {allWorkoutSetsDone ? 'Finalizar treino' : workoutStarted ? 'Continuar' : 'Iniciar treino'}
                    </AppText>
                  </Pressable>
                )}
              </Animated.View>

              {/* Exercise list */}
              <Animated.View
                entering={FadeInDown.delay(100).duration(500)}
                className="mt-12"
                onLayout={(event) => { seriesYRef.current = event.nativeEvent.layout.y; }}
              >
                <View className="flex-row items-end justify-between border-b border-border-subtle pb-4 mb-2">
                  <AppText className="text-[11px] font-bold text-text-muted uppercase tracking-[0.25em]">Exercícios</AppText>
                  <AppText className="text-xs text-text-muted">
                    {restRunning ? `${formatSeconds(restLeft)} descanso` : workoutStarted ? 'sem descanso' : ''}
                  </AppText>
                </View>
                <View>
                  {sessionExercises.map((item, index) => (
                    <WorkoutExerciseListItem
                      key={item.id}
                      exercise={item}
                      completedSets={completedByExercise[item.id] ?? 0}
                      isDark={isDark}
                      onPress={() => openExercise(index)}
                    />
                  ))}
                </View>
              </Animated.View>
            </>
          ) : (
            <>
              {/* Exercise Detail View */}
              <Animated.View entering={FadeInDown.duration(400)}>
                <ExerciseVisual isDark={isDark} muscle={exercise.muscle} size="lg" />

                <View className="mb-2">
                  <AppText className="text-text-muted text-xs font-bold tracking-[0.3em] uppercase mb-3">
                    {exercise.equipment} • {exercise.muscle}
                  </AppText>
                  <AppText className="font-heading text-4xl font-bold text-text-main tracking-tight leading-[1.05]">
                    {exercise.name}
                  </AppText>
                </View>

                {/* Info toggle */}
                <Pressable
                  className="flex-row items-center gap-2 mt-3 mb-8"
                  onPress={() => setInfoOpen((value) => !value)}
                >
                  <Info color="#A78BFA" size={16} weight="bold" />
                  <AppText className="text-sm font-semibold text-brand-secondary">
                    {infoOpen ? 'Fechar instruções' : 'Ver instruções'}
                  </AppText>
                </Pressable>
              </Animated.View>

              {/* Info Panel */}
              {infoOpen && (
                <Animated.View entering={FadeInDown.duration(300)} className="mb-8">
                  {embeddableVideo?.embedUrl ? (
                    <View className="h-48 overflow-hidden rounded-2xl bg-black mb-5">
                      <WebView
                        allowsFullscreenVideo
                        javaScriptEnabled
                        mediaPlaybackRequiresUserAction={false}
                        source={{ uri: embeddableVideo.embedUrl }}
                      />
                    </View>
                  ) : null}

                  <AppText className="text-base leading-relaxed text-text-muted mb-4">
                    {exercise.description ?? exercise.cue}
                  </AppText>

                  {(exercise.executionTips ?? []).length > 0 && (
                    <View className="gap-2.5 mb-4">
                      {(exercise.executionTips ?? []).map((tip) => (
                        <View key={tip} className="flex-row gap-3">
                          <View className="mt-2 h-1.5 w-1.5 rounded-full bg-brand-primary" />
                          <AppText className="flex-1 text-sm leading-relaxed text-text-muted">{tip}</AppText>
                        </View>
                      ))}
                    </View>
                  )}

                  {externalVideos.length > 0 && (
                    <View className="gap-2">
                      {externalVideos.map((video) => (
                        <Pressable
                          key={video.id}
                          accessibilityRole="button"
                          className="flex-row items-center justify-between py-3"
                          style={{ borderBottomWidth: 1, borderBottomColor: isDark ? '#1A1A1A' : '#F3F4F6' }}
                          onPress={() => openVideo(video.url)}
                        >
                          <AppText className="text-sm font-semibold text-text-main">{video.title}</AppText>
                          <LinkSimple color="#A78BFA" size={16} weight="bold" />
                        </Pressable>
                      ))}
                    </View>
                  )}
                </Animated.View>
              )}

              {/* Sets */}
              <Animated.View entering={FadeInDown.delay(80).duration(400)}>
                <View className="flex-row items-end justify-between border-b border-border-subtle pb-4 mb-2">
                  <AppText className="text-[11px] font-bold text-text-muted uppercase tracking-[0.25em]">Séries</AppText>
                  <AppText className="text-xs text-text-muted">Anterior: {exercise.previous}</AppText>
                </View>

                <View
                  onLayout={(event) => { seriesYRef.current = event.nativeEvent.layout.y; }}
                >
                  {exercise.sets.map((set, index) => {
                    const done = index < completedSets;
                    const isNext = index === completedSets && !exerciseDone;
                    const currentReps = getSetReps(exercise.id, set.id, set.reps);
                    const currentWeight = getSetWeight(exercise.id, set.id, set.weight);

                    return (
                      <Pressable
                        key={set.id}
                        className="flex-row items-center py-4"
                        style={{ borderBottomWidth: 1, borderBottomColor: isDark ? '#1A1A1A' : '#F3F4F6' }}
                        onPress={() => openSetEditor(index)}
                      >
                        <View className={cn(
                          'h-9 w-9 items-center justify-center rounded-full mr-4',
                          done ? 'bg-brand-primary' : isNext ? 'border-2 border-brand-primary' : 'border border-border-subtle',
                        )}>
                          {done ? (
                            <CheckCircle color="#FFFFFF" size={16} weight="bold" />
                          ) : (
                            <AppText className={cn('text-sm font-bold', isNext ? 'text-brand-secondary' : 'text-text-muted')}>{index + 1}</AppText>
                          )}
                        </View>
                        <View className="flex-1">
                          <AppText className={cn('text-lg font-semibold', done ? 'text-text-muted' : 'text-text-main')}>
                            {currentReps} reps
                          </AppText>
                        </View>
                        <AppText className={cn('text-base font-semibold', done ? 'text-text-muted' : 'text-text-main')}>
                          {currentWeight ?? set.duration ?? '—'}
                        </AppText>
                      </Pressable>
                    );
                  })}
                </View>

                {/* Rest timer */}
                <View
                  className="mt-6 flex-row items-center justify-between py-5"
                  onLayout={(event) => { intervalYRef.current = seriesYRef.current + event.nativeEvent.layout.y; }}
                >
                  <View>
                    <AppText className="text-xs font-bold uppercase tracking-[0.2em] text-text-muted mb-1">Descanso</AppText>
                    <AppText className={cn('text-3xl font-bold', restRunning ? 'text-brand-secondary' : 'text-text-main')}>
                      {restRunning ? formatSeconds(restLeft) : formatSeconds(exercise.restSeconds)}
                    </AppText>
                  </View>
                  <Pressable
                    className={cn(
                      'h-12 px-6 items-center justify-center rounded-full',
                      restRunning ? 'bg-red-500/15' : 'bg-brand-primary/10',
                    )}
                    onPress={() => {
                      if (!workoutStarted) startWorkout();
                      setRestLeft(restRunning ? 0 : exercise.restSeconds);
                    }}
                  >
                    <AppText className={cn('text-sm font-bold', restRunning ? 'text-red-400' : 'text-brand-secondary')}>
                      {restRunning ? 'Parar' : 'Iniciar'}
                    </AppText>
                  </Pressable>
                </View>

                {/* Cue */}
                <AppText className="mt-4 text-base leading-relaxed text-text-muted">{exercise.cue}</AppText>
              </Animated.View>
            </>
          )}
        </ScrollView>

        {/* Bottom Bar */}
        <View className="absolute bottom-0 left-0 right-0 pb-8 pt-4 px-6" style={{ backgroundColor: isDark ? 'rgba(0,0,0,0.92)' : 'rgba(255,255,255,0.95)' }}>
          {/* Floating CTA above bar */}
          {viewMode === 'exercise' && !workoutFinished && (
            <Pressable
              className="mb-4 min-h-[52px] items-center justify-center rounded-2xl bg-brand-primary"
              onPress={handlePrimaryAction}
            >
              <AppText className="text-base font-bold text-white">{primaryActionLabel}</AppText>
            </Pressable>
          )}

          <View className="flex-row items-center justify-between">
            <Pressable className="h-12 w-12 items-center justify-center rounded-full bg-red-500/15" onPress={confirmCloseWorkout}>
              <X color={isDark ? '#FF6B6B' : '#EF4444'} size={20} weight="bold" />
            </Pressable>
            <Pressable className="items-center" onPress={toggleTimer}>
              <AppText className="text-2xl font-bold text-text-main">{formatSeconds(elapsed)}</AppText>
              <AppText className="mt-0.5 text-[10px] font-bold uppercase tracking-widest text-text-muted">
                {workoutFinished ? 'finalizado' : !workoutStarted ? 'toque para iniciar' : paused ? 'pausado' : 'rodando'}
              </AppText>
            </Pressable>
            <Pressable className="h-12 w-12 items-center justify-center rounded-full bg-bg-surface border border-border-subtle" onPress={toggleTimer}>
              {!workoutStarted || paused ? <Play color={isDark ? '#FFFFFF' : '#111827'} size={18} weight="fill" /> : <Pause color={isDark ? '#FFFFFF' : '#111827'} size={18} weight="fill" />}
            </Pressable>
          </View>
        </View>
      </SafeAreaView>

      {/* Set Editor Modal */}
      <Modal animationType="fade" transparent visible={Boolean(setEditor)} onRequestClose={() => setSetEditor(null)}>
        <KeyboardAvoidingView
          behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
          className="flex-1 justify-end"
          style={{ backgroundColor: 'rgba(0,0,0,0.6)' }}
          keyboardVerticalOffset={Platform.OS === 'ios' ? 18 : 0}
        >
          <Pressable className="flex-1" onPress={() => setSetEditor(null)} />
          <View className="mx-5 mb-5 rounded-[28px] bg-bg-surface px-6 py-6" style={{ borderWidth: 1, borderColor: isDark ? '#222222' : '#E5E7EB' }}>
            <AppText className="text-xs font-bold uppercase tracking-[0.2em] text-text-muted mb-2">Editar série</AppText>
            <AppText className="text-2xl font-bold text-text-main mb-6">Ajustar execução</AppText>

            <View className="flex-row gap-4 mb-6">
              <View className="flex-1">
                <AppText className="text-xs font-bold uppercase tracking-widest text-text-muted mb-2">Reps</AppText>
                <TextInput
                  autoFocus
                  className="h-14 rounded-xl bg-bg-base px-4 text-2xl font-semibold text-text-main"
                  style={{ borderWidth: 1, borderColor: isDark ? '#222222' : '#E5E7EB' }}
                  keyboardType="number-pad"
                  onChangeText={setRepsDraft}
                  placeholder="0"
                  placeholderTextColor={isDark ? '#555555' : '#9CA3AF'}
                  value={repsDraft}
                />
              </View>
              <View className="flex-1">
                <AppText className="text-xs font-bold uppercase tracking-widest text-text-muted mb-2">Peso (kg)</AppText>
                <TextInput
                  className="h-14 rounded-xl bg-bg-base px-4 text-2xl font-semibold text-text-main"
                  style={{ borderWidth: 1, borderColor: isDark ? '#222222' : '#E5E7EB' }}
                  keyboardType="decimal-pad"
                  onChangeText={setWeightDraft}
                  placeholder="—"
                  placeholderTextColor={isDark ? '#555555' : '#9CA3AF'}
                  value={weightDraft}
                />
              </View>
            </View>

            <View className="gap-2.5">
              <Pressable className="min-h-[50px] items-center justify-center rounded-2xl bg-brand-primary" onPress={() => applySetExecution('single')}>
                <AppText className="text-sm font-bold text-white">Só esta série</AppText>
              </Pressable>
              <Pressable
                className="min-h-[50px] items-center justify-center rounded-2xl bg-bg-base"
                style={{ borderWidth: 1, borderColor: isDark ? '#222222' : '#E5E7EB' }}
                onPress={() => applySetExecution('exercise-next')}
              >
                <AppText className="text-sm font-bold text-text-main">Esta e próximas séries</AppText>
              </Pressable>
              <Pressable
                className="min-h-[50px] items-center justify-center rounded-2xl bg-bg-base"
                style={{ borderWidth: 1, borderColor: isDark ? '#222222' : '#E5E7EB' }}
                onPress={() => applySetExecution('workout-next')}
              >
                <AppText className="text-sm font-bold text-text-main">Todos os próximos</AppText>
              </Pressable>
              <Pressable className="min-h-[44px] items-center justify-center" onPress={() => setSetEditor(null)}>
                <AppText className="text-sm font-semibold text-text-muted">Cancelar</AppText>
              </Pressable>
            </View>
          </View>
        </KeyboardAvoidingView>
      </Modal>
    </View>
  );
}
