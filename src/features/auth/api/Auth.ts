import { Routes } from '@/src/shared/api/routes';

// ─── Types ──────────────────────────────────────────────────────────────

export type StudentLookupStatus = 'not-found' | 'needs-registration' | 'existing-student';

export interface StudentLookupResponse {
  status: StudentLookupStatus;
  email?: string;
  name?: string;
}

export interface StudentAuthResponse {
  token: string;
  refreshToken: string;
  studentId: string;
  cpf: string;
  name: string;
  email: string;
  released_questionnaire?: {
    id: string;
    title: string;
    description?: string;
  } | null;
}

// ─── API Functions ──────────────────────────────────────────────────────

/**
 * Busca um aluno pelo CPF.
 * Retorna o status: not-found, needs-registration, existing-student
 */
export async function lookupByCpf(cpf: string): Promise<StudentLookupResponse> {
  return Routes.post<StudentLookupResponse>('/api/student-auth/lookup', { cpf });
}

/**
 * Primeiro acesso do aluno: define email e senha.
 */
export async function registerStudentAccess(
  cpf: string,
  email: string,
  password: string,
): Promise<StudentAuthResponse> {
  return Routes.post<StudentAuthResponse>('/api/student-auth/register', {
    cpf,
    email,
    password,
  });
}

/**
 * Login de aluno com CPF + senha.
 */
export async function loginStudent(
  cpf: string,
  password: string,
): Promise<StudentAuthResponse> {
  return Routes.post<StudentAuthResponse>('/api/student-auth/login', {
    cpf,
    password,
  });
}
