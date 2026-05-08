import { memo } from 'react';
import { Barbell, PersonSimpleRun, PersonSimpleTaiChi } from 'phosphor-react-native';
import { View } from 'react-native';

import { cn } from '@/src/shared/utils/cn';

type ExerciseVisualProps = {
  isDark: boolean;
  muscle: string;
  size?: 'sm' | 'lg';
  muted?: boolean;
};

const muscleColor: Record<string, string> = {
  Abdomen: '#8B5CF6',
  Core: '#8B5CF6',
  Quadriceps: '#F59E0B',
  Pernas: '#F59E0B',
  Dorsais: '#38BDF8',
  Biceps: '#A78BFA',
  Triceps: '#C084FC',
  Peitoral: '#FF6B9A',
  Posterior: '#FFB86B',
  Ombros: '#7DD3FC',
  Gluteos: '#FB7185',
  Panturrilhas: '#FCD34D',
};

function ExerciseVisualComponent({ muscle, muted, size = 'sm', isDark }: ExerciseVisualProps) {
  const accent = muscleColor[muscle] ?? '#8B5CF6';
  const Icon = muscle === 'Core' || muscle === 'Abdomen' ? PersonSimpleTaiChi : muscle === 'Pernas' || muscle === 'Quadriceps' ? PersonSimpleRun : Barbell;

  if (size === 'sm') {
    return null; // No longer used in list items
  }

  return (
    <View className="items-center justify-center h-48 w-full mb-4">
      <View
        className="items-center justify-center rounded-full h-40 w-40"
        style={{
          backgroundColor: `${accent}12`,
        }}
      >
        <View
          className="absolute rounded-full h-20 w-20"
          style={{ backgroundColor: `${accent}25` }}
        />
        <Icon
          color={muted ? (isDark ? '#6B7280' : '#9CA3AF') : accent}
          size={100}
          weight="duotone"
        />
      </View>
    </View>
  );
}

export const ExerciseVisual = memo(
  ExerciseVisualComponent,
  (prevProps, nextProps) =>
    prevProps.isDark === nextProps.isDark &&
    prevProps.muscle === nextProps.muscle &&
    prevProps.muted === nextProps.muted &&
    prevProps.size === nextProps.size,
);
