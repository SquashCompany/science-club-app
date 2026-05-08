import { CalendarCheck, ChartPieSlice, Clock, SealCheck, WarningCircle } from 'phosphor-react-native';
import { router, type Href } from 'expo-router';
import { useMemo, useState } from 'react';
import { Pressable, View, ActivityIndicator } from 'react-native';
import Animated, { FadeInDown } from 'react-native-reanimated';
import { useQuery } from '@tanstack/react-query';

import { AppScreen } from '@/src/shared/components/ui/AppScreen';
import { AppText } from '@/src/shared/components/ui/AppText';
import { cn } from '@/src/shared/utils/cn';
import { useAuthStore } from '@/src/features/auth/services/auth.store';

import { AssessmentCard } from '../components/AssessmentCard';
import { createAssessmentDraft, useAssessmentsStore } from '../services/assessments.store';
import { AssessmentFilter } from '../types';
import { getAssessmentProgress, getStatusLabel, getStatusTone } from '../utils';
import { getStudentEvaluations } from '../api/assessments';

const filters: { label: string; value: AssessmentFilter }[] = [
  { label: 'Pendentes', value: 'pending' },
  { label: 'Em analise', value: 'analysis' },
  { label: 'Concluidas', value: 'done' },
  { label: 'Todas', value: 'all' },
];

export function AssessmentsDashboardScreen() {
  const [filter, setFilter] = useState<AssessmentFilter>('pending');
  const { session } = useAuthStore();
  const drafts = useAssessmentsStore((state) => state.drafts);

  const { data: assessments = [], isLoading } = useQuery({
    queryKey: ['assessments'],
    queryFn: () => getStudentEvaluations(session?.token!),
    enabled: !!session?.token,
  });

  const urgentAssessment = useMemo(
    () =>
      assessments.find((assessment) => assessment.status === 'overdue') ??
      assessments.find((assessment) => assessment.status === 'pending') ??
      assessments.find((assessment) => assessment.status === 'scheduled') ??
      assessments[0],
    [assessments],
  );

  const filteredAssessments = useMemo(
    () =>
      assessments.filter((assessment) => {
        if (filter === 'all') return true;
        if (filter === 'done') return assessment.status === 'done';
        if (filter === 'analysis') return ['received', 'analysis', 'answered'].includes(assessment.status);
        return ['pending', 'sent', 'scheduled', 'overdue'].includes(assessment.status);
      }),
    [assessments, filter],
  );

  const pendingCount = assessments.filter((item) => ['pending', 'sent', 'scheduled', 'overdue'].includes(item.status)).length;
  const analysisCount = assessments.filter((item) => ['received', 'analysis', 'answered'].includes(item.status)).length;
  const doneCount = assessments.filter((item) => item.status === 'done').length;

  const urgentDraft = urgentAssessment ? (drafts[urgentAssessment.id] ?? createAssessmentDraft(urgentAssessment as any)) : null;
  const urgentTone = urgentAssessment ? getStatusTone(urgentAssessment.status) : null;

  if (isLoading) {
    return (
      <AppScreen contentClassName="items-center justify-center">
        <ActivityIndicator size="large" color="#A78BFA" />
      </AppScreen>
    );
  }

  return (
    <AppScreen contentClassName="px-5 pb-36 pt-10">
      <Animated.View entering={FadeInDown.duration(420)}>
        <View className="mb-8 flex-row items-start justify-between gap-4">
          <View className="flex-1">
            <AppText className="text-sm text-text-muted">Science Club</AppText>
            <AppText className="mt-2 text-5xl font-semibold leading-tight text-text-main">Avaliações</AppText>
          </View>
          <View className="rounded-2xl border border-border-subtle bg-bg-surface px-4 py-3">
            <ChartPieSlice color="#A78BFA" size={23} weight="duotone" />
          </View>
        </View>

        {urgentAssessment && urgentTone && urgentDraft && (
          <Pressable
            accessibilityRole="button"
            className="mb-6 overflow-hidden rounded-[32px] border border-brand-primary/35 bg-bg-surface p-5"
            onPress={() => router.push(`/(app)/assessments/${urgentAssessment.id}` as Href)}
          >
            <View className="absolute -right-16 -top-20 h-48 w-48 rounded-full bg-brand-primary/20" />
            <View className="mb-7 flex-row items-center justify-between">
              <View className={cn('rounded-full border px-3 py-1.5', urgentTone.bg, urgentTone.border)}>
                <AppText className={cn('text-xs font-semibold', urgentTone.text)}>{getStatusLabel(urgentAssessment.status)}</AppText>
              </View>
              <AppText className="text-sm font-semibold text-text-muted">{getAssessmentProgress(urgentAssessment as any, urgentDraft)}% enviado</AppText>
            </View>

            <AppText className="text-3xl font-semibold leading-tight text-text-main">{urgentAssessment.title}</AppText>
            <AppText className="mt-3 text-base leading-snug text-text-soft">
              {urgentAssessment.status === 'answered' || urgentAssessment.status === 'done'
                ? 'Parecer entregue. Veja os ajustes e proximos passos.'
                : 'Sua equipe precisa dessas informacoes para ajustar treino, dieta e estrategia.'}
            </AppText>

            <View className="mt-7 flex-row gap-3">
              <MetricPill icon={CalendarCheck} label="Prazo" value="10 dias" />
              <MetricPill icon={Clock} label="Status" value={getStatusLabel(urgentAssessment.status)} />
            </View>
          </Pressable>
        )}

        <View className="mb-5 flex-row gap-3">
          <SummaryCard icon={WarningCircle} label="pendentes" value={String(pendingCount)} tone="warning" />
          <SummaryCard icon={Clock} label="em analise" value={String(analysisCount)} />
          <SummaryCard icon={SealCheck} label="concluidas" value={String(doneCount)} tone="success" />
        </View>

        <View className="mb-6 rounded-[28px] border border-border-subtle bg-bg-surface p-5">
          <View className="mb-5 flex-row items-center justify-between">
            <View>
              <AppText className="text-xl font-semibold text-text-main">Comparativo corporal</AppText>
              <AppText className="mt-1 text-sm text-text-muted">Ultima reavaliacao vs atual</AppText>
            </View>
            <View className="rounded-full bg-brand-primary/10 px-3 py-1.5">
              <AppText className="text-xs font-semibold text-brand-secondary">visual</AppText>
            </View>
          </View>
          <View className="gap-4">
            <ComparisonRow label="Peso" previous="--" current="--" progress={0} />
            <ComparisonRow label="Cintura" previous="--" current="--" progress={0} />
            <ComparisonRow label="Fotos enviadas" previous="--" current="--" progress={0} />
          </View>
        </View>

        <View className="mb-6 flex-row gap-2">
          {filters.map((item) => (
            <Pressable
              key={item.value}
              accessibilityRole="button"
              className={cn(
                'min-h-[42px] flex-1 items-center justify-center rounded-2xl border px-2',
                filter === item.value ? 'border-brand-primary bg-brand-primary/15' : 'border-border-subtle bg-bg-surface',
              )}
              onPress={() => setFilter(item.value)}
            >
              <AppText className={cn('text-xs font-semibold', filter === item.value ? 'text-brand-secondary' : 'text-text-muted')}>
                {item.label}
              </AppText>
            </Pressable>
          ))}
        </View>
      </Animated.View>

      <Animated.View entering={FadeInDown.delay(100).duration(420)}>
        <View className="mb-4 flex-row items-center justify-between">
          <AppText className="text-2xl font-semibold text-text-main">Ciclos de avaliação</AppText>
          <AppText className="text-sm text-text-muted">{filteredAssessments.length} itens</AppText>
        </View>

        <View className="gap-4">
          {filteredAssessments.map((assessment) => (
            <AssessmentCard
              key={assessment.id}
              assessment={assessment as any}
              draft={drafts[assessment.id] ?? createAssessmentDraft(assessment as any)}
              onPress={() => router.push(`/(app)/assessments/${assessment.id}` as Href)}
            />
          ))}
          {filteredAssessments.length === 0 && (
              <AppText className="text-center text-text-soft py-10">Nenhuma avaliação encontrada.</AppText>
          )}
        </View>
      </Animated.View>
    </AppScreen>
  );
}

