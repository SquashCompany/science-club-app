import { Camera } from 'phosphor-react-native';
import { Pressable, View } from 'react-native';

import { AppText } from '@/src/shared/components/ui/AppText';

const avatarPalettes = [
  'bg-brand-primary',
  'bg-cyan-400',
  'bg-emerald-400',
  'bg-amber-300',
];

type ProfileAvatarProps = {
  name: string;
  variant: number;
  editable?: boolean;
  onPress?: () => void;
};

export function ProfileAvatar({ name, variant, editable, onPress }: ProfileAvatarProps) {
  const initials = name
    .split(' ')
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0])
    .join('');
  const colorClass = avatarPalettes[(variant - 1) % avatarPalettes.length] ?? avatarPalettes[0];

  return (
    <Pressable
      accessibilityRole={editable ? 'button' : undefined}
      disabled={!editable}
      className="relative h-28 w-28 items-center justify-center rounded-[32px] border border-white/10 bg-bg-surface p-1"
      onPress={onPress}
    >
      <View className={`h-full w-full items-center justify-center rounded-[28px] ${colorClass}`}>
        <View className="absolute inset-0 rounded-[28px] bg-black/10" />
        <AppText className="text-4xl font-semibold text-white">{initials}</AppText>
      </View>
      {editable && (
        <View className="absolute -bottom-2 -right-2 h-11 w-11 items-center justify-center rounded-2xl border border-border-subtle bg-bg-base">
          <Camera color="#A78BFA" size={20} weight="duotone" />
        </View>
      )}
    </Pressable>
  );
}
