import { create } from 'zustand';

import { mockStudentProfile } from '../data/profile';
import { ProfilePreferences, StudentProfile } from '../types';

type ProfileStore = {
  profile: StudentProfile;
  updateContact: (contact: Pick<StudentProfile, 'phone' | 'city'>) => void;
  cycleAvatar: () => void;
  setPreference: <Key extends keyof ProfilePreferences>(key: Key, value: ProfilePreferences[Key]) => void;
};

export const useProfileStore = create<ProfileStore>((set) => ({
  profile: mockStudentProfile,
  updateContact: (contact) =>
    set((state) => ({
      profile: {
        ...state.profile,
        ...contact,
      },
    })),
  cycleAvatar: () =>
    set((state) => ({
      profile: {
        ...state.profile,
        avatarVariant: state.profile.avatarVariant >= 4 ? 1 : state.profile.avatarVariant + 1,
      },
    })),
  setPreference: (key, value) =>
    set((state) => ({
      profile: {
        ...state.profile,
        preferences: {
          ...state.profile.preferences,
          [key]: value,
        },
      },
    })),
}));
