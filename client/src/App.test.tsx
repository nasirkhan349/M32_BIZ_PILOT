import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest'
import { render, screen, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { BrowserRouter } from 'react-router-dom'
import App from './App'

const renderApp = () => render(
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
    window.matchMedia = () => ({ matches: true, addEventListener(){}, removeEventListener(){}, media: '', onchange: null, addListener(){}, removeListener(){} })
    renderApp()
    expect(document.documentElement.classList.contains('dark')).toBe(true)
    window.matchMedia = matcher
  })
})

const CHATS = [
  { _id: 'a', title: 'Alpha Marketing' },
  { _id: 'b', title: 'beta Pricing' },
  { _id: 'c', title: 'Gamma Support' },
]

describe('Conversations sidebar search', () => {
  beforeEach(() => {
    // jsdom does not implement scrollIntoView, which Chat() calls on mount.
    Element.prototype.scrollIntoView = vi.fn()
    localStorage.clear()
    localStorage.setItem('token', 'test-token')
    localStorage.setItem('user', JSON.stringify({ id: 'u', name: 'Test', email: 't@e.com' }))
    window.history.pushState({}, '', '/chat')
    // Stub per endpoint: a catch-all chats payload breaks handlers reading data.user.map.
    vi.stubGlobal('fetch', vi.fn(async (url: string) => {
      if (url.includes('/api/me')) {
        return { ok: true, json: async () => ({ user: { id: 'u', name: 'Test', email: 't@e.com' } }) }
      }
      return { ok: true, json: async () => ({ chats: CHATS }) }
    }))
  })

  afterEach(() => {
    vi.unstubAllGlobals()
    window.history.pushState({}, '', '/')
  })

  const renderChat = () => render(
    <BrowserRouter>
      <App />
    </BrowserRouter>
  )

  it('renders every conversation title before any query is typed', async () => {
    renderChat()
    const aside = document.querySelector('aside') as HTMLElement

    // The chat list is loaded by an effect, so wait for the first title to land.
    expect(await within(aside).findByText('Alpha Marketing')).toBeInTheDocument()
    expect(within(aside).getByText('beta Pricing')).toBeInTheDocument()
    expect(within(aside).getByText('Gamma Support')).toBeInTheDocument()
  })

  it('narrows the list to titles containing the query, case-insensitively', async () => {
    const user = userEvent.setup()
    renderChat()
    const aside = document.querySelector('aside') as HTMLElement
    const input = within(aside).getByRole('textbox', { name: 'Search conversations' })

    await user.type(input, 'alpha')

    expect(within(aside).getByText('Alpha Marketing')).toBeInTheDocument()
    expect(within(aside).queryByText('beta Pricing')).not.toBeInTheDocument()
    expect(within(aside).queryByText('Gamma Support')).not.toBeInTheDocument()

    await user.clear(input)
    await user.type(input, 'BETA')

    expect(within(aside).getByText('beta Pricing')).toBeInTheDocument()
    expect(within(aside).queryByText('Alpha Marketing')).not.toBeInTheDocument()
    expect(within(aside).queryByText('Gamma Support')).not.toBeInTheDocument()
  })

  it('shows "No conversations found" when nothing matches', async () => {
    const user = userEvent.setup()
    renderChat()
    const aside = document.querySelector('aside') as HTMLElement

    await user.type(within(aside).getByRole('textbox', { name: 'Search conversations' }), 'zzzz')

    expect(within(aside).getByText('No conversations found')).toBeInTheDocument()
  })

  it('restores the full list when the clear button is used', async () => {
    const user = userEvent.setup()
    renderChat()
    const aside = document.querySelector('aside') as HTMLElement
    const input = within(aside).getByRole('textbox', { name: 'Search conversations' })

    await user.type(input, 'alpha')
    await user.click(within(aside).getByRole('button', { name: 'Clear search' }))

    expect(input).toHaveValue('')
    expect(within(aside).getByText('Alpha Marketing')).toBeInTheDocument()
    expect(within(aside).getByText('beta Pricing')).toBeInTheDocument()
    expect(within(aside).getByText('Gamma Support')).toBeInTheDocument()
    expect(within(aside).queryByText('No conversations found')).not.toBeInTheDocument()
  })

  it('exposes the search input in the mobile drawer and filters it there too', async () => {
    const user = userEvent.setup()
    renderChat()

    await user.click(screen.getAllByRole('button', { name: 'Open conversations' })[0])
    const drawer = screen.getByRole('dialog')

    const input = within(drawer).getByRole('textbox', { name: 'Search conversations' })
    expect(input).toBeInTheDocument()

    await user.type(input, 'gamma')
    expect(within(drawer).getByText('Gamma Support')).toBeInTheDocument()
    expect(within(drawer).queryByText('Alpha Marketing')).not.toBeInTheDocument()

    await user.type(input, 'zzzz')
    expect(within(drawer).getByText('No conversations found')).toBeInTheDocument()
  })
})


