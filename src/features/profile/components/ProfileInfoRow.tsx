import type { Icon } from 'phosphor-react-native';
import { View } from 'react-native';

import { AppText } from '@/src/shared/components/ui/AppText';

type ProfileInfoRowProps = {
  icon?: Icon;
  label: string;
  value: string;
};

export function ProfileInfoRow({ icon: Icon, label, value }: ProfileInfoRowProps) {
  return (
    <View className="flex-row items-start gap-3 border-t border-border-subtle pt-4">
      {Icon ? (
        <View className="h-10 w-10 items-center justify-center rounded-2xl bg-bg-base">
          <Icon color="#A78BFA" size={19} weight="duotone" />
        </View>
      ) : null}
      <View className="flex-1">
        <AppText className="text-xs font-semibold text-text-muted">{label}</AppText>
        <AppText className="mt-1 text-base font-semibold leading-snug text-text-main">{value}</AppText>
      </View>
    </View>
  );
}
