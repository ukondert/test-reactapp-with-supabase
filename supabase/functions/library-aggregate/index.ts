import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.103.1';

const supabaseUrl = Deno.env.get('SUPABASE_URL');
const serviceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY');

if (!supabaseUrl || !serviceKey) {
  throw new Error('Missing SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY in Edge Function environment.');
}

const supabase = createClient(supabaseUrl, serviceKey);

async function handleBorrowBook(payload: { bookId: string; borrowerId: string }) {
  const { bookId, borrowerId } = payload;

  const { data, error } = await supabase.rpc('borrow_book', {
    p_book_id:     bookId,
    p_borrower_id: borrowerId,
  });

  if (error) {
    return new Response(JSON.stringify({ error: error.message }), { status: 500 });
  }

  if (!data.success) {
    const status = data.error === 'Buch nicht gefunden' ? 404 : 409;
    return new Response(JSON.stringify({ error: data.error }), { status });
  }

  return new Response(JSON.stringify({ success: true, loan_id: data.loan_id }), { status: 201 });
}

async function handleReturnBook(payload: { bookId: string; borrowerId: string }) {
  const { bookId, borrowerId } = payload;

  const { data, error } = await supabase.rpc('return_book', {
    p_book_id:     bookId,
    p_borrower_id: borrowerId,
  });

  if (error) {
    return new Response(JSON.stringify({ error: error.message }), { status: 500 });
  }

  if (!data.success) {
    return new Response(JSON.stringify({ error: data.error }), { status: 404 });
  }

  return new Response(JSON.stringify({ success: true }), { status: 200 });
}

async function handler(req: Request) {
  if (req.method !== 'POST') {
    return new Response('Method Not Allowed', { status: 405 });
  }

  let body;
  try {
    body = await req.json();
  } catch {
    return new Response(JSON.stringify({ error: 'Invalid JSON body' }), { status: 400 });
  }

  const { aggregate, action, payload } = body;
  if (aggregate !== 'Book') {
    return new Response(JSON.stringify({ error: 'Unsupported aggregate' }), { status: 400 });
  }

  if (action === 'BorrowBook') {
    return handleBorrowBook(payload);
  }

  if (action === 'ReturnBook') {
    return handleReturnBook(payload);
  }

  return new Response(JSON.stringify({ error: 'Unsupported action' }), { status: 400 });
}

Deno.serve(handler);
