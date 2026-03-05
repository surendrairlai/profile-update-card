import { render, screen, fireEvent } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { EnumPicker } from '../EnumPicker';

const options = Array.from({ length: 50 }, (_, i) => ({
  label: `Option ${i + 1}`,
  value: `opt_${i + 1}`,
}));

describe('EnumPicker', () => {
  it('renders a search box for long lists', () => {
    render(<EnumPicker options={options} onSelect={vi.fn()} />);
    expect(screen.getByRole('textbox')).toBeInTheDocument();
  });

  it('typing filters the list', async () => {
    render(<EnumPicker options={options} onSelect={vi.fn()} />);

    await userEvent.type(screen.getByRole('textbox'), 'Option 12');
    expect(screen.getByText('Option 12')).toBeInTheDocument();
    expect(screen.queryByText('Option 3')).not.toBeInTheDocument();
  });

  it('clicking an option calls onSelect', async () => {
    const onSelect = vi.fn();
    render(<EnumPicker options={options} onSelect={onSelect} />);

    await userEvent.click(screen.getByText('Option 1'));
    expect(onSelect).toHaveBeenCalledWith('opt_1', 'Option 1');
  });

  it('only renders a subset of items (virtual scroll)', () => {
    const { container } = render(<EnumPicker options={options} onSelect={vi.fn()} />);
    const rendered = container.querySelectorAll('[style*="position: absolute"]');
    expect(rendered.length).toBeGreaterThan(0);
    expect(rendered.length).toBeLessThan(50);
  });

  it('ArrowDown + Enter selects first item', () => {
    const onSelect = vi.fn();
    const { container } = render(<EnumPicker options={options} onSelect={onSelect} />);

    fireEvent.keyDown(container.firstElementChild!, { key: 'ArrowDown' });
    fireEvent.keyDown(container.firstElementChild!, { key: 'Enter' });
    expect(onSelect).toHaveBeenCalledWith('opt_1', 'Option 1');
  });
});
