import {
  Barbell,
  Bell,
  CalendarCheck,
  ChatCircleText,
  ClipboardText,
  EnvelopeSimple,
  FileText,
  ForkKnife,
  Gear,
  Heartbeat,
  IdentificationCard,
  LockKey,
  Medal,
  Note,
  Phone,
  Ruler,
  Scales,
  ShieldCheck,
  SignOut,
  TrendUp,
  Trophy,
  UserCircle,
} from 'phosphor-react-native';
import { router, type Href } from 'expo-router';
import { Alert, Pressable, View } from 'react-native';
import Animated, { FadeInDown } from 'react-native-reanimated';

import { useAuthStore } from '@/src/features/auth/services/auth.store';
import { AppButton } from '@/src/shared/components/ui/AppButton';
import { AppScreen } from '@/src/shared/components/ui/AppScreen';
import { AppText } from '@/src/shared/components/ui/AppText';
import { cn } from '@/src/shared/utils/cn';

import { ProfileActionRow } from '../components/ProfileActionRow';
import { ProfileAvatar } from '../components/ProfileAvatar';
import { ProfileInfoRow } from '../components/ProfileInfoRow';
import { ProfileMetricCard } from '../components/ProfileMetricCard';
import { useProfileStore } from '../services/profile.store';
import { getProfileStatus } from '../utils';

