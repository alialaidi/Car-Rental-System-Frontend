export type Role = 'Admin' | 'BranchManager' | 'Employee' | 'Customer';

export type AuthStatus = 'loading' | 'authenticated' | 'anonymous';

export interface AuthUser {
  id: string;
  username: string;
  roles: Role[];
}

export interface AuthTokens {
  accessToken: string;
  refreshToken: string;
  accessTokenExpiresAtUtc: Date;
}

export interface Session extends AuthTokens {
  user: AuthUser;
}

export interface RegisterRequest {
  username: string;
  email: string;
  password: string;
  phoneNumber?: string;
  fullName: string;
  drivingLicenseNumber: string;
  drivingLicenseExpiry: string;
  address?: string;
}

export interface LoginRequest {
  usernameOrEmail: string;
  password: string;
}

export interface RefreshTokenRequest {
  refreshToken: string;
}
