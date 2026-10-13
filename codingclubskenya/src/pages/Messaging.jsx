import { useState, useEffect, useRef } from 'react';
import api from '../services/api';
import { useAuth } from '../contexts/AuthContext';

const Messaging = () => {
  const { user } = useAuth();
  const [conversations, setConversations] = useState([]);
  const [selectedConv, setSelectedConv] = useState(null);
  const [messages, setMessages] = useState([]);
  const [loadingMessages, setLoadingMessages] = useState(false);
  const [loadingConv, setLoadingConv] = useState(true);
  const [newMessage, setNewMessage] = useState('');
  const [showNewChat, setShowNewChat] = useState(false);
  const [contacts, setContacts] = useState({ students: [], parents: [] });
  const [showNewGroup, setShowNewGroup] = useState(false);
  const messagesEndRef = useRef(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const fetchConversations = async () => {
    try {
      const res = await api.get('/api/messaging/conversations/my_conversations/');
      const data = res.data.results || res.data;
      setConversations(data);
    } catch (e) {
      console.error('Error fetching conversations:', e);
    } finally {
      setLoadingConv(false);
    }
  };

  const fetchMessages = async (convId) => {
    setLoadingMessages(true);
    try {
      const res = await api.get(`/api/messaging/conversations/${convId}/messages/`);
      const data = res.data.results || res.data;
      setMessages(data);
      await api.post(`/api/messaging/conversations/${convId}/mark_read/`);
      setTimeout(scrollToBottom, 50);
    } catch (e) {
      console.error('Error fetching messages:', e);
    } finally {
      setLoadingMessages(false);
    }
  };

  const fetchContacts = async () => {
    try {
      const res = await api.get('/api/messaging/conversations/teacher_contacts/');
      setContacts({ students: res.data.students || [], parents: res.data.parents || [] });
    } catch (e) {
      console.error('Error fetching contacts:', e);
    }
  };

  const sendMessage = async () => {
    if (!newMessage.trim() || !selectedConv) return;
    try {
      const res = await api.post('/api/messaging/conversation-messages/', {
        conversation: selectedConv.id,
        content: newMessage.trim(),
      });
      const newMsg = res.data;
      setMessages((prev) => [...prev, newMsg]);
      setNewMessage('');
      setTimeout(scrollToBottom, 50);
      fetchConversations();
    } catch (e) {
      console.error('Error sending message:', e);
      alert('Failed to send message.');
    }
  };

  const startChat = async (parentId) => {
    try {
      await api.post('/api/messaging/conversations/start_chat/', { parent_id: parentId });
      setShowNewChat(false);
      fetchConversations();
    } catch (e) {
      console.error('Error starting chat:', e);
      alert('Failed to start chat.');
    }
  };

  const createGroup = async (name, target, participantIds) => {
    try {
      await api.post('/api/messaging/conversations/create_group/', {
        name,
        target,
        participant_ids: participantIds,
      });
      setShowNewGroup(false);
      fetchConversations();
    } catch (e) {
      console.error('Error creating group:', e);
      alert('Failed to create group.');
    }
  };

  const selectConversation = (conv) => {
    setSelectedConv(conv);
    setNewMessage('');
    fetchMessages(conv.id);
  };

  const isTeacher = user?.role === 'TEACHER' || user?.role === 'STAFF' || user?.role === 'ADMIN';

  useEffect(() => {
    fetchConversations();
  }, []);

  const NewChatDialog = ({ onClose, onNewChat, onNewGroup, newGroup }) => {
    const [groupName, setGroupName] = useState('');
    const [groupTarget, setGroupTarget] = useState('PARENTS');
    const [selectedParent, setSelectedParent] = useState('');

    const availableParents = contacts.parents;

    const handleSubmit = () => {
      if (!newGroup) {
        if (!selectedParent) return;
        onNewChat(parseInt(selectedParent));
      } else {
        if (!groupName.trim()) return;
        onNewGroup(groupName, groupTarget, selectedParent ? [parseInt(selectedParent)] : []);
      }
    };

    return (
      <div className="fixed inset-0 bg-black/40 flex items-center justify-center p-4 z-50">
        <div className="bg-white rounded-lg shadow-lg w-full max-w-md max-h-[80vh] overflow-y-auto p-6">
          <h3 className="text-xl font-bold mb-4">{newGroup ? 'Create Group Message' : 'Start New Chat'}</h3>
          {newGroup ? (
            <p className="text-gray-600 mb-4">
              Send a group announcement to all parents or learners. You can also select specific recipients below.
            </p>
          ) : (
            <p className="text-gray-600 mb-4">
              Start a direct conversation with a parent.
            </p>
          )}

          {!newGroup ? (
            <>
              <label className="block text-sm font-medium text-gray-700 mb-1">Select Parent</label>
              <select
                className="w-full border border-gray-300 rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 mb-4"
                value={selectedParent}
                onChange={(e) => setSelectedParent(e.target.value)}
              >
                <option value="">Choose a parent...</option>
                {availableParents.map((p) => (
                  <option key={p.id} value={p.id}>
                    {p.first_name} {p.last_name} ({p.email})
                  </option>
                ))}
              </select>
            </>
          ) : (
            <>
              <div className="space-y-4 mb-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Group Name</label>
                  <input
                    type="text"
                    className="w-full border border-gray-300 rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="e.g. PTA Announcement"
                    value={groupName}
                    onChange={(e) => setGroupName(e.target.value)}
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Target Audience</label>
                  <select
                    className="w-full border border-gray-300 rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    value={groupTarget}
                    onChange={(e) => setGroupTarget(e.target.value)}
                  >
                    <option value="PARENTS">All Parents</option>
                    <option value="LEARNERS">All Learners</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Or select a specific parent
                  </label>
                  <select
                    className="w-full border border-gray-300 rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    value={selectedParent}
                    onChange={(e) => setSelectedParent(e.target.value)}
                  >
                    <option value="">All {groupTarget === 'PARENTS' ? 'parents' : 'learners'} (default)</option>
                    {(groupTarget === 'PARENTS' ? contacts.parents : contacts.students).map((p) => (
                      <option key={p.id} value={p.id}>
                        {p.first_name} {p.last_name} ({p.email})
                      </option>
                    ))}
                  </select>
                </div>
              </div>
            </>
          )}

          <div className="flex justify-end gap-3">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded border border-gray-300 hover:bg-gray-50"
            >
              Cancel
            </button>
            <button
              onClick={handleSubmit}
              disabled={newGroup ? !groupName.trim() : !selectedParent}
              className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 disabled:opacity-50"
            >
              {newGroup ? 'Create Group' : 'Start Chat'}
            </button>
          </div>
        </div>
      </div>
    );
  };

  const ConversationList = () => (
    <div className="w-80 border-r border-gray-200 bg-gray-50 flex flex-col">
      <div className="p-4 border-b border-gray-200 flex items-center justify-between">
        <h2 className="text-lg font-semibold">Messages</h2>
        {isTeacher && (
          <div className="flex gap-1">
            <button
              onClick={() => { setShowNewChat(true); setShowNewGroup(false); fetchContacts(); }}
              className="p-1 text-gray-600 hover:bg-gray-200 rounded"
              title="New Direct Chat"
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                <path d="M10 3a1 1 0 011 1v5h5a1 1 0 110 2h-5v5a1 1 0 11-2 0v-5H4a1 1 0 110-2h5V4a1 1 0 011-1z" />
              </svg>
            </button>
            <button
              onClick={() => { setShowNewGroup(true); setShowNewChat(false); fetchContacts(); }}
              className="p-1 text-gray-600 hover:bg-gray-200 rounded"
              title="New Group Chat"
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                <path d="M9 5a1 1 0 0a1 1 0 012 0v2a1 1 0 01-2 0V5zm0 4a1 1 0 0a1 1 0 012 0v2a1 1 0 01-2 0v-2zm0 4a1 1 0 0a1 1 0 012 0v2a1 1 0 01-2 0v-2z" />
              </svg>
            </button>
          </div>
        )}
      </div>

      {loadingConv ? (
        <div className="flex-1 flex items-center justify-center">
          <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-600"></div>
        </div>
      ) : (
        <div className="flex-1 overflow-y-auto">
          {conversations.length === 0 ? (
            <div className="p-4 text-center text-gray-500">
              {isTeacher ? 'No conversations yet. Start a new chat!' : 'No messages yet.'}
            </div>
          ) : (
            conversations.map((conv) => (
              <div
                key={conv.id}
                className={`p-3 cursor-pointer border-b border-gray-100 transition ${
                  selectedConv?.id === conv.id ? 'bg-blue-50' : 'hover:bg-gray-100'
                }`}
                onClick={() => selectConversation(conv)}
              >
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-gray-300 flex-shrink-0 flex items-center justify-center">
                    {conv.display_name?.charAt(0)?.toUpperCase() ?? 'C'}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex justify-between">
                      <span className="font-medium text-sm truncate">{conv.display_name}</span>
                      {conv.unread_count > 0 && (
                        <span className="bg-blue-600 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center">
                          {conv.unread_count}
                        </span>
                      )}
                    </div>
                    {conv.last_message && (
                      <p className="text-xs text-gray-500 truncate mt-1">
                        {conv.last_message.sender?.first_name
                          ? `${conv.last_message.sender.first_name}: `
                          : ''}{conv.last_message.content}
                      </p>
                    )}
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      )}
    </div>
  );

  const ChatWindow = () => (
    <div className="flex-1 flex flex-col h-full">
      {selectedConv ? (
        <>
          <div className="p-4 border-b border-gray-200 flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-gray-300 flex items-center justify-center">
              {selectedConv.display_name?.charAt(0)?.toUpperCase() ?? 'C'}
            </div>
            <div>
              <h3 className="font-semibold">{selectedConv.display_name}</h3>
              {selectedConv.participants && (
                <p className="text-xs text-gray-500">
                  {selectedConv.participants.length} participant{selectedConv.participants.length !== 1 ? 's' : ''}
                </p>
              )}
            </div>
          </div>
          <div className="flex-1 overflow-y-auto p-4 space-y-3">
            {loadingMessages ? (
              <div className="flex justify-center py-4">
                <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-600"></div>
              </div>
            ) : messages.length === 0 ? (
              <div className="text-center text-gray-500 py-8">No messages yet.</div>
            ) : (
              messages.map((msg) => {
                const isMe = msg.sender?.id === user?.id;
                return (
                  <div
                    key={msg.id}
                    className={`flex ${isMe ? 'justify-end' : 'justify-start'}`}
                  >
                    <div
                      className={`max-w-[70%] px-4 py-2 rounded-lg text-sm ${
                        isMe
                          ? 'bg-blue-600 text-white'
                          : 'bg-gray-200 text-gray-800'
                      }`}
                    >
                      {!isMe && msg.sender && (
                        <div className="text-xs font-medium mb-1 opacity-75">
                          {msg.sender.first_name} {msg.sender.last_name}
                        </div>
                      )}
                      <p className="whitespace-pre-wrap break-words">{msg.content}</p>
                      <div className="text-xs opacity-50 mt-1">
                        {new Date(msg.sent_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      </div>
                    </div>
                  </div>
                );
              })
            )}
            <div ref={messagesEndRef} />
          </div>
          <div className="p-4 border-t border-gray-200">
            <div className="flex gap-2">
              <input
                type="text"
                className="flex-1 border border-gray-300 rounded-full px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="Type a message..."
                value={newMessage}
                onChange={(e) => setNewMessage(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && sendMessage()}
              />
              <button
                onClick={sendMessage}
                disabled={!newMessage.trim()}
                className="bg-blue-600 text-white px-4 py-2 rounded-full hover:bg-blue-700 disabled:opacity-50"
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                  <path d="M10.409 19.804l6.385-2.126c.327-.11.59-.34.745-.642a1.5 1.5 0 00.095-1.742l-1.49-2.98a1.5 1.5 0 00-2.046-.657l-1.416 1.416a.25.25 0 01-.416-.177V4.5a.5.5 0 00-.5-.5h-1a.5.5 0 00-.5.5v7.742a.25.25 0 01-.416.177l-1.416-1.416a1.5 1.5 0 00-2.046.657l-1.49 2.98a1.5 1.5 0 00.095 1.742l6.385 2.126a1.5 1.5 0 001.831 0z" />
                </svg>
              </button>
            </div>
          </div>
        </>
      ) : (
        <div className="flex-1 flex items-center justify-center text-gray-500">
          <div className="text-center">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-16 w-16 mx-auto text-gray-300 mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9 9 0 110-18 9 9 0 019 9z" />
            </svg>
            <h3 className="text-lg font-medium">Select a conversation</h3>
            <p className="mt-2">Choose a conversation from the list to start messaging.</p>
          </div>
        </div>
      )}
    </div>
  );

  return (
    <div className="h-[calc(100vh-180px)] flex">
      <ConversationList />
      <ChatWindow />

      {showNewChat && (
        <NewChatDialog
          onClose={() => setShowNewChat(false)}
          onNewChat={startChat}
        />
      )}

      {showNewGroup && (
        <NewChatDialog
          newGroup={true}
          onClose={() => setShowNewGroup(false)}
          onNewChat={() => {}}
          onNewGroup={createGroup}
        />
      )}
    </div>
  );
};

export default Messaging;