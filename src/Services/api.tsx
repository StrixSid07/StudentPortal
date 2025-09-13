import axios from "axios";
import { ApolloClient, InMemoryCache, HttpLink, gql } from "@apollo/client";

// Base URL configuration
const BASE_URL = "https://api.twilightfinland.eu/graphql";

// Axios instance configuration
const axiosInstance = axios.create({
  baseURL: BASE_URL,
  headers: {
    "Content-Type": "application/json",
  },
});

// Apollo Client configuration
const apolloClient = new ApolloClient({
  link: new HttpLink({ uri: BASE_URL }),
  cache: new InMemoryCache(),
});

// -----------------------------
// Types
// -----------------------------

// Generic response interface
interface ApiResponse<T> {
  data: T;
  errors?: Array<{
    message: string;
    locations?: Array<{ line: number; column: number }>;
    path?: string[];
  }>;
}

// User related interfaces
export interface User {
  id: string;
  name: string;
  email: string;
  // Add more user fields as needed
}

export interface UserLoginInput {
  email: string;
  password: string;
}

export interface UserRegistrationInput {
  name: string;
  email: string;
  password: string;
}

// Course related interfaces
export interface Course {
  id: string;
  title: string;
  description: string;
}

// -----------------------------
// Apollo Client helpers
// -----------------------------

/**
 * Execute a GraphQL query using Apollo Client
 */
async function executeQuery<T>(
  query: string,
  variables?: Record<string, any>,
): Promise<T> {
  try {
    const result = await apolloClient.query({
      query: gql`
        ${query}
      `,
      variables,
    });
    return result.data as T;
  } catch (error: any) {
    if (error.graphQLErrors) {
      throw new Error(error.graphQLErrors[0].message);
    }
    throw error;
  }
}

/**
 * Execute a GraphQL mutation using Apollo Client
 */
async function executeMutation<T>(
  mutation: string,
  variables?: Record<string, any>,
): Promise<T> {
  try {
    const result = await apolloClient.mutate({
      mutation: gql`
        ${mutation}
      `,
      variables,
    });
    return result.data as T;
  } catch (error: any) {
    if (error.graphQLErrors) {
      throw new Error(error.graphQLErrors[0].message);
    }
    throw error;
  }
}

// -----------------------------
// Example Queries
// -----------------------------

export async function getUserById(id: string): Promise<{ user: User }> {
  const query = `
    query GetUser($id: ID!) {
      user(id: $id) {
        id
        name
        email
      }
    }
  `;
  return executeQuery<{ user: User }>(query, { id });
}

export async function getAllCourses(): Promise<{ courses: Course[] }> {
  const query = `
    query GetAllCourses {
      courses {
        id
        title
        description
      }
    }
  `;
  return executeQuery<{ courses: Course[] }>(query);
}

// -----------------------------
// Example Mutations
// -----------------------------

export async function loginUser(
  input: UserLoginInput,
): Promise<{ login: { token: string; user: User } }> {
  const mutation = `
    mutation Login($email: String!, $password: String!) {
      login(email: $email, password: $password) {
        token
        user {
          id
          name
          email
        }
      }
    }
  `;
  return executeMutation<{ login: { token: string; user: User } }>(
    mutation,
    input,
  );
}

export async function registerUser(
  input: UserRegistrationInput,
): Promise<{ register: { user: User } }> {
  const mutation = `
    mutation Register($name: String!, $email: String!, $password: String!) {
      register(name: $name, email: $email, password: $password) {
        user {
          id
          name
          email
        }
      }
    }
  `;
  return executeMutation<{ register: { user: User } }>(mutation, input);
}

// -----------------------------
// Axios Raw Query (fixed)
// -----------------------------

/**
 * Execute a raw GraphQL query using axios
 * Returns unwrapped `T`
 */
export async function executeRawQuery<T>(
  query: string,
  variables?: Record<string, any>,
): Promise<T> {
  try {
    const response = await axiosInstance.post<ApiResponse<T>>("", {
      query,
      variables,
    });

    if (response.data.errors && response.data.errors.length > 0) {
      throw new Error(response.data.errors[0].message);
    }

    // ✅ unwrap .data so consumers just get T
    return response.data.data;
  } catch (error: any) {
    if (error.response?.data?.errors) {
      throw new Error(error.response.data.errors[0].message);
    }
    throw error;
  }
}

// Export clients if needed
export { axiosInstance, apolloClient };
