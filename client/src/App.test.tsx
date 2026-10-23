import { describe, it, expect, beforeEach, vi, afterEach } from 'vitest'
import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { BrowserRouter, MemoryRouter } from 'react-router-dom'
import App from './App'

const renderApp = () =>
  render(
    <BrowserRouter>
      <App />
    </BrowserRouter>
  )

describe('App routing and theme', () => {
  beforeEach(() => {
    localStorage.clear()
    document.documentElement.classList.remove('dark')
  })

  it('renders Home route with CTA buttons', () => {
    renderApp()
    expect(screen.getByText('BizPilot')).toBeInTheDocument()
    expect(screen.getByRole('button', { name: /get started/i })).toBeInTheDocument()
    expect(screen.getByRole('button', { name: /log in/i })).toBeInTheDocument()
  })

  it('applies dark theme based on prefers-color-scheme', () => {
    const matcher = window.matchMedia
    // @ts-expect-error override for test
    window.matchMedia = () => ({
      matches: true,
      addEventListener() {},
      removeEventListener() {},
      media: '',
      onchange: null,
      addListener() {},
      removeListener() {},
    })
    renderApp()
    expect(document.documentElement.classList.contains('dark')).toBe(true)
    window.matchMedia = matcher
  })
})

describe('Chat conversation search and filter in App', () => {
  beforeEach(() => {
    localStorage.clear()
    localStorage.setItem('token', 'mock-token')
    localStorage.setItem('user', JSON.stringify({ id: 'u1', name: 'Test User', email: 'test@example.com' }))

    vi.stubGlobal(
      'fetch',
      vi.fn().mockImplementation(async (url: string) => {
        if (url.includes('/chats')) {
          return {
            ok: true,
            json: async () => ({
              chats: [
                { _id: 'c1', title: 'Growth Marketing Campaign' },
                { _id: 'c2', title: 'Q4 Budget Analysis' },
              ],
            }),
          }
        }
        return { ok: true, json: async () => ({}) }
      })
    )
  })

  afterEach(() => {
    vi.restoreAllMocks()
  })

  it('filters conversations list in App and allows clearing the search', async () => {
    render(
      <MemoryRouter initialEntries={['/chat']}>
        <App />
      </MemoryRouter>
    )

    // Wait for chats to load in desktop sidebar
    await waitFor(() => {
      expect(screen.getByText('Growth Marketing Campaign')).toBeInTheDocument()
      expect(screen.getByText('Q4 Budget Analysis')).toBeInTheDocument()
    })

    const searchInput = screen.getByPlaceholderText('Search conversations...')
    expect(searchInput).toBeInTheDocument()

    // Type in search query
    await userEvent.type(searchInput, 'growth')

    expect(screen.getByText('Growth Marketing Campaign')).toBeInTheDocument()
    expect(screen.queryByText('Q4 Budget Analysis')).not.toBeInTheDocument()

    // Search for nonexistent chat
    await userEvent.clear(searchInput)
    await userEvent.type(searchInput, 'Unknown Query')

    expect(screen.getByText('No conversations found')).toBeInTheDocument()
    expect(screen.queryByText('Growth Marketing Campaign')).not.toBeInTheDocument()

    // Clear search using clear button
    const clearButton = screen.getByRole('button', { name: /clear search/i })
    await userEvent.click(clearButton)

    expect(screen.getByText('Growth Marketing Campaign')).toBeInTheDocument()
    expect(screen.getByText('Q4 Budget Analysis')).toBeInTheDocument()
  })
})
