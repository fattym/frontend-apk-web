import { useState } from 'react';
import Tabs from '../components/Tabs';
import ResourceManager from '../components/ResourceManager';

const EXAM_TYPE_OPTIONS = [
  { value: 'MIDTERM', label: 'Midterm' },
  { value: 'FINAL', label: 'Final' },
  { value: 'QUIZ', label: 'Quiz' },
  { value: 'UNIT_TEST', label: 'Unit Test' },
];

const GRADE_OPTIONS = [
  { value: 'A+', label: 'A+' }, { value: 'A', label: 'A' }, { value: 'B+', label: 'B+' },
  { value: 'B', label: 'B' }, { value: 'C+', label: 'C+' }, { value: 'C', label: 'C' },
  { value: 'D', label: 'D' }, { value: 'F', label: 'F' },
];

const Exams = () => {
  const [tab, setTab] = useState('exams');

  if (tab === 'grades') {
    return (
      <div>
        <Tabs tabs={[{ key: 'exams', label: 'Exams' }, { key: 'grades', label: 'Grades' }, { key: 'report-cards', label: 'Report Cards' }]} active={tab} onChange={setTab} />
        <ResourceManager
          title="Exam Grades"
          endpoint="/api/exams/grades/"
          columns={[
            { key: 'id', label: 'ID' },
            { key: 'student', label: 'Student ID' },
            { key: 'exam', label: 'Exam ID' },
            { key: 'marks_obtained', label: 'Marks' },
            { key: 'grade', label: 'Grade' },
          ]}
          fields={[
            { name: 'student', label: 'Student ID', type: 'number', required: true },
            { name: 'exam', label: 'Exam ID', type: 'number', required: true },
            { name: 'marks_obtained', label: 'Marks Obtained', type: 'number', required: true },
            { name: 'grade', label: 'Grade', type: 'select', options: GRADE_OPTIONS, required: true },
            { name: 'remarks', label: 'Remarks', type: 'textarea' },
          ]}
        />
      </div>
    );
  }

  if (tab === 'report-cards') {
    return (
      <div>
        <Tabs tabs={[{ key: 'exams', label: 'Exams' }, { key: 'grades', label: 'Grades' }, { key: 'report-cards', label: 'Report Cards' }]} active={tab} onChange={setTab} />
        <ResourceManager
          title="Report Cards"
          endpoint="/api/exams/report-cards/"
          columns={[
            { key: 'id', label: 'ID' },
            { key: 'student', label: 'Student ID' },
            { key: 'stream', label: 'Stream ID' },
            { key: 'term', label: 'Term' },
            { key: 'obtained_marks', label: 'Obtained' },
            { key: 'percentage', label: 'Percentage' },
            { key: 'grade', label: 'Grade' },
          ]}
          fields={[
            { name: 'student', label: 'Student ID', type: 'number', required: true },
            { name: 'stream', label: 'Stream ID', type: 'number', required: true },
            { name: 'term', label: 'Term', required: true },
            { name: 'total_marks', label: 'Total Marks', type: 'number', required: true },
            { name: 'obtained_marks', label: 'Obtained Marks', type: 'number', required: true },
            { name: 'percentage', label: 'Percentage', type: 'number', step: '0.01', required: true },
            { name: 'grade', label: 'Grade', required: true },
            { name: 'remarks', label: 'Remarks', type: 'textarea' },
          ]}
        />
      </div>
    );
  }

  return (
    <div>
      <Tabs tabs={[{ key: 'exams', label: 'Exams' }, { key: 'grades', label: 'Grades' }, { key: 'report-cards', label: 'Report Cards' }]} active={tab} onChange={setTab} />
      <ResourceManager
        title="Exams"
        endpoint="/api/exams/exams/"
        columns={[
          { key: 'id', label: 'ID' },
          { key: 'name', label: 'Name' },
          { key: 'exam_type', label: 'Type' },
          { key: 'stream', label: 'Stream ID' },
          { key: 'learning_area', label: 'Learning Area ID' },
          { key: 'date', label: 'Date' },
          { key: 'total_marks', label: 'Total' },
          { key: 'passing_marks', label: 'Passing' },
        ]}
        fields={[
          { name: 'name', label: 'Name', required: true },
          { name: 'exam_type', label: 'Exam Type', type: 'select', options: EXAM_TYPE_OPTIONS, required: true },
          { name: 'stream', label: 'Stream ID', type: 'number', required: true },
          { name: 'learning_area', label: 'Learning Area ID', type: 'number', required: true },
          { name: 'date', label: 'Date', type: 'date', required: true },
          { name: 'start_time', label: 'Start Time', type: 'time', required: true },
          { name: 'end_time', label: 'End Time', type: 'time', required: true },
          { name: 'total_marks', label: 'Total Marks', type: 'number', required: true },
          { name: 'passing_marks', label: 'Passing Marks', type: 'number', required: true },
        ]}
      />
    </div>
  );
};

export default Exams;
