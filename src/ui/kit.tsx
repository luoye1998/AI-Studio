import { useEffect, type ReactNode } from 'react';
import { Icon } from './Icons';

export function Modal({
  open,
  title,
  subtitle,
  children,
  footer,
  onClose,
  width,
}: {
  open: boolean;
  title: ReactNode;
  subtitle?: ReactNode;
  children: ReactNode;
  footer?: ReactNode;
  onClose: () => void;
  width?: number;
}) {
  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [open, onClose]);

  if (!open) return null;
  return (
    <div className="overlay" onMouseDown={(e) => e.target === e.currentTarget && onClose()}>
      <div className="modal" style={width ? { width: `min(${width}px, 100%)` } : undefined} role="dialog" aria-modal>
        <div className="modal-head">
          <div className="grow">
            <h2>{title}</h2>
            {subtitle ? <div className="sm dim" style={{ marginTop: 3 }}>{subtitle}</div> : null}
          </div>
          <button className="btn ghost sm" onClick={onClose} aria-label="关闭">
            <Icon name="x" />
          </button>
        </div>
        <div className="modal-body">{children}</div>
        {footer ? <div className="modal-foot">{footer}</div> : null}
      </div>
    </div>
  );
}

export function Progress({ value, tone = 'gold' }: { value: number; tone?: 'gold' | 'indigo' | 'green' }) {
  return (
    <div className={`progress ${tone}`}>
      <i style={{ width: `${Math.max(0, Math.min(100, value))}%` }} />
    </div>
  );
}

export function Stat({ value, label, tone }: { value: ReactNode; label: string; tone?: string }) {
  return (
    <div className="stat">
      <div className="v" style={tone ? { color: tone } : undefined}>{value}</div>
      <div className="k">{label}</div>
    </div>
  );
}

export function SectionTitle({ children, right }: { children: ReactNode; right?: ReactNode }) {
  return (
    <div className="row" style={{ marginBottom: 10 }}>
      <div className="label">{children}</div>
      <div className="grow" />
      {right}
    </div>
  );
}

export function Empty({ title, hint }: { title: string; hint?: string }) {
  return (
    <div className="empty">
      <div style={{ marginBottom: 6 }}>{title}</div>
      {hint ? <div className="tiny dim">{hint}</div> : null}
    </div>
  );
}
