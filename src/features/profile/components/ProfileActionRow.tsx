import { CaretRight } from 'phosphor-react-native';
import type { Icon } from 'phosphor-react-native';
import { Pressable, View } from 'react-native';

import { AppText } from '@/src/shared/components/ui/AppText';
import { cn } from '@/src/shared/utils/cn';

type ProfileActionRowProps = {
  icon: Icon;
  title: string;
  description: string;
  value?: string;
  destructive?: boolean;
  onPress: () => void;
};

export function ProfileActionRow({ description, destructive, icon: Icon, onPress, title, value }: ProfileActionRowProps) {
  const color = destructive ? '#FCA5A5' : '#A78BFA';

  return (
    <Pressable
      accessibilityRole="button"
      className="flex-row items-center rounded-[24px] border border-border-subtle bg-bg-surface p-4"
      onPress={onPress}
    >
      <View className={cn('h-12 w-12 items-center justify-center rounded-2xl', destructive ? 'bg-red-500/10' : 'bg-brand-primary/12')}>
        <Icon color={color} size={23} weight="duotone" />
      </View>
      <View className="ml-4 flex-1">
        <AppText className={cn('text-base font-semibold', destructive ? 'text-red-200' : 'text-text-main')}>{title}</AppText>
        <AppText className="mt-1 text-sm leading-snug text-text-muted">{description}</AppText>
      </View>
      {value ? <AppText className="mr-2 text-xs font-semibold text-text-muted">{value}</AppText> : null}
      <CaretRight color={destructive ? '#FCA5A5' : '#71717A'} size={18} weight="bold" />
    </Pressable>
  );
}
