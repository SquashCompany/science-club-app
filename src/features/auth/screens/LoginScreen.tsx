import { useMutation } from '@tanstack/react-query';
import { router } from 'expo-router';
import { useMemo, useState } from 'react';

import { AppScreen } from '@/src/shared/components/ui/AppScreen';
import { onlyDigits } from '@/src/shared/utils/cpf';
import { showSonner } from '@/src/shared/stores/sonner.store';

import { CpfStep } from '../components/CpfStep';
import { LoginShell } from '../components/LoginShell';
import { PasswordStep } from '../components/PasswordStep';
import { RegisterStep } from '../components/RegisterStep';
import { lookupStudentByCpf, registerAccess, signInWithPassword } from '../services/auth.service';
import { useAuthStore } from '../services/auth.store';
import type { AuthLookupStatus, AuthLookupResponse, CpfFormValues, PasswordFormValues, RegisterFormValues } from '../types/auth.types';

type LoginStep = 'cpf' | 'existing-student' | 'needs-registration';

export function LoginScreen() {
  const [step, setStep] = useState<LoginStep>('cpf');
  const [cpf, setCpf] = useState('');
  const [studentEmail, setStudentEmail] = useState('');
  const setSession = useAuthStore((state) => state.setSession);

  const copy = useMemo(() => {
    if (step === 'existing-student') {
      return {
        description: 'Informe sua senha para continuar com a experiencia Science Fitness.',
        eyebrow: 'Acesso do aluno',
        title: 'Bem-vindo de volta.',
      };
    }

    if (step === 'needs-registration') {
      return {
        description: 'Complete seu acesso com email e senha para ativar sua área do aluno.',
        eyebrow: 'Primeiro acesso',
        title: 'Finalize seu cadastro.',
      };
    }

    return {
      description: 'Acompanhe treinos, dieta e reavaliações com uma experiência focada em performance.',
      eyebrow: 'Science Fitness',
      title: 'Entre no seu clube.',
    };
  }, [step]);

  const lookupMutation = useMutation({
    mutationFn: lookupStudentByCpf,
    onSuccess: (result: AuthLookupResponse, values: CpfFormValues) => {
      if (result.status === 'not-found') {
        showSonner({
          type: 'error',
          message: 'Você não possui acesso ao aplicativo.',
          duration: 4000,
        });
        return;
      }

      setCpf(values.cpf);
      setStudentEmail(result.email || '');
      setStep(result.status as 'existing-student' | 'needs-registration');
    },
    onError: (error: Error) => {
      showSonner({
        type: 'error',
        message: error.message || 'Erro ao buscar cadastro. Tente novamente.',
      });
    },
  });

  const passwordMutation = useMutation({
    mutationFn: (values: PasswordFormValues) => signInWithPassword(onlyDigits(cpf), values),
    onSuccess: async (session) => {
      await setSession(session);
      showSonner({ type: 'success', message: 'Bem-vindo de volta!' });
      router.replace('/(app)/(tabs)/home');
    },
    onError: (error: Error) => {
      showSonner({
        type: 'error',
        message: error.message || 'CPF ou senha incorretos.',
      });
    },
  });

  const registerMutation = useMutation({
    mutationFn: (values: RegisterFormValues) => registerAccess(onlyDigits(cpf), values),
    onSuccess: async (session) => {
      await setSession(session);
      showSonner({ type: 'success', message: 'Conta criada com sucesso!' });
      router.replace('/(app)/(tabs)/home');
    },
    onError: (error: Error) => {
      showSonner({
        type: 'error',
        message: error.message || 'Erro ao criar sua conta. Tente novamente.',
      });
    },
  });

  function handleCpfSubmit(values: CpfFormValues) {
    lookupMutation.mutate(values);
  }

  function resetCpf() {
    setStep('cpf');
    setCpf('');
    setStudentEmail('');
  }

  function forgotPassword() {
    showSonner({
      type: 'info',
      message: 'Entre em contato com sua equipe para redefinir a senha.',
      duration: 5000,
    });
  }

  return (
    <AppScreen hideGlow scroll={false}>
      <LoginShell 
        showBackButton={step !== 'cpf'} 
        onBack={resetCpf}
      >
        {step === 'cpf' ? (
          <CpfStep isLoading={lookupMutation.isPending} onSubmit={handleCpfSubmit} />
        ) : null}

        {step === 'existing-student' ? (
          <PasswordStep
            cpf={cpf}
            isLoading={passwordMutation.isPending}
            onBack={resetCpf}
            onForgotPassword={forgotPassword}
            onSubmit={(values) => passwordMutation.mutate(values)}
          />
        ) : null}

        {step === 'needs-registration' ? (
          <RegisterStep
            cpf={cpf}
            email={studentEmail}
            isLoading={registerMutation.isPending}
            onBack={resetCpf}
            onForgotPassword={forgotPassword}
            onSubmit={(values) => registerMutation.mutate(values)}
          />
        ) : null}
      </LoginShell>
    </AppScreen>
  );
}
