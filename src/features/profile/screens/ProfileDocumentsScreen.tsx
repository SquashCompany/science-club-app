import { ArrowLeft, CheckCircle, CreditCard, DownloadSimple, FileText, Paperclip, ShieldCheck, WarningCircle } from 'phosphor-react-native';
import { router } from 'expo-router';
import { Alert, Pressable, View } from 'react-native';
import Animated, { FadeInDown } from 'react-native-reanimated';

import { AppScreen } from '@/src/shared/components/ui/AppScreen';
import { AppText } from '@/src/shared/components/ui/AppText';
import { cn } from '@/src/shared/utils/cn';

import { useProfileStore } from '../services/profile.store';
import { ProfileDocument } from '../types';
import { getDocumentCategory, getDocumentStatus } from '../utils';

export function ProfileDocumentsScreen() {
  const profile = useProfileStore((state) => state.profile);

  return (
    <AppScreen contentClassName="px-5 pb-12 pt-5">
      <Animated.View entering={FadeInDown.duration(420)}>
        <Pressable accessibilityRole="button" className="mb-8 h-12 w-12 items-center justify-center rounded-2xl bg-bg-surface" onPress={() => router.back()}>
          <ArrowLeft color="#FFFFFF" size={22} weight="bold" />
        </Pressable>

        <View className="mb-7 overflow-hidden rounded-[32px] border border-border-subtle bg-bg-surface p-5">
          <View className="absolute -right-16 -top-16 h-44 w-44 rounded-full bg-brand-primary/15" />
          <View className="mb-5 h-14 w-14 items-center justify-center rounded-2xl bg-brand-primary/12">
            <FileText color="#A78BFA" size={28} weight="duotone" />
          </View>
          <AppText className="text-4xl font-semibold leading-tight text-text-main">Documentos</AppText>
          <AppText className="mt-3 text-base leading-snug text-text-soft">
            Contrato, planos, exames e termos vinculados ao seu acompanhamento.
          </AppText>
        </View>
      </Animated.View>

      <View className="gap-3">
        {profile.documents.map((document, index) => (
          <Animated.View key={document.id} entering={FadeInDown.delay(80 + index * 35).duration(420)}>
            <DocumentCard document={document} />
          </Animated.View>
        ))}
      </View>
    </AppScreen>
  );
}

function DocumentCard({ document }: { document: ProfileDocument }) {
  const Icon = document.category === 'contract' ? CreditCard : document.category === 'exam' ? Paperclip : document.category === 'terms' ? ShieldCheck : FileText;
  const statusColor = document.status === 'pending' ? '#FCD34D' : document.status === 'available' ? '#A78BFA' : '#34D399';

  return (
    <Pressable
      accessibilityRole="button"
      className="rounded-[26px] border border-border-subtle bg-bg-surface p-4"
      onPress={() => Alert.alert(document.title, 'Download/visualização será conectado quando houver backend de arquivos.')}
    >
      <View className="flex-row items-start gap-4">
        <View className="h-14 w-14 items-center justify-center rounded-2xl bg-bg-base">
          <Icon color="#A78BFA" size={25} weight="duotone" />
        </View>
        <View className="flex-1">
          <View className="mb-2 flex-row flex-wrap gap-2">
            <View className="rounded-full bg-bg-base px-3 py-1">
              <AppText className="text-xs font-semibold text-text-muted">{getDocumentCategory(document)}</AppText>
            </View>
            <View className="rounded-full bg-bg-base px-3 py-1">
              <AppText className="text-xs font-semibold" style={{ color: statusColor }}>{getDocumentStatus(document)}</AppText>
            </View>
          </View>
          <AppText className="text-xl font-semibold text-text-main">{document.title}</AppText>
          <AppText className="mt-1 text-sm text-text-muted">{document.date}</AppText>
          <AppText className="mt-3 text-sm leading-snug text-text-soft">{document.description}</AppText>
          <View className="mt-4 flex-row items-center justify-between rounded-2xl bg-bg-base px-4 py-3">
            <View className="flex-row items-center gap-2">
              {document.status === 'pending' ? (
                <WarningCircle color="#FCD34D" size={18} weight="fill" />
              ) : (
                <CheckCircle color={statusColor} size={18} weight="fill" />
              )}
              <AppText className={cn('text-sm font-semibold', document.status === 'pending' ? 'text-amber-200' : 'text-text-main')}>
                {document.status === 'pending' ? 'Aguardando' : 'Pronto para abrir'}
              </AppText>
            </View>
            <DownloadSimple color="#A78BFA" size={19} weight="bold" />
          </View>
        </View>
      </View>
    </Pressable>
  );
}
