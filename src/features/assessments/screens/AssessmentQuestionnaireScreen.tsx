import { ArrowLeft, Camera, ClipboardText, PaperPlaneTilt } from 'phosphor-react-native';
import { router, type Href, useLocalSearchParams } from 'expo-router';
import { Pressable, View, ActivityIndicator } from 'react-native';
import Animated, { FadeInDown } from 'react-native-reanimated';
import { useQuery } from '@tanstack/react-query';
import { useEffect } from 'react';

import { AppButton } from '@/src/shared/components/ui/AppButton';
import { AppScreen } from '@/src/shared/components/ui/AppScreen';
import { AppText } from '@/src/shared/components/ui/AppText';
import { cn } from '@/src/shared/utils/cn';
import { useAuthStore } from '@/src/features/auth/services/auth.store';

import { AssessmentFieldRenderer } from '../components/AssessmentFieldRenderer';
import { createAssessmentDraft, useAssessmentsStore } from '../services/assessments.store';
import { getQuestionnaireProgress, getRequiredMissing, cleanText } from '../utils';
import { getEvaluationById } from '../api/assessments';

export function AssessmentQuestionnaireScreen() {
  const { assessmentId } = useLocalSearchParams<{ assessmentId: string }>();
  const { session } = useAuthStore();
  const drafts = useAssessmentsStore((state) => state.drafts);
  const setAnswer = useAssessmentsStore((state) => state.setAnswer);
  const toggleCheckboxAnswer = useAssessmentsStore((state) => state.toggleCheckboxAnswer);

  const { data: assessment, isLoading } = useQuery({
    queryKey: ['assessment', assessmentId],
    queryFn: () => getEvaluationById(session?.token!, assessmentId!),
    enabled: !!session?.token && !!assessmentId,
  });

  const initializeDraft = useAssessmentsStore((state) => state.initializeDraft);

  // Initialize draft if not exists
  useEffect(() => {
    if (assessment) {
      initializeDraft(assessment as any);
    }
  }, [assessment, initializeDraft]);

  if (isLoading || !assessment) {
    return (
      <AppScreen contentClassName="items-center justify-center">
        <ActivityIndicator size="large" color="#A78BFA" />
      </AppScreen>
    );
  }

  const draft = drafts[assessment.id] ?? createAssessmentDraft(assessment as any);
  const progress = getQuestionnaireProgress(assessment as any, draft);
  const missing = getRequiredMissing(assessment as any, draft).length;
  const isSubmitted = assessment.status === 'analysis' || assessment.status === 'answered' || assessment.status === 'done' || draft.submitted;

  const hasPhotos = assessment.questionnaire.image_questions.length > 0;
  const hasExams = assessment.questionnaire.attachment_questions.length > 0;

  const handleNext = () => {
    if (hasPhotos) {
      router.push(`/(app)/assessments/${assessment.id}/photos` as Href);
    } else if (hasExams) {
      router.push(`/(app)/assessments/${assessment.id}/exams` as Href);
    } else {
      router.push(`/(app)/assessments/${assessment.id}/review` as Href);
    }
  };

  return (
    <AppScreen contentClassName="px-5 pb-12 pt-5">
      <Animated.View entering={FadeInDown.duration(420)}>
        <Pressable accessibilityRole="button" className="mb-8 h-12 w-12 items-center justify-center rounded-2xl bg-bg-surface" onPress={() => router.back()}>
          <ArrowLeft color="#FFFFFF" size={22} weight="bold" />
        </Pressable>

        <View className="mb-6 rounded-[32px] border border-border-subtle bg-bg-surface p-5">
          <View className="mb-5 h-14 w-14 items-center justify-center rounded-2xl bg-brand-primary/12">
            <ClipboardText color="#A78BFA" size={28} weight="duotone" />
          </View>
          <AppText className="text-4xl font-semibold leading-tight text-text-main">{assessment.questionnaire.title}</AppText>
          <AppText className="mt-3 text-base leading-snug text-text-soft">{cleanText(assessment.questionnaire.description)}</AppText>
          <View className="mt-6">
            <View className="mb-2 flex-row items-center justify-between">
              <AppText className="text-xs font-semibold text-text-muted">{progress.answered}/{progress.total} respondidas</AppText>
              <AppText className="text-xs font-semibold text-brand-secondary">{missing} obrigatórias faltando</AppText>
            </View>
            <View className="h-2 overflow-hidden rounded-full bg-bg-base">
              <View className="h-full rounded-full bg-brand-primary" style={{ width: `${progress.percent}%` }} />
            </View>
          </View>
        </View>
      </Animated.View>

      <View className="gap-7">
        <Animated.View entering={FadeInDown.delay(80).duration(420)}>
          <View className={cn('gap-3', isSubmitted && 'opacity-70')}>
            {assessment.questionnaire.questions.map((field) => (
              <AssessmentFieldRenderer
                key={field.id}
                field={field as any}
                value={draft.answers[field.id]}
                onChange={(value) => !isSubmitted && setAnswer(assessment.id, field.id, value)}
                onToggleOption={(option) => !isSubmitted && toggleCheckboxAnswer(assessment.id, field.id, option)}
              />
            ))}
          </View>
        </Animated.View>
      </View>

      <Animated.View entering={FadeInDown.delay(180).duration(420)} className="mt-8">
        {(hasPhotos || hasExams) && (
          <AppButton 
              rightIcon={<Camera color="#FFFFFF" size={20} weight="bold" />} 
              onPress={handleNext}
          >
            {hasPhotos ? 'Continuar para fotos' : 'Continuar para anexos'}
          </AppButton>
        )}
        {!hasPhotos && !hasExams && (
          <AppButton 
              rightIcon={<PaperPlaneTilt color="#FFFFFF" size={20} weight="bold" />}
              onPress={handleNext}
          >
            Revisar e enviar
          </AppButton>
        )}
      </Animated.View>
    </AppScreen>
  );
}
