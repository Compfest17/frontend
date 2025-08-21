export default function StatusBadge({ status, text }) {
  const getStatusStyle = (status) => {
    switch (status) {
      case 'pending':
      case 'baru':
      case 'new':
        return 'bg-blue-100 text-blue-800';
      case 'sedang_proses':
      case 'in_progress':
      case 'ongoing':
      case 'proses':
        return 'bg-yellow-100 text-yellow-800';
      case 'selesai':
      case 'resolved':
      case 'completed':
        return 'bg-green-100 text-green-800';
      case 'batal':
      case 'closed':
      case 'cancelled':
        return 'bg-red-100 text-red-800';
      case 'open':
        return 'bg-blue-100 text-blue-800';
      case 'disabled':
        return 'bg-gray-100 text-gray-400';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusText = (status) => {
    if (text) return text;
    switch (status) {
      case 'pending':
      case 'baru':
      case 'new':
        return 'Baru';
      case 'sedang_proses':
      case 'in_progress':
      case 'ongoing':
      case 'proses':
        return 'Sedang Diproses';
      case 'selesai':
      case 'resolved':
      case 'completed':
        return 'Selesai';
      case 'batal':
      case 'closed':
      case 'cancelled':
        return 'Dibatalkan';
      case 'open':
        return 'Terbuka';
      case 'disabled':
        return 'Tahap Belum Dimulai';
      default:
        return 'Status Tidak Diketahui';
    }
  };

  return (
    <span className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${getStatusStyle(status)}`}>
      {getStatusText(status)}
    </span>
  );
}
