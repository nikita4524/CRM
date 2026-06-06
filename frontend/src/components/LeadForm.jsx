import { useState, useEffect } from 'react';
import { LEAD_STATUSES } from '@/lib/constants';

const EMPTY_FORM = {
  name: '',
  email: '',
  phone: '',
  company: '',
  status: 'New',
  notes: '',
};

export default function LeadForm({ initialData, onSubmit, onCancel, isLoading }) {
  const [form, setForm] = useState(EMPTY_FORM);
  const [errors, setErrors] = useState({});

  useEffect(() => {
    if (initialData) {
      setForm({
        name: initialData.name || '',
        email: initialData.email || '',
        phone: initialData.phone || '',
        company: initialData.company || '',
        status: initialData.status || 'New',
        notes: initialData.notes || '',
      });
    } else {
      setForm(EMPTY_FORM);
    }
    setErrors({});
  }, [initialData]);

  const validate = () => {
    const errs = {};
    if (!form.name.trim()) errs.name = 'Name is required';
    if (!form.email.trim()) errs.email = 'Email is required';
    else if (!/^\S+@\S+\.\S+$/.test(form.email)) errs.email = 'Enter a valid email';
    if (!form.phone.trim()) errs.phone = 'Phone number is required';
    if (!form.company.trim()) errs.company = 'Company name is required';
    return errs;
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
    if (errors[name]) setErrors((prev) => ({ ...prev, [name]: '' }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    const errs = validate();
    if (Object.keys(errs).length) {
      setErrors(errs);
      return;
    }
    onSubmit(form);
  };

  const Field = ({ label, name, type = 'text', required, placeholder, children }) => (
    <div>
      <label htmlFor={name} className="label">
        {label} {required && <span className="text-red-500">*</span>}
      </label>
      {children || (
        <input
          id={name}
          name={name}
          type={type}
          value={form[name]}
          onChange={handleChange}
          placeholder={placeholder}
          className={`input ${errors[name] ? 'border-red-400 focus:ring-red-400' : ''}`}
          disabled={isLoading}
        />
      )}
      {errors[name] && <p className="mt-1 text-xs text-red-500">{errors[name]}</p>}
    </div>
  );

  return (
    <form onSubmit={handleSubmit} noValidate>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <Field label="Full Name" name="name" required placeholder="John Doe" />
        <Field label="Email Address" name="email" type="email" required placeholder="john@company.com" />
        <Field label="Phone Number" name="phone" required placeholder="+1 (555) 000-0000" />
        <Field label="Company Name" name="company" required placeholder="Acme Inc." />

        {/* Status select */}
        <div>
          <label htmlFor="status" className="label">
            Lead Status
          </label>
          <select
            id="status"
            name="status"
            value={form.status}
            onChange={handleChange}
            className="input"
            disabled={isLoading}
          >
            {LEAD_STATUSES.map((s) => (
              <option key={s} value={s}>
                {s}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Notes — full width */}
      <div className="mt-4">
        <label htmlFor="notes" className="label">
          Notes
        </label>
        <textarea
          id="notes"
          name="notes"
          value={form.notes}
          onChange={handleChange}
          rows={3}
          placeholder="Any additional notes about this lead..."
          className="input resize-none"
          disabled={isLoading}
        />
      </div>

      <div className="flex justify-end gap-3 mt-6">
        <button type="button" onClick={onCancel} className="btn-secondary" disabled={isLoading}>
          Cancel
        </button>
        <button type="submit" className="btn-primary" disabled={isLoading}>
          {isLoading ? 'Saving...' : initialData ? 'Save Changes' : 'Add Lead'}
        </button>
      </div>
    </form>
  );
}
