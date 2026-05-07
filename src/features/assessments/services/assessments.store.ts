import { create } from 'zustand';

import { mockAssessments } from '../data/assessments';
import { Assessment, AssessmentAnswerValue, AssessmentDraft } from '../types';

type AssessmentsStore = {
  assessments: Assessment[];
  drafts: Record<string, AssessmentDraft>;
  setAnswer: (assessmentId: string, fieldId: string, value: AssessmentAnswerValue) => void;
  toggleCheckboxAnswer: (assessmentId: string, fieldId: string, option: string) => void;
  togglePhoto: (assessmentId: string, poseId: string) => void;
  toggleExam: (assessmentId: string, examId: string) => void;
  submitAssessment: (assessmentId: string) => void;
};

export function createAssessmentDraft(assessment: Assessment): AssessmentDraft {
  const submitted = assessment.status === 'received' || assessment.status === 'analysis' || assessment.status === 'answered';
  const photos = Object.fromEntries(assessment.photoPoses.map((pose) => [pose.id, assessment.status === 'received' || assessment.status === 'analysis' || assessment.status === 'answered']));
  const exams = Object.fromEntries(assessment.exams.map((exam) => [exam.id, assessment.status === 'received' || assessment.status === 'analysis' || assessment.status === 'answered']));
  const answers = Object.fromEntries(
    assessment.questionnaire.sections.flatMap((section) =>
      section.fields.map((field) => {
        if (!submitted) return [field.id, field.type === 'checkbox' ? [] : ''];
        if (field.type === 'checkbox') return [field.id, field.options?.slice(0, 2) ?? []];
        if (field.type === 'number') return [field.id, '4'];
        if (field.type === 'select' || field.type === 'radio') return [field.id, field.options?.[0] ?? 'Respondido'];
        return [field.id, 'Respondido no envio anterior.'];
      }),
    ),
  );

  return {
    answers,
    photos,
    exams,
    submitted,
  };
}

function ensureDraft(drafts: Record<string, AssessmentDraft>, assessment: Assessment) {
  return drafts[assessment.id] ?? createAssessmentDraft(assessment);
}

export const useAssessmentsStore = create<AssessmentsStore>((set, get) => ({
  assessments: mockAssessments,
  drafts: Object.fromEntries(mockAssessments.map((assessment) => [assessment.id, createAssessmentDraft(assessment)])),
  setAnswer: (assessmentId, fieldId, value) =>
    set((state) => {
      const assessment = state.assessments.find((item) => item.id === assessmentId);
      if (!assessment) return state;
      const draft = ensureDraft(state.drafts, assessment);

      return {
        drafts: {
          ...state.drafts,
          [assessmentId]: {
            ...draft,
            answers: {
              ...draft.answers,
              [fieldId]: value,
            },
          },
        },
      };
    }),
  toggleCheckboxAnswer: (assessmentId, fieldId, option) =>
    set((state) => {
      const assessment = state.assessments.find((item) => item.id === assessmentId);
      if (!assessment) return state;
      const draft = ensureDraft(state.drafts, assessment);
      const current = draft.answers[fieldId];
      const values = Array.isArray(current) ? current : [];
      const nextValues = values.includes(option) ? values.filter((item) => item !== option) : [...values, option];

      return {
        drafts: {
          ...state.drafts,
          [assessmentId]: {
            ...draft,
            answers: {
              ...draft.answers,
              [fieldId]: nextValues,
            },
          },
        },
      };
    }),
  togglePhoto: (assessmentId, poseId) =>
    set((state) => {
      const assessment = state.assessments.find((item) => item.id === assessmentId);
      if (!assessment) return state;
      const draft = ensureDraft(state.drafts, assessment);

      return {
        drafts: {
          ...state.drafts,
          [assessmentId]: {
            ...draft,
            photos: {
              ...draft.photos,
              [poseId]: !draft.photos[poseId],
            },
          },
        },
      };
    }),
  toggleExam: (assessmentId, examId) =>
    set((state) => {
      const assessment = state.assessments.find((item) => item.id === assessmentId);
      if (!assessment) return state;
      const draft = ensureDraft(state.drafts, assessment);

      return {
        drafts: {
          ...state.drafts,
          [assessmentId]: {
            ...draft,
            exams: {
              ...draft.exams,
              [examId]: !draft.exams[examId],
            },
          },
        },
      };
    }),
  submitAssessment: (assessmentId) =>
    set((state) => {
      const assessment = state.assessments.find((item) => item.id === assessmentId);
      if (!assessment) return state;
      const draft = ensureDraft(state.drafts, assessment);

      return {
        assessments: state.assessments.map((item) =>
          item.id === assessmentId
            ? {
                ...item,
                status: 'analysis',
                submittedAt: 'Agora',
              }
            : item,
        ),
        drafts: {
          ...state.drafts,
          [assessmentId]: {
            ...draft,
            submitted: true,
          },
        },
      };
    }),
}));

export function getAssessmentSnapshot(id: string) {
  const state = useAssessmentsStore.getState();
  const assessment = state.assessments.find((item) => item.id === id) ?? state.assessments[0];
  return {
    assessment,
    draft: state.drafts[assessment.id] ?? createAssessmentDraft(assessment),
  };
}
