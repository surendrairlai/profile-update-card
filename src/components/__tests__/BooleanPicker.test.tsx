import { render, screen, fireEvent } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { BooleanPicker } from '../BooleanPicker';

const yesNo = [
  { label: 'Yes', value: 'true' },
  { label: 'No', value: 'false' },
];

describe('BooleanPicker', () => {
  it('renders both options', () => {
    render(<BooleanPicker options={yesNo} onSelect={vi.fn()} />);
    expect(screen.getAllByRole('option')).toHaveLength(2);
  });

  it('clicking an option calls onSelect', async () => {
    const onSelect = vi.fn();
    render(<BooleanPicker options={yesNo} onSelect={onSelect} />);

    await userEvent.click(screen.getByText('Yes'));
    expect(onSelect).toHaveBeenCalledWith('true', 'Yes');
  });

  it('selected option gets a checkmark', () => {
    render(<BooleanPicker options={yesNo} selectedValue="true" onSelect={vi.fn()} />);
    expect(screen.getByRole('option', { name: /Yes/ }).textContent).toContain('✓');
  });

  it('arrow keys + enter to select, escape to close', () => {
    const onSelect = vi.fn();
    const onClose = vi.fn();
    render(<BooleanPicker options={yesNo} onSelect={onSelect} onClose={onClose} />);

    const box = screen.getByRole('listbox');
    fireEvent.keyDown(box, { key: 'ArrowDown' });
    fireEvent.keyDown(box, { key: 'Enter' });
    expect(onSelect).toHaveBeenCalledWith('true', 'Yes');

    fireEvent.keyDown(box, { key: 'Escape' });
    expect(onClose).toHaveBeenCalled();
  });
});
