import { fireEvent, render, screen } from '@testing-library/react'
import { describe, expect, it } from 'vitest'
import { App } from './App'

describe('App replay workflow', () => {
  it('loads, steps, completes, and resets the candidate graph', () => {
    render(<App />)

    expect(screen.getByText('Awaiting inspection')).toBeInTheDocument()
    expect(screen.getByRole('button', { name: 'Step' })).toBeDisabled()

    fireEvent.click(screen.getByRole('button', { name: 'Load My Archipelago' }))
    expect(screen.getByText('Analysis loaded')).toBeInTheDocument()

    fireEvent.click(screen.getByRole('button', { name: 'Step' }))
    expect(screen.getByRole('heading', { name: 'Island discovered' })).toBeInTheDocument()
    expect(screen.getByText(/enters the DFS tree/)).toBeInTheDocument()

    fireEvent.click(screen.getByRole('button', { name: 'Run to End' }))
    expect(screen.getByRole('heading', { name: 'Safety inspection complete' })).toBeInTheDocument()
    expect(screen.getByText('CD, FG, FH')).toBeInTheDocument()
    expect(screen.getByText('C, D, F')).toBeInTheDocument()

    fireEvent.click(screen.getByRole('button', { name: 'Reset' }))
    expect(screen.getByText('Awaiting inspection')).toBeInTheDocument()
    expect(screen.getByText('Not started')).toBeInTheDocument()
  })
})
