export default function FormInput({
  label,
  id,
  type = 'text',
  placeholder,
  error,
  disabled,
  register,
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
      <input
        id={id}
        type={type}
        placeholder={placeholder}
        disabled={disabled}
        className={`bg-bg-surface border rounded-lg px-3 py-2 text-sm text-text-primary placeholder:text-text-muted focus:outline-none focus:ring-2 focus:ring-accent/50 focus:border-accent transition-colors disabled:opacity-50 disabled:cursor-not-allowed w-full ${
          error ? 'border-danger' : 'border-border'
        }`}
        {...(register ? register(id) : {})}
        {...rest}
      />
      {error && <p className="text-xs text-danger text-right mt-0.5">{error}</p>}
    </div>
  );
}
