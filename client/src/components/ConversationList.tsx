import { useMemo } from 'react'

export interface ChatItem {
  _id: string
  title: string
  updatedAt?: string
}

export interface ConversationListProps {
  chats: ChatItem[]
  activeChatId: string | null
  searchQuery: string
  onSearchChange: (query: string) => void
  onSelectChat: (id: string) => void
  onDeleteChat: (id: string) => void
  onCreateChat: () => void
}

export function ConversationList({
  chats,
  activeChatId,
  searchQuery,
  onSearchChange,
  onSelectChat,
  onDeleteChat,
  onCreateChat,
}: ConversationListProps) {
  const filteredChats = useMemo(() => {
    const query = searchQuery.trim().toLowerCase()
    if (!query) return chats
    return chats.filter((c) => (c.title || 'Untitled').toLowerCase().includes(query))
  }, [chats, searchQuery])

  return (
    <div className="flex flex-col h-full">
      <div className="flex items-center justify-between mb-2">
        <b style={{ color: 'var(--text-primary)' }}>Conversations</b>
        <button className="px-2 py-1 rounded border" onClick={onCreateChat}>
          New
        </button>
      </div>

      <div className="relative mb-3">
        <input
          type="text"
          placeholder="Search conversations..."
          aria-label="Search conversations"
          value={searchQuery}
          onChange={(e) => onSearchChange(e.target.value)}
          className="w-full text-sm rounded border px-2.5 py-1.5 pr-7 outline-none"
          style={{
            background: 'var(--panel-bg)',
            borderColor: 'var(--panel-border)',
            color: 'var(--text-primary)',
          }}
        />
        {searchQuery && (
          <button
            type="button"
            onClick={() => onSearchChange('')}
            aria-label="Clear search"
            title="Clear search"
            className="absolute right-2 top-1/2 -translate-y-1/2 text-xs opacity-60 hover:opacity-100 flex items-center justify-center p-0.5 rounded cursor-pointer"
            style={{ color: 'var(--text-primary)' }}
          >
            ✕
          </button>
        )}
      </div>

      <div className="flex flex-col">
        {filteredChats.length === 0 && searchQuery.trim() ? (
          <div
            className="py-6 text-center text-xs opacity-70"
            style={{ color: 'var(--text-primary)' }}
          >
            No conversations found
          </div>
        ) : (
          filteredChats.map((c) => {
            const isActive = activeChatId === c._id
            return (
              <div
                key={c._id}
                className="flex items-center gap-2 px-2 py-2 border-b"
                style={{
                  borderColor: 'var(--panel-border)',
                  background: isActive ? 'rgba(37,99,235,0.08)' : 'transparent',
                }}
              >
                <div className="flex-1 min-w-0">
                  <button
                    onClick={() => onSelectChat(c._id)}
                    className="text-left w-full truncate"
                    style={{ color: 'var(--text-primary)' }}
                  >
                    {c.title || 'Untitled'}
                  </button>
                  <div
                    className="text-[10px] opacity-70"
                    style={{ color: 'var(--text-primary)' }}
                  >
                    {c.updatedAt ? new Date(c.updatedAt).toLocaleString() : ''}
                  </div>
                </div>
                <button
                  className="p-1 rounded border"
                  onClick={() => onDeleteChat(c._id)}
                  aria-label="Delete"
                  title="Delete"
                >
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    width="16"
                    height="16"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  >
                    <polyline points="3 6 5 6 21 6" />
                    <path d="M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6" />
                    <path d="M10 11v6" />
                    <path d="M14 11v6" />
                    <path d="M9 6V4a1 1 0 0 1 1-1h4a1 1 0 0 1 1 1v2" />
                  </svg>
                </button>
              </div>
            )
          })
        )}
      </div>
    </div>
  )
}
