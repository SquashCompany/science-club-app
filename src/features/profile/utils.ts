import { ProfileDocument, StudentStatus } from './types';

export function getProfileStatus(status: StudentStatus) {
  const config: Record<StudentStatus, { label: string; text: string; bg: string; border: string; color: string }> = {
    active: {
      label: 'Ativo',
      text: 'text-emerald-300',
      bg: 'bg-emerald-400/10',
      border: 'border-emerald-400/20',
      color: '#34D399',
    },
    inactive: {
      label: 'Inativo',
      text: 'text-text-muted',
      bg: 'bg-bg-base',
      border: 'border-border-subtle',
      color: '#A1A1AA',
    },
    pending: {
      label: 'Pendente',
      text: 'text-amber-200',
      bg: 'bg-amber-300/10',
      border: 'border-amber-300/20',
      color: '#FCD34D',
    },
    overdue: {
      label: 'Atrasado',
      text: 'text-red-200',
      bg: 'bg-red-500/10',
      border: 'border-red-500/20',
      color: '#FCA5A5',
    },
  };

  return config[status];
}

export function getDocumentStatus(document: ProfileDocument) {
  const labels: Record<ProfileDocument['status'], string> = {
    available: 'Disponível',
    reviewed: 'Analisado',
    signed: 'Assinado',
    pending: 'Pendente',
  };

  return labels[document.status];
}

export function getDocumentCategory(document: ProfileDocument) {
  const labels: Record<ProfileDocument['category'], string> = {
    contract: 'Contrato',
    plan: 'Plano',
    exam: 'Exame',
    terms: 'Termos',
  };

  return labels[document.category];
}
