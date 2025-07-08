import { User } from '@prisma/client';
import { API_BASE } from '../config/api';

export async function getToken(username:string, password: string): Promise<{user: User, token:string}> {
    const response = await fetch(`${API_BASE}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ username, password }),
    });

    if (!response.ok) {
      // Gestion spécifique selon le code
      if (response.status === 401) {
        throw new Error('Identifiants incorrects.');
      } else if (response.status === 403) {
        throw new Error('Accès refusé.');
      } else {
        const errorText = await response.text();
        throw new Error(`Erreur serveur (${response.status}) : ${errorText}`);
      }
    }

    return response.json();
}