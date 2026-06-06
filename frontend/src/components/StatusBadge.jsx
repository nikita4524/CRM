import { STATUS_STYLES } from '@/lib/constants';

export default function StatusBadge({ status }) {
  const styles = STATUS_STYLES[status] || STATUS_STYLES['New'];
  return (
    <span
      className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-medium border ${styles.badge}`}
    >
      <span className={`w-1.5 h-1.5 rounded-full ${styles.dot}`} />
      {status}
    </span>
  );
}
