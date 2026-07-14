import { useState } from 'react';
import Tabs from '../components/Tabs';
import ResourceManager from '../components/ResourceManager';

const AUDIENCE_OPTIONS = [
  { value: 'ALL', label: 'All' },
  { value: 'TEACHERS', label: 'Teachers' },
  { value: 'STUDENTS', label: 'Students' },
  { value: 'PARENTS', label: 'Parents' },
];

const Messaging = () => {
  const [tab, setTab] = useState('announcements');

  if (tab === 'direct-messages') {
    return (
      <div>
        <Tabs tabs={[{ key: 'announcements', label: 'Announcements' }, { key: 'direct-messages', label: 'Direct Messages' }, { key: 'notifications', label: 'Notifications' }]} active={tab} onChange={setTab} />
        <ResourceManager
          title="Direct Messages"
          endpoint="/api/messaging/direct-messages/"
          columns={[
            { key: 'id', label: 'ID' },
            { key: 'sender', label: 'Sender ID' },
            { key: 'recipient', label: 'Recipient ID' },
            { key: 'subject', label: 'Subject' },
            { key: 'is_read', label: 'Read' },
          ]}
          fields={[
            { name: 'sender', label: 'Sender ID', type: 'number', required: true },
            { name: 'recipient', label: 'Recipient ID', type: 'number', required: true },
            { name: 'subject', label: 'Subject', required: true },
            { name: 'content', label: 'Content', type: 'textarea', required: true },
            { name: 'is_read', label: 'Read', type: 'checkbox' },
          ]}
        />
      </div>
    );
  }

  if (tab === 'notifications') {
    return (
      <div>
        <Tabs tabs={[{ key: 'announcements', label: 'Announcements' }, { key: 'direct-messages', label: 'Direct Messages' }, { key: 'notifications', label: 'Notifications' }]} active={tab} onChange={setTab} />
        <ResourceManager
          title="Notifications"
          endpoint="/api/messaging/notifications/"
          columns={[
            { key: 'id', label: 'ID' },
            { key: 'recipient', label: 'Recipient ID' },
            { key: 'title', label: 'Title' },
            { key: 'is_read', label: 'Read' },
          ]}
          fields={[
            { name: 'recipient', label: 'Recipient ID', type: 'number', required: true },
            { name: 'title', label: 'Title', required: true },
            { name: 'message', label: 'Message', type: 'textarea', required: true },
            { name: 'is_read', label: 'Read', type: 'checkbox' },
          ]}
        />
      </div>
    );
  }

  return (
    <div>
      <Tabs tabs={[{ key: 'announcements', label: 'Announcements' }, { key: 'direct-messages', label: 'Direct Messages' }, { key: 'notifications', label: 'Notifications' }]} active={tab} onChange={setTab} />
      <ResourceManager
        title="Announcements"
        endpoint="/api/messaging/announcements/"
        columns={[
          { key: 'id', label: 'ID' },
          { key: 'title', label: 'Title' },
          { key: 'target_audience', label: 'Audience' },
          { key: 'is_published', label: 'Published' },
        ]}
        fields={[
          { name: 'title', label: 'Title', required: true },
          { name: 'content', label: 'Content', type: 'textarea', required: true },
          { name: 'target_audience', label: 'Target Audience', type: 'select', options: AUDIENCE_OPTIONS, required: true },
          { name: 'is_published', label: 'Published', type: 'checkbox' },
        ]}
      />
    </div>
  );
};

export default Messaging;
