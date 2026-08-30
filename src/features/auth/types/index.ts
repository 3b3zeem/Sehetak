export interface LoginCredentials {
  email: string;
  password: string;
}

export interface RegisterCredentials {
  fullName: string;
  username: string;
  email: string;
  password: string;
  locale: 'en' | 'ar';
}

export interface AuthUserData {
  id: string;
  email: string;
  username: string;
  role: 'admin' | 'patient';
}
