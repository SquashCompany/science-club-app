import { ArrowLeft, Camera, ClipboardText } from 'phosphor-react-native';
import { router, type Href, useLocalSearchParams } from 'expo-router';
import { Pressable, View } from 'react-native';
import Animated, { FadeInDown } from 'react-native-reanimated';

import { AppButton } from '@/src/shared/components/ui/AppButton';
import { AppScreen } from '@/src/shared/components/ui/AppScreen';
import { AppText } from '@/src/shared/components/ui/AppText';

import { AssessmentFieldRenderer } from '../components/AssessmentFieldRenderer';
import { createAssessmentDraft, useAssessmentsStore } from '../services/assessments.store';
import { getQuestionnaireProgress, getRequiredMissing } from '../utils';

export function AssessmentQuestionnaireScreen() {
  const { assessmentId } = useLocalSearchParams<{ assessmentId: string }>();
  const assessments = useAssessmentsStore((state) => state.assessments);
  const drafts = useAssessmentsStore((state) => state.drafts);
  const setAnswer = useAssessmentsStore((state) => state.setAnswer);
  const toggleCheckboxAnswer = useAssessmentsStore((state) => state.toggleCheckboxAnswer);
  const assessment = assessments.find((item) => item.id === assessmentId) ?? assessments[0];
  const draft = drafts[assessment.id] ?? createAssessmentDraft(assessment);
  const progress = getQuestionnaireProgress(assessment, draft);
  const missing = getRequiredMissing(assessment, draft).length;

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
          <AppText className="mt-3 text-base leading-snug text-text-soft">{assessment.questionnaire.description}</AppText>
          <View className="mt-6">
            <View className="mb-2 flex-row items-center justify-between">
              <AppText className="text-xs font-semibold text-text-muted">{progress.answered}/{progress.total} respondidas</AppText>
              <AppText className="text-xs font-semibold text-brand-secondary">{missing} obrigatorias faltando</AppText>
            </View>
            <View className="h-2 overflow-hidden rounded-full bg-bg-base">
              <View className="h-full rounded-full bg-brand-primary" style={{ width: `${progress.percent}%` }} />
            </View>
          </View>
        </View>
      </Animated.View>

      <View className="gap-7">
        {assessment.questionnaire.sections.map((section, sectionIndex) => (
          <Animated.View key={section.id} entering={FadeInDown.delay(80 + sectionIndex * 40).duration(420)}>
            <View className="mb-3">
              <AppText className="text-2xl font-semibold text-text-main">{section.title}</AppText>
              <AppText className="mt-1 text-sm text-text-muted">{section.description}</AppText>
            </View>
            <View className="gap-3">
              {section.fields.map((field) => (
                <AssessmentFieldRenderer
                  key={field.id}
                  field={field}
                  value={draft.answers[field.id]}
                  onChange={(value) => setAnswer(assessment.id, field.id, value)}
                  onToggleOption={(option) => toggleCheckboxAnswer(assessment.id, field.id, option)}
                />
              ))}
            </View>
          </Animated.View>
        ))}
      </View>

      <Animated.View entering={FadeInDown.delay(180).duration(420)} className="mt-8">
        <AppButton rightIcon={<Camera color="#FFFFFF" size={20} weight="bold" />} onPress={() => router.push(`/(app)/assessments/${assessment.id}/photos` as Href)}>
          Continuar para fotos
        </AppButton>
      </Animated.View>
    </AppScreen>
  );
}
