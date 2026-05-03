export interface RegisterResponse {
  userId: string;
  message: string;
}

export interface LoginCredentials {
  email: string;
  password: string;
}

export interface AuthResponse {
  message: string;
  userId: string;
  role: string;
}
