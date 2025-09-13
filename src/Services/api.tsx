import axios from 'axios';
import { ApolloClient, InMemoryCache, HttpLink, gql } from '@apollo/client';

// Base URL configuration
const BASE_URL = 'https://admin.twilightfinland.eu/graphql';

// Axios instance configuration
const axiosInstance = axios.create({
  baseURL: BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Apollo Client configuration
const apolloClient = new ApolloClient({
  link: new HttpLink({ uri: BASE_URL }),
  cache: new InMemoryCache(),
});

// TypeScript interfaces for data handling

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
interface User {
  id: string;
  name: string;
  email: string;
  // Add more user fields as needed
}

interface UserLoginInput {
  email: string;
  password: string;
}

interface UserRegistrationInput {
  name: string;
  email: string;
  password: string;
  // Add more registration fields as needed
}

// Course related interfaces
interface Course {
  id: string;
  title: string;
  description: string;
  // Add more course fields as needed
}

// GraphQL query functions

/**
 * Execute a GraphQL query using Apollo Client
 * @param query GraphQL query
 * @param variables Query variables
 * @returns Promise with query result
 */
async function executeQuery<T>(query: string, variables?: Record<string, any>): Promise<ApiResponse<T>> {
  try {
    const result = await apolloClient.query({
      query: gql`${query}`,
      variables,
    });
    return { data: result.data as T };
  } catch (error: any) {
    if (error.graphQLErrors) {
      return { data: {} as T, errors: error.graphQLErrors };
    }
    throw error;
  }
}

/**
 * Get user by ID
 * @param id User ID
 * @returns User data
 */
export async function getUserById(id: string): Promise<ApiResponse<{ user: User }>> {
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

/**
 * Get all courses
 * @returns List of courses
 */
export async function getAllCourses(): Promise<ApiResponse<{ courses: Course[] }>> {
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

// GraphQL mutation functions

/**
 * Execute a GraphQL mutation using Apollo Client
 * @param mutation GraphQL mutation
 * @param variables Mutation variables
 * @returns Promise with mutation result
 */
async function executeMutation<T>(mutation: string, variables?: Record<string, any>): Promise<ApiResponse<T>> {
  try {
    const result = await apolloClient.mutate({
      mutation: gql`${mutation}`,
      variables,
    });
    return { data: result.data as T };
  } catch (error: any) {
    if (error.graphQLErrors) {
      return { data: {} as T, errors: error.graphQLErrors };
    }
    throw error;
  }
}

/**
 * Login user
 * @param input Login credentials
 * @returns Login result with token
 */
export async function loginUser(input: UserLoginInput): Promise<ApiResponse<{ login: { token: string; user: User } }>> {
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
  return executeMutation<{ login: { token: string; user: User } }>(mutation, input);
}

/**
 * Register new user
 * @param input User registration data
 * @returns Registration result
 */
export async function registerUser(input: UserRegistrationInput): Promise<ApiResponse<{ register: { user: User } }>> {
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

// Direct axios methods for more flexibility

/**
 * Execute a raw GraphQL query using axios
 * @param query GraphQL query string
 * @param variables Query variables
 * @returns Promise with query result
 */
export async function executeRawQuery<T>(query: string, variables?: Record<string, any>): Promise<ApiResponse<T>> {
  try {
    const response = await axiosInstance.post('', {
      query,
      variables,
    });
    return response.data;
  } catch (error: any) {
    if (error.response && error.response.data) {
      return error.response.data;
    }
    throw error;
  }
}

// Export the axios instance and Apollo client for direct use if needed
export { axiosInstance, apolloClient };