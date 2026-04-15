export function createBorrowBookCommand({ bookId, borrowerId }) {
  return {
    aggregate: 'Book',
    action: 'BorrowBook',
    payload: {
      bookId,
      borrowerId,
    },
  };
}

export function createReturnBookCommand({ bookId, borrowerId }) {
  return {
    aggregate: 'Book',
    action: 'ReturnBook',
    payload: {
      bookId,
      borrowerId,
    },
  };
}
