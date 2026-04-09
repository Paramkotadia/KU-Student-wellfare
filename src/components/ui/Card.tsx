import React from 'react';

export function Card({ className, children }: { className?: string, children: React.ReactNode }) {
  return (
    <div className={`bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden ${className || ''}`}>
      {children}
    </div>
  );
}

export function CardHeader({ title, description, className }: { title: string, description?: string, className?: string }) {
  return (
    <div className={`p-6 border-b border-slate-100 ${className || ''}`}>
      <h3 className="text-xl font-semibold text-slate-800">{title}</h3>
      {description && <p className="text-slate-500 mt-1 text-sm">{description}</p>}
    </div>
  );
}

export function CardContent({ className, children }: { className?: string, children: React.ReactNode }) {
  return (
    <div className={`p-6 ${className || ''}`}>
      {children}
    </div>
  );
}
