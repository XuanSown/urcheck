'use client';

import { useState, type FormEvent } from 'react';
import { motion, useReducedMotion } from 'framer-motion';
import { Button } from '@/components/ui/Button';
import { useLocale } from '@/components/I18nProvider';

interface ContactFormValues {
  name: string;
  email: string;
  company: string;
  message: string;
}

type Errors = Partial<Record<keyof ContactFormValues, string>>;

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export function ContactForm() {
  const { t } = useLocale();
  const reducedMotion = useReducedMotion();

  const [values, setValues] = useState<ContactFormValues>({
    name: '',
    email: '',
    company: '',
    message: '',
  });
  const [errors, setErrors] = useState<Errors>({});
  const [submitted, setSubmitted] = useState(false);

  const update = (key: keyof ContactFormValues) => (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    setValues((prev) => ({ ...prev, [key]: e.target.value }));
    if (errors[key]) setErrors((prev) => ({ ...prev, [key]: undefined }));
  };

  const validate = (): Errors => {
    const next: Errors = {};
    if (!values.name.trim()) next.name = t('contact_form_name');
    if (!values.email.trim()) next.email = t('contact_form_email');
    else if (!EMAIL_RE.test(values.email)) next.email = t('contact_form_email');
    if (!values.message.trim()) next.message = t('contact_form_message');
    return next;
  };

  const onSubmit = (e: FormEvent) => {
    e.preventDefault();
    const found = validate();
    setErrors(found);
    if (Object.keys(found).length === 0) {
      setSubmitted(true);
    }
  };

  const field =
    'w-full rounded-xl border bg-white/70 dark:bg-gray-900/60 px-4 py-3 text-sm text-gray-900 dark:text-white placeholder:text-gray-400 dark:placeholder:text-gray-500 focus:outline-none focus:ring-2 focus:ring-primary-500 transition-colors duration-300';
  const ok = 'border-gray-200 dark:border-gray-700';
  const bad = 'border-error dark:border-error-fg';
  const errText = 'mt-1.5 text-xs text-error dark:text-error-fg';

  return (
    <section className="relative py-4 sm:py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-12 items-start">
        {/* LEFT: form card */}
        {submitted ? (
          <div className="glass rounded-3xl p-8 sm:p-10 relative overflow-hidden min-h-[420px] flex items-center justify-center">
            <div className="pointer-events-none absolute -top-16 -right-10 h-44 w-44 rounded-full bg-primary-500/10 blur-2xl" />
            <motion.div
              initial={reducedMotion ? false : { opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
              className="relative flex flex-col items-center text-center"
              role="status"
              aria-live="polite"
            >
              <div className="flex h-16 w-16 items-center justify-center rounded-full bg-primary-100 dark:bg-primary-900/40 text-primary-600 dark:text-primary-400">
                <svg className="h-8 w-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7" />
                </svg>
              </div>
              <p className="mt-5 text-lg font-medium text-gray-900 dark:text-white">
                {t('contact_form_success')}
              </p>
            </motion.div>
          </div>
        ) : (
          <form onSubmit={onSubmit} noValidate className="glass rounded-3xl p-6 sm:p-10 relative overflow-hidden">
            <div className="pointer-events-none absolute -top-16 -right-10 h-44 w-44 rounded-full bg-primary-500/10 blur-2xl" />
            <div className="relative space-y-5">
              <div>
                <label htmlFor="contact-name" className="block text-sm font-medium text-gray-900 dark:text-white mb-1.5">
                  {t('contact_form_name')}
                </label>
                <input
                  id="contact-name"
                  type="text"
                  value={values.name}
                  onChange={update('name')}
                  aria-invalid={!!errors.name}
                  className={`${field} ${errors.name ? bad : ok}`}
                />
                {errors.name && <p className={errText}>{errors.name}</p>}
              </div>

              <div>
                <label htmlFor="contact-email" className="block text-sm font-medium text-gray-900 dark:text-white mb-1.5">
                  {t('contact_form_email')}
                </label>
                <input
                  id="contact-email"
                  type="email"
                  value={values.email}
                  onChange={update('email')}
                  aria-invalid={!!errors.email}
                  className={`${field} ${errors.email ? bad : ok}`}
                />
                {errors.email && <p className={errText}>{errors.email}</p>}
              </div>

              <div>
                <label htmlFor="contact-company" className="block text-sm font-medium text-gray-900 dark:text-white mb-1.5">
                  {t('contact_form_company')}
                </label>
                <input
                  id="contact-company"
                  type="text"
                  value={values.company}
                  onChange={update('company')}
                  className={`${field} ${ok}`}
                />
              </div>

              <div>
                <label htmlFor="contact-message" className="block text-sm font-medium text-gray-900 dark:text-white mb-1.5">
                  {t('contact_form_message')}
                </label>
                <textarea
                  id="contact-message"
                  rows={5}
                  value={values.message}
                  onChange={update('message')}
                  aria-invalid={!!errors.message}
                  className={`${field} resize-none ${errors.message ? bad : ok}`}
                />
                {errors.message && <p className={errText}>{errors.message}</p>}
              </div>

              <Button type="submit" variant="primary" size="lg" className="w-full">
                {t('contact_form_submit')}
              </Button>
            </div>
          </form>
        )}

        {/* RIGHT: info panel */}
        <div className="glass rounded-3xl p-6 sm:p-10 relative overflow-hidden h-full">
          <div className="pointer-events-none absolute -bottom-16 -left-10 h-44 w-44 rounded-full bg-primary-500/10 blur-2xl" />
          <motion.div
            initial={reducedMotion ? false : { opacity: 0, x: 24 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true, margin: '-50px' }}
            transition={{ duration: 0.7, ease: [0.16, 1, 0.3, 1] }}
            className="relative"
          >
            <h2 className="text-lg sm:text-xl font-semibold text-gray-900 dark:text-white">
              {t('contact_info_title')}
            </h2>

            <ul className="mt-6 space-y-5">
              <li className="flex items-start gap-3.5">
                <span className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-xl bg-primary-100 dark:bg-primary-900/40 text-primary-600 dark:text-primary-400">
                  <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                  </svg>
                </span>
                <div>
                  <p className="text-xs uppercase tracking-wider text-gray-500 dark:text-gray-400">Email</p>
                  <a href={`mailto:${t('contact_email')}`} className="text-sm text-gray-900 dark:text-white hover:text-primary-600 dark:hover:text-primary-400 transition-colors break-all">
                    {t('contact_email')}
                  </a>
                </div>
              </li>

              <li className="flex items-start gap-3.5">
                <span className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-xl bg-primary-100 dark:bg-primary-900/40 text-primary-600 dark:text-primary-400">
                  <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                  </svg>
                </span>
                <div>
                  <p className="text-xs uppercase tracking-wider text-gray-500 dark:text-gray-400">Phone</p>
                  <a href={`tel:${t('contact_phone')}`} className="text-sm text-gray-900 dark:text-white hover:text-primary-600 dark:hover:text-primary-400 transition-colors">
                    {t('contact_phone')}
                  </a>
                </div>
              </li>

              <li className="flex items-start gap-3.5">
                <span className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-xl bg-primary-100 dark:bg-primary-900/40 text-primary-600 dark:text-primary-400">
                  <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                  </svg>
                </span>
                <div>
                  <p className="text-xs uppercase tracking-wider text-gray-500 dark:text-gray-400">Address</p>
                  <p className="text-sm text-gray-900 dark:text-white">
                    {t('contact_address')}
                  </p>
                </div>
              </li>
            </ul>

            <div className="mt-8 inline-flex items-center gap-2 rounded-full bg-primary-50 dark:bg-primary-900/20 px-4 py-2 text-sm text-primary-700 dark:text-primary-300 border border-primary-200/60 dark:border-primary-800/50">
              <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              {t('contact_trust')}
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
}

export default ContactForm;
