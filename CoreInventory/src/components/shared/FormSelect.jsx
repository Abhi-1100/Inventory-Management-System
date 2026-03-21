export default function FormSelect({
  label,
  id,
  options = [],
  error,
  disabled,
  register,
  placeholder = 'Select...',
  className = '',
  ...rest
}) {
  return (
    <div className={`flex flex-col gap-1.5 ${className}`}>
      {label && (
        <label htmlFor={id} className="text-sm font-medium text-text-secondary">
          {label}
        </label>
      )}
      <select
        id={id}
        disabled={disabled}
        className={`bg-bg-surface border rounded-lg px-3 py-2 text-sm text-text-primary focus:outline-none focus:ring-2 focus:ring-accent/50 focus:border-accent transition-colors disabled:opacity-50 disabled:cursor-not-allowed w-full appearance-none ${
          error ? 'border-danger' : 'border-border'
        }`}
        {...(register ? register(id) : {})}
        {...rest}
      >
        <option value="">{placeholder}</option>
        {options.map((opt) => (
          <option key={opt.value} value={opt.value}>
            {opt.label}
          </option>
        ))}
      </select>
      {error && <p className="text-xs text-danger text-right mt-0.5">{error}</p>}
    </div>
  );
}
