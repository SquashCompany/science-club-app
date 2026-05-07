export type AssessmentStatus = 'pending' | 'sent' | 'received' | 'analysis' | 'answered' | 'overdue' | 'scheduled';

export type AssessmentFieldType = 'text' | 'long_text' | 'number' | 'select' | 'radio' | 'checkbox';

export type AssessmentFilter = 'pending' | 'analysis' | 'done' | 'all';

export type AssessmentField = {
  id: string;
  label: string;
  type: AssessmentFieldType;
  required: boolean;
  options?: string[];
};

export type AssessmentQuestionnaireSection = {
  id: string;
  title: string;
  description: string;
  fields: AssessmentField[];
};

export type AssessmentQuestionnaire = {
  id: string;
  title: string;
  description: string;
  sections: AssessmentQuestionnaireSection[];
};

export type AssessmentPhotoPose = {
  id: string;
  label: string;
  instruction: string;
  required: boolean;
};

export type AssessmentExam = {
  id: string;
  name: string;
  type: string;
  category: string;
  required: boolean;
  date?: string;
  status?: 'requested' | 'attached' | 'reviewed';
  note: string;
};

export type AssessmentResult = {
  deliveredAt: string;
  coachMessage: string;
  trainingDecision: string;
  dietDecision: string;
  nextSteps: string[];
  nextAssessmentAt: string;
};

export type Assessment = {
  id: string;
  title: string;
  type: string;
  category: string;
  status: AssessmentStatus;
  plan: string;
  mesocycle: string;
  professional: string;
  dueDate: string;
  submittedAt?: string;
  lastEvaluation: string;
  nextEvaluation: string;
  linkedDemand?: string;
  questionnaire: AssessmentQuestionnaire;
  photoPoses: AssessmentPhotoPose[];
  exams: AssessmentExam[];
  result?: AssessmentResult;
};

export type AssessmentAnswerValue = string | string[];

export type AssessmentDraft = {
  answers: Record<string, AssessmentAnswerValue>;
  photos: Record<string, boolean>;
  exams: Record<string, boolean>;
  submitted: boolean;
};
