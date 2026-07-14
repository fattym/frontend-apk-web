import { useState } from 'react';
import Tabs from '../components/Tabs';
import ResourceManager from '../components/ResourceManager';

const CATEGORY_OPTIONS = [
  { value: 'FICTION', label: 'Fiction' },
  { value: 'NON_FICTION', label: 'Non-Fiction' },
  { value: 'TEXTBOOK', label: 'Textbook' },
  { value: 'REFERENCE', label: 'Reference' },
  { value: 'MAGAZINE', label: 'Magazine' },
  { value: 'OTHER', label: 'Other' },
];

const Library = () => {
  const [tab, setTab] = useState('books');

  if (tab === 'loans') {
    return (
      <div>
        <Tabs tabs={[{ key: 'books', label: 'Books' }, { key: 'loans', label: 'Loans' }, { key: 'reservations', label: 'Reservations' }]} active={tab} onChange={setTab} />
        <ResourceManager
          title="Loans"
          endpoint="/api/library/loans/"
          columns={[
            { key: 'id', label: 'ID' },
            { key: 'book', label: 'Book ID' },
            { key: 'borrower', label: 'Borrower ID' },
            { key: 'due_date', label: 'Due Date' },
            { key: 'fine_amount', label: 'Fine' },
            { key: 'returned_at', label: 'Returned At' },
          ]}
          fields={[
            { name: 'book', label: 'Book ID', type: 'number', required: true },
            { name: 'borrower', label: 'Borrower ID', type: 'number', required: true },
            { name: 'due_date', label: 'Due Date', type: 'date', required: true },
            { name: 'fine_amount', label: 'Fine Amount', type: 'number', step: '0.01' },
          ]}
        />
      </div>
    );
  }

  if (tab === 'reservations') {
    return (
      <div>
        <Tabs tabs={[{ key: 'books', label: 'Books' }, { key: 'loans', label: 'Loans' }, { key: 'reservations', label: 'Reservations' }]} active={tab} onChange={setTab} />
        <ResourceManager
          title="Reservations"
          endpoint="/api/library/reservations/"
          columns={[
            { key: 'id', label: 'ID' },
            { key: 'book', label: 'Book ID' },
            { key: 'borrower', label: 'Borrower ID' },
            { key: 'fulfilled', label: 'Fulfilled' },
          ]}
          fields={[
            { name: 'book', label: 'Book ID', type: 'number', required: true },
            { name: 'borrower', label: 'Borrower ID', type: 'number', required: true },
            { name: 'fulfilled', label: 'Fulfilled', type: 'checkbox' },
          ]}
        />
      </div>
    );
  }

  return (
    <div>
      <Tabs tabs={[{ key: 'books', label: 'Books' }, { key: 'loans', label: 'Loans' }, { key: 'reservations', label: 'Reservations' }]} active={tab} onChange={setTab} />
      <ResourceManager
        title="Books"
        endpoint="/api/library/books/"
        columns={[
          { key: 'id', label: 'ID' },
          { key: 'title', label: 'Title' },
          { key: 'author', label: 'Author' },
          { key: 'isbn', label: 'ISBN' },
          { key: 'category', label: 'Category' },
          { key: 'available_copies', label: 'Available' },
        ]}
        fields={[
          { name: 'title', label: 'Title', required: true },
          { name: 'author', label: 'Author', required: true },
          { name: 'isbn', label: 'ISBN', required: true },
          { name: 'category', label: 'Category', type: 'select', options: CATEGORY_OPTIONS, required: true },
          { name: 'total_copies', label: 'Total Copies', type: 'number' },
          { name: 'available_copies', label: 'Available Copies', type: 'number' },
        ]}
      />
    </div>
  );
};

export default Library;
