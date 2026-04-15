import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.103.1';

const supabaseUrl = Deno.env.get('SUPABASE_URL');
const serviceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY');

if (!supabaseUrl || !serviceKey) {
  throw new Error('Missing SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY in Edge Function environment.');
}

const supabase = createClient(supabaseUrl, serviceKey);

async function handleBorrowBook(payload: { bookId: string; borrowerId: string }) {
  const { bookId, borrowerId } = payload;

  const { data: book, error: bookError } = await supabase
    .from('books')
    .select('id, available_copies')
    .eq('id', bookId)
    .maybeSingle();

  if (bookError) {
    return new Response(JSON.stringify({ error: 'Book lookup failed' }), { status: 500 });
  }

  if (!book) {
    return new Response(JSON.stringify({ error: 'Book not found' }), { status: 404 });
  }

  if (book.available_copies <= 0) {
    return new Response(JSON.stringify({ error: 'No copies available' }), { status: 409 });
  }

  const { data: existingLoan, error: loanError } = await supabase
    .from('book_loans')
    .select('id')
    .eq('book_id', bookId)
    .eq('borrower_id', borrowerId)
    .eq('returned', false)
    .maybeSingle();

  if (loanError) {
    return new Response(JSON.stringify({ error: 'Loan lookup failed' }), { status: 500 });
  }

  if (existingLoan) {
    return new Response(JSON.stringify({ error: 'Borrower already has an active loan for this book' }), { status: 409 });
  }

  const { error: borrowError } = await supabase.from('books').update({ available_copies: book.available_copies - 1 }).eq('id', bookId);
  if (borrowError) {
    return new Response(JSON.stringify({ error: 'Failed to update book availability' }), { status: 500 });
  }

  const { data: loan, error: insertError } = await supabase.from('book_loans').insert({ book_id: bookId, borrower_id: borrowerId, returned: false, borrowed_at: new Date().toISOString() }).select().single();

  if (insertError) {
    return new Response(JSON.stringify({ error: 'Failed to create loan' }), { status: 500 });
  }

  return new Response(JSON.stringify({ success: true, loan }), { status: 201 });
}

async function handleReturnBook(payload: { bookId: string; borrowerId: string }) {
  const { bookId, borrowerId } = payload;

  const { data: loan, error: loanError } = await supabase
    .from('book_loans')
    .select('id, returned')
    .eq('book_id', bookId)
    .eq('borrower_id', borrowerId)
    .eq('returned', false)
    .single();

  if (loanError || !loan) {
    return new Response(JSON.stringify({ error: 'Active loan not found' }), { status: 404 });
  }

  const { error: updateLoanError } = await supabase.from('book_loans').update({ returned: true, returned_at: new Date().toISOString() }).eq('id', loan.id);
  if (updateLoanError) {
    return new Response(JSON.stringify({ error: 'Failed to close loan' }), { status: 500 });
  }

  const { data: bookToReturn, error: bookFetchError } = await supabase
    .from('books')
    .select('available_copies')
    .eq('id', bookId)
    .single();

  if (bookFetchError || !bookToReturn) {
    return new Response(JSON.stringify({ error: 'Book not found' }), { status: 500 });
  }

  const { error: updateBookError } = await supabase
    .from('books')
    .update({ available_copies: bookToReturn.available_copies + 1 })
    .eq('id', bookId);

  if (updateBookError) {
    return new Response(JSON.stringify({ error: 'Failed to restore book availability' }), { status: 500 });
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
