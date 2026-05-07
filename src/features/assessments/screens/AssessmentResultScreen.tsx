import { ArrowLeft, CalendarCheck, CheckCircle, ForkKnife, ListChecks, SealCheck } from 'phosphor-react-native';
import { router, useLocalSearchParams } from 'expo-router';
import { Pressable, View } from 'react-native';
import Animated, { FadeInDown } from 'react-native-reanimated';

import { AppScreen } from '@/src/shared/components/ui/AppScreen';
import { AppText } from '@/src/shared/components/ui/AppText';

import { useAssessmentsStore } from '../services/assessments.store';

export function AssessmentResultScreen() {
  const { assessmentId } = useLocalSearchParams<{ assessmentId: string }>();
  const assessments = useAssessmentsStore((state) => state.assessments);
  const assessment = assessments.find((item) => item.id === assessmentId) ?? assessments[0];
  const result = assessment.result;

  return (
    <AppScreen contentClassName="px-5 pb-12 pt-5">
      <Animated.View entering={FadeInDown.duration(420)}>
        <Pressable accessibilityRole="button" className="mb-8 h-12 w-12 items-center justify-center rounded-2xl bg-bg-surface" onPress={() => router.back()}>
          <ArrowLeft color="#FFFFFF" size={22} weight="bold" />
        </Pressable>

        <View className="mb-6 overflow-hidden rounded-[32px] border border-border-subtle bg-bg-surface p-5">
          <View className="absolute -right-16 -top-16 h-44 w-44 rounded-full bg-emerald-400/12" />
          <View className="mb-5 h-14 w-14 items-center justify-center rounded-2xl bg-emerald-400/10">
            <SealCheck color="#34D399" size={29} weight="duotone" />
          </View>
          <AppText className="text-4xl font-semibold leading-tight text-text-main">
            {result ? 'Parecer entregue' : 'Parecer em preparo'}
          </AppText>
          <AppText className="mt-3 text-base leading-snug text-text-soft">
            {result
              ? `${assessment.title} · ${result.deliveredAt}`
              : 'A equipe ainda esta analisando seu envio. Assim que concluir, o parecer aparece aqui.'}
          </AppText>
        </View>
      </Animated.View>

      {result ? (
        <View className="gap-4">
          <Animated.View entering={FadeInDown.delay(80).duration(420)} className="rounded-[28px] border border-border-subtle bg-bg-surface p-5">
            <AppText className="text-xl font-semibold text-text-main">Mensagem da equipe</AppText>
            <AppText className="mt-3 text-base leading-relaxed text-text-soft">{result.coachMessage}</AppText>
          </Animated.View>

          <DecisionCard icon={ListChecks} title="Treino" text={result.trainingDecision} />
          <DecisionCard icon={ForkKnife} title="Dieta" text={result.dietDecision} />

          <Animated.View entering={FadeInDown.delay(180).duration(420)} className="rounded-[28px] border border-border-subtle bg-bg-surface p-5">
            <AppText className="mb-4 text-xl font-semibold text-text-main">Proximos passos</AppText>
            <View className="gap-3">
              {result.nextSteps.map((step) => (
                <View key={step} className="flex-row items-start gap-3">
                  <CheckCircle color="#34D399" size={18} weight="fill" />
                  <AppText className="flex-1 text-sm leading-snug text-text-soft">{step}</AppText>
                </View>
              ))}
            </View>
            <View className="mt-5 flex-row items-center rounded-2xl bg-bg-base p-4">
              <CalendarCheck color="#A78BFA" size={22} weight="duotone" />
              <View className="ml-3 flex-1">
                <AppText className="text-xs font-semibold text-text-muted">Proxima reavaliacao</AppText>
                <AppText className="mt-1 text-base font-semibold text-text-main">{result.nextAssessmentAt}</AppText>
              </View>
            </View>
          </Animated.View>
        </View>
      ) : (
        <Animated.View entering={FadeInDown.delay(80).duration(420)} className="rounded-[28px] border border-brand-primary/25 bg-brand-primary/10 p-5">
          <AppText className="text-xl font-semibold text-text-main">Equipe analisando</AppText>
          <AppText className="mt-2 text-sm leading-relaxed text-text-soft">
            Quando o parecer estiver concluido, voce vai ver ajustes de treino, dieta e orientacoes nesta pagina.
          </AppText>
        </Animated.View>
      )}
    </AppScreen>
  );
}

function DecisionCard({
  icon: Icon,
  title,
  text,
}: {
  icon: typeof ListChecks;
  title: string;
  text: string;
}) {
  return (
    <Animated.View entering={FadeInDown.delay(120).duration(420)} className="rounded-[28px] border border-border-subtle bg-bg-surface p-5">
      <View className="mb-4 h-12 w-12 items-center justify-center rounded-2xl bg-brand-primary/12">
        <Icon color="#A78BFA" size={24} weight="duotone" />
      </View>
      <AppText className="text-xl font-semibold text-text-main">{title}</AppText>
      <AppText className="mt-2 text-sm leading-relaxed text-text-soft">{text}</AppText>
    </Animated.View>
  );
}
