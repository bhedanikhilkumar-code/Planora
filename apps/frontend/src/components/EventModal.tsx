import { FormEvent, useMemo, useState } from 'react';
import type { EventDraft } from '../types/events';

export const EventModal = ({ onSave }: { onSave: (payload: EventDraft) => void }) => {
  const [title, setTitle] = useState('');
  const [startAt, setStartAt] = useState('');
  const [endAt, setEndAt] = useState('');
  const [submitError, setSubmitError] = useState('');

  const rangeError = useMemo(() => {
    if (!startAt || !endAt) return '';
    return new Date(endAt) <= new Date(startAt) ? 'End time must be after start time.' : '';
  }, [startAt, endAt]);

  const canSubmit = title.trim().length > 0 && startAt.length > 0 && endAt.length > 0 && !rangeError;

  const submit = (e: FormEvent) => {
    e.preventDefault();
    if (!canSubmit) {
      setSubmitError(rangeError || 'Please complete all required fields.');
      return;
    }

    onSave({ title: title.trim(), startAt, endAt });
    setTitle('');
    setStartAt('');
    setEndAt('');
    setSubmitError('');
  };

  return (
    <form onSubmit={submit} className="p-4 bg-white rounded shadow space-y-2">
      <h3 className="font-semibold">Create / Edit Event</h3>
      <input value={title} onChange={(e) => setTitle(e.target.value)} placeholder="Title" className="w-full" required />
      <input type="datetime-local" value={startAt} onChange={(e) => setStartAt(e.target.value)} className="w-full" required />
      <input type="datetime-local" value={endAt} onChange={(e) => setEndAt(e.target.value)} className="w-full" required />
      {(rangeError || submitError) && <p className="text-sm text-red-600">{rangeError || submitError}</p>}
      <button type="submit" disabled={!canSubmit} className="disabled:opacity-50">Save Event</button>
    </form>
  );
};
