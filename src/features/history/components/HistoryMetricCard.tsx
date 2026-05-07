import { Icon } from 'phosphor-react-native';
import { View } from 'react-native';

import { AppText } from '@/src/shared/components/ui/AppText';

type HistoryMetricCardProps = {
  icon: Icon;
  label: string;
  value: string;
  caption: string;
  tone?: 'primary' | 'success' | 'warning' | 'neutral';
};

const toneMap = {
  primary: { bg: 'bg-brand-primary/12', color: '#A78BFA' },
  success: { bg: 'bg-emerald-400/10', color: '#34D399' },
  warning: { bg: 'bg-amber-300/10', color: '#FCD34D' },
  neutral: { bg: 'bg-bg-base', color: '#A1A1AA' },
};

export function HistoryMetricCard({ icon: IconComponent, label, value, caption, tone = 'primary' }: HistoryMetricCardProps) {
  const toneConfig = toneMap[tone];

  return (
    <View className="flex-1 rounded-[22px] border border-border-subtle bg-bg-surface px-4 py-4">
      <View className={`h-10 w-10 items-center justify-center rounded-2xl ${toneConfig.bg}`}>
        <IconComponent color={toneConfig.color} size={20} weight="duotone" />
      </View>
      <AppText className="mt-4 text-2xl font-semibold text-text-main">{value}</AppText>
      <AppText className="mt-1 text-xs font-semibold text-text-muted">{label}</AppText>
      <AppText className="mt-2 text-xs leading-snug text-text-muted">{caption}</AppText>
    </View>
  );
}
