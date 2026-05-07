import { Assessment, AssessmentAnswerValue, AssessmentDraft, AssessmentField } from './types';

export function getStatusLabel(status: Assessment['status']) {
  const labels: Record<Assessment['status'], string> = {
    pending: 'Pendente',
    sent: 'Disponivel',
    received: 'Recebido',
    analysis: 'Em analise',
    answered: 'Concluida',
    overdue: 'Atrasada',
    scheduled: 'Agendada',
  };

  return labels[status];
}

export function getStatusTone(status: Assessment['status']) {
  if (status === 'answered') return { text: 'text-emerald-300', bg: 'bg-emerald-400/10', border: 'border-emerald-400/20', color: '#34D399' };
  if (status === 'overdue') return { text: 'text-red-200', bg: 'bg-red-500/10', border: 'border-red-500/20', color: '#FCA5A5' };
  if (status === 'sent' || status === 'scheduled' || status === 'pending') return { text: 'text-amber-200', bg: 'bg-amber-300/10', border: 'border-amber-300/20', color: '#FCD34D' };
  return { text: 'text-brand-secondary', bg: 'bg-brand-primary/10', border: 'border-brand-primary/25', color: '#A78BFA' };
}

export function isAnswerFilled(value: AssessmentAnswerValue | undefined) {
  if (Array.isArray(value)) return value.length > 0;
  return Boolean(value?.trim());
}

export function getAllFields(assessment: Assessment) {
  return assessment.questionnaire.sections.flatMap((section) => section.fields);
}

export function getRequiredMissing(assessment: Assessment, draft: AssessmentDraft) {
  return getAllFields(assessment).filter((field) => field.required && !isAnswerFilled(draft.answers[field.id]));
}

export function getQuestionnaireProgress(assessment: Assessment, draft: AssessmentDraft) {
  const fields = getAllFields(assessment);
  const answered = fields.filter((field) => isAnswerFilled(draft.answers[field.id])).length;

  return {
    answered,
    total: fields.length,
    percent: fields.length ? Math.round((answered / fields.length) * 100) : 0,
  };
}

export function getPhotoProgress(assessment: Assessment, draft: AssessmentDraft) {
  const required = assessment.photoPoses.filter((pose) => pose.required);
  const done = required.filter((pose) => draft.photos[pose.id]).length;

  return {
    done,
    total: required.length,
    percent: required.length ? Math.round((done / required.length) * 100) : 0,
  };
}

export function getExamProgress(assessment: Assessment, draft: AssessmentDraft) {
  const required = assessment.exams.filter((exam) => exam.required);
  const done = required.filter((exam) => draft.exams[exam.id]).length;

  return {
    done,
    total: required.length,
    percent: required.length ? Math.round((done / required.length) * 100) : 100,
  };
}

export function canSubmitAssessment(assessment: Assessment, draft: AssessmentDraft) {
  const photos = getPhotoProgress(assessment, draft);
  const exams = getExamProgress(assessment, draft);

  return getRequiredMissing(assessment, draft).length === 0 && photos.done === photos.total && exams.done === exams.total;
}

export function getAssessmentProgress(assessment: Assessment, draft: AssessmentDraft) {
  const questionnaire = getQuestionnaireProgress(assessment, draft).percent;
  const photos = getPhotoProgress(assessment, draft).percent;
  const exams = getExamProgress(assessment, draft).percent;
  return Math.round((questionnaire + photos + exams) / 3);
}

export function getFieldKeyboardType(field: AssessmentField) {
  return field.type === 'number' ? 'numeric' : 'default';
}
