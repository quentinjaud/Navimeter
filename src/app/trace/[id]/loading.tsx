export default function Loading() {
  return (
    <div className="trace-detail-layout">
      <div className="skeleton" style={{ height: 32, width: 192 }} />
      <div className="trace-detail-grid">
        <div className="skeleton trace-map-container" />
        <div className="trace-sidebar">
          <div className="stats-grid">
            {[...Array(4)].map((_, i) => (
              <div key={i} className="skeleton" style={{ height: 96 }} />
            ))}
          </div>
          <div className="skeleton" style={{ height: 192 }} />
        </div>
      </div>
    </div>
  );
}
