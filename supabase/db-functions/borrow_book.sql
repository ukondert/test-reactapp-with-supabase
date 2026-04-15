CREATE OR REPLACE FUNCTION borrow_book(
  p_book_id     UUID,
  p_borrower_id UUID
)
RETURNS JSON
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_active_loans     INT;
  v_available_copies INT;
  v_loan_id          UUID;
BEGIN
  -- 1. Max 3 aktive Ausleihen pro Entleiher
  SELECT COUNT(*) INTO v_active_loans
  FROM book_loans
  WHERE borrower_id = p_borrower_id
    AND returned = false;

  IF v_active_loans >= 3 THEN
    RETURN json_build_object(
      'success', false,
      'error',   'bereits max. Anzahl an Bücher ausgeborgt'
    );
  END IF;

  -- 2. Kein doppelter aktiver Eintrag für dasselbe Buch
  IF EXISTS (
    SELECT 1 FROM book_loans
    WHERE book_id     = p_book_id
      AND borrower_id = p_borrower_id
      AND returned    = false
  ) THEN
    RETURN json_build_object(
      'success', false,
      'error',   'Entleiher hat dieses Buch bereits ausgeborgt'
    );
  END IF;

  -- 3. Buchzeile sperren und Verfügbarkeit prüfen (verhindert Race Conditions)
  SELECT available_copies INTO v_available_copies
  FROM books
  WHERE id = p_book_id
  FOR UPDATE;

  IF NOT FOUND THEN
    RETURN json_build_object('success', false, 'error', 'Buch nicht gefunden');
  END IF;

  IF v_available_copies <= 0 THEN
    RETURN json_build_object('success', false, 'error', 'Keine Exemplare verfügbar');
  END IF;

  -- 4. Verfügbare Exemplare reduzieren
  UPDATE books
  SET available_copies = available_copies - 1
  WHERE id = p_book_id;

  -- 5. Ausleihe anlegen
  INSERT INTO book_loans (book_id, borrower_id, returned, borrowed_at)
  VALUES (p_book_id, p_borrower_id, false, now())
  RETURNING id INTO v_loan_id;

  RETURN json_build_object('success', true, 'loan_id', v_loan_id);
END;
$$;
