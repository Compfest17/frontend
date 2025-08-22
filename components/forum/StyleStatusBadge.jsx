import StatusBadge from '../formulir/StatusBadge';

export default function StyleStatusBadge({ history }) {
  const historyMap = {};
  history.forEach(h => { historyMap[h.status] = h; });

  const finalStatus = history[history.length - 1]?.status;
  const hasFinal = finalStatus === 'closed' || finalStatus === 'resolved';
  const finalStepStatus = hasFinal ? finalStatus : 'resolved';
  const finalLabel = hasFinal ? (finalStatus === 'closed' ? 'Dibatalkan' : 'Selesai') : 'Selesai/Dibatalkan';
  const finalDate = historyMap[finalStepStatus]?.date;

  const stepsToShow = [
    { status: 'new', label: 'Laporan Dibuat', date: historyMap['new']?.date },
    { status: 'in_progress', label: 'Sedang Diproses', date: historyMap['in_progress']?.date },
    { status: finalStepStatus, label: finalLabel, date: finalDate }
  ];

  return (
    <div className="relative flex flex-col items-center">
      {stepsToShow.map((step, idx) => {
        const reached = !!historyMap[step.status];
        const date = step.date;
        return (
          <div key={`${step.status}-${idx}`} className="flex flex-col items-center relative">
            {idx > 0 && (
              <div className="flex flex-col items-center">
                <div className="w-0.5 h-8 bg-gray-300"></div>
                <svg width="20" height="20" className="text-gray-400" style={{ marginTop: '-2px' }}>
                  <path d="M10 4v12m0 0l-4-4m4 4l4-4" stroke="currentColor" strokeWidth="2" fill="none" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
                <div className="w-0.5 h-8 bg-gray-300"></div>
              </div>
            )}
            <span className={reached ? '' : 'opacity-60'}>
              <StatusBadge status={reached ? step.status : 'disabled'} text={step.label} />
            </span>
            {date && (
              <span className="text-sm text-gray-500 mt-1">{date}</span>
            )}
          </div>
        );
      })}
    </div>
  );
}