import StatusBadge from '../formulir/StatusBadge';

// List all possible steps in order
const ALL_STEPS = [
  { status: 'new', label: 'Laporan Dibuat' },
  { status: 'in_progress', label: 'Sedang Diproses' },
  { status: 'resolved', label: 'Selesai' },
];

export default function StyleStatusBadge({ history }) {
  // Map history by status for quick lookup
  const historyMap = {};
  history.forEach(h => { historyMap[h.status] = h; });

  return (
    <div className="relative flex flex-col items-center">
      {ALL_STEPS.map((step, idx) => {
        const reached = !!historyMap[step.status];
        const date = historyMap[step.status]?.date;
        return (
          <div key={step.status} className="flex flex-col items-center relative">
            {/* Timeline vertical line above (except first) */}
            {idx > 0 && (
              <div className="flex flex-col items-center">
                <div className="w-0.5 h-8 bg-gray-300"></div>
                <svg width="20" height="20" className="text-gray-400" style={{ marginTop: '-2px' }}>
                  <path d="M10 4v12m0 0l-4-4m4 4l4-4" stroke="currentColor" strokeWidth="2" fill="none" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
                <div className="w-0.5 h-8 bg-gray-300"></div>
              </div>
            )}
            {/* Badge: gray if not reached, label only in badge */}
            <span className={reached ? '' : 'opacity-60'}>
              <StatusBadge status={reached ? step.status : 'disabled'} text={step.label} />
            </span>
            {/* Date */}
            {date && (
              <span className="text-sm text-gray-500 mt-1">{date}</span>
            )}
          </div>
        );
      })}
    </div>
  );
}