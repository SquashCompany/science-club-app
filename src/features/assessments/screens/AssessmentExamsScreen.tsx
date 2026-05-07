import { ArrowLeft, CheckCircle, FileText, PaperPlaneTilt, Trash, UploadSimple } from 'phosphor-react-native';
import { router, useLocalSearchParams } from 'expo-router';
import { Pressable, View } from 'react-native';
import Animated, { FadeInDown } from 'react-native-reanimated';

import { AppButton } from '@/src/shared/components/ui/AppButton';
import { AppScreen } from '@/src/shared/components/ui/AppScreen';
import { AppText } from '@/src/shared/components/ui/AppText';
import { cn } from '@/src/shared/utils/cn';

import { createAssessmentDraft, useAssessmentsStore } from '../services/assessments.store';
import { getExamProgress } from '../utils';

export function AssessmentExamsScreen() {
  const { assessmentId } = useLocalSearchParams<{ assessmentId: string }>();
  const assessments = useAssessmentsStore((state) => state.assessments);
  const drafts = useAssessmentsStore((state) => state.drafts);
  const toggleExam = useAssessmentsStore((state) => state.toggleExam);
  const assessment = assessments.find((item) => item.id === assessmentId) ?? assessments[0];
  const draft = drafts[assessment.id] ?? createAssessmentDraft(assessment);
  const progress = getExamProgress(assessment, draft);

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
            Marque os documentos que voce tem disponiveis. O upload real fica para a integracao com backend.
          </AppText>
          <AppText className="mt-5 text-sm font-semibold text-brand-secondary">
            {assessment.exams.length ? `${progress.done}/${progress.total} obrigatorios anexados` : 'Nenhum documento solicitado'}
          </AppText>
        </View>
      </Animated.View>

      {assessment.exams.length ? (
        <View className="gap-3">
          {assessment.exams.map((exam, index) => {
            const attached = Boolean(draft.exams[exam.id]);

            return (
              <Animated.View
                key={exam.id}
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
                        <AppText className="text-xs font-semibold text-text-muted">{exam.type}</AppText>
                      </View>
                      <View className="rounded-full bg-bg-base px-3 py-1">
                        <AppText className="text-xs font-semibold text-text-muted">{exam.required ? 'Obrigatorio' : 'Opcional'}</AppText>
                      </View>
                    </View>
                    <AppText className="mt-3 text-xl font-semibold text-text-main">{exam.name}</AppText>
                    <AppText className="mt-1 text-sm text-text-muted">
                      {exam.category}{exam.date ? ` · ${exam.date}` : ''}
                    </AppText>
                    {exam.status && (
                      <AppText className="mt-1 text-xs font-semibold text-brand-secondary">
                        {exam.status === 'reviewed' ? 'Analisado pela equipe' : exam.status === 'attached' ? 'Anexado' : 'Solicitado'}
                      </AppText>
                    )}
                    <AppText className="mt-3 text-sm leading-snug text-text-soft">{exam.note}</AppText>
                    <Pressable
                      accessibilityRole="button"
                      className={cn('mt-4 min-h-[46px] flex-row items-center justify-center gap-2 rounded-2xl', attached ? 'bg-bg-base' : 'bg-brand-primary')}
                      onPress={() => toggleExam(assessment.id, exam.id)}
                    >
                      {attached ? <Trash color="#FFFFFF" size={17} weight="bold" /> : <UploadSimple color="#FFFFFF" size={17} weight="bold" />}
                      <AppText className="text-sm font-bold text-white">{attached ? 'Remover anexo' : 'Marcar como anexado'}</AppText>
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
            Para esta avaliacao, a equipe precisa apenas do questionario e das fotos padronizadas.
          </AppText>
        </Animated.View>
      )}

      <Animated.View entering={FadeInDown.delay(180).duration(420)} className="mt-8">
        <AppButton rightIcon={<PaperPlaneTilt color="#FFFFFF" size={20} weight="bold" />} onPress={() => router.push(`/(app)/assessments/${assessment.id}`)}>
          Revisar envio
        </AppButton>
      </Animated.View>
    </AppScreen>
  );
}
