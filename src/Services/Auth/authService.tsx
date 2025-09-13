import { executeRawQuery } from "../api";

// User interface based on the provided GraphQL response
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

// Login response interface
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

// Login input interface
export interface LoginInput {
  loginEmail2: string;
  loginPassword2: string;
}

// Response interfaces for password reset flow
export interface ForgotPasswordResponse {
  ForgotPassword: {
    success: boolean;
    message: string;
  };
}

export interface VerifyOtpResponse {
  verifyotp: {
    success: boolean;
    message: string;
  };
}

export interface ResetPasswordResponse {
  ResetPassword: {
    success: boolean;
    message: string;
  };
}

// Registration input interface
export interface RegisterInput {
  isOnlineExam: boolean;
  fullname: string;
  email: string;
  mobile: string;
  password: string;
  dob: string;
  gender: string;
  class: string;
  country: string;
}

// Registration response interface
export interface RegisterResponse {
  register: {
    success: boolean;
    message: string;
    user: User;
  };
}

// Countries response interface
export interface CountriesResponse {
  countries: {
    rows: Country[];
    count: number;
  };
}

export interface Country {
  id: number;
  name: string;
  code: string;
  price: number;
  currency: {
    code: string;
    name: string;
    symbol: string;
  };
  flag: string;
  isoCode: string;
}

// Authentication service
const authService = {
  // Login function
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

    const variables: LoginInput = {
      loginEmail2: email,
      loginPassword2: password,
    };

    try {
      const response = await executeRawQuery<{ data: LoginResponse }>(
        loginMutation,
        variables,
      );
      return response.data;
    } catch (error) {
      console.error("Login error:", error);
      throw error;
    }
  },

  // Forgot Password function
  forgotPassword: async (email: string) => {
    const forgotPasswordMutation = `
      mutation ForgotPassword($email: String!) {
        ForgotPassword(email: $email) {
          message
          success
        }
      }
    `;
    const variables = { email };
    try {
      const response = await executeRawQuery<{ data: ForgotPasswordResponse }>(
        forgotPasswordMutation,
        variables,
      );
      return response.data;
    } catch (error) {
      console.error("Forgot password error:", error);
      throw error;
    }
  },

  // Verify OTP function
  verifyOtp: async (email: string, otp: string) => {
    const verifyOtpMutation = `
      mutation Verifyotp($email: String!, $otp: String!) {
        verifyotp(email: $email, otp: $otp) {
          message
          success
        }
      }
    `;
    const variables = { email, otp };
    try {
      const response = await executeRawQuery<{ data: VerifyOtpResponse }>(
        verifyOtpMutation,
        variables,
      );
      return response.data;
    } catch (error) {
      console.error("Verify OTP error:", error);
      throw error;
    }
  },

  // Reset Password function
  resetPassword: async (email: string, newPassword: string) => {
    const resetPasswordMutation = `
      mutation ResetPassword($newPassword: String!, $email: String) {
        ResetPassword(newPassword: $newPassword, email: $email) {
          message
          success
        }
      }
    `;
    const variables = { newPassword, email };
    try {
      const response = await executeRawQuery<{ data: ResetPasswordResponse }>(
        resetPasswordMutation,
        variables,
      );
      return response.data;
    } catch (error) {
      console.error("Reset password error:", error);
      throw error;
    }
  },

  // Register function
  register: async (registerData: RegisterInput) => {
    const registerMutation = `
      mutation Register(
        $isOnlineExam: Boolean!
        $fullname: String
        $email: String
        $mobile: String
        $password: String
        $dob: String
        $gender: String
        $class: String
        $country: String
      ) {
        register(
          isOnlineExam: $isOnlineExam
          fullname: $fullname
          email: $email
          mobile: $mobile
          password: $password
          dob: $dob
          gender: $gender
          class: $class
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
    try {
      const response = await executeRawQuery<{ data: RegisterResponse }>(
        registerMutation,
        registerData,
      );
      return response.data;
    } catch (error) {
      console.error("Registration error:", error);
      throw error;
    }
  },

  // Get countries function
  getCountries: async (search?: string, limit?: number, offset?: number) => {
    const countriesQuery = `
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
    const variables = { search, limit, offset };
    try {
      const response = await executeRawQuery<{ data: CountriesResponse }>(
        countriesQuery,
        variables,
      );
      return response.data;
    } catch (error) {
      console.error("Get countries error:", error);
      throw error;
    }
  },

  // Save auth token to localStorage
  setToken: (token: string) => {
    localStorage.setItem("auth_token", token);
  },

  // Get auth token from localStorage
  getToken: () => {
    return localStorage.getItem("auth_token");
  },

  // Remove auth token from localStorage
  removeToken: () => {
    localStorage.removeItem("auth_token");
  },

  // Check if user is authenticated
  isAuthenticated: () => {
    return !!localStorage.getItem("auth_token");
  },

  // Save user data to localStorage
  setUser: (user: User) => {
    localStorage.setItem("user", JSON.stringify(user));
  },

  // Get user data from localStorage
  getUser: (): User | null => {
    const userData = localStorage.getItem("user");
    return userData ? JSON.parse(userData) : null;
  },

  // Remove user data from localStorage
  removeUser: () => {
    localStorage.removeItem("user");
  },

  // Logout user
  logout: () => {
    localStorage.removeItem("auth_token");
    localStorage.removeItem("user");
  },
};

export default authService;
