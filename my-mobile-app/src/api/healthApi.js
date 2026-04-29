const normalizeSupabaseUrl = (value) => {
  return value
    .replace(/\/$/, '')
    .replace(/\/auth\/v1$/, '')
    .replace(/\/auth\/v1\/health$/, '')
    .replace(/\/functions\/v1$/, '');
};

const resolveBaseUrl = () => {
  const baseUrl = process.env.EXPO_PUBLIC_SUPABASE_URL;

  if (!baseUrl) {
    throw new Error('EXPO_PUBLIC_SUPABASE_URL fehlt. Bitte in my-mobile-app/.env setzen.');
  }

  return normalizeSupabaseUrl(baseUrl.trim());
};

const resolveAnonKey = () => {
  const anonKey = process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY;

  if (!anonKey) {
    throw new Error('EXPO_PUBLIC_SUPABASE_ANON_KEY fehlt. Bitte in my-mobile-app/.env setzen.');
  }

  return anonKey.trim();
};

export const getHealthStatus = async () => {
  const anonKey = resolveAnonKey();
  const response = await fetch(`${resolveBaseUrl()}/auth/v1/health`, {
    method: 'GET',
    headers: {
      Accept: 'application/json',
      apikey: anonKey,
      Authorization: `Bearer ${anonKey}`,
    },
  });

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`Health endpoint fehlgeschlagen (HTTP ${response.status}): ${errorText}`);
  }

  const payload = await response.json();

  return {
    ok: true,
    statusCode: response.status,
    payload,
  };
};
