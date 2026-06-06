export default function StatsCard({ label, value, icon, colorClass = 'text-blue-600', bgClass = 'bg-blue-50' }) {
  return (
    <div className="card p-5 flex items-center gap-4">
      <div className={`w-12 h-12 rounded-xl ${bgClass} flex items-center justify-center text-xl flex-shrink-0`}>
        {icon}
      </div>
      <div className="min-w-0">
        <p className="text-sm text-gray-500 truncate">{label}</p>
        <p className={`text-2xl font-bold ${colorClass}`}>{value}</p>
      </div>
    </div>
  );
}
