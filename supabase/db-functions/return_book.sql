CREATE OR REPLACE FUNCTION return_book(
  p_book_id     UUID,
  p_borrower_id UUID
)
RETURNS JSON
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_loan_id UUID;
BEGIN
  -- 1. Aktive Ausleihe suchen und Buchzeile sperren (verhindert Race Conditions)
  SELECT bl.id INTO v_loan_id
  FROM book_loans bl
  JOIN books b ON b.id = bl.book_id
  WHERE bl.book_id     = p_book_id
    AND bl.borrower_id = p_borrower_id
    AND bl.returned    = false
  FOR UPDATE OF b;

  IF NOT FOUND THEN
    RETURN json_build_object('success', false, 'error', 'Keine aktive Ausleihe gefunden');
  END IF;

  -- 2. Ausleihe als zurückgegeben markieren
  UPDATE book_loans
  SET returned    = true,
      returned_at = now()
  WHERE id = v_loan_id;

  -- 3. Verfügbare Exemplare erhöhen
  UPDATE books
  SET available_copies = available_copies + 1
  WHERE id = p_book_id;

  RETURN json_build_object('success', true);
END;
$$;
