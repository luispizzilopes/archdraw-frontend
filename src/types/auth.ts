export interface SessionUser {
  userId: string;
  name: string;
  email: string | null;
  avatarUrl?: string;
}

export interface SessionResponse {
  userId: string;
  email: string | null;
  name: string;
  token: string;
  tokenExpiresAtUtc: string;
  profilePhotoUrl: string | null;
}

export interface Profile {
  userId: string;
  name: string;
  email: string | null;
  profilePhotoUrl: string | null;
  createdAtUtc: string;
}

export interface RegisterPayload {
  name: string;
  email: string;
  password: string;
}

export interface LoginPayload {
  email: string;
  password: string;
}
