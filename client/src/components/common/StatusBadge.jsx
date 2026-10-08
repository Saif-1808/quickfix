const getStatusBadgeClass = (status) => {
  const map = {
    'Pending': 'badge-pending',
    'Accepted': 'badge-accepted',
    'Rejected': 'badge-rejected',
    'In Progress': 'badge-in-progress',
    'Completed': 'badge-completed',
    'Cancelled': 'badge-cancelled',
  };
  return map[status] || 'badge-pending';
};

const StatusBadge = ({ status }) => (
  <span className={`badge ${getStatusBadgeClass(status)}`}>
    {status}
  </span>
);

export default StatusBadge;
