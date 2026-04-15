import { API_ENDPOINTS } from '../../../core/api/endpoints';

export async function invokeAggregateCommand(command) {
  const apiKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

  if (!apiKey) {
    throw new Error('Missing VITE_SUPABASE_ANON_KEY for aggregate command execution.');
  }

  const response = await fetch(API_ENDPOINTS.AGGREGATE_COMMAND, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Accept: 'application/json',
      apikey: apiKey,
      Authorization: `Bearer ${apiKey}`,
    },
    body: JSON.stringify(command),
  });

  if (!response.ok) {
    const message = await response.text();
    throw new Error(`Aggregate command failed (${response.status}): ${message}`);
  }

  return response.json();
}
