import { View } from 'react-native';

import { AppText } from '@/src/shared/components/ui/AppText';
import { cn } from '@/src/shared/utils/cn';

import { getProgressPercent } from '../utils';

type MacroProgressProps = {
  label: string;
  value: number;
  target: number;
  unit?: string;
  tone?: 'protein' | 'carbs' | 'fat' | 'calories' | 'water';
};

const toneClasses = {
  protein: 'bg-sky-400',
  carbs: 'bg-amber-300',
  fat: 'bg-rose-400',
  calories: 'bg-brand-primary',
  water: 'bg-cyan-300',
};

export function MacroProgress({ label, value, target, unit = 'g', tone = 'calories' }: MacroProgressProps) {
  const percent = getProgressPercent(value, target);

  return (
    <View>
      <View className="mb-2 flex-row items-baseline justify-between">
        <AppText className="text-sm font-semibold text-text-main">{label}</AppText>
        <AppText className="text-xs text-text-muted">
          {Math.round(value)}
          {unit} / {target}
          {unit}
        </AppText>
      </View>
      <View className="h-2 overflow-hidden rounded-full bg-bg-base">
        <View className={cn('h-full rounded-full', toneClasses[tone])} style={{ width: `${percent}%` }} />
      </View>
    </View>
  );
}
