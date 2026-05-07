import type { Icon } from 'phosphor-react-native';
import { View } from 'react-native';

import { AppText } from '@/src/shared/components/ui/AppText';

type ProfileMetricCardProps = {
  icon: Icon;
  label: string;
  value: string;
  caption: string;
  tone?: 'brand' | 'success' | 'warning' | 'neutral';
};

export function ProfileMetricCard({ caption, icon: Icon, label, tone = 'brand', value }: ProfileMetricCardProps) {
  const color = tone === 'success' ? '#34D399' : tone === 'warning' ? '#FCD34D' : tone === 'neutral' ? '#C4C4CC' : '#A78BFA';

  return (
    <View className="flex-1 rounded-[24px] border border-border-subtle bg-bg-surface p-4">
      <Icon color={color} size={23} weight="duotone" />
      <AppText className="mt-4 text-2xl font-semibold text-text-main">{value}</AppText>
      <AppText className="mt-1 text-xs font-semibold text-text-muted">{label}</AppText>
      <AppText className="mt-1 text-xs text-text-muted">{caption}</AppText>
    </View>
  );
}