function ComparisonRow({
  current,
  label,
  previous,
  progress,
}: {
  current: string;
  label: string;
  previous: string;
  progress: number;
}) {
  return (
    <View>
      <View className="mb-2 flex-row items-center justify-between">
        <AppText className="text-sm font-semibold text-text-main">{label}</AppText>
        <AppText className="text-xs text-text-muted">{previous} para {current}</AppText>
      </View>
      <View className="h-2 overflow-hidden rounded-full bg-bg-base">
        <View className="h-full rounded-full bg-brand-primary" style={{ width: `${progress}%` }} />
      </View>
    </View>
  );
}

function MetricPill({
  icon: Icon,
  label,
  value,
}: {
  icon: typeof CalendarCheck;
  label: string;
  value: string;
}) {
  return (
    <View className="flex-1 rounded-[22px] border border-border-subtle bg-bg-base p-4">
      <Icon color="#A78BFA" size={21} weight="duotone" />
      <AppText className="mt-3 text-xs font-semibold text-text-muted">{label}</AppText>
      <AppText className="mt-1 text-base font-semibold text-text-main">{value}</AppText>
    </View>
  );
}

function SummaryCard({
  icon: Icon,
  label,
  value,
  tone = 'brand',
}: {
  icon: typeof WarningCircle;
  label: string;
  value: string;
  tone?: 'brand' | 'success' | 'warning';
}) {
  const color = tone === 'success' ? '#34D399' : tone === 'warning' ? '#FCD34D' : '#A78BFA';

  return (
    <View className="flex-1 rounded-[22px] border border-border-subtle bg-bg-surface p-4">
      <Icon color={color} size={22} weight="duotone" />
      <AppText className="mt-3 text-2xl font-semibold text-text-main">{value}</AppText>
      <AppText className="mt-1 text-xs font-semibold text-text-muted">{label}</AppText>
    </View>
  );
}
