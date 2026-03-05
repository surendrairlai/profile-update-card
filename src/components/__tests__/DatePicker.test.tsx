import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { DatePicker } from '../DatePicker';

beforeEach(() => vi.useFakeTimers({ now: new Date(2026, 2, 5), shouldAdvanceTime: true }));
afterEach(() => vi.useRealTimers());

describe('DatePicker', () => {
  it('shows current month heading', () => {
    render(<DatePicker onSelect={vi.fn()} />);
    expect(screen.getByText('March 2026')).toBeInTheDocument();
  });

  it('highlights today (the 5th)', () => {
    render(<DatePicker onSelect={vi.fn()} />);
    expect(screen.getByRole('button', { name: '5' }).className).toContain('text-brand');
  });

  it('returns ISO + DD/MM/YYYY on day click', async () => {
    const onSelect = vi.fn();
    const user = userEvent.setup();
    render(<DatePicker onSelect={onSelect} />);

    await user.click(screen.getByRole('button', { name: '15' }));
    expect(onSelect).toHaveBeenCalledWith('2026-03-15T00:00:00.000Z', '15/03/2026');
  });

  it('prev/next buttons change the month', async () => {
    const user = userEvent.setup();
    render(<DatePicker onSelect={vi.fn()} />);

    await user.click(screen.getByRole('button', { name: 'Previous month' }));
    expect(screen.getByText('February 2026')).toBeInTheDocument();

    await user.click(screen.getByRole('button', { name: 'Next month' }));
    expect(screen.getByText('March 2026')).toBeInTheDocument();
  });

  it('Feb 2026 = 28 days, Feb 2028 = 29 (leap)', async () => {
    const user = userEvent.setup();
    render(<DatePicker onSelect={vi.fn()} />);

    await user.click(screen.getByRole('button', { name: 'Previous month' }));

    const dayCount = () =>
      screen.getAllByRole('button').filter(
        b => !b.getAttribute('aria-label')?.includes('month'),
      ).length;

    expect(dayCount()).toBe(28);

    for (let i = 0; i < 24; i++)
      await user.click(screen.getByRole('button', { name: 'Next month' }));

    expect(screen.getByText('February 2028')).toBeInTheDocument();
    expect(dayCount()).toBe(29);
  });
});
