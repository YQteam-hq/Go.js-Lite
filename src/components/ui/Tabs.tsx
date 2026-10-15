import {
  createContext,
  useContext,
  useId,
  useRef,
  type HTMLAttributes,
  type KeyboardEvent as ReactKeyboardEvent,
  type ReactNode,
} from 'react';

interface TabsContextValue {
  value: string;
  onChange: (value: string) => void;
  /** Prefix used to wire each tab to the panel it controls. */
  baseId: string;
}

const TabsContext = createContext<TabsContextValue | undefined>(undefined);

function useTabsContext() {
  const ctx = useContext(TabsContext);
  if (!ctx) throw new Error('Tabs components must be used within Tabs');
  return ctx;
}

interface TabsProps {
  value: string;
  onValueChange: (value: string) => void;
  children: ReactNode;
  className?: string;
}

export function Tabs({ value, onValueChange, children, className = '' }: TabsProps) {
  const baseId = useId();
  return (
    <TabsContext.Provider value={{ value, onChange: onValueChange, baseId }}>
      <div className={className}>{children}</div>
    </TabsContext.Provider>
  );
}

interface TabsListProps extends HTMLAttributes<HTMLDivElement> {
  /** Orientation announced to assistive technology. Defaults to horizontal. */
  orientation?: 'horizontal' | 'vertical';
}

export function TabsList({
  className = '',
  children,
  orientation = 'horizontal',
  onKeyDown,
  ...props
}: TabsListProps) {
  const listRef = useRef<HTMLDivElement>(null);

  const tabElements = (): HTMLElement[] => {
    const list = listRef.current;
    if (!list) return [];
    return Array.from(list.querySelectorAll<HTMLElement>('[role="tab"]:not([disabled])'));
  };

  const activateAt = (index: number) => {
    const items = tabElements();
    const next = items[index];
    if (!next) return;
    next.focus();
    // Automatic activation: the panel follows the focus, which is the
    // behaviour recommended when switching panels is cheap.
    next.click();
  };

  const handleKeyDown = (event: ReactKeyboardEvent<HTMLDivElement>) => {
    onKeyDown?.(event);
    if (event.defaultPrevented) return;

    const items = tabElements();
    const current = items.indexOf(document.activeElement as HTMLElement);
    if (current === -1) return;

    switch (event.key) {
      case 'ArrowRight':
      case 'ArrowDown':
        event.preventDefault();
        activateAt((current + 1) % items.length);
        break;
      case 'ArrowLeft':
      case 'ArrowUp':
        event.preventDefault();
        activateAt((current - 1 + items.length) % items.length);
        break;
      case 'Home':
        event.preventDefault();
        activateAt(0);
        break;
      case 'End':
        event.preventDefault();
        activateAt(items.length - 1);
        break;
      default:
        break;
    }
  };

  return (
    <div
      ref={listRef}
      role="tablist"
      aria-orientation={orientation}
      onKeyDown={handleKeyDown}
      className={`inline-flex h-10 items-center justify-center rounded-md bg-bg-sunken p-1 text-fg-muted ${className}`}
      {...props}
    >
      {children}
    </div>
  );
}

interface TabsTriggerProps extends HTMLAttributes<HTMLButtonElement> {
  value: string;
}

export function TabsTrigger({ value, className = '', children, ...props }: TabsTriggerProps) {
  const { value: active, onChange, baseId } = useTabsContext();
  const isActive = active === value;
  return (
    <button
      type="button"
      role="tab"
      id={`${baseId}-tab-${value}`}
      aria-controls={`${baseId}-panel-${value}`}
      aria-selected={isActive}
      // Roving tabindex: the tab list is a single stop in the tab order and
      // the arrow keys move inside it.
      tabIndex={isActive ? 0 : -1}
      data-state={isActive ? 'active' : 'inactive'}
      data-value={value}
      onClick={() => onChange(value)}
      className={`inline-flex items-center justify-center whitespace-nowrap rounded-sm px-3 py-1.5 text-sm font-medium transition-all ${
        isActive ? 'bg-bg-elevated text-fg shadow-sm' : 'text-fg-muted hover:text-fg'
      } ${className}`}
      {...props}
    >
      {children}
    </button>
  );
}

interface TabsContentProps extends HTMLAttributes<HTMLDivElement> {
  value: string;
}

export function TabsContent({ value, className = '', children, ...props }: TabsContentProps) {
  const { value: active, baseId } = useTabsContext();
  if (active !== value) return null;
  return (
    <div
      id={`${baseId}-panel-${value}`}
      role="tabpanel"
      aria-labelledby={`${baseId}-tab-${value}`}
      tabIndex={0}
      className={`mt-2 ${className}`}
      {...props}
    >
      {children}
    </div>
  );
}
