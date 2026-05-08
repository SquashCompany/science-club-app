import { memo } from 'react';
import { CheckCircle, CaretRight } from 'phosphor-react-native';
import { Pressable, View } from 'react-native';

import { AppText } from '@/src/shared/components/ui/AppText';
import { cn } from '@/src/shared/utils/cn';

import type { WorkoutExercise } from '../data/workoutSheets';

type WorkoutExerciseListItemProps = {
  exercise: WorkoutExercise;
  completedSets?: number;
  isDark: boolean;
  onPress?: () => void;
};

function WorkoutExerciseListItemComponent({
  exercise,
  completedSets = 0,
  isDark,
  onPress,
}: WorkoutExerciseListItemProps) {
  const done = completedSets >= exercise.sets.length;
  const partial = completedSets > 0 && !done;
  const setTarget = exercise.sets[0];
  const prescription = setTarget?.duration ?? `${setTarget?.reps ?? '-'} reps`;

  return (
    <Pressable
      accessibilityRole="button"
      className="flex-row items-center py-4"
      style={{ borderBottomWidth: 1, borderBottomColor: isDark ? '#1A1A1A' : '#F3F4F6' }}
      onPress={onPress}
    >
      {/* Status indicator */}
      <View className={cn(
        'h-9 w-9 items-center justify-center rounded-full mr-4',
        done ? 'bg-brand-primary' : partial ? 'bg-amber-400/15' : 'bg-bg-surface border border-border-subtle',
      )}>
        {done ? (
          <CheckCircle color="#FFFFFF" size={18} weight="bold" />
        ) : (
          <AppText className={cn('text-sm font-bold', partial ? 'text-amber-400' : 'text-text-muted')}>
            {exercise.sets.length}
          </AppText>
        )}
      </View>

      <View className="flex-1">
        <AppText className={cn('text-base font-semibold text-text-main', done && 'text-text-muted line-through')}>
          {exercise.name}
        </AppText>
        <AppText className="mt-0.5 text-sm text-text-muted">
          {exercise.sets.length}×{prescription}{setTarget?.weight ? ` • ${setTarget.weight}` : ''}
        </AppText>
      </View>

      {partial && (
        <AppText className="text-xs font-semibold text-amber-400 mr-3">
          {completedSets}/{exercise.sets.length}
        </AppText>
      )}

      {!done && onPress && (
        <CaretRight color={isDark ? '#555555' : '#9CA3AF'} size={16} weight="bold" />
      )}
    </Pressable>
  );
}

export const WorkoutExerciseListItem = memo(
  WorkoutExerciseListItemComponent,
  (prevProps, nextProps) =>
    prevProps.exercise === nextProps.exercise &&
    prevProps.completedSets === nextProps.completedSets &&
    prevProps.isDark === nextProps.isDark,
);
