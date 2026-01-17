import { render, screen } from '@testing-library/react'
import HomePage from '@/app/page'

describe('HomePage', () => {
  it('renders the main heading', () => {
    render(<HomePage />)
    const heading = screen.getByText('Evolution of Todo')
    expect(heading).toBeInTheDocument()
  })

  it('renders feature cards', () => {
    render(<HomePage />)
    expect(screen.getByText('Task Management')).toBeInTheDocument()
    expect(screen.getByText('Secure Authentication')).toBeInTheDocument()
    expect(screen.getByText('Lightning Fast')).toBeInTheDocument()
  })
})
