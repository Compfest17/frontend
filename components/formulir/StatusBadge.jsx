export default function StatusBadge({ status }) {
  const getStatusStyle = (status) => {
    switch (status) {
      case 'sedang_proses':
        return 'bg-yellow-100 text-yellow-800';
      case 'selesai':
        return 'bg-green-100 text-green-800';
      case 'batal':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusText = (status) => {
    switch (status) {
      case 'sedang_proses':
        return 'Sedang di proses';
      case 'selesai':
        return 'Proses selesai';
      case 'batal':
        return 'Proses batal';
      default:
        return 'Status tidak diketahui';
    }
  };

  return (
    <span className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${getStatusStyle(status)}`}>
      {getStatusText(status)}
    </span>
  );
}
