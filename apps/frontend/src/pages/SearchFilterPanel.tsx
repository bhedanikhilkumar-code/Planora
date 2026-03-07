import type { CalendarFilters } from '../types/events';

type SearchFilterPanelProps = {
  filters: CalendarFilters;
  onChange: (next: CalendarFilters) => void;
};

export default function SearchFilterPanel({ filters, onChange }: SearchFilterPanelProps) {
  return (
    <section className="p-4 bg-white rounded space-y-2" aria-label="Calendar filters">
      <h3 className="font-semibold">Search & Filters</h3>
      <label className="block text-sm">
        Search
        <input
          value={filters.query}
          onChange={(e) => onChange({ ...filters, query: e.target.value })}
          placeholder="Search title"
          className="w-full mt-1"
        />
      </label>
      <label className="block text-sm">
        From
        <input
          type="date"
          value={filters.from}
          onChange={(e) => onChange({ ...filters, from: e.target.value })}
          className="w-full mt-1"
        />
      </label>
      <label className="block text-sm">
        To
        <input
          type="date"
          value={filters.to}
          onChange={(e) => onChange({ ...filters, to: e.target.value })}
          className="w-full mt-1"
        />
      </label>
    </section>
  );
}