export function ProfileDashboardScreen() {
  const profile = useProfileStore((state) => state.profile);
  const clearSession = useAuthStore((state) => state.clearSession);
  const status = getProfileStatus(profile.plan.status);

  const handleSignOut = () => {
    Alert.alert('Sair da conta', 'Deseja encerrar sua sessão neste aparelho?', [
      { text: 'Cancelar', style: 'cancel' },
      {
        text: 'Sair',
        style: 'destructive',
        onPress: async () => {
          await clearSession();
          router.replace('/(public)/login');
        },
      },
    ]);
  };

  return (
    <AppScreen contentClassName="px-5 pb-36 pt-10">
      <Animated.View entering={FadeInDown.duration(420)}>
        <View className="mb-8 flex-row items-start justify-between gap-4">
          <View className="flex-1">
            <AppText className="text-sm text-text-muted">Science Club</AppText>
            <AppText className="mt-2 text-5xl font-semibold leading-tight text-text-main">Perfil</AppText>
          </View>
          <Pressable
            accessibilityRole="button"
            className="rounded-2xl border border-border-subtle bg-bg-surface px-4 py-3"
            onPress={() => router.push('/(app)/profile/preferences' as Href)}
          >
            <Gear color="#A78BFA" size={23} weight="duotone" />
          </Pressable>
        </View>

        <View className="mb-6 overflow-hidden rounded-[32px] border border-brand-primary/30 bg-bg-surface p-5">
          <View className="absolute -right-16 -top-20 h-48 w-48 rounded-full bg-brand-primary/20" />
          <View className="flex-row items-start gap-5">
            <ProfileAvatar name={profile.name} variant={profile.avatarVariant} />
            <View className="flex-1">
              <View className={cn('mb-3 self-start rounded-full border px-3 py-1.5', status.bg, status.border)}>
                <AppText className={cn('text-xs font-semibold', status.text)}>{status.label}</AppText>
              </View>
              <AppText className="text-3xl font-semibold leading-tight text-text-main">{profile.name}</AppText>
              <AppText className="mt-2 text-sm font-semibold text-brand-secondary">ID {profile.id}</AppText>
              <AppText className="mt-2 text-sm leading-snug text-text-muted">{profile.plan.name}</AppText>
            </View>
          </View>

          <View className="mt-7 flex-row gap-3">
            <View className="flex-1 rounded-[22px] border border-border-subtle bg-bg-base p-4">
              <CalendarCheck color="#A78BFA" size={21} weight="duotone" />
              <AppText className="mt-3 text-xs font-semibold text-text-muted">Próxima reavaliação</AppText>
              <AppText className="mt-1 text-base font-semibold text-text-main">{profile.plan.nextCheckIn}</AppText>
            </View>
            <View className="flex-1 rounded-[22px] border border-border-subtle bg-bg-base p-4">
              <Medal color="#A78BFA" size={21} weight="duotone" />
              <AppText className="mt-3 text-xs font-semibold text-text-muted">Ciclo atual</AppText>
              <AppText className="mt-1 text-base font-semibold text-text-main">{profile.plan.mesocycle}</AppText>
            </View>
          </View>
        </View>
      </Animated.View>

      <Animated.View entering={FadeInDown.delay(80).duration(420)} className="mb-7">
        <View className="mb-4 flex-row items-center justify-between">
          <AppText className="text-2xl font-semibold text-text-main">Seu ciclo atual</AppText>
          <AppText className="text-sm text-text-muted">{profile.plan.objective}</AppText>
        </View>
        <View className="rounded-[28px] border border-border-subtle bg-bg-surface p-5">
          <View className="mb-5 flex-row gap-3">
            <PlanMiniCard icon={Barbell} label="Treino" value={profile.currentWorkout} />
            <PlanMiniCard icon={ForkKnife} label="Dieta" value={profile.currentDiet} />
          </View>
          <View className="gap-4">
            <ProfileInfoRow icon={UserCircle} label="Responsável" value={`${profile.coach.name} · ${profile.coach.role}`} />
            <ProfileInfoRow icon={CalendarCheck} label="Contrato" value={`${profile.plan.startDate} até ${profile.plan.renewalDate}`} />
            <ProfileInfoRow icon={Trophy} label="Objetivo oficial" value={profile.plan.objective} />
          </View>
        </View>
      </Animated.View>

      <Animated.View entering={FadeInDown.delay(120).duration(420)} className="mb-7">
        <View className="mb-4 flex-row items-center justify-between">
          <AppText className="text-2xl font-semibold text-text-main">Resumo do aluno</AppText>
          <AppText className="text-sm text-brand-secondary">{profile.metrics.adherence}% aderência</AppText>
        </View>
        <View className="mb-3 flex-row gap-3">
          <ProfileMetricCard caption="concluídos" icon={Barbell} label="treinos" value={String(profile.metrics.workoutsDone)} />
          <ProfileMetricCard caption="registradas" icon={ClipboardText} label="séries válidas" tone="success" value={String(profile.metrics.validSets)} />
        </View>
        <View className="flex-row gap-3">
          <ProfileMetricCard caption="último bloco" icon={TrendUp} label="volume" tone="neutral" value={profile.metrics.totalVolume} />
          <ProfileMetricCard caption="cargas/reps" icon={Trophy} label="progressões" tone="warning" value={String(profile.metrics.progressions)} />
        </View>
      </Animated.View>

      <Animated.View entering={FadeInDown.delay(160).duration(420)} className="mb-7">
        <AppText className="mb-4 text-2xl font-semibold text-text-main">Dados oficiais</AppText>
        <View className="rounded-[28px] border border-border-subtle bg-bg-surface p-5">
          <View className="mb-4 rounded-2xl border border-brand-primary/20 bg-brand-primary/10 p-4">
            <AppText className="text-sm font-semibold text-brand-secondary">Somente leitura</AppText>
            <AppText className="mt-1 text-sm leading-snug text-text-soft">
              Medidas, objetivo e restrições são atualizados pela equipe nas avaliações.
            </AppText>
          </View>
          <View className="mb-4 flex-row gap-3">
            <BodyMiniCard icon={Scales} label="Peso" value={`${profile.body.weightKg}kg`} />
            <BodyMiniCard icon={Ruler} label="Altura" value={`${profile.body.heightCm}cm`} />
          </View>
          <View className="mb-4 flex-row gap-3">
            <BodyMiniCard icon={Heartbeat} label="BF" value={`${profile.body.bodyFatPercent}%`} />
            <BodyMiniCard icon={IdentificationCard} label="Idade" value={`${profile.body.age} anos`} />
          </View>
          <ProfileInfoRow icon={Note} label="Observações" value={profile.observations} />
          <View className="mt-4 flex-row flex-wrap gap-2">
            {profile.restrictions.map((restriction) => (
              <View key={restriction} className="rounded-full border border-border-subtle bg-bg-base px-3 py-1.5">
                <AppText className="text-xs font-semibold text-text-soft">{restriction}</AppText>
              </View>
            ))}
          </View>
        </View>
      </Animated.View>

      <Animated.View entering={FadeInDown.delay(200).duration(420)} className="mb-7">
        <AppText className="mb-4 text-2xl font-semibold text-text-main">Contato e conta</AppText>
        <View className="gap-3">
          <ProfileActionRow
            description={`${profile.phone} · ${profile.city}`}
            icon={Phone}
            title="Editar contato"
            onPress={() => router.push('/(app)/profile/edit-contact' as Href)}
          />
          <ProfileActionRow
            description={profile.email}
            icon={EnvelopeSimple}
            title="Email de acesso"
            value="fixo"
            onPress={() => Alert.alert('Email de acesso', 'O email é o identificador da sua conta. Peça alteração ao suporte.')}
          />
          <ProfileActionRow
            description="Notificações, privacidade e canal preferido."
            icon={LockKey}
            title="Preferências"
            onPress={() => router.push('/(app)/profile/preferences' as Href)}
          />
        </View>
      </Animated.View>

      <Animated.View entering={FadeInDown.delay(240).duration(420)} className="mb-7">
        <AppText className="mb-4 text-2xl font-semibold text-text-main">Equipe Science Club</AppText>
        <View className="rounded-[28px] border border-border-subtle bg-bg-surface p-5">
          <View className="mb-5 flex-row items-center gap-4">
            <View className="h-14 w-14 items-center justify-center rounded-2xl bg-brand-primary/12">
              <ShieldCheck color="#A78BFA" size={28} weight="duotone" />
            </View>
            <View className="flex-1">
              <AppText className="text-xl font-semibold text-text-main">{profile.coach.name}</AppText>
              <AppText className="mt-1 text-sm text-text-muted">{profile.coach.responseTime}</AppText>
            </View>
          </View>
          <AppButton
            variant="secondary"
            leftIcon={<ChatCircleText color="#A78BFA" size={20} weight="bold" />}
            onPress={() => Alert.alert('Mensagem enviada', 'Este é um mock. A mensagem real será integrada ao chat/suporte depois.')}
          >
            Enviar mensagem
          </AppButton>
        </View>
      </Animated.View>

      <Animated.View entering={FadeInDown.delay(280).duration(420)} className="mb-8 gap-3">
        <AppText className="mb-1 text-2xl font-semibold text-text-main">Documentos</AppText>
        <ProfileActionRow
          description="Contrato, plano, exames e termos vinculados."
          icon={FileText}
          title="Abrir documentos"
          value={`${profile.documents.length}`}
          onPress={() => router.push('/(app)/profile/documents' as Href)}
        />
        <ProfileActionRow
          description="Ajuda com acesso, plano ou dúvidas técnicas."
          icon={Bell}
          title="Suporte"
          onPress={() => Alert.alert('Suporte', 'Pedido de suporte registrado no mock.')}
        />
        <ProfileActionRow
          destructive
          description="Encerrar sessão neste aparelho."
          icon={SignOut}
          title="Sair da conta"
          onPress={handleSignOut}
        />
      </Animated.View>

      <AppText className="pb-3 text-center text-xs text-text-muted">Science Club App · v1.0.0</AppText>
    </AppScreen>
  );
}

function PlanMiniCard({ icon: Icon, label, value }: { icon: typeof Barbell; label: string; value: string }) {
  return (
    <View className="flex-1 rounded-[22px] border border-border-subtle bg-bg-base p-4">
      <Icon color="#A78BFA" size={22} weight="duotone" />
      <AppText className="mt-3 text-xs font-semibold text-text-muted">{label}</AppText>
      <AppText className="mt-1 text-sm font-semibold leading-snug text-text-main">{value}</AppText>
    </View>
  );
}

function BodyMiniCard({ icon: Icon, label, value }: { icon: typeof Scales; label: string; value: string }) {
  return (
    <View className="flex-1 rounded-[20px] border border-border-subtle bg-bg-base p-4">
      <Icon color="#C4C4CC" size={20} weight="duotone" />
      <AppText className="mt-2 text-xs font-semibold text-text-muted">{label}</AppText>
      <AppText className="mt-1 text-xl font-semibold text-text-main">{value}</AppText>
    </View>
  );
}
