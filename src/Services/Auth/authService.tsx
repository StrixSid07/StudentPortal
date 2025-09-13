import { executeRawQuery } from "../api";

// User interface based on GraphQL response
export interface User {
  id: string;
  fullname: string;
  email: string;
  mobile: string;
  dob: string;
  gender: string;
  class: string;
  isOnlineExam: boolean;
  country: string;
  isVerified: boolean;
  examType?: string;
  isPaid: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface LoginResponse {
  login: {
    success: boolean;
    message: string;
    token: string;
    isVerified: boolean;
    isExist: boolean;
    user: User;
  };
}

export interface ForgotPasswordResponse {
  ForgotPassword: { success: boolean; message: string };
}

export interface VerifyOtpResponse {
  verifyotp: { success: boolean; message: string };
}

export interface ResetPasswordResponse {
  ResetPassword: { success: boolean; message: string };
}

export interface RegisterResponse {
  register: { success: boolean; message: string; user: User };
}

export interface Country {
  id: number;
  name: string;
  code: string;
  price: number;
  currency: { code: string; name: string; symbol: string };
  flag: string;
  isoCode: string;
}

export interface CountriesResponse {
  countries: { rows: Country[]; count: number };
}

const authService = {
  // Login
  login: async (email: string, password: string) => {
    const loginMutation = `
      mutation Login($loginEmail2: String!, $loginPassword2: String!) {
        login(email: $loginEmail2, password: $loginPassword2) {
          success
          message
          token
          isVerified
          isExist
          user {
            id
            fullname
            email
            mobile
            dob
            gender
            class
            isOnlineExam
            country
            isVerified
            isPaid
            createdAt
            updatedAt
          }
        }
      }
    `;
    return executeRawQuery<LoginResponse>(loginMutation, {
      loginEmail2: email,
      loginPassword2: password,
    });
  },

  // Forgot Password
  forgotPassword: async (email: string) => {
    const mutation = `
      mutation ForgotPassword($email: String!) {
        ForgotPassword(email: $email) {
          success
          message
        }
      }
    `;
    return executeRawQuery<ForgotPasswordResponse>(mutation, { email });
  },

  // Verify OTP
  verifyOtp: async (email: string, otp: string) => {
    const mutation = `
      mutation Verifyotp($email: String!, $otp: String!) {
        verifyotp(email: $email, otp: $otp) {
          success
          message
        }
      }
    `;
    return executeRawQuery<VerifyOtpResponse>(mutation, { email, otp });
  },

  // Reset Password
  resetPassword: async (email: string, newPassword: string) => {
    const mutation = `
      mutation ResetPassword($newPassword: String!, $email: String) {
        ResetPassword(newPassword: $newPassword, email: $email) {
          success
          message
        }
      }
    `;
    return executeRawQuery<ResetPasswordResponse>(mutation, {
      email,
      newPassword,
    });
  },

  // Register
  register: async (input: {
    isOnlineExam: boolean;
    fullname: string;
    email: string;
    mobile: string;
    password: string;
    dob: string;
    gender: string;
    class: string;
    country: string;
  }) => {
    const mutation = `
      mutation Register(
        $isOnlineExam: Boolean!,
        $fullname: String,
        $email: String,
        $mobile: String,
        $password: String,
        $dob: String,
        $gender: String,
        $class: String,
        $country: String
      ) {
        register(
          isOnlineExam: $isOnlineExam,
          fullname: $fullname,
          email: $email,
          mobile: $mobile,
          password: $password,
          dob: $dob,
          gender: $gender,
          class: $class,
          country: $country
        ) {
          success
          message
          user {
            id
            fullname
            email
            mobile
            dob
            gender
            class
            isOnlineExam
            country
            isVerified
            isPaid
            createdAt
            updatedAt
          }
        }
      }
    `;
    return executeRawQuery<RegisterResponse>(mutation, input);
  },

  // Get countries
  getCountries: async (search?: string, limit?: number, offset?: number) => {
    const query = `
      query Countries($search: String, $limit: Int, $offset: Int) {
        countries(search: $search, limit: $limit, offset: $offset) {
          rows {
            id
            name
          }
          count
        }
      }
    `;
    return executeRawQuery<CountriesResponse>(query, { search, limit, offset });
  },

  // Local storage helpers
  setToken: (token: string) => localStorage.setItem("auth_token", token),
  getToken: () => localStorage.getItem("auth_token"),
  removeToken: () => localStorage.removeItem("auth_token"),

  setUser: (user: User) => localStorage.setItem("user", JSON.stringify(user)),
  getUser: (): User | null => {
    const raw = localStorage.getItem("user");
    return raw ? JSON.parse(raw) : null;
  },
  removeUser: () => localStorage.removeItem("user"),

  logout: () => {
    localStorage.removeItem("auth_token");
    localStorage.removeItem("user");
  },
};

export default authService;
