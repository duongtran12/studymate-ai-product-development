export function LoadingState({ message = "Đang tải dữ liệu…" }) {
  return (
    <div className="content-state content-state-loading" role="status" aria-live="polite">
      <span className="loading-spinner" aria-hidden="true" />
      <p>{message}</p>
    </div>
  );
}

export function EmptyState({ title, description, action }) {
  return (
    <div className="content-state content-state-empty">
      <strong>{title}</strong>
      {description && <p>{description}</p>}
      {action}
    </div>
  );
}

export function ErrorState({ message, onRetry }) {
  return (
    <div className="content-state content-state-error" role="alert">
      <strong>Không thể tải dữ liệu</strong>
      <p>{message}</p>
      {onRetry && <button className="secondary-button" onClick={onRetry} type="button">Thử lại</button>}
    </div>
  );
}
