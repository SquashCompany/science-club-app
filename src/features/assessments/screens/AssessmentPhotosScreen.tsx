import { ArrowLeft, Camera, CheckCircle, Flask, ImageSquare } from 'phosphor-react-native';
import { router, type Href, useLocalSearchParams } from 'expo-router';
import { Pressable, View } from 'react-native';
import Animated, { FadeInDown } from 'react-native-reanimated';

import { AppButton } from '@/src/shared/components/ui/AppButton';
import { AppScreen } from '@/src/shared/components/ui/AppScreen';
import { AppText } from '@/src/shared/components/ui/AppText';
import { cn } from '@/src/shared/utils/cn';

import { createAssessmentDraft, useAssessmentsStore } from '../services/assessments.store';
import { getPhotoProgress } from '../utils';

export function AssessmentPhotosScreen() {
  const { assessmentId } = useLocalSearchParams<{ assessmentId: string }>();
  const assessments = useAssessmentsStore((state) => state.assessments);
  const drafts = useAssessmentsStore((state) => state.drafts);
  const togglePhoto = useAssessmentsStore((state) => state.togglePhoto);
  const assessment = assessments.find((item) => item.id === assessmentId) ?? assessments[0];
  const draft = drafts[assessment.id] ?? createAssessmentDraft(assessment);
  const progress = getPhotoProgress(assessment, draft);

  return (
    <AppScreen contentClassName="px-5 pb-12 pt-5">
      <Animated.View entering={FadeInDown.duration(420)}>
        <Pressable accessibilityRole="button" className="mb-8 h-12 w-12 items-center justify-center rounded-2xl bg-bg-surface" onPress={() => router.back()}>
          <ArrowLeft color="#FFFFFF" size={22} weight="bold" />
        </Pressable>

        <View className="mb-6 rounded-[32px] border border-border-subtle bg-bg-surface p-5">
          <View className="mb-5 h-14 w-14 items-center justify-center rounded-2xl bg-brand-primary/12">
            <Camera color="#A78BFA" size={28} weight="duotone" />
          </View>
          <AppText className="text-4xl font-semibold leading-tight text-text-main">Fotos corporais</AppText>
          <AppText className="mt-3 text-base leading-snug text-text-soft">
            Padronize luz, distancia e postura. Nesta versao mock, adicionar foto marca a pose como enviada.
          </AppText>
          <View className="mt-6">
            <View className="mb-2 flex-row items-center justify-between">
              <AppText className="text-xs font-semibold text-text-muted">{progress.done}/{progress.total} poses obrigatorias</AppText>
              <AppText className="text-xs font-semibold text-brand-secondary">{progress.percent}%</AppText>
            </View>
            <View className="h-2 overflow-hidden rounded-full bg-bg-base">
              <View className="h-full rounded-full bg-brand-primary" style={{ width: `${progress.percent}%` }} />
            </View>
          </View>
        </View>
      </Animated.View>

      <View className="gap-3">
        {assessment.photoPoses.map((pose, index) => {
          const added = Boolean(draft.photos[pose.id]);

          return (
            <Animated.View
              key={pose.id}
              entering={FadeInDown.delay(80 + index * 35).duration(420)}
              className={cn('rounded-[26px] border p-4', added ? 'border-emerald-400/25 bg-emerald-400/10' : 'border-border-subtle bg-bg-surface')}
            >
              <View className="flex-row gap-4">
                <View className="h-24 w-20 items-center justify-center overflow-hidden rounded-[20px] bg-bg-base">
                  {added ? (
                    <CheckCircle color="#34D399" size={31} weight="fill" />
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
                  <AppText className="mt-2 text-sm leading-snug text-text-muted">{pose.instruction}</AppText>
                  <Pressable
                    accessibilityRole="button"
                    className={cn('mt-4 min-h-[44px] items-center justify-center rounded-2xl', added ? 'bg-bg-base' : 'bg-brand-primary')}
                    onPress={() => togglePhoto(assessment.id, pose.id)}
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
        <AppButton rightIcon={<Flask color="#FFFFFF" size={20} weight="bold" />} onPress={() => router.push(`/(app)/assessments/${assessment.id}/exams` as Href)}>
          Continuar para anexos
        </AppButton>
      </Animated.View>
    </AppScreen>
  );
}
