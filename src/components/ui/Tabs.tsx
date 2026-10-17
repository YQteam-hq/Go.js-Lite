import {
  createContext,
  useContext,
  useId,
  useRef,
  type HTMLAttributes,
  type KeyboardEvent,
  type ReactNode,
} from 'react';

interface TabsContextValue {
  value: string;
  onChange: (value: string) => void;
  baseId: string;
}

const TabsContext = createContext<TabsContextValue | undefined>(undefined);

function useTabsContext() {
  const ctx = useContext(TabsContext);
  if (!ctx) throw new Error('Tabs components must be used within Tabs');
  return ctx;
}

/** Selector matching the tabs that participate in keyboard navigation. */
const TAB_SELECTOR = '[role="tab"]:not([disabled])';

/** The keys that move focus inside a tablist, per orientation. */
function navigationKeys(vertical: boolean): string[] {
  return vertical
    ? ['ArrowDown', 'ArrowUp', 'Home', 'End']
    : ['ArrowRight', 'ArrowLeft', 'Home', 'End'];
}

/**
 * Resolves the index focus should move to for a navigation key, wrapping
 * around in both directions. Callers must pre-filter the key so only the
 * four navigation keys reach this function.
 */
function resolveNextIndex(
  tabs: HTMLElement[],
  currentIndex: number,
  key: string,
  vertical: boolean,
): number {
  if (key === 'Home') return 0;
  if (key === 'End') return tabs.length - 1;
  const forward = key === (vertical ? 'ArrowDown' : 'ArrowRight');
  const offset = forward ? 1 : -1;
  return (currentIndex + offset + tabs.length) % tabs.length;
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

export function TabsList({
  className = '',
  children,
  onKeyDown,
  ...props
}: HTMLAttributes<HTMLDivElement>) {
  const { onChange } = useTabsContext();
  const listRef = useRef<HTMLDivElement>(null);

  const handleKeyDown = (event: KeyboardEvent<HTMLDivElement>) => {
    const vertical = props['aria-orientation'] === 'vertical';
    // Ignore every non-navigation key (typing, Enter, ...) before touching
    // the DOM, so the tab lookup only runs for keys that can move focus.
    if (!navigationKeys(vertical).includes(event.key)) return;

    const tabs = Array.from(listRef.current?.querySelectorAll<HTMLElement>(TAB_SELECTOR) ?? []);
    if (tabs.length === 0) return;

    // Focus normally sits on one of the tabs; bail out when it does not
    // (for example right after a pointer opening) instead of guessing.
    const currentIndex = tabs.indexOf(document.activeElement as HTMLElement);
    if (currentIndex === -1) return;

    event.preventDefault();
    const nextTab = tabs[resolveNextIndex(tabs, currentIndex, event.key, vertical)];
    if (nextTab.dataset.value) onChange(nextTab.dataset.value);
    nextTab.focus();
  };

  return (
    <div
      ref={listRef}
      role="tablist"
      className={`inline-flex h-10 items-center justify-center rounded-md bg-bg-sunken p-1 text-fg-muted ${className}`}
      onKeyDown={event => {
        onKeyDown?.(event);
        handleKeyDown(event);
      }}
      {...props}
    >
      {children}
    </div>
  );
}

interface TabsTriggerProps extends HTMLAttributes<HTMLButtonElement> {
  value: string;
  /** Disabled tabs are skipped by the keyboard navigation and cannot be selected. */
  disabled?: boolean;
}

export function TabsTrigger({ value, className = '', children, ...props }: TabsTriggerProps) {
  const { value: active, onChange, baseId } = useTabsContext();
  const isActive = active === value;
  return (
    <button
      type="button"
      role="tab"
      id={`${baseId}-tab-${value}`}
      aria-selected={isActive}
      aria-controls={`${baseId}-panel-${value}`}
      data-state={isActive ? 'active' : 'inactive'}
      data-value={value}
      tabIndex={isActive ? 0 : -1}
      onClick={() => onChange(value)}
      className={`inline-flex items-center justify-center whitespace-nowrap rounded-sm px-3 py-1.5 text-sm font-medium transition-all focus-ring ${
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
      role="tabpanel"
      id={`${baseId}-panel-${value}`}
      aria-labelledby={`${baseId}-tab-${value}`}
      className={`mt-2 ${className}`}
      {...props}
    >
      {children}
    </div>
  );
}
