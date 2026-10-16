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
    const tabs = Array.from(
      listRef.current?.querySelectorAll<HTMLElement>('[role="tab"]:not([disabled])') ?? [],
    );
    const currentIndex = tabs.indexOf(document.activeElement as HTMLElement);
    if (currentIndex === -1 || tabs.length === 0) return;

    const vertical = props['aria-orientation'] === 'vertical';
    const nextKey = vertical ? 'ArrowDown' : 'ArrowRight';
    const prevKey = vertical ? 'ArrowUp' : 'ArrowLeft';

    let nextIndex: number | null = null;
    if (event.key === nextKey) nextIndex = (currentIndex + 1) % tabs.length;
    else if (event.key === prevKey) nextIndex = (currentIndex - 1 + tabs.length) % tabs.length;
    else if (event.key === 'Home') nextIndex = 0;
    else if (event.key === 'End') nextIndex = tabs.length - 1;
    if (nextIndex === null) return;

    event.preventDefault();
    const nextTab = tabs[nextIndex];
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
