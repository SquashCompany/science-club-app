import { ArrowLeft, CheckCircle, ImageSquare, Flask, PaperPlaneTilt } from 'phosphor-react-native';
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
import { getPhotoProgress } from '../utils';
import { getEvaluationById } from '../api/assessments';

export function AssessmentPhotosScreen() {
  const { assessmentId } = useLocalSearchParams<{ assessmentId: string }>();
  const { session } = useAuthStore();
  const drafts = useAssessmentsStore((state) => state.drafts);
  const setPhoto = useAssessmentsStore((state) => state.setPhoto);
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
  const progress = getPhotoProgress(assessment as any, draft);
  const isSubmitted = assessment.status === 'analysis' || assessment.status === 'answered' || assessment.status === 'done' || draft.submitted;

  const handlePickImage = async (poseId: string) => {
    if (isSubmitted) return;

    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ['images'],
      allowsEditing: true,
      quality: 0.8,
    });

    if (!result.canceled) {
      setPhoto(assessment.id, poseId, result.assets[0].uri);
    }
  };

  const handleNext = () => {
    const hasExams = assessment.questionnaire.attachment_questions.length > 0;
    if (hasExams) {
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
            <ImageSquare color="#A78BFA" size={28} weight="duotone" />
          </View>
          <AppText className="text-4xl font-semibold leading-tight text-text-main">Fotos corporais</AppText>
          <AppText className="mt-3 text-base leading-snug text-text-soft">
            Padronize luz, distância e postura. A foto ficará salva no rascunho até o envio final.
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

      <View className="gap-3">
        {assessment.questionnaire.image_questions.map((pose: any, index: number) => {
          const poseId = pose.id || pose._id;
          const photoUri = draft.photos[poseId];
          const added = Boolean(photoUri);

          return (
            <Animated.View
              key={poseId || index}
              entering={FadeInDown.delay(80 + index * 35).duration(420)}
              className={cn('rounded-[26px] border p-4', added ? 'border-emerald-400/25 bg-emerald-400/10' : 'border-border-subtle bg-bg-surface')}
            >
              <View className="flex-row gap-4">
                <View className="h-24 w-20 items-center justify-center overflow-hidden rounded-[20px] bg-bg-base">
                  {added ? (
                    <Animated.Image 
                      source={{ uri: photoUri! }} 
                      className="h-full w-full object-cover"
                      entering={FadeInDown}
                    />
                  ) : (
                    <ImageSquare color="#71717A" size={31} weight="duotone" />
                  )}
                </View>
                <View className="flex-1">
                  <View className="flex-row items-center justify-between gap-3">
                    <AppText className="flex-1 text-xl font-semibold text-text-main">{pose.label}</AppText>
                    <View className={cn('rounded-full px-3 py-1', added ? 'bg-emerald-400/10' : 'bg-amber-300/10')}>
                      <AppText className={cn('text-xs font-semibold', added ? 'text-emerald-300' : 'text-amber-200')}>
                        {added ? 'Adicionada' : 'Pendente'}
                      </AppText>
                    </View>
                  </View>
                  <AppText className="mt-2 text-sm leading-snug text-text-muted">{pose.description}</AppText>
                  <Pressable
                    accessibilityRole="button"
                    disabled={isSubmitted}
                    className={cn('mt-4 min-h-[44px] items-center justify-center rounded-2xl', added ? 'bg-bg-base' : 'bg-brand-primary', isSubmitted && 'opacity-50')}
                    onPress={() => added ? setPhoto(assessment.id, poseId, null) : handlePickImage(poseId)}
                  >
                    <AppText className={cn('text-sm font-bold', added ? 'text-text-main' : 'text-white')}>
                      {added ? 'Remover foto' : 'Adicionar foto'}
                    </AppText>
                  </Pressable>
                </View>
              </View>
            </Animated.View>
          );
        })}
      </View>

      <Animated.View entering={FadeInDown.delay(220).duration(420)} className="mt-8">
        <AppButton 
            rightIcon={assessment.questionnaire.attachment_questions.length > 0 ? <Flask color="#FFFFFF" size={20} weight="bold" /> : <PaperPlaneTilt color="#FFFFFF" size={20} weight="bold" />} 
            onPress={handleNext}
        >
          {assessment.questionnaire.attachment_questions.length > 0 ? 'Continuar para anexos' : 'Revisar e enviar'}
        </AppButton>
      </Animated.View>
    </AppScreen>
  );
}
