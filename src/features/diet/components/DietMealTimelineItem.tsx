import { CheckCircle, CircleIcon, ForkKnife, MinusCircle, WarningCircle } from 'phosphor-react-native';
import { Pressable, View } from 'react-native';

import { AppText } from '@/src/shared/components/ui/AppText';
import { cn } from '@/src/shared/utils/cn';

import { DietMeal, MealStatus } from '../types';
import { getMealTotal, getStatusLabel } from '../utils';

type DietMealTimelineItemProps = {
  meal: DietMeal;
  status: MealStatus;
  active?: boolean;
  onPress: () => void;
};

const statusIcon = {
  pending: CircleIcon,
  partial: WarningCircle,
  done: CheckCircle,
  skipped: MinusCircle,
};

const statusColor = {
  pending: '#71717A',
  partial: '#FBBF24',
  done: '#22C55E',
  skipped: '#A1A1AA',
};

export function DietMealTimelineItem({ meal, status, active, onPress }: DietMealTimelineItemProps) {
  const Icon = statusIcon[status];
  const total = getMealTotal(meal);

  return (
    <Pressable
      accessibilityRole="button"
      className={cn(
        'flex-row items-center rounded-[24px] border px-4 py-4',
        active ? 'border-brand-primary bg-brand-primary/10' : 'border-border-subtle bg-bg-surface',
      )}
      onPress={onPress}
    >
      <View className="h-12 w-12 items-center justify-center rounded-2xl bg-bg-base">
        <ForkKnife color={active ? '#A78BFA' : '#8A8D99'} size={22} weight="duotone" />
      </View>
      <View className="ml-4 flex-1">
        <View className="flex-row items-center gap-2">
          <AppText className="text-lg font-semibold text-text-main">{meal.name}</AppText>
          <Icon color={statusColor[status]} size={16} weight={status === 'pending' ? 'regular' : 'fill'} />
        </View>
        <AppText className="mt-1 text-sm text-text-muted">
          {meal.time} - {Math.round(total.calories)} kcal - {getStatusLabel(status)}
        </AppText>
      </View>
    </Pressable>
  );
}
