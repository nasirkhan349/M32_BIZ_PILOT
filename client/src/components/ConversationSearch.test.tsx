import { describe, it, expect, vi } from 'vitest'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { useState } from 'react'
import { ConversationSearch } from './ConversationSearch'

function StatefulSearch({ initial = '' }: { initial?: string }) {
  const [value, setValue] = useState(initial)
  return <ConversationSearch value={value} onChange={setValue} />
}

describe('ConversationSearch', () => {
  it('exposes the input with an accessible name', () => {
    render(<StatefulSearch />)
    expect(screen.getByRole('textbox', { name: 'Search conversations' })).toBeInTheDocument()
  })

  it('calls onChange with the typed value', async () => {
    const user = userEvent.setup()
    render(<StatefulSearch />)
    const input = screen.getByRole('textbox', { name: 'Search conversations' })

    await user.type(input, 'alp')

    expect(input).toHaveValue('alp')
  })

  it('omits the clear button while the value is empty and shows it once text is typed', async () => {
    const user = userEvent.setup()
    render(<StatefulSearch />)
    expect(screen.queryByRole('button', { name: 'Clear search' })).not.toBeInTheDocument()

    await user.type(screen.getByRole('textbox', { name: 'Search conversations' }), 'alp')

    expect(screen.getByRole('button', { name: 'Clear search' })).toBeInTheDocument()
  })

  it('clears the value through onChange("") and empties the input', async () => {
    const user = userEvent.setup()
    const onChange = vi.fn()
    const { rerender } = render(<ConversationSearch value="alpha" onChange={onChange} />)

    await user.click(screen.getByRole('button', { name: 'Clear search' }))
    expect(onChange).toHaveBeenCalledWith('')

    // Controlled component: apply the value the parent would have stored.
    rerender(<ConversationSearch value="" onChange={onChange} />)
    expect(screen.getByRole('textbox', { name: 'Search conversations' })).toHaveValue('')
    expect(screen.queryByRole('button', { name: 'Clear search' })).not.toBeInTheDocument()
  })
})