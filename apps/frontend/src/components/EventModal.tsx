import { useState } from 'react';

export const EventModal = ({ onSave }: { onSave: (payload: any) => void }) => {
  const [title, setTitle] = useState('');
  const [startAt, setStartAt] = useState('');
  const [endAt, setEndAt] = useState('');
  return (
    <div className="p-4 bg-white rounded shadow space-y-2">
      <h3 className="font-semibold">Create / Edit Event</h3>
      <input value={title} onChange={(e) => setTitle(e.target.value)} placeholder="Title" className="w-full" />
      <input type="datetime-local" value={startAt} onChange={(e) => setStartAt(e.target.value)} className="w-full" />
      <input type="datetime-local" value={endAt} onChange={(e) => setEndAt(e.target.value)} className="w-full" />
      <button onClick={() => onSave({ title, startAt, endAt })}>Save Event</button>
    </div>
  );
};
