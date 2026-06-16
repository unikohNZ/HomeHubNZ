import api from "./api";
import { queryKeys } from "@/lib/queryClient";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

export interface UserProfile {
  id: number;
  email: string;
  first_name: string;
  last_name: string;
  phone?: string | null;
  avatar_url?: string | null;
  role: string;
  emergency_contact_name?: string | null;
  emergency_contact_phone?: string | null;
}

export interface ProfileUpdateInput {
  first_name?: string;
  last_name?: string;
  email?: string;
  phone?: string;
  emergency_contact_name?: string;
  emergency_contact_phone?: string;
}

export const profileService = {
  async getProfile(): Promise<UserProfile> {
    const { data } = await api.get<UserProfile>("/profile/me");
    return data;
  },

  async updateProfile(patch: ProfileUpdateInput): Promise<UserProfile> {
    const { data } = await api.patch<UserProfile>("/profile/me", patch);
    return data;
  },

  async uploadAvatar(file: { uri: string; name: string; type: string }): Promise<UserProfile> {
    const form = new FormData();
    form.append("file", {
      uri: file.uri,
      name: file.name,
      type: file.type,
    } as unknown as Blob);
    const { data } = await api.post<UserProfile>("/profile/me/avatar", form, {
      headers: { "Content-Type": "multipart/form-data" },
    });
    return data;
  },

  /** Spec alias — POST /users/me/photo */
  async uploadPhoto(file: { uri: string; name: string; type: string }): Promise<UserProfile> {
    const form = new FormData();
    form.append("file", {
      uri: file.uri,
      name: file.name,
      type: file.type,
    } as unknown as Blob);
    const { data } = await api.post<UserProfile>("/users/me/photo", form, {
      headers: { "Content-Type": "multipart/form-data" },
    });
    return data;
  },
};

export function useProfile(enabled = true) {
  return useQuery({
    queryKey: queryKeys.profile.me,
    queryFn: () => profileService.getProfile(),
    enabled,
    placeholderData: (prev) => prev,
  });
}

export function useUpdateProfile() {
  const client = useQueryClient();
  return useMutation({
    mutationFn: profileService.updateProfile,
    onSuccess: (data) => {
      client.setQueryData(queryKeys.profile.me, data);
      client.invalidateQueries({ queryKey: queryKeys.auth.me });
    },
  });
}

export function useUploadAvatar() {
  const client = useQueryClient();
  return useMutation({
    mutationFn: profileService.uploadAvatar,
    onSuccess: (data) => {
      client.setQueryData(queryKeys.profile.me, data);
      client.invalidateQueries({ queryKey: queryKeys.auth.me });
    },
  });
}
