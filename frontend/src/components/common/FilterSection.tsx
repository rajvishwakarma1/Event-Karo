import { useState, type ReactNode } from 'react';

export default function FilterSection({ title, children, defaultOpen = true, action }: { title: string; children: ReactNode; defaultOpen?: boolean; action?: ReactNode }) {
  const [open, setOpen] = useState(defaultOpen);
  return (
    <div className="rounded border bg-white overflow-hidden">
      <div className="flex items-center justify-between px-4 py-3">
        <button className="font-medium" onClick={() => setOpen(!open)}>{title}</button>
        {action}
      </div>
      {open && <div className="border-t px-4 py-3 text-sm text-gray-700">{children}</div>}
    </div>
  );
}
