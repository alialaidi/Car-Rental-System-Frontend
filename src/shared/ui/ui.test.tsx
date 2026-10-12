import { useState } from 'react';
import { render, screen, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it, vi } from 'vitest';
import { Alert } from './Alert';
import { Button } from './Button';
import { ConfirmDialog } from './ConfirmDialog';
import { DataTable } from './DataTable';
import { DateTimeField } from './DateTimeField';
import { EmptyState } from './EmptyState';
import { ErrorState } from './ErrorState';
import { LoadingState } from './LoadingState';
import { PageHeader } from './PageHeader';
import { Pagination } from './Pagination';
import { SelectField } from './SelectField';
import { StatusBadge } from './StatusBadge';
import { TextField } from './TextField';
import { ApiError } from '../api/apiError';

describe('shared UI foundations', () => {
  it('renders a named button and supports keyboard activation', async () => {
    const user = userEvent.setup();
    const onClick = vi.fn();
    render(<Button onClick={onClick}>Save changes</Button>);
    const button = screen.getByRole('button', { name: 'Save changes' });
    button.focus();
    await user.keyboard('{Enter}');
    expect(onClick).toHaveBeenCalledOnce();
  });

  it('connects text labels, descriptions and validation errors accessibly', () => {
    render(
      <TextField
        description="Use the email connected to your account."
        error="Enter a valid email address."
        id="email"
        label="Email address"
        required
        type="email"
      />,
    );
    const input = screen.getByLabelText('Email address');
    expect(input).toHaveAttribute('aria-invalid', 'true');
    expect(input).toHaveAttribute('aria-describedby', 'email-description email-error');
    expect(screen.getByRole('alert')).toHaveTextContent('Enter a valid email address.');
  });

  it('renders a labelled select and responds to keyboard selection', async () => {
    const user = userEvent.setup();
    render(
      <SelectField
        id="branch"
        label="Pickup branch"
        options={[
          { value: 'north', label: 'North branch' },
          { value: 'south', label: 'South branch' },
        ]}
      />,
    );
    const select = screen.getByLabelText('Pickup branch');
    select.focus();
    await user.keyboard('{ArrowDown}');
    expect(select).toHaveFocus();
  });

  it('renders a labelled local date and time control', () => {
    render(<DateTimeField id="pickup" label="Pickup date and time" required />);
    expect(screen.getByLabelText('Pickup date and time')).toHaveAttribute('type', 'datetime-local');
  });

  it('renders table header cells and row data in a semantic table', () => {
    render(
      <DataTable
        caption="Vehicles"
        columns={[
          { key: 'name', header: 'Vehicle', render: (row) => row.name },
          { key: 'status', header: 'Status', render: (row) => row.status },
        ]}
        getRowKey={(row) => row.id}
        rows={[{ id: 7, name: 'City hatchback', status: 'Available' }]}
      />,
    );
    const table = screen.getByRole('table', { name: 'Vehicles' });
    expect(within(table).getByRole('columnheader', { name: 'Vehicle' })).toHaveAttribute(
      'scope',
      'col',
    );
    expect(within(table).getByRole('cell', { name: 'City hatchback' })).toBeInTheDocument();
  });

  it('disables pagination boundaries and supports moving to the next page', async () => {
    const user = userEvent.setup();
    const onPageChange = vi.fn();
    const { rerender } = render(
      <Pagination page={1} pageSize={10} totalCount={21} onPageChange={onPageChange} />,
    );
    const previous = screen.getByRole('button', { name: 'Go to previous page' });
    const next = screen.getByRole('button', { name: 'Go to next page' });
    expect(previous).toBeDisabled();
    await user.click(next);
    expect(onPageChange).toHaveBeenCalledWith(2);

    rerender(<Pagination page={3} pageSize={10} totalCount={21} onPageChange={onPageChange} />);
    expect(screen.getByRole('button', { name: 'Go to next page' })).toBeDisabled();
  });

  it('announces loading and empty states with useful text', () => {
    const { rerender } = render(<LoadingState label="Loading vehicles" />);
    expect(screen.getByRole('status')).toHaveAttribute('aria-busy', 'true');
    expect(screen.getByRole('status')).toHaveTextContent('Loading vehicles');

    rerender(<EmptyState description="Try changing the search." title="No cars found" />);
    expect(screen.getByRole('region', { name: 'No cars found' })).toHaveTextContent(
      'Try changing the search.',
    );
  });

  it('shows the API error title, detail and trace ID and retries on keyboard activation', async () => {
    const user = userEvent.setup();
    const onRetry = vi.fn();
    render(
      <ErrorState
        error={
          new ApiError({
            kind: 'http',
            status: 500,
            title: 'Service unavailable',
            detail: 'Please try again soon.',
            traceId: 'trace-17',
          })
        }
        onRetry={onRetry}
      />,
    );
    const alert = screen.getByRole('alert');
    expect(alert).toHaveTextContent('Service unavailable');
    expect(alert).toHaveTextContent('Please try again soon.');
    expect(alert).toHaveTextContent('trace-17');
    screen.getByRole('button', { name: 'Try again' }).focus();
    await user.keyboard('{Enter}');
    expect(onRetry).toHaveBeenCalledOnce();
  });

  it('uses alert semantics and visible status text for notifications', () => {
    const { rerender } = render(<Alert variant="error">Payment failed.</Alert>);
    expect(screen.getByRole('alert')).toHaveTextContent('Payment failed.');
    rerender(<Alert variant="success">Payment saved.</Alert>);
    expect(screen.getByRole('status')).toHaveTextContent('Payment saved.');
  });

  it('keeps status meaning in text as well as color', () => {
    render(<StatusBadge status="Confirmed" />);
    expect(screen.getByText('Confirmed')).toBeInTheDocument();
  });

  it('renders the page heading and optional action', () => {
    render(
      <PageHeader
        action={<Button>Create reservation</Button>}
        description="Manage the vehicles available to rent."
        title="Vehicle catalog"
      />,
    );
    expect(screen.getByRole('heading', { level: 1, name: 'Vehicle catalog' })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Create reservation' })).toBeInTheDocument();
  });

  it('traps focus, closes with Escape and restores focus to the trigger', async () => {
    const user = userEvent.setup();

    function Fixture() {
      const [open, setOpen] = useState(false);
      return (
        <>
          <button onClick={() => setOpen(true)} type="button">
            Open confirmation
          </button>
          <ConfirmDialog
            description="This action cannot be undone."
            onCancel={() => setOpen(false)}
            onConfirm={() => setOpen(false)}
            open={open}
            title="Cancel reservation?"
          />
        </>
      );
    }

    render(<Fixture />);
    const trigger = screen.getByRole('button', { name: 'Open confirmation' });
    await user.click(trigger);
    const dialog = screen.getByRole('dialog', { name: 'Cancel reservation?' });
    const cancel = within(dialog).getByRole('button', { name: 'Cancel' });
    const confirm = within(dialog).getByRole('button', { name: 'Confirm' });
    expect(cancel).toHaveFocus();

    await user.keyboard('{Shift>}{Tab}{/Shift}');
    expect(confirm).toHaveFocus();
    await user.keyboard('{Escape}');
    expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
    expect(trigger).toHaveFocus();
  });
});
