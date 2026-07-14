import ResourceManager from '../components/ResourceManager';

const ROLE_OPTIONS = [
  { value: 'subject_teacher', label: 'Subject Teacher' },
  { value: 'class_teacher', label: 'Class Teacher' },
  { value: 'assistant_teacher', label: 'Assistant/TA' },
];

const TeacherAssignments = () => (
  <ResourceManager
    title="Teacher Assignments"
    endpoint="/api/academics/teacher-assignments/"
    columns={[
      { key: 'id', label: 'ID' },
      { key: 'teacher', label: 'Teacher' },
      { key: 'stream', label: 'Stream' },
      { key: 'learning_area', label: 'Learning Area' },
      { key: 'term', label: 'Term' },
      { key: 'role', label: 'Role' },
      { key: 'is_active', label: 'Active' },
    ]}
    fields={[
      { name: 'teacher', label: 'Teacher', type: 'select', optionsUrl: '/api/auth/users/?role=TEACHER', required: true },
      { name: 'stream', label: 'Stream', type: 'select', optionsUrl: '/api/academics/streams/', required: true },
      { name: 'learning_area', label: 'Learning Area (blank for class teacher)', type: 'select', optionsUrl: '/api/academics/learning-areas/' },
      { name: 'term', label: 'Term', type: 'select', optionsUrl: '/api/academics/terms/', required: true },
      { name: 'role', label: 'Role', type: 'select', options: ROLE_OPTIONS, required: true },
      { name: 'is_active', label: 'Active', type: 'checkbox' },
    ]}
    defaultValues={{ is_active: true, role: 'subject_teacher' }}
  />
);

export default TeacherAssignments;
