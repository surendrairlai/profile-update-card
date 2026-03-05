import { render, screen, fireEvent } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { FieldNameDropdown } from '../FieldNameDropdown';
import type { FieldDefinition } from '../../types';

const fields: FieldDefinition[] = [
  { id: 'name', label: 'Name', type: 'text', source: 'default' },
  { id: 'surname', label: 'Surname', type: 'text', source: 'default' },
  { id: 'birthday', label: 'Birthday', type: 'date', source: 'default' },
];

function renderDropdown(selected: FieldDefinition | null = null) {
  const onChange = vi.fn();
  const onCreateField = vi.fn();
  render(
    <FieldNameDropdown fields={fields} selectedField={selected} onChange={onChange} onCreateField={onCreateField} />,
  );
  return { onChange, onCreateField };
}

describe('FieldNameDropdown', () => {
  it('shows placeholder text initially', () => {
    renderDropdown();
    expect(screen.getByText('Select a field')).toBeInTheDocument();
  });

  it('clicking trigger opens the list', async () => {
    renderDropdown();
    await userEvent.click(screen.getByRole('button', { name: /select a field/i }));
    expect(screen.getAllByRole('option')).toHaveLength(3);
  });

  it('search narrows the list', async () => {
    renderDropdown();
    await userEvent.click(screen.getByRole('button', { name: /select a field/i }));
    await userEvent.type(screen.getByPlaceholderText('Filter...'), 'birth');

    expect(screen.getByText('Birthday')).toBeInTheDocument();
    expect(screen.queryByText('Name')).not.toBeInTheDocument();
  });

  it('clicking an option selects it and closes', async () => {
    const { onChange } = renderDropdown();
    await userEvent.click(screen.getByRole('button', { name: /select a field/i }));
    await userEvent.click(screen.getByRole('option', { name: /Surname/ }));

    expect(onChange).toHaveBeenCalledWith(fields[1]);
    expect(screen.queryByRole('listbox')).not.toBeInTheDocument();
  });

  it('keyboard: ArrowDown then Enter picks next field', async () => {
    const { onChange } = renderDropdown();
    await userEvent.click(screen.getByRole('button', { name: /select a field/i }));

    fireEvent.keyDown(screen.getByRole('listbox'), { key: 'ArrowDown' });
    fireEvent.keyDown(screen.getByRole('listbox'), { key: 'Enter' });
    expect(onChange).toHaveBeenCalledWith(fields[1]);
  });

  it('can create a custom field', async () => {
    const { onCreateField } = renderDropdown();
    await userEvent.click(screen.getByRole('button', { name: /select a field/i }));
    await userEvent.click(screen.getByText('Create custom field'));
    await userEvent.type(screen.getByPlaceholderText('e.g. Patient ID'), 'Nickname');
    await userEvent.click(screen.getByText('Add field'));

    expect(onCreateField).toHaveBeenCalledWith(
      expect.objectContaining({ id: 'nickname', label: 'Nickname', type: 'text' }),
    );
  });
});
