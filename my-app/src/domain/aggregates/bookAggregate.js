// This file documents the domain invariants for the Book aggregate.
// The actual state changes are executed by Edge Functions, not in the browser.

export const BookAggregate = {
  name: 'Book',
  invariants: [
    'A book can only be borrowed if available copies > 0.',
    'A borrower may only have one active loan per book.',
    'A book return must reference an existing active loan.',
  ],

  actions: {
    BorrowBook: {
      description: 'Reserve a book copy for a borrower and decrement availability.',
      requiredPayload: ['bookId', 'borrowerId'],
    },
    ReturnBook: {
      description: 'Release a borrowed book copy and close the loan.',
      requiredPayload: ['bookId', 'borrowerId'],
    },
  },
};
