type ConversationSearchProps = {
  value: string
  onChange: (value: string) => void
  placeholder?: string
}

export function ConversationSearch({ value, onChange, placeholder = 'Search conversations' }: ConversationSearchProps) {
  return (
    <div className="mb-2 relative">
      <input
        type="text"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        aria-label="Search conversations"
        className="input-base pr-8"
      />
      {value && (
        <button
          type="button"
          onClick={() => onChange('')}
          aria-label="Clear search"
          title="Clear search"
          className="absolute right-1 top-1/2 -translate-y-1/2 p-1 rounded"
          style={{ color: 'var(--text-primary)' }}
        >
          ✕
        </button>
      )}
    </div>
  )
}