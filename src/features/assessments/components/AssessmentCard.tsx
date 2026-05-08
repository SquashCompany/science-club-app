import { CalendarCheck, CaretRight, ClipboardText, UserCircle } from 'phosphor-react-native';
import { Pressable, View } from 'react-native';

import { AppText } from '@/src/shared/components/ui/AppText';
import { cn } from '@/src/shared/utils/cn';

import { Assessment, AssessmentDraft } from '../types';
import { getAssessmentProgress, getStatusLabel, getStatusTone } from '../utils';

type AssessmentCardProps = {
  assessment: Assessment;
  draft: AssessmentDraft;
  onPress: () => void;
};

export function AssessmentCard({ assessment, draft, onPress }: AssessmentCardProps) {
  const tone = getStatusTone(assessment.status);
  const progress = getAssessmentProgress(assessment, draft);

  return (
    <Pressable
      accessibilityRole="button"
      className="overflow-hidden rounded-[28px] border border-border-subtle bg-bg-surface"
      onPress={onPress}
    >
      <View className="p-5">
        <View className="mb-5 flex-row items-start justify-between gap-4">
          <View className="flex-1">
            <View className="mb-3 flex-row flex-wrap gap-2">
              <View className={cn('rounded-full border px-3 py-1.5', tone.bg, tone.border)}>
                <AppText className={cn('text-xs font-semibold', tone.text)}>{getStatusLabel(assessment.status)}</AppText>
              </View>
              {assessment.category && (
                <View className="rounded-full border border-border-subtle bg-bg-base px-3 py-1.5">
                    <AppText className="text-xs font-semibold text-text-muted">{assessment.category}</AppText>
                </View>
              )}
            </View>
            <AppText className="text-2xl font-semibold leading-tight text-text-main">{assessment.title}</AppText>
          </View>
          <View className="h-11 w-11 items-center justify-center rounded-2xl bg-bg-base">
            <CaretRight color="#A1A1AA" size={20} weight="bold" />
          </View>
        </View>

        <View className="mb-5 gap-3">
          <View className="flex-row items-center gap-3">
            <CalendarCheck color="#A78BFA" size={18} weight="duotone" />
            <AppText className="flex-1 text-sm text-text-soft">Prazo: 10 dias</AppText>
          </View>
          <View className="flex-row items-center gap-3">
            <UserCircle color="#A78BFA" size={18} weight="duotone" />
            <AppText className="flex-1 text-sm text-text-soft">{assessment.professional?.name || 'Equipe Science Club'}</AppText>
          </View>
          {assessment.mesocycle && (
            <View className="flex-row items-center gap-3">
              <ClipboardText color="#A78BFA" size={18} weight="duotone" />
              <AppText className="flex-1 text-sm text-text-soft">{assessment.mesocycle}</AppText>
            </View>
          )}
        </View>

        <View>
          <View className="mb-2 flex-row items-center justify-between">
            <AppText className="text-xs font-semibold text-text-muted">Progresso de envio</AppText>
            <AppText className="text-xs font-semibold text-brand-secondary">{progress}%</AppText>
          </View>
          <View className="h-2 overflow-hidden rounded-full bg-bg-base">
            <View className="h-full rounded-full bg-brand-primary" style={{ width: `${progress}%` }} />
          </View>
        </View>
      </View>
    </Pressable>
  );
}
