import { ArrowLeft, Camera, MapPin, Phone } from 'phosphor-react-native';
import { router } from 'expo-router';
import { useState } from 'react';
import { Pressable, TextInput, View } from 'react-native';
import Animated, { FadeInDown } from 'react-native-reanimated';

import { AppButton } from '@/src/shared/components/ui/AppButton';
import { AppScreen } from '@/src/shared/components/ui/AppScreen';
import { AppText } from '@/src/shared/components/ui/AppText';

import { ProfileAvatar } from '../components/ProfileAvatar';
import { useProfileStore } from '../services/profile.store';

export function ProfileEditContactScreen() {
  const profile = useProfileStore((state) => state.profile);
  const updateContact = useProfileStore((state) => state.updateContact);
  const cycleAvatar = useProfileStore((state) => state.cycleAvatar);
  const [phone, setPhone] = useState(profile.phone);
  const [city, setCity] = useState(profile.city);

  const handleSave = () => {
    updateContact({ phone, city });
    router.back();
  };

  return (
    <AppScreen contentClassName="px-5 pb-12 pt-5">
      <Animated.View entering={FadeInDown.duration(420)}>
        <Pressable accessibilityRole="button" className="mb-8 h-12 w-12 items-center justify-center rounded-2xl bg-bg-surface" onPress={() => router.back()}>
          <ArrowLeft color="#FFFFFF" size={22} weight="bold" />
        </Pressable>

        <View className="mb-7 rounded-[32px] border border-border-subtle bg-bg-surface p-5">
          <View className="items-center">
            <ProfileAvatar editable name={profile.name} variant={profile.avatarVariant} onPress={cycleAvatar} />
            <AppText className="mt-5 text-3xl font-semibold text-text-main">Contato básico</AppText>
            <AppText className="mt-2 text-center text-sm leading-snug text-text-muted">
              Esses dados ajudam a equipe a falar com você. Plano, medidas e objetivo seguem oficiais pela gestão.
            </AppText>
          </View>
        </View>
      </Animated.View>

      <Animated.View entering={FadeInDown.delay(80).duration(420)} className="gap-4">
        <ContactField icon={Phone} label="Telefone / WhatsApp" value={phone} onChangeText={setPhone} keyboardType="phone-pad" />
        <ContactField icon={MapPin} label="Cidade ou endereço resumido" value={city} onChangeText={setCity} />
      </Animated.View>

      <Animated.View entering={FadeInDown.delay(140).duration(420)} className="mt-8">
        <AppButton leftIcon={<Camera color="#FFFFFF" size={20} weight="bold" />} onPress={handleSave}>
          Salvar contato
        </AppButton>
      </Animated.View>
    </AppScreen>
  );
}

function ContactField({
  icon: Icon,
  keyboardType,
  label,
  onChangeText,
  value,
}: {
  icon: typeof Phone;
  keyboardType?: 'default' | 'phone-pad';
  label: string;
  onChangeText: (value: string) => void;
  value: string;
}) {
  return (
    <View className="rounded-[24px] border border-border-subtle bg-bg-surface p-4">
      <View className="mb-3 flex-row items-center gap-3">
        <View className="h-10 w-10 items-center justify-center rounded-2xl bg-brand-primary/12">
          <Icon color="#A78BFA" size={20} weight="duotone" />
        </View>
        <AppText className="flex-1 text-base font-semibold text-text-main">{label}</AppText>
      </View>
      <TextInput
        className="min-h-[58px] rounded-2xl border border-border-subtle bg-bg-base px-4 font-sans text-base text-text-main"
        keyboardType={keyboardType ?? 'default'}
        onChangeText={onChangeText}
        placeholder="Digite aqui"
        placeholderTextColor="#71717A"
        returnKeyType="done"
        value={value}
      />
    </View>
  );
}
