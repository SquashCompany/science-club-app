export type AuthLookupStatus = 'existing-student' | 'needs-registration' | 'not-found';

export type AuthSession = {
  token: string;
  refreshToken?: string;
  studentId: string;
  cpf: string;
  name?: string;
  email?: string;
  released_questionnaire?: {
    id: string;
    title: string;
    description?: string;
  } | null;
};

export type AuthLookupResponse = {
  status: AuthLookupStatus;
  email?: string;
  name?: string;
};

export type CpfFormValues = {
  cpf: string;
};

export type PasswordFormValues = {
  password: string;
};

export type RegisterFormValues = {
  email: string;
  password: string;
};
