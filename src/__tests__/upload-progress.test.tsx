import { beforeAll, describe, expect, it, vi } from 'vitest';
import { fireEvent, render, screen } from '@testing-library/react';
import { UploadProgress } from '@/components/ui/UploadProgress';
import { loadLocale } from '@/i18n';
import { useUiStore } from '@/stores/uiStore';

beforeAll(async () => {
  await loadLocale('en');
  useUiStore.setState({ language: 'en' });
});

describe('UploadProgress', () => {
  it('renders nothing when there are no items', () => {
    const { container } = render(<UploadProgress items={[]} />);
    expect(container.firstChild).toBeNull();
  });

  it('renders one row per upload item', () => {
    render(
      <UploadProgress
        items={[
          { id: '1', name: 'a.txt', size: 10, progress: 40, status: 'uploading' },
          { id: '2', name: 'b.txt', size: 20, progress: 70, status: 'uploading' },
        ]}
      />
    );
    expect(screen.getByText('a.txt')).toBeTruthy();
    expect(screen.getByText('b.txt')).toBeTruthy();
  });

  it('shows the uploading header while files are in flight', () => {
    render(
      <UploadProgress
        items={[{ id: '1', name: 'a.txt', size: 10, progress: 40, status: 'uploading' }]}
      />
    );
    expect(screen.getByText('Uploading 1 files...')).toBeTruthy();
    // No dismiss affordances while uploads are active.
    expect(screen.queryAllByLabelText('Close')).toHaveLength(0);
  });

  it('surfaces a close button for completed uploads and fires onDismiss', () => {
    const onDismiss = vi.fn();
    render(
      <UploadProgress
        items={[
          { id: '1', name: 'a.txt', size: 10, progress: 100, status: 'success' },
          { id: '2', name: 'b.txt', size: 20, progress: 100, status: 'success' },
        ]}
        onDismiss={onDismiss}
      />
    );
    const closeButtons = screen.getAllByLabelText('Close');
    // One global dismiss plus one per completed upload.
    expect(closeButtons).toHaveLength(3);
    fireEvent.click(closeButtons[1]);
    expect(onDismiss).toHaveBeenCalledWith('1');
  });
});
