export default function Badge({ children, color = "#2563eb", soft = true, className = "" }) {
  const style = soft
    ? { color, backgroundColor: `${color}1a`, borderColor: `${color}33` }
    : { color: "#fff", backgroundColor: color, borderColor: color };
  return (
    <span
      className={`chip border ${className}`}
      style={style}
    >
      {children}
    </span>
  );
}
