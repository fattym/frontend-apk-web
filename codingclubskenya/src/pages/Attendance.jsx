import { useState } from 'react';
import Tabs from '../components/Tabs';
import ResourceManager from '../components/ResourceManager';

const STATUS_OPTIONS = [
  { value: 'PRESENT', label: 'Present' },
  { value: 'ABSENT', label: 'Absent' },
  { value: 'LATE', label: 'Late' },
  { value: 'EXCUSED', label: 'Excused' },
];

const Attendance = () => {
  const [tab, setTab] = useState('records');

  if (tab === 'summaries') {
    return (
      <div>
        <Tabs tabs={[{ key: 'records', label: 'Attendance Records' }, { key: 'summaries', label: 'Summaries' }]} active={tab} onChange={setTab} />
        <ResourceManager
          title="Attendance Summaries"
          endpoint="/api/attendance/attendance-summaries/"
          columns={[
            { key: 'id', label: 'ID' },
            { key: 'student', label: 'Student ID' },
            { key: 'stream', label: 'Stream ID' },
            { key: 'month', label: 'Month' },
            { key: 'year', label: 'Year' },
            { key: 'present_days', label: 'Present' },
            { key: 'absent_days', label: 'Absent' },
            { key: 'late_days', label: 'Late' },
          ]}
          fields={[
            { name: 'student', label: 'Student ID', type: 'number', required: true },
            { name: 'stream', label: 'Stream ID', type: 'number', required: true },
            { name: 'month', label: 'Month (1-12)', type: 'number', required: true },
            { name: 'year', label: 'Year', type: 'number', required: true },
            { name: 'present_days', label: 'Present Days', type: 'number' },
            { name: 'absent_days', label: 'Absent Days', type: 'number' },
            { name: 'late_days', label: 'Late Days', type: 'number' },
          ]}
        />
      </div>
    );
  }

  return (
    <div>
      <Tabs tabs={[{ key: 'records', label: 'Attendance Records' }, { key: 'summaries', label: 'Summaries' }]} active={tab} onChange={setTab} />
      <ResourceManager
        title="Attendance Records"
        endpoint="/api/attendance/attendance-records/"
        columns={[
          { key: 'id', label: 'ID' },
          { key: 'student', label: 'Student ID' },
          { key: 'stream', label: 'Stream ID' },
          { key: 'date', label: 'Date' },
          { key: 'status', label: 'Status' },
          { key: 'recorded_by', label: 'Recorded By' },
        ]}
        fields={[
          { name: 'student', label: 'Student ID', type: 'number', required: true },
          { name: 'stream', label: 'Stream ID', type: 'number', required: true },
          { name: 'date', label: 'Date', type: 'date', required: true },
          { name: 'status', label: 'Status', type: 'select', options: STATUS_OPTIONS, required: true },
          { name: 'recorded_by', label: 'Recorded By (User ID)', type: 'number', required: true },
        ]}
      />
    </div>
  );
};

export default Attendance;
