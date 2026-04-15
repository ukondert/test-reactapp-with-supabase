import React, { useState } from 'react';
import { createBorrowBookCommand, createReturnBookCommand } from '../store/bookCommands';
import { invokeAggregateCommand } from '../../../core/api/aggregateCommandApi';
import BookCommandForm from '../components/BookCommandForm';

const BookCommandFormContainer = () => {
  const [bookId, setBookId] = useState('');
  const [borrowerId, setBorrowerId] = useState('');
  const [status, setStatus] = useState('');
  const [loading, setLoading] = useState(false);

  const executeCommand = async (command) => {
    setStatus('');
    setLoading(true);

    try {
      const result = await invokeAggregateCommand(command);
      setStatus(`✅ ${command.action} erfolgreich` + (result?.success ? '' : `: ${JSON.stringify(result)}`));
    } catch (error) {
      setStatus(`❌ Fehler: ${error.message}`);
    } finally {
      setLoading(false);
    }
  };

  const handleBorrow = () => {
    executeCommand(createBorrowBookCommand({ bookId, borrowerId }));
  };

  const handleReturn = () => {
    executeCommand(createReturnBookCommand({ bookId, borrowerId }));
  };

  return (
    <BookCommandForm
      bookId={bookId}
      borrowerId={borrowerId}
      status={status}
      loading={loading}
      onBookIdChange={setBookId}
      onBorrowerIdChange={setBorrowerId}
      onBorrow={handleBorrow}
      onReturn={handleReturn}
    />
  );
};

export default BookCommandFormContainer;
