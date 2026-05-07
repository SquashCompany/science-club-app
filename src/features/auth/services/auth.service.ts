import { lookupByCpf, loginStudent, registerStudentAccess } from '../api/Auth';
import type { AuthLookupResponse, AuthSession, CpfFormValues, PasswordFormValues, RegisterFormValues } from '../types/auth.types';
import { onlyDigits } from '@/src/shared/utils/cpf';

export async function lookupStudentByCpf(values: CpfFormValues): Promise<AuthLookupResponse> {
  const cpfDigits = onlyDigits(values.cpf);
  const result = await lookupByCpf(cpfDigits);

  return {
    status: result.status as AuthLookupResponse['status'],
    email: result.email,
    name: result.name,
  };
}

export async function signInWithPassword(cpf: string, values: PasswordFormValues): Promise<AuthSession> {
  const cpfDigits = onlyDigits(cpf);
  const result = await loginStudent(cpfDigits, values.password);

  return {
    cpf: result.cpf,
    studentId: result.studentId,
    token: result.token,
    refreshToken: result.refreshToken,
    name: result.name,
    email: result.email,
    released_questionnaire: result.released_questionnaire,
  };
}

export async function registerAccess(cpf: string, values: RegisterFormValues): Promise<AuthSession> {
  const cpfDigits = onlyDigits(cpf);
  const result = await registerStudentAccess(cpfDigits, values.email, values.password);

  return {
    cpf: result.cpf,
    studentId: result.studentId,
    token: result.token,
    refreshToken: result.refreshToken,
    name: result.name,
    email: result.email,
    released_questionnaire: result.released_questionnaire,
  };
}
