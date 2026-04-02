import * as React from "react";

export function Select({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}

export function SelectTrigger({
  className,
  children,
}: React.SelectHTMLAttributes<HTMLSelectElement> & { children?: React.ReactNode }) {
  return (
    <select className={className}>
      {children}
    </select>
  );
}

export function SelectValue({ placeholder }: { placeholder?: string }) {
  return <option value="">{placeholder}</option>;
}

export function SelectContent({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}

export function SelectItem({
  value,
  children,
}: {
  value: string;
  children: React.ReactNode;
}) {
  return <option value={value}>{children}</option>;
}
