import { useState } from 'react';
import Tabs from '../components/Tabs';
import ResourceManager from '../components/ResourceManager';

const FREQUENCY_OPTIONS = [
  { value: 'MONTHLY', label: 'Monthly' },
  { value: 'TERMLY', label: 'Termly' },
  { value: 'YEARLY', label: 'Yearly' },
];

const STATUS_OPTIONS = [
  { value: 'PENDING', label: 'Pending' },
  { value: 'PAID', label: 'Paid' },
  { value: 'OVERDUE', label: 'Overdue' },
  { value: 'CANCELLED', label: 'Cancelled' },
];

const METHOD_OPTIONS = [
  { value: 'CASH', label: 'Cash' },
  { value: 'CARD', label: 'Card' },
  { value: 'BANK_TRANSFER', label: 'Bank Transfer' },
  { value: 'MPESA', label: 'M-Pesa' },
];

const Fees = () => {
  const [tab, setTab] = useState('structures');

  if (tab === 'invoices') {
    return (
      <div>
        <Tabs tabs={[{ key: 'structures', label: 'Fee Structures' }, { key: 'invoices', label: 'Invoices' }, { key: 'payments', label: 'Payments' }]} active={tab} onChange={setTab} />
        <ResourceManager
          title="Invoices"
          endpoint="/api/fees/invoices/"
          columns={[
            { key: 'id', label: 'ID' },
            { key: 'student', label: 'Student ID' },
            { key: 'fee_structure', label: 'Fee Structure ID' },
            { key: 'amount', label: 'Amount' },
            { key: 'due_date', label: 'Due Date' },
            { key: 'status', label: 'Status' },
          ]}
          fields={[
            { name: 'student', label: 'Student ID', type: 'number', required: true },
            { name: 'fee_structure', label: 'Fee Structure ID', type: 'number', required: true },
            { name: 'amount', label: 'Amount', type: 'number', step: '0.01', required: true },
            { name: 'due_date', label: 'Due Date', type: 'date', required: true },
            { name: 'status', label: 'Status', type: 'select', options: STATUS_OPTIONS, required: true },
          ]}
        />
      </div>
    );
  }

  if (tab === 'payments') {
    return (
      <div>
        <Tabs tabs={[{ key: 'structures', label: 'Fee Structures' }, { key: 'invoices', label: 'Invoices' }, { key: 'payments', label: 'Payments' }]} active={tab} onChange={setTab} />
        <ResourceManager
          title="Payments"
          endpoint="/api/fees/payments/"
          columns={[
            { key: 'id', label: 'ID' },
            { key: 'invoice', label: 'Invoice ID' },
            { key: 'amount', label: 'Amount' },
            { key: 'method', label: 'Method' },
            { key: 'reference', label: 'Reference' },
          ]}
          fields={[
            { name: 'invoice', label: 'Invoice ID', type: 'number', required: true },
            { name: 'amount', label: 'Amount', type: 'number', step: '0.01', required: true },
            { name: 'method', label: 'Method', type: 'select', options: METHOD_OPTIONS, required: true },
            { name: 'reference', label: 'Reference', required: false },
          ]}
        />
      </div>
    );
  }

  return (
    <div>
      <Tabs tabs={[{ key: 'structures', label: 'Fee Structures' }, { key: 'invoices', label: 'Invoices' }, { key: 'payments', label: 'Payments' }]} active={tab} onChange={setTab} />
      <ResourceManager
        title="Fee Structures"
        endpoint="/api/fees/fee-structures/"
        columns={[
          { key: 'id', label: 'ID' },
          { key: 'name', label: 'Name' },
          { key: 'stream', label: 'Stream ID' },
          { key: 'amount', label: 'Amount' },
          { key: 'frequency', label: 'Frequency' },
          { key: 'due_date', label: 'Due Date' },
        ]}
        fields={[
          { name: 'name', label: 'Name', required: true },
          { name: 'stream', label: 'Stream ID', type: 'number', required: true },
          { name: 'amount', label: 'Amount', type: 'number', step: '0.01', required: true },
          { name: 'frequency', label: 'Frequency', type: 'select', options: FREQUENCY_OPTIONS, required: true },
          { name: 'due_date', label: 'Due Date', type: 'date', required: true },
        ]}
      />
    </div>
  );
};

export default Fees;
