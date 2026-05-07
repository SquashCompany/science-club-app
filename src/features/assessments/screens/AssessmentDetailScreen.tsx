import { ArrowLeft, Camera, ClipboardText, FileText, Flask, PaperPlaneTilt, SealCheck } from 'phosphor-react-native';
import { router, type Href, useLocalSearchParams } from 'expo-router';
import { Alert, Pressable, View } from 'react-native';
import Animated, { FadeInDown } from 'react-native-reanimated';

import { AppButton } from '@/src/shared/components/ui/AppButton';
import { AppScreen } from '@/src/shared/components/ui/AppScreen';
import { AppText } from '@/src/shared/components/ui/AppText';
import { cn } from '@/src/shared/utils/cn';

import { AssessmentTaskCard } from '../components/AssessmentTaskCard';
import { createAssessmentDraft, useAssessmentsStore } from '../services/assessments.store';
import {
  canSubmitAssessment,
  getExamProgress,
  getPhotoProgress,
  getQuestionnaireProgress,
  getRequiredMissing,
  getStatusLabel,
  getStatusTone,
} from '../utils';

export function AssessmentDetailScreen() {
  const { assessmentId } = useLocalSearchParams<{ assessmentId: string }>();
  const assessments = useAssessmentsStore((state) => state.assessments);
  const drafts = useAssessmentsStore((state) => state.drafts);
  const submitAssessment = useAssessmentsStore((state) => state.submitAssessment);
  const assessment = assessments.find((item) => item.id === assessmentId) ?? assessments[0];
  const draft = drafts[assessment.id] ?? createAssessmentDraft(assessment);
  const statusTone = getStatusTone(assessment.status);
  const questionnaire = getQuestionnaireProgress(assessment, draft);
  const photos = getPhotoProgress(assessment, draft);
  const exams = getExamProgress(assessment, draft);
  const missing = getRequiredMissing(assessment, draft);
  const canSubmit = canSubmitAssessment(assessment, draft);
  const isScheduled = assessment.status === 'scheduled';
  const readOnly = isScheduled || assessment.status === 'analysis' || assessment.status === 'answered' || draft.submitted;

  const handleSubmit = () => {
    if (!canSubmit) {
      Alert.alert(
        'Ainda falta completar',
        `Questionario: ${missing.length} obrigatorias pendentes. Fotos: ${photos.done}/${photos.total}. Exames obrigatorios: ${exams.done}/${exams.total}.`,
      );
      return;
    }

    submitAssessment(assessment.id);
    Alert.alert('Avaliação enviada', 'Recebemos seu envio. A equipe ja pode analisar seus dados.');
  };

  return (
    <AppScreen contentClassName="px-5 pb-12 pt-5">
      <Animated.View entering={FadeInDown.duration(420)}>
        <Pressable accessibilityRole="button" className="mb-8 h-12 w-12 items-center justify-center rounded-2xl bg-bg-surface" onPress={() => router.back()}>
          <ArrowLeft color="#FFFFFF" size={22} weight="bold" />
        </Pressable>

        <View className="mb-6 overflow-hidden rounded-[32px] border border-border-subtle bg-bg-surface p-5">
          <View className="absolute -right-16 -top-16 h-44 w-44 rounded-full bg-brand-primary/15" />
          <View className={cn('mb-5 self-start rounded-full border px-3 py-1.5', statusTone.bg, statusTone.border)}>
            <AppText className={cn('text-xs font-semibold', statusTone.text)}>{getStatusLabel(assessment.status)}</AppText>
          </View>
          <AppText className="text-4xl font-semibold leading-tight text-text-main">{assessment.title}</AppText>
          <AppText className="mt-3 text-base leading-snug text-text-soft">{assessment.category} · {assessment.plan}</AppText>

          <View className="mt-7 gap-3">
            <InfoRow label="Responsavel" value={assessment.professional} />
            <InfoRow label="Mesociclo" value={assessment.mesocycle} />
            <InfoRow label="Prazo" value={assessment.dueDate} />
            <InfoRow label="Demanda" value={assessment.linkedDemand ?? 'Acompanhamento do ciclo'} />
          </View>
        </View>
      </Animated.View>

      <Animated.View entering={FadeInDown.delay(80).duration(420)} className="gap-3">
        <AppText className="mb-1 text-2xl font-semibold text-text-main">Checklist</AppText>
        <AssessmentTaskCard
          description={assessment.questionnaire.description}
          done={questionnaire.percent === 100}
          disabled={isScheduled}
          icon={ClipboardText}
          progressLabel={`${questionnaire.answered}/${questionnaire.total} respostas`}
          title="Responder questionario"
          urgent={missing.length > 0}
          onPress={() => router.push(`/(app)/assessments/${assessment.id}/questionnaire` as Href)}
        />
        <AssessmentTaskCard
          description="Frente, costas e laterais com enquadramento padronizado."
          done={photos.done === photos.total}
          disabled={isScheduled}
          icon={Camera}
          progressLabel={`${photos.done}/${photos.total} poses obrigatorias`}
          title="Fotos corporais guiadas"
          urgent={photos.done < photos.total}
          onPress={() => router.push(`/(app)/assessments/${assessment.id}/photos` as Href)}
        />
        <AssessmentTaskCard
          description={assessment.exams.length ? 'Anexe os exames solicitados ou marque que estao indisponiveis.' : 'Nenhum exame solicitado nesta avaliacao.'}
          disabled={isScheduled || !assessment.exams.length}
          done={exams.done === exams.total}
          icon={Flask}
          progressLabel={assessment.exams.length ? `${exams.done}/${exams.total} obrigatorios` : 'Sem anexos obrigatorios'}
          title="Exames e anexos"
          onPress={() => router.push(`/(app)/assessments/${assessment.id}/exams` as Href)}
        />
        {assessment.result && (
          <AssessmentTaskCard
            description="Parecer entregue pela equipe com ajustes e proximos passos."
            done
            icon={SealCheck}
            progressLabel={`Entregue em ${assessment.result.deliveredAt}`}
            title="Parecer final"
            onPress={() => router.push(`/(app)/assessments/${assessment.id}/result` as Href)}
          />
        )}
      </Animated.View>

      <Animated.View entering={FadeInDown.delay(140).duration(420)} className="mt-7">
        {assessment.status === 'answered' ? (
          <AppButton rightIcon={<FileText color="#FFFFFF" size={20} weight="bold" />} onPress={() => router.push(`/(app)/assessments/${assessment.id}/result` as Href)}>
            Ver parecer final
          </AppButton>
        ) : isScheduled ? (
          <View className="rounded-[28px] border border-amber-300/20 bg-amber-300/10 p-5">
            <AppText className="text-xl font-semibold text-text-main">Ainda nao liberada</AppText>
            <AppText className="mt-2 text-sm leading-relaxed text-text-soft">
              Esta avaliacao esta agendada. Quando chegar a data, o questionario e as fotos ficam disponiveis.
            </AppText>
            <AppText className="mt-4 text-sm font-semibold text-amber-200">Libera: {assessment.dueDate}</AppText>
          </View>
        ) : readOnly ? (
          <View className="rounded-[28px] border border-brand-primary/25 bg-brand-primary/10 p-5">
            <AppText className="text-xl font-semibold text-text-main">Equipe analisando</AppText>
            <AppText className="mt-2 text-sm leading-relaxed text-text-soft">
              Seu envio foi recebido. A equipe revisa questionario, fotos e anexos antes de liberar o parecer.
            </AppText>
            <AppText className="mt-4 text-sm font-semibold text-brand-secondary">Previsao: ate 24h uteis</AppText>
          </View>
        ) : (
          <AppButton rightIcon={<PaperPlaneTilt color="#FFFFFF" size={20} weight="bold" />} onPress={handleSubmit}>
            Revisar e enviar avaliação
          </AppButton>
        )}
      </Animated.View>
    </AppScreen>
  );
}

function InfoRow({ label, value }: { label: string; value: string }) {
  return (
    <View className="flex-row items-center justify-between gap-4 border-t border-border-subtle pt-3">
      <AppText className="text-sm text-text-muted">{label}</AppText>
      <AppText className="max-w-[64%] text-right text-sm font-semibold text-text-main">{value}</AppText>
    </View>
  );
}
