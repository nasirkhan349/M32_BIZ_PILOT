import { describe, it, expect, vi } from 'vitest'
import { render, screen, fireEvent } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { useState } from 'react'
import { ConversationList, type ChatItem } from './ConversationList'

const mockChats: ChatItem[] = [
  { _id: '1', title: 'Marketing Strategy 2026', updatedAt: '2026-10-20T10:00:00Z' },
  { _id: '2', title: 'Financial Budget Q3', updatedAt: '2026-10-21T11:00:00Z' },
  { _id: '3', title: '', updatedAt: '2026-10-22T12:00:00Z' }, // Untitled fallback
]

describe('ConversationList component', () => {
  it('renders all conversations and search input', () => {
    render(
      <ConversationList
        chats={mockChats}
        activeChatId="1"
        searchQuery=""
        onSearchChange={vi.fn()}
        onSelectChat={vi.fn()}
        onDeleteChat={vi.fn()}
        onCreateChat={vi.fn()}
      />
    )

    expect(screen.getByPlaceholderText('Search conversations...')).toBeInTheDocument()
    expect(screen.getByText('Marketing Strategy 2026')).toBeInTheDocument()
    expect(screen.getByText('Financial Budget Q3')).toBeInTheDocument()
    expect(screen.getByText('Untitled')).toBeInTheDocument()
  })

  it('filters conversations case-insensitively in real-time', () => {
    render(
      <ConversationList
        chats={mockChats}
        activeChatId={null}
        searchQuery="marketing"
        onSearchChange={vi.fn()}
        onSelectChat={vi.fn()}
        onDeleteChat={vi.fn()}
        onCreateChat={vi.fn()}
      />
    )

    expect(screen.getByText('Marketing Strategy 2026')).toBeInTheDocument()
    expect(screen.queryByText('Financial Budget Q3')).not.toBeInTheDocument()
    expect(screen.queryByText('Untitled')).not.toBeInTheDocument()
  })

  it('filters untitled chats when searching for "untitled"', () => {
    render(
      <ConversationList
        chats={mockChats}
        activeChatId={null}
        searchQuery="UNTITLED"
        onSearchChange={vi.fn()}
        onSelectChat={vi.fn()}
        onDeleteChat={vi.fn()}
        onCreateChat={vi.fn()}
      />
    )

    expect(screen.getByText('Untitled')).toBeInTheDocument()
    expect(screen.queryByText('Marketing Strategy 2026')).not.toBeInTheDocument()
  })

  it('shows "No conversations found" when no chats match the search query', () => {
    render(
      <ConversationList
        chats={mockChats}
        activeChatId={null}
        searchQuery="Nonexistent Topic"
        onSearchChange={vi.fn()}
        onSelectChat={vi.fn()}
        onDeleteChat={vi.fn()}
        onCreateChat={vi.fn()}
      />
    )

    expect(screen.getByText('No conversations found')).toBeInTheDocument()
    expect(screen.queryByText('Marketing Strategy 2026')).not.toBeInTheDocument()
    expect(screen.queryByText('Financial Budget Q3')).not.toBeInTheDocument()
  })

  it('does not show "No conversations found" when query is only whitespace', () => {
    render(
      <ConversationList
        chats={mockChats}
        activeChatId={null}
        searchQuery="   "
        onSearchChange={vi.fn()}
        onSelectChat={vi.fn()}
        onDeleteChat={vi.fn()}
        onCreateChat={vi.fn()}
      />
    )

    expect(screen.queryByText('No conversations found')).not.toBeInTheDocument()
    expect(screen.getByText('Marketing Strategy 2026')).toBeInTheDocument()
  })

  it('displays quick clear button when search query is present and clicking it resets search', async () => {
    function ControlledWrapper() {
      const [query, setQuery] = useState('budget')
      return (
        <ConversationList
          chats={mockChats}
          activeChatId={null}
          searchQuery={query}
          onSearchChange={setQuery}
          onSelectChat={vi.fn()}
          onDeleteChat={vi.fn()}
          onCreateChat={vi.fn()}
        />
      )
    }

    render(<ControlledWrapper />)

    const clearButton = screen.getByRole('button', { name: /clear search/i })
    expect(clearButton).toBeInTheDocument()
    expect(screen.getByText('Financial Budget Q3')).toBeInTheDocument()
    expect(screen.queryByText('Marketing Strategy 2026')).not.toBeInTheDocument()

    await userEvent.click(clearButton)

    expect(screen.queryByRole('button', { name: /clear search/i })).not.toBeInTheDocument()
    expect(screen.getByText('Marketing Strategy 2026')).toBeInTheDocument()
    expect(screen.getByText('Financial Budget Q3')).toBeInTheDocument()
  })

  it('triggers onSearchChange when user types in the input', () => {
    const onSearchChange = vi.fn()
    render(
      <ConversationList
        chats={mockChats}
        activeChatId={null}
        searchQuery=""
        onSearchChange={onSearchChange}
        onSelectChat={vi.fn()}
        onDeleteChat={vi.fn()}
        onCreateChat={vi.fn()}
      />
    )

    const input = screen.getByPlaceholderText('Search conversations...')
    fireEvent.change(input, { target: { value: 'strategy' } })

    expect(onSearchChange).toHaveBeenCalledWith('strategy')
  })

  it('calls onSelectChat when clicking a conversation item', async () => {
    const onSelectChat = vi.fn()
    render(
      <ConversationList
        chats={mockChats}
        activeChatId={null}
        searchQuery=""
        onSearchChange={vi.fn()}
        onSelectChat={onSelectChat}
        onDeleteChat={vi.fn()}
        onCreateChat={vi.fn()}
      />
    )

    await userEvent.click(screen.getByText('Marketing Strategy 2026'))
    expect(onSelectChat).toHaveBeenCalledWith('1')
  })

  it('calls onDeleteChat when clicking the delete button', async () => {
    const onDeleteChat = vi.fn()
    render(
      <ConversationList
        chats={mockChats}
        activeChatId={null}
        searchQuery=""
        onSearchChange={vi.fn()}
        onSelectChat={vi.fn()}
        onDeleteChat={onDeleteChat}
        onCreateChat={vi.fn()}
      />
    )

    const deleteButtons = screen.getAllByRole('button', { name: /delete/i })
    await userEvent.click(deleteButtons[0])
    expect(onDeleteChat).toHaveBeenCalledWith('1')
  })

  it('calls onCreateChat when clicking the New button', async () => {
    const onCreateChat = vi.fn()
    render(
      <ConversationList
        chats={mockChats}
        activeChatId={null}
        searchQuery=""
        onSearchChange={vi.fn()}
        onSelectChat={vi.fn()}
        onDeleteChat={vi.fn()}
        onCreateChat={onCreateChat}
      />
    )

    await userEvent.click(screen.getByRole('button', { name: /new/i }))
    expect(onCreateChat).toHaveBeenCalledTimes(1)
  })

  it('renders correctly with empty chats array without error', () => {
    render(
      <ConversationList
        chats={[]}
        activeChatId={null}
        searchQuery=""
        onSearchChange={vi.fn()}
        onSelectChat={vi.fn()}
        onDeleteChat={vi.fn()}
        onCreateChat={vi.fn()}
      />
    )

    expect(screen.queryByText('No conversations found')).not.toBeInTheDocument()
  })

  it('renders chat item with missing updatedAt gracefully', () => {
    render(
      <ConversationList
        chats={[{ _id: '99', title: 'No Date Chat' }]}
        activeChatId={null}
        searchQuery=""
        onSearchChange={vi.fn()}
        onSelectChat={vi.fn()}
        onDeleteChat={vi.fn()}
        onCreateChat={vi.fn()}
      />
    )

    expect(screen.getByText('No Date Chat')).toBeInTheDocument()
  })
})
