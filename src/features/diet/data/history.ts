import { DietDayLog } from '../types';

export const initialDietLogs: Record<string, DietDayLog> = {
  '2026-05-03': {
    date: '2026-05-03',
    waterMl: 3000,
    mealLogs: [
      {
        mealId: 'cafe-manha',
        status: 'done',
        updatedAt: '2026-05-03T07:28:00.000Z',
        foodLogs: [
          { foodId: 'ovos-inteiros', selectedFoodId: 'ovos-inteiros', selectedFoodName: 'Ovos inteiros', plannedGrams: 150, actualGrams: 150, nutrition: { calories: 222, protein: 18, carbs: 0, fat: 15 }, loggedAt: '2026-05-03T07:28:00.000Z' },
          { foodId: 'pao-integral', selectedFoodId: 'pao-integral', selectedFoodName: 'Pao integral', plannedGrams: 60, actualGrams: 60, nutrition: { calories: 150, protein: 6, carbs: 28, fat: 2 }, loggedAt: '2026-05-03T07:28:00.000Z' },
          { foodId: 'abacate', selectedFoodId: 'abacate', selectedFoodName: 'Abacate', plannedGrams: 80, actualGrams: 80, nutrition: { calories: 128, protein: 1, carbs: 5, fat: 12 }, loggedAt: '2026-05-03T07:28:00.000Z' },
        ],
      },
      {
        mealId: 'almoco',
        status: 'partial',
        updatedAt: '2026-05-03T13:12:00.000Z',
        foodLogs: [
          { foodId: 'frango-grelhado', selectedFoodId: 'frango-grelhado', selectedFoodName: 'Frango grelhado', plannedGrams: 200, actualGrams: 180, nutrition: { calories: 297, protein: 56, carbs: 0, fat: 6 }, loggedAt: '2026-05-03T13:12:00.000Z' },
          { foodId: 'arroz-branco', selectedFoodId: 'arroz-branco', selectedFoodName: 'Arroz branco cozido', plannedGrams: 200, actualGrams: 200, nutrition: { calories: 260, protein: 5, carbs: 56, fat: 1 }, loggedAt: '2026-05-03T13:12:00.000Z' },
        ],
      },
    ],
  },
  '2026-05-04': {
    date: '2026-05-04',
    waterMl: 3600,
    mealLogs: [
      {
        mealId: 'cafe-manha',
        status: 'done',
        updatedAt: '2026-05-04T07:10:00.000Z',
        foodLogs: [
          { foodId: 'ovos-inteiros', selectedFoodId: 'ovos-inteiros', selectedFoodName: 'Ovos inteiros', plannedGrams: 150, actualGrams: 150, nutrition: { calories: 222, protein: 18, carbs: 0, fat: 15 }, loggedAt: '2026-05-04T07:10:00.000Z' },
          { foodId: 'pao-integral', selectedFoodId: 'tapioca', selectedFoodName: 'Tapioca', plannedGrams: 80, actualGrams: 80, nutrition: { calories: 170, protein: 2, carbs: 40, fat: 0 }, loggedAt: '2026-05-04T07:10:00.000Z', replacedBy: 'tapioca' },
          { foodId: 'abacate', selectedFoodId: 'abacate', selectedFoodName: 'Abacate', plannedGrams: 80, actualGrams: 80, nutrition: { calories: 128, protein: 1, carbs: 5, fat: 12 }, loggedAt: '2026-05-04T07:10:00.000Z' },
        ],
      },
      {
        mealId: 'lanche-manha',
        status: 'skipped',
        skippedReason: 'Sem fome',
        updatedAt: '2026-05-04T10:30:00.000Z',
        foodLogs: [],
      },
      {
        mealId: 'almoco',
        status: 'done',
        updatedAt: '2026-05-04T13:05:00.000Z',
        foodLogs: [
          { foodId: 'frango-grelhado', selectedFoodId: 'frango-grelhado', selectedFoodName: 'Frango grelhado', plannedGrams: 200, actualGrams: 200, nutrition: { calories: 330, protein: 62, carbs: 0, fat: 7 }, loggedAt: '2026-05-04T13:05:00.000Z' },
          { foodId: 'arroz-branco', selectedFoodId: 'arroz-branco', selectedFoodName: 'Arroz branco cozido', plannedGrams: 200, actualGrams: 210, nutrition: { calories: 273, protein: 5, carbs: 59, fat: 1 }, loggedAt: '2026-05-04T13:05:00.000Z' },
          { foodId: 'feijao-carioca', selectedFoodId: 'feijao-carioca', selectedFoodName: 'Feijao carioca', plannedGrams: 100, actualGrams: 100, nutrition: { calories: 130, protein: 8, carbs: 22, fat: 1 }, loggedAt: '2026-05-04T13:05:00.000Z' },
        ],
      },
    ],
  },
};
