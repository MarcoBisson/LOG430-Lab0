import { useAuthStore } from '../stores/useAuthStore';

export async function authFetch(input: RequestInfo, init: RequestInit = {}) {
  const token = localStorage.getItem('token');

  const headers = {
    ...init.headers,
    'Content-Type': 'application/json',
    ...(token && { Authorization: `Bearer ${token}` }),
  };

  const response =  await fetch(input, {
    ...init,
    headers,
  });

  if (response.status === 403) {
    const clearStore = useAuthStore.getState().clear;
    clearStore(); 
    localStorage.removeItem('token');
    window.location.href = '/login';
  }

  return response;
}