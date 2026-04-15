import React from 'react';

const BookCommandForm = ({ bookId, borrowerId, status, loading, onBookIdChange, onBorrowerIdChange, onBorrow, onReturn }) => {
  const isDisabled = loading || !bookId || !borrowerId;

  return (
    <div className="book-command-form">
      <h2>Book Aggregate Commands</h2>
      <div className="field-group">
        <label htmlFor="bookId">Book ID</label>
        <input
          id="bookId"
          value={bookId}
          onChange={(event) => onBookIdChange(event.target.value)}
          placeholder="z. B. book-123"
        />
      </div>
      <div className="field-group">
        <label htmlFor="borrowerId">Borrower ID</label>
        <input
          id="borrowerId"
          value={borrowerId}
          onChange={(event) => onBorrowerIdChange(event.target.value)}
          placeholder="z. B. user-456"
        />
      </div>
      <div className="button-row">
        <button type="button" onClick={onBorrow} disabled={isDisabled}>
          Ausleihen
        </button>
        <button type="button" onClick={onReturn} disabled={isDisabled}>
          Zurückgeben
        </button>
      </div>
      {status && <div className="status-message">{status}</div>}
      {loading && <div className="status-message">Verarbeite...</div>}
    </div>
  );
};

export default BookCommandForm;
