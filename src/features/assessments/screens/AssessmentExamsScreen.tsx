import { ArrowLeft, CheckCircle, FileText, PaperPlaneTilt, Trash, UploadSimple } from 'phosphor-react-native';
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

import * as ImagePicker from 'expo-image-picker';
import { createAssessmentDraft, useAssessmentsStore } from '../services/assessments.store';
import { getExamProgress } from '../utils';
import { getEvaluationById } from '../api/assessments';

export function AssessmentExamsScreen() {
  const { assessmentId } = useLocalSearchParams<{ assessmentId: string }>();
  const { session } = useAuthStore();
  const drafts = useAssessmentsStore((state) => state.drafts);
  const setExam = useAssessmentsStore((state) => state.setExam);
  const initializeDraft = useAssessmentsStore((state) => state.initializeDraft);

  const { data: assessment, isLoading } = useQuery({
    queryKey: ['assessment', assessmentId],
    queryFn: () => getEvaluationById(session?.token!, assessmentId!),
    enabled: !!session?.token && !!assessmentId,
  });

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
  const progress = getExamProgress(assessment as any, draft);
  const isSubmitted = assessment.status === 'analysis' || assessment.status === 'answered' || assessment.status === 'done' || draft.submitted;

  const handlePickFile = async (examId: string) => {
    if (isSubmitted) return;

    // Usando ImagePicker como fallback para anexos (fotos de exames)
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ['images'],
      allowsEditing: false,
      quality: 0.8,
    });

    if (!result.canceled) {
      setExam(assessment.id, examId, result.assets[0].uri);
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
            <FileText color="#A78BFA" size={28} weight="duotone" />
          </View>
          <AppText className="text-4xl font-semibold leading-tight text-text-main">Exames e anexos</AppText>
          <AppText className="mt-3 text-base leading-snug text-text-soft">
            Selecione fotos dos seus exames ou documentos. Eles ficarão salvos no rascunho até o envio.
          </AppText>
          <View className="mt-6">
            <View className="mb-2 flex-row items-center justify-between">
              <AppText className="text-xs font-semibold text-text-muted">{progress.done}/{progress.total} respostas</AppText>
              <AppText className="text-xs font-semibold text-brand-secondary">{progress.percent}%</AppText>
            </View>
            <View className="h-2 overflow-hidden rounded-full bg-bg-base">
              <View className="h-full rounded-full bg-brand-primary" style={{ width: `${progress.percent}%` }} />
            </View>
          </View>
        </View>
      </Animated.View>

      {assessment.questionnaire.attachment_questions.length ? (
        <View className="gap-3">
          {assessment.questionnaire.attachment_questions.map((exam: any, index: number) => {
            const examId = exam.id || exam._id;
            const attached = Boolean(draft.exams[examId]);

            return (
              <Animated.View
                key={examId || index}
                entering={FadeInDown.delay(80 + index * 40).duration(420)}
                className={cn('rounded-[26px] border p-4', attached ? 'border-emerald-400/25 bg-emerald-400/10' : 'border-border-subtle bg-bg-surface')}
              >
                <View className="flex-row items-start gap-4">
                  <View className="h-14 w-14 items-center justify-center rounded-2xl bg-bg-base">
                    {attached ? <CheckCircle color="#34D399" size={25} weight="fill" /> : <FileText color="#A78BFA" size={25} weight="duotone" />}
                  </View>
                  <View className="flex-1">
                    <View className="flex-row flex-wrap gap-2">
                      <View className="rounded-full bg-bg-base px-3 py-1">
                        <AppText className="text-xs font-semibold text-text-muted">{exam.required ? 'Obrigatório' : 'Opcional'}</AppText>
                      </View>
                    </View>
                    <AppText className="mt-3 text-xl font-semibold text-text-main">{exam.label}</AppText>
                    <AppText className="mt-3 text-sm leading-snug text-text-soft">{exam.description}</AppText>
                    <Pressable
                      accessibilityRole="button"
                      disabled={isSubmitted}
                      className={cn('mt-4 min-h-[46px] flex-row items-center justify-center gap-2 rounded-2xl', attached ? 'bg-bg-base' : 'bg-brand-primary', isSubmitted && 'opacity-50')}
                      onPress={() => attached ? setExam(assessment.id, examId, null) : handlePickFile(examId)}
                    >
                      {attached ? <Trash color="#FFFFFF" size={17} weight="bold" /> : <UploadSimple color="#FFFFFF" size={17} weight="bold" />}
                      <AppText className="text-sm font-bold text-white">{attached ? 'Remover anexo' : 'Selecionar anexo'}</AppText>
                    </Pressable>
                  </View>
                </View>
              </Animated.View>
            );
          })}
        </View>
      ) : (
        <Animated.View entering={FadeInDown.delay(80).duration(420)} className="rounded-[28px] border border-border-subtle bg-bg-surface p-5">
          <AppText className="text-xl font-semibold text-text-main">Sem anexos nesta etapa</AppText>
          <AppText className="mt-2 text-sm leading-relaxed text-text-soft">
            Para esta avaliação, a equipe precisa apenas do questionário e das fotos padronizadas.
          </AppText>
        </Animated.View>
      )}

      <Animated.View entering={FadeInDown.delay(180).duration(420)} className="mt-8">
        <AppButton rightIcon={<PaperPlaneTilt color="#FFFFFF" size={20} weight="bold" />} onPress={() => router.push(`/(app)/assessments/${assessment.id}/review` as Href)}>
          Revisar e enviar
        </AppButton>
      </Animated.View>
    </AppScreen>
  );
}
