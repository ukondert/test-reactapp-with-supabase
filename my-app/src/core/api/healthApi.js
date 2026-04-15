import { API_ENDPOINTS } from './endpoints';

export async function getHealthStatus() {
  const anonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

  if (!anonKey) {
    throw new Error('Missing VITE_SUPABASE_ANON_KEY for health endpoint request.');
  }

  const response = await fetch(API_ENDPOINTS.HEALTH, {
    method: 'GET',
    headers: {
      Accept: 'application/json',
      apikey: anonKey,
      Authorization: `Bearer ${anonKey}`,
    },
  });

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`Health endpoint failed (${response.status}): ${errorText}`);
  }

  // Supabase Auth health endpoint typically returns JSON with service metadata.
  const payload = await response.json();

  return {
    ok: true,
    statusCode: response.status,
    payload,
  };
}
