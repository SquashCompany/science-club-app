import { ArrowLeft, CheckCircle, PaperPlaneTilt } from 'phosphor-react-native';
import { router, type Href, useLocalSearchParams } from 'expo-router';
import { Alert, Pressable, ScrollView, View, ActivityIndicator } from 'react-native';
import Animated, { FadeInDown } from 'react-native-reanimated';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useEffect, useState } from 'react';

import { AppButton } from '@/src/shared/components/ui/AppButton';
import { AppScreen } from '@/src/shared/components/ui/AppScreen';
import { AppText } from '@/src/shared/components/ui/AppText';
import { cn } from '@/src/shared/utils/cn';
import { useAuthStore } from '@/src/features/auth/services/auth.store';

import { createAssessmentDraft, useAssessmentsStore } from '../services/assessments.store';
import { getEvaluationById, submitEvaluation, uploadFile } from '../api/assessments';
import { getQuestionnaireProgress, getPhotoProgress, getExamProgress, canSubmitAssessment } from '../utils';

export function AssessmentReviewScreen() {
  const { assessmentId } = useLocalSearchParams<{ assessmentId: string }>();
  const { session } = useAuthStore();
  const queryClient = useQueryClient();
  const drafts = useAssessmentsStore((state) => state.drafts);
  const submitDraft = useAssessmentsStore((state) => state.submitAssessment);
  const initializeDraft = useAssessmentsStore((state) => state.initializeDraft);

  const [isUploading, setIsUploading] = useState(false);

  const { data: assessment, isLoading } = useQuery({
    queryKey: ['assessment', assessmentId],
    queryFn: () => getEvaluationById(session?.token!, assessmentId!),
    enabled: !!session?.token && !!assessmentId,
  });

  const mutation = useMutation({
    mutationFn: (data: any) => submitEvaluation(session?.token!, assessmentId!, data),
    onSuccess: () => {
      submitDraft(assessmentId!);
      queryClient.invalidateQueries({ queryKey: ['assessment', assessmentId] });
      queryClient.invalidateQueries({ queryKey: ['assessments'] });
      Alert.alert('Sucesso', 'Sua avaliação foi enviada com sucesso!');
      router.dismissAll();
      router.replace('/(app)/(tabs)/assessments' as any);
    },
    onError: () => {
      Alert.alert('Erro', 'Não foi possível enviar a avaliação. Tente novamente.');
    }
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
  const questionnaire = getQuestionnaireProgress(assessment as any, draft);
  const photos = getPhotoProgress(assessment as any, draft);
  const exams = getExamProgress(assessment as any, draft);
  const canSubmit = canSubmitAssessment(assessment as any, draft);
  const isSubmitted = assessment.status === 'analysis' || assessment.status === 'answered' || assessment.status === 'done' || draft.submitted;

  const handleSubmit = async () => {
    if (!canSubmit) {
      Alert.alert('Incompleto', 'Por favor, preencha todos os campos obrigatórios antes de enviar.');
      return;
    }

    setIsUploading(true);
    try {
      // 1. Upload Photos
      const uploadedPhotos = await Promise.all(
        Object.entries(draft.photos)
          .filter(([_, uri]) => !!uri)
          .map(async ([id, uri]) => {
            const label = assessment.questionnaire.image_questions.find((iq: any) => iq.id === id || iq._id === id)?.label || id;
            if (uri!.startsWith('http')) return { position: id, url: uri!, label };
            const { url } = await uploadFile(session?.token!, uri!, 'photos/evaluations');
            return { position: id, url, label };
          })
      );

      // 2. Upload Exams
      const uploadedExams = await Promise.all(
        Object.entries(draft.exams)
          .filter(([_, uri]) => !!uri)
          .map(async ([id, uri]) => {
            if (uri!.startsWith('http')) return { url: uri!, label: id };
            const { url } = await uploadFile(session?.token!, uri!, 'exams/evaluations');
            return { url, label: id };
          })
      );

      // 3. Submit Evaluation
      mutation.mutate({
        answers: Object.entries(draft.answers).map(([question, answer]) => ({ 
          question, 
          answer: Array.isArray(answer) ? answer.join(', ') : String(answer) 
        })),
        photos: uploadedPhotos,
        exams: uploadedExams
      });
    } catch (error) {
      console.error('[AssessmentReview] Upload error:', error);
      Alert.alert('Erro', 'Ocorreu um erro ao fazer upload dos arquivos. Tente novamente.');
    } finally {
      setIsUploading(false);
    }
  };

  return (
    <AppScreen contentClassName="px-5 pb-12 pt-5">
      <Animated.View entering={FadeInDown.duration(420)}>
        <Pressable accessibilityRole="button" className="mb-8 h-12 w-12 items-center justify-center rounded-2xl bg-bg-surface" onPress={() => router.back()}>
          <ArrowLeft color="#FFFFFF" size={22} weight="bold" />
        </Pressable>

        <View className="mb-8">
          <AppText className="text-4xl font-semibold leading-tight text-text-main">Revisar Envio</AppText>
          <AppText className="mt-2 text-base text-text-soft">Confira seus dados antes de enviar para a equipe.</AppText>
        </View>
      </Animated.View>

      <ScrollView showsVerticalScrollIndicator={false} className="flex-1">
        <View className="gap-4">
          {/* Resumo do Questionário */}
          {assessment.questionnaire.questions.length > 0 && (
            <ReviewSection 
              title="Questionário" 
              status={`${questionnaire.answered}/${questionnaire.total} respondidas`}
              done={questionnaire.percent === 100}
            >
              {assessment.questionnaire.questions.map((q: any) => (
                <View key={q.id || q._id} className="mb-3 border-b border-border-subtle/50 pb-3">
                  <AppText className="text-xs font-semibold text-text-muted mb-1">{q.label}</AppText>
                  <AppText className="text-sm text-text-main">
                    {draft.answers[q.id || q._id] ? (Array.isArray(draft.answers[q.id || q._id]) ? (draft.answers[q.id || q._id] as string[]).join(', ') : draft.answers[q.id || q._id]) : 'Não respondido'}
                  </AppText>
                </View>
              ))}
            </ReviewSection>
          )}

          {/* Resumo de Fotos */}
          {assessment.questionnaire.image_questions.length > 0 && (
            <ReviewSection 
              title="Fotos Corporais" 
              status={`${photos.done}/${photos.total} fotos`}
              done={photos.done === photos.total}
            >
              <AppText className="text-sm text-text-soft">
                {photos.done} de {photos.total} posições capturadas.
              </AppText>
            </ReviewSection>
          )}

          {/* Resumo de Exames */}
          {assessment.questionnaire.attachment_questions.length > 0 && (
            <ReviewSection 
              title="Exames e Anexos" 
              status={`${exams.done}/${exams.total} anexos`}
              done={exams.done === exams.total}
            >
              <AppText className="text-sm text-text-soft">
                {exams.done} de {exams.total} documentos anexados.
              </AppText>
            </ReviewSection>
          )}
        </View>
      </ScrollView>

      <Animated.View entering={FadeInDown.delay(200).duration(420)} className="mt-8">
        <AppButton 
          loading={mutation.isPending || isUploading}
          disabled={!canSubmit || isSubmitted}
          rightIcon={!(mutation.isPending || isUploading) && <PaperPlaneTilt color="#FFFFFF" size={20} weight="bold" />} 
          onPress={handleSubmit}
        >
          {isSubmitted ? 'Avaliação já enviada' : 'Confirmar e Enviar Agora'}
        </AppButton>
        {!canSubmit && !isSubmitted && (
          <AppText className="mt-3 text-center text-xs text-amber-200">
            Alguns itens obrigatórios ainda não foram preenchidos.
          </AppText>
        )}
      </Animated.View>
    </AppScreen>
  );
}

function ReviewSection({ title, status, done, children }: { title: string; status: string; done: boolean; children: React.ReactNode }) {
  return (
    <View className="rounded-[28px] border border-border-subtle bg-bg-surface p-5">
      <View className="flex-row items-center justify-between mb-4">
        <View>
          <AppText className="text-xl font-semibold text-text-main">{title}</AppText>
          <AppText className="text-xs text-text-muted mt-0.5">{status}</AppText>
        </View>
        {done && <CheckCircle color="#34D399" size={22} weight="fill" />}
      </View>
      <View className="rounded-2xl bg-bg-base/50 p-4">
        {children}
      </View>
    </View>
  );
}
