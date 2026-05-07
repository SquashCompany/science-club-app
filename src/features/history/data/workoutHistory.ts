import { HistoryWorkoutEntry } from '../types';

export const workoutHistory: HistoryWorkoutEntry[] = [
  {
    id: 'hist-upper-2026-05-04',
    date: '2026-05-04',
    title: 'Cima e Baixo 1',
    sheetTitle: 'Base Science - Hipertrofia',
    durationSeconds: 3674,
    completedSets: 21,
    totalSets: 24,
    progressions: 4,
    comment: 'Boa energia. Leg press subiu com controle e remada ficou mais limpa.',
    photoUri: 'mock://workout-upper',
    exercises: [
      {
        id: 'cadeira-extensora',
        name: 'Cadeira Extensora',
        muscle: 'Quadriceps',
        sets: [
          { id: 'set-1', targetReps: 15, actualReps: 15, previousWeightKg: 35, weightKg: 37.5, completed: true },
          { id: 'set-2', targetReps: 15, actualReps: 15, previousWeightKg: 35, weightKg: 37.5, completed: true },
          { id: 'set-3', targetReps: 15, actualReps: 12, previousWeightKg: 35, weightKg: 37.5, completed: true },
        ],
      },
      {
        id: 'leg-press',
        name: 'Leg Press',
        muscle: 'Pernas',
        sets: [
          { id: 'set-1', targetReps: 15, actualReps: 15, previousWeightKg: 120, weightKg: 130, completed: true },
          { id: 'set-2', targetReps: 15, actualReps: 14, previousWeightKg: 120, weightKg: 130, completed: true },
          { id: 'set-3', targetReps: 15, actualReps: 12, previousWeightKg: 120, weightKg: 130, completed: true },
        ],
      },
      {
        id: 'puxada-frente',
        name: 'Puxada Frente no Pulley',
        muscle: 'Dorsais',
        sets: [
          { id: 'set-1', targetReps: 15, actualReps: 15, previousWeightKg: 45, weightKg: 45, completed: true },
          { id: 'set-2', targetReps: 15, actualReps: 15, previousWeightKg: 45, weightKg: 47.5, completed: true },
          { id: 'set-3', targetReps: 15, actualReps: 13, previousWeightKg: 45, weightKg: 47.5, completed: true },
        ],
      },
    ],
  },
  {
    id: 'hist-push-2026-05-02',
    date: '2026-05-02',
    title: 'Push A',
    sheetTitle: 'Base Science - Hipertrofia',
    durationSeconds: 3180,
    completedSets: 18,
    totalSets: 18,
    progressions: 2,
    comment: 'Treino consistente. Supino teve melhor estabilidade.',
    exercises: [
      {
        id: 'supino-reto',
        name: 'Supino Reto',
        muscle: 'Peitoral',
        sets: [
          { id: 'set-1', targetReps: 10, actualReps: 10, previousWeightKg: 70, weightKg: 72.5, completed: true },
          { id: 'set-2', targetReps: 10, actualReps: 9, previousWeightKg: 70, weightKg: 72.5, completed: true },
          { id: 'set-3', targetReps: 10, actualReps: 8, previousWeightKg: 70, weightKg: 70, completed: true },
        ],
      },
      {
        id: 'desenvolvimento',
        name: 'Desenvolvimento Halteres',
        muscle: 'Ombros',
        sets: [
          { id: 'set-1', targetReps: 12, actualReps: 12, previousWeightKg: 20, weightKg: 22, completed: true },
          { id: 'set-2', targetReps: 12, actualReps: 11, previousWeightKg: 20, weightKg: 22, completed: true },
          { id: 'set-3', targetReps: 12, actualReps: 10, previousWeightKg: 20, weightKg: 20, completed: true },
        ],
      },
    ],
  },
  {
    id: 'hist-pull-2026-04-29',
    date: '2026-04-29',
    title: 'Pull B',
    sheetTitle: 'Base Science - Hipertrofia',
    durationSeconds: 3440,
    completedSets: 16,
    totalSets: 21,
    progressions: 1,
    comment: 'Faltou tempo para finalizar biceps, mas dorsais responderam bem.',
    exercises: [
      {
        id: 'remada-baixa',
        name: 'Remada Baixa na Polia',
        muscle: 'Dorsais',
        sets: [
          { id: 'set-1', targetReps: 12, actualReps: 12, previousWeightKg: 50, weightKg: 52.5, completed: true },
          { id: 'set-2', targetReps: 12, actualReps: 11, previousWeightKg: 50, weightKg: 52.5, completed: true },
          { id: 'set-3', targetReps: 12, actualReps: 10, previousWeightKg: 50, weightKg: 50, completed: true },
        ],
      },
      {
        id: 'rosca-direta',
        name: 'Rosca Direta',
        muscle: 'Biceps',
        sets: [
          { id: 'set-1', targetReps: 12, actualReps: 12, previousWeightKg: 20, weightKg: 20, completed: true },
          { id: 'set-2', targetReps: 12, actualReps: 10, previousWeightKg: 20, weightKg: 20, completed: true },
          { id: 'set-3', targetReps: 12, actualReps: 0, previousWeightKg: 20, weightKg: 20, completed: false },
        ],
      },
    ],
  },
  {
    id: 'hist-full-2026-04-24',
    date: '2026-04-24',
    title: 'Full Body Tecnico',
    sheetTitle: 'Semana de ajuste',
    durationSeconds: 2895,
    completedSets: 15,
    totalSets: 15,
    progressions: 0,
    exercises: [
      {
        id: 'agachamento-goblet',
        name: 'Agachamento Goblet',
        muscle: 'Pernas',
        sets: [
          { id: 'set-1', targetReps: 15, actualReps: 15, previousWeightKg: 30, weightKg: 30, completed: true },
          { id: 'set-2', targetReps: 15, actualReps: 15, previousWeightKg: 30, weightKg: 30, completed: true },
          { id: 'set-3', targetReps: 15, actualReps: 15, previousWeightKg: 30, weightKg: 30, completed: true },
        ],
      },
    ],
  },
];
