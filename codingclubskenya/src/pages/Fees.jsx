import { useState, useEffect } from 'react';
import Tabs from '../components/Tabs';
import ResourceManager from '../components/ResourceManager';
import api from '../services/api';

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

const TABS = [
  { key: 'report', label: 'Report' },
  { key: 'structures', label: 'Fee Structures' },
  { key: 'invoices', label: 'Invoices' },
  { key: 'payments', label: 'Payments' },
  { key: 'defaulters', label: 'Defaulters' },
];

const Fees = () => {
  const [tab, setTab] = useState('report');
  const [reportData, setReportData] = useState(null);

  useEffect(() => {
    if (tab === 'report') {
      api.get('/api/fees/invoices/report/')
        .then(res => setReportData(res.data))
        .catch(err => console.error(err));
    }
  }, [tab]);

  if (tab === 'report') {
    return (
      <div>
        <Tabs tabs={TABS} active={tab} onChange={setTab} />
        <div className="bg-white rounded shadow p-6 mt-6">
          <h2 className="text-2xl font-bold mb-4">Fee Summary</h2>
          {reportData ? (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="bg-blue-50 p-6 rounded-xl border border-blue-100">
                <p className="text-blue-600 text-sm font-semibold uppercase tracking-wide">Total Expected</p>
                <p className="text-3xl font-bold mt-2 text-blue-900">KES {Number(reportData.total_expected || 0).toLocaleString()}</p>
              </div>
              <div className="bg-green-50 p-6 rounded-xl border border-green-100">
                <p className="text-green-600 text-sm font-semibold uppercase tracking-wide">Total Paid</p>
                <p className="text-3xl font-bold mt-2 text-green-900">KES {Number(reportData.total_paid || 0).toLocaleString()}</p>
              </div>
              <div className="bg-red-50 p-6 rounded-xl border border-red-100">
                <p className="text-red-600 text-sm font-semibold uppercase tracking-wide">Total Pending</p>
                <p className="text-3xl font-bold mt-2 text-red-900">KES {Number(reportData.total_pending || 0).toLocaleString()}</p>
              </div>
            </div>
          ) : (
            <p className="text-gray-500">Loading report data...</p>
          )}
        </div>
      </div>
    );
  }

  if (tab === 'invoices') {
    return (
      <div>
        <Tabs tabs={TABS} active={tab} onChange={setTab} />
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

  if (tab === 'defaulters') {
    return (
      <div>
        <Tabs tabs={TABS} active={tab} onChange={setTab} />
        <ResourceManager
          title="Defaulters (Overdue & Unpaid)"
          endpoint="/api/fees/invoices/defaulters/"
          columns={[
            { key: 'id', label: 'Invoice ID' },
            { key: 'student', label: 'Student ID' },
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
        <Tabs tabs={TABS} active={tab} onChange={setTab} />
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
          customActions={[
            {
              label: 'Receipt',
              onClick: async (item) => {
                try {
                  const res = await api.get(`/api/fees/payments/${item.id}/receipt/`);
                  const receiptHtml = `
                    <div style="font-family: sans-serif; padding: 20px;">
                      <h2>Payment Receipt</h2>
                      <p><strong>Receipt No:</strong> ${res.data.receipt_no}</p>
                      <p><strong>Date:</strong> ${new Date(res.data.date).toLocaleString()}</p>
                      <p><strong>Student:</strong> ${res.data.student_name} (${res.data.admission_number || 'N/A'})</p>
                      <p><strong>Fee Structure:</strong> ${res.data.fee_structure}</p>
                      <p><strong>Amount Paid:</strong> KES ${Number(res.data.amount).toLocaleString()}</p>
                      <p><strong>Method:</strong> ${res.data.method} (${res.data.reference || 'N/A'})</p>
                      <p><strong>Recorded By:</strong> ${res.data.recorded_by}</p>
                    </div>
                  `;
                  const printWindow = window.open('', '', 'width=600,height=600');
                  printWindow.document.write(receiptHtml);
                  printWindow.document.close();
                  printWindow.focus();
                  setTimeout(() => printWindow.print(), 500);
                } catch (e) {
                  alert('Failed to generate receipt. Please try again.');
                }
              }
            }
          ]}
        />
      </div>
    );
  }

  return (
    <div>
      <Tabs tabs={TABS} active={tab} onChange={setTab} />
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
