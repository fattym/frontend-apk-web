import { Link, Navigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { useState, useEffect } from 'react';
import { fetchFormSubmissions, formErrorMessage } from '../services/api';

const roleConfigs = {
  school: {
    icon: 'fa-solid fa-school',
    iconBg: 'bg-orange-100 text-brand-orange',
    label: 'A school or club',
    desc: 'I manage a learning program, team, or coding club.',
    question: 'Let us plan for your school or club',
    fields: [
      ['Contact person', 'e.g. Jane Doe', 'text', 'contact-name'],
      ['Work email', 'e.g. jane@school.ac.ke', 'email', 'contact-email'],
      ['Phone number', 'e.g. +254 700 000 000', 'tel', 'contact-phone'],
      ['Organisation name', 'e.g. Nairobi STEM Academy', 'text', 'organisation-name'],
      ['Location or town', 'e.g. Nairobi', 'text', 'location'],
      ['Number of learners', 'Select learner count', 'select', 'learner-count'],
    ],
    selectOptions: ['Select learner count', '1 - 50 learners', '51 - 200 learners', '200+ learners'],
    cta: 'Explore school tools',
  },
  parent: {
    icon: 'fa-solid fa-user-group',
    iconBg: 'bg-blue-100 text-blue-700',
    label: 'A parent or guardian',
    desc: "I want to support and follow a learner's progress.",
    question: 'Let us connect you to your learner',
    fields: [
      ['Your full name', 'e.g. Jane Doe', 'text', 'contact-name'],
      ['Email address', 'e.g. jane@example.com', 'email', 'contact-email'],
      ['Phone number', 'e.g. +254 700 000 000', 'tel', 'contact-phone'],
      ['Learner name', 'e.g. Amina Ndungu', 'text', 'learner-name'],
      ['School or club', 'e.g. Nairobi Coding Club', 'text', 'organisation-name'],
      ['Preferred contact method', 'Choose a contact method', 'contact', 'preferred-contact'],
    ],
    selectOptions: ['Choose a contact method', 'Phone call', 'WhatsApp', 'Email'],
    cta: 'See the parent experience',
  },
  student: {
    icon: 'fa-solid fa-laptop-code',
    iconBg: 'bg-green-100 text-green-700',
    label: 'A student',
    desc: 'I want to learn, build projects, and grow my coding skills.',
    question: 'Let us shape your learning path',
    fields: [
      ['Student name', 'e.g. Jabali Otieno', 'text', 'contact-name'],
      ['Email address', 'e.g. student@example.com', 'email', 'contact-email'],
      ['Parent or guardian phone', 'e.g. +254 700 000 000', 'tel', 'contact-phone'],
      ['School or club', 'e.g. Nairobi Coding Club', 'text', 'organisation-name'],
      ['Location or town', 'e.g. Nairobi', 'text', 'location'],
      ['I want to learn', 'Choose a focus', 'select', 'learning-focus'],
    ],
    selectOptions: ['Choose a focus', 'Web development', 'Python', 'Robotics'],
    cta: 'Start learning',
  },
  admin: {
    icon: 'fa-solid fa-user-shield',
    iconBg: 'bg-indigo-100 text-indigo-700',
    label: 'A system administrator',
    desc: 'I want to view and manage onboarding forms for parents, schools, and students.',
    question: 'View onboarding forms for parent, school, and student',
    fields: [],
    selectOptions: [],
    cta: 'View form submissions',
  },
};

const pricingPlans = [
  {
    name: 'Essential',
    label: 'Starter Club',
    desc: 'Ideal for single coding clubs with up to 50 students.',
    features: ['Basic ERP & Attendance', 'Standard LMS Coding Sandbox', 'Parent Email Updates'],
    btnClass: 'border border-brand-navy text-brand-navy hover:bg-brand-grayLight',
    featuresClass: 'text-gray-600',
    checkClass: 'text-green-500',
    waMessage: 'Hello%20Coding%20Clubs%20Kenya%2C%20I%20would%20like%20a%20quote%20for%20the%20Essential%20plan.',
  },
  {
    name: 'System Complete',
    label: 'Pro Academy',
    desc: 'Full access for growing STEM academies up to 300 students.',
    features: [
      'Advanced ERP + Invoicing Module',
      'Full LMS + Auto-grading Pipelines',
      'Dedicated Parent Mobile App Access',
      'Mentor Chat & Portfolio Showcase',
    ],
    highlighted: true,
    btnClass: 'bg-brand-orange hover:bg-brand-orangeHover text-white clay-button',
    featuresClass: 'text-gray-200',
    checkClass: 'text-brand-orange',
    waMessage: 'Hello%20Coding%20Clubs%20Kenya%2C%20I%20would%20like%20a%20quote%20for%20the%20System%20Complete%20plan.',
  },
  {
    name: 'Institutional',
    label: 'Enterprise',
    desc: 'For large school networks and nationwide club franchises.',
    features: [
      'Unlimited Students & Branches',
      'Custom Domain & White-labeling',
      'Dedicated Server & API Support',
    ],
    btnClass: 'border border-brand-navy text-brand-navy hover:bg-brand-grayLight',
    featuresClass: 'text-gray-600',
    checkClass: 'text-green-500',
    waMessage: 'Hello%20Coding%20Clubs%20Kenya%2C%20I%20would%20like%20a%20quote%20for%20the%20Institutional%20plan.',
  },
];

const OnboardingField = ({ label, placeholder, type, fieldName }) => {
  const inputClasses = "mt-2 w-full px-4 py-3 rounded-xl border border-gray-200 text-sm font-normal focus:outline-none focus:border-brand-orange";
  if (type === 'select') {
    const isLearnerCount = fieldName === 'learner-count';
    const isLearningFocus = fieldName === 'learning-focus';
    return (
      <label className="block text-xs font-bold text-brand-navy mb-1">
        {label}
        <select name={fieldName} required className={inputClasses}>
          <option>{placeholder}</option>
          {isLearnerCount && (
            <>
              <option>1 - 50 learners</option>
              <option>51 - 200 learners</option>
              <option>200+ learners</option>
            </>
          )}
          {isLearningFocus && (
            <>
              <option>Web development</option>
              <option>Python</option>
              <option>Robotics</option>
            </>
          )}
        </select>
      </label>
    );
  }
  if (type === 'contact') {
    return (
      <label className="block text-xs font-bold text-brand-navy mb-1">
        {label}
        <select name={fieldName} required className={inputClasses}>
          <option>{placeholder}</option>
          <option>Phone call</option>
          <option>WhatsApp</option>
          <option>Email</option>
        </select>
      </label>
    );
  }
  const phoneAttrs = fieldName === 'contact-phone'
    ? { inputMode: 'tel', pattern: '[+0-9 ()-]{7,}', title: 'Enter a valid phone number with at least 7 digits' }
    : {};
  return (
    <label className="block text-xs font-bold text-brand-navy mb-1">
      {label}
      <input name={fieldName} type={type} required {...phoneAttrs} placeholder={placeholder} className={inputClasses} />
    </label>
  );
};

const ADMIN_FORM_ROLES = ['school', 'parent', 'student'];

const AdminFormsViewer = () => {
  const [submissions, setSubmissions] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const token = typeof window !== 'undefined' ? localStorage.getItem('access_token') : null;

  const loadSubmissions = async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await fetchFormSubmissions();
      setSubmissions(data);
    } catch (err) {
      setError(
        err?.response?.status === 401
          ? 'You need to be logged in as an admin to view submitted responses.'
          : formErrorMessage(err, 'Could not load submissions.'),
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-8" id="admin-forms-viewer">
      <div className="text-center">
        <h3 className="text-lg sm:text-xl font-extrabold text-brand-navy">
          Onboarding Form Viewer
        </h3>
        <p className="text-xs text-brand-charcoal/70 mt-1">
          Review the information collected for each role during onboarding.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {ADMIN_FORM_ROLES.map((role) => {
          const config = roleConfigs[role];
          return (
            <div key={role} className="clay-card p-5 bg-white">
              <div className="flex items-center space-x-3 mb-4">
                <span className={`w-10 h-10 rounded-xl flex items-center justify-center text-lg ${config.iconBg}`}>
                  <i className={config.icon}></i>
                </span>
                <div className="min-w-0">
                  <h4 className="font-bold text-brand-navy text-sm">{config.label}</h4>
                  <p className="text-[10px] text-gray-500 leading-tight">{config.desc}</p>
                </div>
              </div>
              <p className="text-xs font-semibold text-brand-navy mb-3">{config.question}</p>
              <ul className="space-y-3 text-xs">
                {config.fields.map(([label, placeholder, type, fieldName]) => (
                  <li key={fieldName} className="flex flex-col">
                    <span className="text-gray-700 font-medium">{label}</span>
                    <span className="text-gray-400">e.g. {placeholder}</span>
                    <span className="text-[10px] text-gray-400">field type: {type}</span>
                  </li>
                ))}
              </ul>
            </div>
          );
        })}
      </div>

      <div className="clay-card p-6 bg-white">
        <div className="flex items-center justify-between mb-3">
          <h4 className="font-bold text-brand-navy">Submitted Form Responses</h4>
          {token ? (
            <button
              type="button"
              onClick={loadSubmissions}
              disabled={loading}
              className="px-4 py-2 text-xs font-bold text-white bg-brand-orange hover:bg-brand-orangeHover rounded-xl clay-button transition-all disabled:opacity-75"
            >
              {loading ? 'Loading…' : 'Load submissions'}
            </button>
          ) : (
            <Link
              to="/login"
              className="px-4 py-2 text-xs font-bold text-white bg-brand-navy hover:bg-brand-navy/90 rounded-xl clay-button transition-all"
            >
              Log In as Admin
            </Link>
          )}
        </div>
        <p className="text-[10px] text-gray-400 mb-3">
          {token
            ? 'Fetched from the admin form-submission API. Only staff/admins can list submissions.'
            : 'Log in as an administrator to view actual submitted parent, school, and student responses.'}
        </p>
        {error && (
          <div className="p-3 bg-red-50 border border-red-200 text-red-700 text-xs font-medium rounded-xl">
            <i className="fa-solid fa-circle-exclamation mr-1"></i>
            {error}
          </div>
        )}
        {submissions.length > 0 && (
          <div className="overflow-x-auto rounded-xl border border-gray-100 mt-4">
            <table className="w-full text-left text-xs">
              <thead className="bg-brand-navy text-white">
                <tr>
                  <th className="p-3">#</th>
                  <th className="p-3">Type</th>
                  <th className="p-3">Status</th>
                  <th className="p-3">Data</th>
                  <th className="p-3">Created</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {submissions.map((s) => (
                  <tr key={s.id}>
                    <td className="p-3 font-semibold text-brand-navy">#{s.id}</td>
                    <td className="p-3 capitalize">{s.form_type}</td>
                    <td className="p-3">
                      <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-brand-grayLight text-brand-navy">
                        {s.status}
                      </span>
                    </td>
                    <td className="p-3 text-gray-500 max-w-xs truncate">{JSON.stringify(s.data)}</td>
                    <td className="p-3 text-gray-400">{new Date(s.created_at).toLocaleString()}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
        {!loading && submissions.length === 0 && token && !error && (
          <p className="text-xs text-gray-400">No submitted responses.</p>
        )}
      </div>
    </div>
  );
};

const PublicHome = () => {
  const { user, loading } = useAuth();
  if (loading) return <div className="p-6">Loading...</div>;
  if (user) return <Navigate to={user.role === 'TEACHER' ? '/teacher-dashboard' : user.role === 'STUDENT' ? '/student-dashboard' : user.role === 'PARENT' ? '/parent-dashboard' : '/school-dashboard'} replace />;
  return <Homepage />;
};

const Homepage = () => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [activeTab, setActiveTab] = useState('erp');
  const [showOnboarding, setShowOnboarding] = useState(true);
  const [selectedRole, setSelectedRole] = useState('');
  const [selectedQuotePlan, setSelectedQuotePlan] = useState('');
  const [demoSuccess, setDemoSuccess] = useState(false);

  useEffect(() => {
    if (showOnboarding) {
      document.body.classList.add('onboarding-active');
    } else {
      document.body.classList.remove('onboarding-active');
    }
  }, [showOnboarding]);

  const handleSelectRole = (role) => {
    setSelectedRole(role);
    document.getElementById('onboarding-details')?.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
  };

  const startQuote = (e, plan) => {
    e.preventDefault();
    setSelectedQuotePlan(plan);
    setShowOnboarding(true);
    setSelectedRole('');
  };

  const handleDemoSubmit = (e) => {
    e.preventDefault();
    setDemoSuccess(true);
    setTimeout(() => {
      const el = document.getElementById('demo-success');
      if (el) el.scrollIntoView({ behavior: 'smooth' });
    }, 100);
  };

  const handleCompleteOnboarding = (e) => {
    e.preventDefault();
    const requiredFields = document.querySelectorAll('#onboarding-details [required]');
    const incompleteField = Array.from(requiredFields).find((field) => !field.value || field.selectedIndex === 0);
    if (incompleteField) {
      incompleteField.focus();
      incompleteField.reportValidity();
      return;
    }
    const phoneField = document.querySelector('#onboarding-details [name="contact-phone"]');
    if (phoneField) {
      if (phoneField.value.replace(/\D/g, '').length < 7) {
        phoneField.setCustomValidity('Enter a valid phone number with at least 7 digits.');
        phoneField.focus();
        phoneField.reportValidity();
        return;
      }
      phoneField.setCustomValidity('');
    }
    if (selectedQuotePlan) {
      const fields = Array.from(document.querySelectorAll('#onboarding-details [name]'))
        .map((field) => {
          const labelEl = field.closest('label');
          const labelText = labelEl ? labelEl.childNodes[0].textContent.trim() : '';
          return `${labelText}: ${field.value}`;
        })
        .join('\n');
      const message = `Hello Coding Clubs Kenya, I would like a quote for the ${selectedQuotePlan} plan.\n\nRole: ${selectedRole}\n${fields}`;
      window.open(`https://wa.me/254716815025?text=${encodeURIComponent(message)}`, '_blank');
      return;
    }
    setShowOnboarding(false);
    setTimeout(() => {
      const el = document.getElementById('demo');
      if (el) el.scrollIntoView({ behavior: 'smooth' });
    }, 100);
  };

  const getOnboardingQuestion = () => {
    const config = roleConfigs[selectedRole];
    if (!config) return '';
    return selectedQuotePlan ? `${config.question} for ${selectedQuotePlan}` : config.question;
  };

  const getOnboardingCta = () => {
    const config = roleConfigs[selectedRole];
    if (!config) return '';
    return selectedQuotePlan ? 'Send quote request on WhatsApp' : config.cta;
  };

  const renderOnboardingFields = () => {
    const config = roleConfigs[selectedRole];
    if (!config) return null;
    return config.fields.map(([label, placeholder, type, fieldName]) => (
      <OnboardingField key={fieldName} label={label} placeholder={placeholder} type={type} fieldName={fieldName} />
    ));
  };

  const scrollToSection = (id) => {
    setShowOnboarding(false);
    document.body.classList.remove('onboarding-active');
    setTimeout(() => {
      const el = document.getElementById(id);
      if (el) el.scrollIntoView({ behavior: 'smooth' });
    }, 100);
  };

  return (
    <div className="landing-font min-h-screen flex flex-col">
      {/* Navigation Bar */}
      <nav className="sticky top-0 z-50 bg-white/90 backdrop-blur-md border-b border-gray-100 py-4 px-4 sm:px-8">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <a href="#overview" onClick={(e) => { e.preventDefault(); scrollToSection('overview'); }} className="flex min-w-0 items-center space-x-2 sm:space-x-3 group">
            <div className="w-9 h-9 sm:w-10 sm:h-10 shrink-0 rounded-2xl bg-brand-navy flex items-center justify-center text-brand-orange font-bold text-lg sm:text-xl">
              <i className="fa-solid fa-code"></i>
            </div>
            <div className="min-w-0">
              <span className="text-base sm:text-xl font-extrabold text-brand-navy tracking-tight block leading-tight truncate">Coding Club System</span>
              <span className="text-[8px] sm:text-[10px] font-semibold text-brand-orange tracking-widest uppercase whitespace-nowrap">By Coding Clubs Kenya</span>
            </div>
          </a>

          <div className="hidden md:flex items-center space-x-8 font-medium text-sm text-brand-navy">
            <a href="#" onClick={(e) => { e.preventDefault(); scrollToSection('overview'); }} className="hover:text-brand-orange transition-colors">Overview</a>
            <a href="#erp" onClick={() => scrollToSection('erp')} className="hover:text-brand-orange transition-colors">ERP Module</a>
            <a href="#lms" onClick={() => scrollToSection('lms')} className="hover:text-brand-orange transition-colors">LMS Module</a>
            <a href="#parent-app" onClick={() => scrollToSection('parent-app')} className="hover:text-brand-orange transition-colors">Parent Mobile App</a>
            <a href="#pricing" onClick={() => scrollToSection('pricing')} className="hover:text-brand-orange transition-colors">Pricing</a>
            <a href="#" onClick={(e) => { e.preventDefault(); setShowOnboarding(true); setSelectedRole(''); }} className="hover:text-brand-orange transition-colors">Get Started</a>
          </div>

          <div className="hidden md:flex items-center space-x-4">
            <Link to="/login" className="px-5 py-2.5 rounded-xl text-sm font-semibold text-brand-navy hover:bg-brand-grayLight transition-colors">Log In</Link>
            <button type="button" onClick={() => { setShowOnboarding(true); setSelectedRole(''); }} className="px-6 py-2.5 text-sm font-bold text-white bg-brand-orange hover:bg-brand-orangeHover clay-button transition-all">Request Demo</button>
          </div>

          <div className="flex items-center gap-1 md:hidden">
            <button type="button" onClick={() => { scrollToSection('overview'); setMobileMenuOpen(false); }} className="px-2 py-2 text-xs font-bold text-brand-navy hover:text-brand-orange focus:outline-none" aria-label="View overview">Overview</button>
            <button id="menu-btn" type="button" onClick={() => setMobileMenuOpen(!mobileMenuOpen)} className="text-brand-navy focus:outline-none p-2" aria-label="Open navigation menu">
              <i className="fa-solid fa-bars text-2xl"></i>
            </button>
          </div>
        </div>

        <div className={`${mobileMenuOpen ? 'flex' : 'hidden'} md:hidden bg-white border-t border-gray-100 px-4 pt-4 pb-6 space-y-4`}>
          <a href="#" onClick={(e) => { e.preventDefault(); scrollToSection('overview'); setMobileMenuOpen(false); }} className="block text-brand-navy font-semibold py-2 hover:text-brand-orange">Overview</a>
          <a href="#erp" onClick={() => { scrollToSection('erp'); setMobileMenuOpen(false); }} className="block text-brand-navy font-semibold py-2 hover:text-brand-orange">ERP Module</a>
          <a href="#lms" onClick={() => { scrollToSection('lms'); setMobileMenuOpen(false); }} className="block text-brand-navy font-semibold py-2 hover:text-brand-orange">LMS Module</a>
          <a href="#parent-app" onClick={() => { scrollToSection('parent-app'); setMobileMenuOpen(false); }} className="block text-brand-navy font-semibold py-2 hover:text-brand-orange">Parent Mobile App</a>
          <a href="#pricing" onClick={() => { scrollToSection('pricing'); setMobileMenuOpen(false); }} className="block text-brand-navy font-semibold py-2 hover:text-brand-orange">Pricing</a>
          <a href="#" onClick={(e) => { e.preventDefault(); setShowOnboarding(true); setSelectedRole(''); setMobileMenuOpen(false); }} className="block text-brand-navy font-semibold py-2 hover:text-brand-orange">Get Started</a>
          <div className="pt-2 flex flex-col space-y-3">
            <Link to="/login" className="w-full text-center px-5 py-2.5 rounded-xl font-semibold text-brand-navy bg-brand-grayLight">Log In</Link>
            <button type="button" onClick={() => { setMobileMenuOpen(false); setShowOnboarding(true); setSelectedRole(''); }} className="w-full text-center px-6 py-2.5 font-bold text-white bg-brand-orange clay-button">Request Demo</button>
          </div>
        </div>
      </nav>

      {/* Floating Shop Action */}
      <a href="#pricing" onClick={(e) => { e.preventDefault(); scrollToSection('pricing'); }} title="View pricing" aria-label="View pricing" className="fixed bottom-5 right-5 z-40 inline-flex items-center gap-2 px-4 py-3 bg-brand-orange text-white rounded-full font-bold text-sm shadow-lg hover:bg-brand-orangeHover hover:-translate-y-1 transition-all">
        <i className="fa-solid fa-cart-plus text-base"></i>
        <span className="hidden sm:inline">Shop For School Items</span>
      </a>

      {/* Progressive Onboarding Section */}
      {showOnboarding && (
        <section id="onboarding" className="py-12 sm:py-20 bg-brand-grayLight/60 px-4 sm:px-8">
          <div className="max-w-5xl mx-auto">
            <div className="text-center max-w-2xl mx-auto mb-10 space-y-3">
              <span className="px-4 py-1.5 rounded-full text-xs font-bold uppercase tracking-wider bg-orange-100 text-brand-orange">Find your best starting point</span>
              <h2 className="text-2xl sm:text-4xl font-extrabold text-brand-navy">How will you use Coding Club System?</h2>
              <p className="text-sm text-brand-charcoal/70">Choose your role and we will point you to the tools and next step that fit you best.</p>
            </div>

            <div className="clay-card bg-white p-4 sm:p-10">
              <div className="flex items-center gap-3 mb-8" aria-label="Onboarding progress">
                <div className="h-2 flex-1 rounded-full bg-brand-orange transition-all"></div>
                <div className={`h-2 flex-1 rounded-full transition-all ${selectedRole ? 'bg-brand-orange' : 'bg-gray-200'}`}></div>
              </div>

              {!selectedRole ? (
                <div id="onboarding-step-one">
                  <div className="flex items-center justify-between gap-4 mb-6">
                    <div>
                      <p className="text-xs font-bold uppercase tracking-wider text-brand-orange">Step 1 of 2</p>
                      <h3 className="text-xl sm:text-2xl font-extrabold text-brand-navy mt-1">I am a...</h3>
                    </div>
                    <span className="hidden sm:block text-xs font-semibold text-gray-400">Select one option</span>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4">
                    {Object.entries(roleConfigs).map(([role, config]) => (
                      <button
                        key={role}
                        type="button"
                        data-onboarding-role={role}
                        onClick={() => handleSelectRole(role)}
                        className={`onboarding-role clay-card p-5 text-left focus:outline-none focus:ring-2 focus:ring-brand-orange/30 ${selectedRole === role ? 'border-brand-orange ring-2 ring-brand-orange/30' : ''}`}
                      >
                        <span className={`w-12 h-12 rounded-2xl ${config.iconBg} flex items-center justify-center text-xl mb-4`}>
                          <i className={config.icon}></i>
                        </span>
                        <span className="block font-bold text-brand-navy">{config.label}</span>
                        <span className="block text-xs text-gray-500 mt-2 leading-relaxed">{config.desc}</span>
                      </button>
                    ))}
                  </div>
                </div>
              ) : (
                <div id="onboarding-step-two">
                  <div className="flex items-center justify-between gap-4 mb-6">
                    <div>
                      <p className="text-xs font-bold uppercase tracking-wider text-brand-orange">Step 2 of 2</p>
                      <h3 className="text-xl sm:text-2xl font-extrabold text-brand-navy mt-1">
                        {getOnboardingQuestion()}
                      </h3>
                    </div>
                    <button type="button" onClick={() => setSelectedRole('')} className="text-xs font-bold text-brand-navy hover:text-brand-orange">Change role</button>
                  </div>

                  <form onSubmit={handleCompleteOnboarding}>
                    <div id="onboarding-details" className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-6">
                      {selectedRole === 'admin' ? <AdminFormsViewer /> : renderOnboardingFields()}
                    </div>
                    {selectedRole !== 'admin' && (
                      <button type="submit" className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-6 py-3 bg-brand-orange hover:bg-brand-orangeHover text-white font-bold rounded-xl clay-button transition-all">
                        {getOnboardingCta()} <i className="fa-solid fa-arrow-right text-xs"></i>
                      </button>
                    )}
                  </form>
                </div>
              )}
            </div>
          </div>
        </section>
      )}

      {!showOnboarding && (
        <>
          {/* Hero Section */}
          <section id="overview" className="pt-12 pb-20 bg-gradient-to-b from-white via-brand-grayLight/40 to-white px-4 sm:px-8">
            <div className="max-w-7xl mx-auto">
              <div className="text-center max-w-3xl mx-auto space-y-6 mb-12">
                <div className="inline-flex items-center gap-2 px-4 py-2 clay-pill text-xs font-bold text-brand-navy">
                  <span className="w-2 h-2 rounded-full bg-brand-orange animate-ping"></span>
                  <span className="text-brand-orange font-extrabold">NEW release:</span> All-in-One School ERP + Coding LMS + Parent App
                </div>

                <h1 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold text-brand-navy leading-tight">
                  Empowering STEM Education with <span className="text-brand-orange">Seamless Tech</span> Management
                </h1>

                <p className="text-lg text-brand-charcoal/80 font-normal leading-relaxed">
                  Designed specifically for schools, academies, and coding clubs. Streamline administrative operations with our robust <strong>ERP</strong>, elevate learning with an interactive <strong>Coding LMS</strong>, and build trust with parents via a real-time <strong>Mobile App</strong>.
                </p>

                <div className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-2">
                  <button onClick={() => { setShowOnboarding(true); setSelectedRole(''); }} className="w-full sm:w-auto px-8 py-4 bg-brand-orange hover:bg-brand-orangeHover text-white font-bold rounded-2xl clay-button text-base shadow-lg transition-all flex items-center justify-center gap-2">
                    <span>Schedule a Live Demo</span>
                    <i className="fa-solid fa-arrow-right text-sm"></i>
                  </button>
                  <button onClick={() => { document.getElementById('preview')?.scrollIntoView({ behavior: 'smooth' }); }} className="w-full sm:w-auto px-8 py-4 bg-white text-brand-navy font-bold rounded-2xl clay-card text-base hover:bg-brand-grayLight transition-all flex items-center justify-center gap-2">
                    <i className="fa-solid fa-play text-brand-orange"></i>
                    <span>Explore System Modules</span>
                  </button>
                </div>
              </div>

              {/* Interactive Hero Workspace Preview */}
              <div id="preview" className="max-w-5xl mx-auto mt-8">
                <div className="flex flex-wrap justify-center gap-2 sm:gap-4 mb-6">
                  <button onClick={() => setActiveTab('erp')} className={`tab-btn px-6 py-3 rounded-2xl font-bold text-sm transition-all ${activeTab === 'erp' ? 'bg-brand-navy text-white shadow-md' : 'bg-white text-brand-navy hover:bg-brand-grayLight border border-gray-200'}`}>
                    <i className="fa-solid fa-chart-line mr-2"></i>ERP Dashboard
                  </button>
                  <button onClick={() => setActiveTab('lms')} className={`tab-btn px-6 py-3 rounded-2xl font-bold text-sm transition-all ${activeTab === 'lms' ? 'bg-brand-navy text-white shadow-md' : 'bg-white text-brand-navy hover:bg-brand-grayLight border border-gray-200'}`}>
                    <i className="fa-solid fa-laptop-code mr-2"></i>LMS Learning Space
                  </button>
                  <button onClick={() => setActiveTab('app')} className={`tab-btn px-6 py-3 rounded-2xl font-bold text-sm transition-all ${activeTab === 'app' ? 'bg-brand-navy text-white shadow-md' : 'bg-white text-brand-navy hover:bg-brand-grayLight border border-gray-200'}`}>
                    <i className="fa-solid fa-mobile-screen-button mr-2"></i>Parent Mobile App
                  </button>
                </div>

                <div className="clay-card p-3 sm:p-6 bg-white overflow-hidden min-h-[320px] sm:min-h-[420px] flex items-center justify-center">
                  {activeTab === 'erp' && (
                    <div className="w-full space-y-6">
                      <div className="flex items-center justify-between border-b pb-4">
                        <div className="flex items-center space-x-3">
                          <span className="p-2.5 rounded-xl bg-orange-100 text-brand-orange font-bold"><i className="fa-solid fa-calculator"></i></span>
                          <div>
                            <h3 className="font-bold text-brand-navy">ERP Administrative Suite</h3>
                            <p className="text-xs text-gray-500">Live operational overview & automated invoicing</p>
                          </div>
                        </div>
                        <span className="px-3 py-1 rounded-full text-xs font-bold bg-green-100 text-green-700">System Active</span>
                      </div>
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <div className="p-4 rounded-2xl bg-brand-grayLight border border-gray-100">
                          <span className="text-xs font-semibold text-gray-500">Term Revenue</span>
                          <p className="text-2xl font-extrabold text-brand-navy mt-1">$42,850</p>
                          <span className="text-[11px] text-green-600 font-semibold"><i className="fa-solid fa-arrow-trend-up"></i> +14% vs last term</span>
                        </div>
                        <div className="p-4 rounded-2xl bg-brand-grayLight border border-gray-100">
                          <span className="text-xs font-semibold text-gray-500">Active Students</span>
                          <p className="text-2xl font-extrabold text-brand-navy mt-1">680</p>
                          <span className="text-[11px] text-brand-orange font-semibold">12 Active Club Batches</span>
                        </div>
                        <div className="p-4 rounded-2xl bg-brand-grayLight border border-gray-100">
                          <span className="text-xs font-semibold text-gray-500">Club Resources allocated</span>
                          <p className="text-2xl font-extrabold text-brand-navy mt-1">142 Kits</p>
                          <span className="text-[11px] text-blue-600 font-semibold">98% In-use efficiency</span>
                        </div>
                      </div>
                      <div className="overflow-x-auto rounded-xl border border-gray-100">
                        <table className="w-full text-left text-xs">
                          <thead className="bg-brand-navy text-white">
                            <tr>
                              <th className="p-3">Student</th>
                              <th className="p-3">Batch/Club</th>
                              <th className="p-3">Fee Status</th>
                              <th className="p-3">Invoice</th>
                            </tr>
                          </thead>
                          <tbody className="divide-y divide-gray-100">
                            <tr>
                              <td className="p-3 font-semibold text-brand-navy">Amina Ndung'u</td>
                              <td className="p-3 text-gray-600">Python Young Pros (Level 2)</td>
                              <td className="p-3"><span className="px-2 py-0.5 rounded bg-green-100 text-green-700 font-bold">Paid</span></td>
                              <td className="p-3 text-brand-orange font-bold cursor-pointer">#INV-8839</td>
                            </tr>
                            <tr>
                              <td className="p-3 font-semibold text-brand-navy">Liam Omondi</td>
                              <td className="p-3 text-gray-600">Robotics & Arduino</td>
                              <td className="p-3"><span className="px-2 py-0.5 rounded bg-amber-100 text-amber-700 font-bold">Partial</span></td>
                              <td className="p-3 text-brand-orange font-bold cursor-pointer">#INV-8840</td>
                            </tr>
                          </tbody>
                        </table>
                      </div>
                    </div>
                  )}
                  {activeTab === 'lms' && (
                    <div className="w-full space-y-6">
                      <div className="flex items-center justify-between border-b pb-4">
                        <div className="flex items-center space-x-3">
                          <span className="p-2.5 rounded-xl bg-blue-100 text-blue-600 font-bold"><i className="fa-solid fa-code"></i></span>
                          <div>
                            <h3 className="font-bold text-brand-navy">Interactive Coding LMS Playground</h3>
                            <p className="text-xs text-gray-500">Automated grading pipeline & project sandbox</p>
                          </div>
                        </div>
                        <span className="px-3 py-1 rounded-full text-xs font-bold bg-brand-orange text-white">Python 3.10 Engine</span>
                      </div>
                      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                        <div className="bg-gray-900 text-green-400 p-4 rounded-xl font-mono text-xs space-y-2">
                          <div className="text-gray-500"># Lesson 4: Loop Challenge</div>
                          <div><span className="text-purple-400">def</span> <span className="text-blue-300">calculate_score</span>(projects):</div>
                          <div className="pl-4"><span className="text-purple-400">return</span> sum(projects) * <span className="text-amber-300">1.25</span></div>
                          <div className="mt-4 text-gray-400"># Automated tests output:</div>
                          <div className="text-green-300">✔ Test Case 1: Passed (0.02s)</div>
                          <div className="text-green-300">✔ Test Case 2: Passed (0.01s)</div>
                        </div>
                        <div className="space-y-3">
                          <h4 className="font-bold text-sm text-brand-navy">Curriculum Progress</h4>
                          <div className="space-y-2">
                            <div>
                              <div className="flex justify-between text-xs font-semibold mb-1">
                                <span>Variables & Data Types</span>
                                <span className="text-brand-orange">100%</span>
                              </div>
                              <div className="w-full bg-gray-200 h-2 rounded-full overflow-hidden">
                                <div className="bg-brand-orange h-2 w-full"></div>
                              </div>
                            </div>
                            <div>
                              <div className="flex justify-between text-xs font-semibold mb-1">
                                <span>Functions & Logic Pipelines</span>
                                <span className="text-brand-navy">75%</span>
                              </div>
                              <div className="w-full bg-gray-200 h-2 rounded-full overflow-hidden">
                                <div className="bg-brand-navy h-2 w-3/4"></div>
                              </div>
                            </div>
                          </div>
                          <div className="p-3 bg-brand-grayLight rounded-xl border border-gray-200 text-xs">
                            <span className="font-bold text-brand-navy">Mentor Feedback:</span>
                            <p className="text-gray-600 mt-1">"Excellent clean code syntax on your recent game submission, Jabali!"</p>
                          </div>
                        </div>
                      </div>
                    </div>
                  )}
                  {activeTab === 'app' && (
                    <div className="w-full flex justify-center py-4">
                      <div className="phone-mockup w-full max-w-[280px] p-4 space-y-4">
                        <div className="flex items-center justify-between border-b pb-2">
                          <div className="flex items-center space-x-2">
                            <div className="w-8 h-8 rounded-full bg-brand-orange text-white font-bold flex items-center justify-center text-xs">CK</div>
                            <div>
                              <p className="text-xs font-extrabold text-brand-navy">Parent Connect</p>
                              <p className="text-[10px] text-gray-500">Student: Stacy K.</p>
                            </div>
                          </div>
                          <i className="fa-solid fa-bell text-brand-orange text-sm"></i>
                        </div>

                        <div className="bg-brand-grayLight p-3 rounded-xl space-y-2">
                          <div className="flex justify-between items-center text-xs">
                            <span className="font-bold text-brand-navy">Today's Attendance</span>
                            <span className="px-2 py-0.5 rounded bg-green-100 text-green-700 font-bold text-[10px]">Present</span>
                          </div>
                          <p className="text-[11px] text-gray-500">Coding Club Lab - 04:15 PM</p>
                        </div>
                        <div className="bg-brand-navy text-white p-3 rounded-xl space-y-1">
                          <p className="text-[10px] text-brand-orange uppercase font-bold tracking-wider">Latest Project Showcase</p>
                          <p className="text-xs font-bold">Space Invaders PyGame</p>
                          <p className="text-[10px] text-gray-300">Grade: 98% • Outstanding Project</p>
                        </div>
                        <div className="flex justify-between items-center p-2 rounded-lg border border-gray-100 text-xs">
                          <span className="font-semibold text-gray-600">Term Fee Balance</span>
                          <span className="font-bold text-green-600">Clear</span>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </section>

          {/* Pillars / Modules Highlight */}
          <section className="py-16 bg-white border-y border-gray-100 px-4 sm:px-8">
            <div className="max-w-7xl mx-auto">
              <div className="text-center max-w-2xl mx-auto mb-16">
                <h2 className="text-3xl font-extrabold text-brand-navy">Complete Ecosystem for Tech Education</h2>
                <p className="text-brand-charcoal/70 mt-3 text-sm">Everything you need to run, teach, and keep parents engaged seamlessly under one umbrella powered by Coding Clubs Kenya.</p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                <div className="clay-card p-8 flex flex-col justify-between">
                  <div>
                    <div className="w-14 h-14 rounded-2xl bg-orange-100 text-brand-orange flex items-center justify-center text-2xl font-bold mb-6">
                      <i className="fa-solid fa-boxes-stacked"></i>
                    </div>
                    <h3 className="text-xl font-bold text-brand-navy mb-3">Robust School ERP</h3>
                    <p className="text-sm text-brand-charcoal/80 leading-relaxed mb-6">
                      Simplify fee collection, generate digital invoices, control club inventory, and manage student attendance effortlessly.
                    </p>
                  </div>
                  <a href="#erp" onClick={() => scrollToSection('erp')} className="inline-flex items-center font-bold text-sm text-brand-orange hover:text-brand-orangeHover">
                    Explore ERP Features <i className="fa-solid fa-chevron-right ml-2 text-xs"></i>
                  </a>
                </div>

                <div className="clay-card p-8 flex flex-col justify-between">
                  <div>
                    <div className="w-14 h-14 rounded-2xl bg-brand-navy text-white flex items-center justify-center text-2xl font-bold mb-6">
                      <i className="fa-solid fa-graduation-cap"></i>
                    </div>
                    <h3 className="text-xl font-bold text-brand-navy mb-3">Interactive Coding LMS</h3>
                    <p className="text-sm text-brand-charcoal/80 leading-relaxed mb-6">
                      Empower students with structured curriculum, automated code tests, project upload portals, and interactive quizzes.
                    </p>
                  </div>
                  <a href="#lms" onClick={() => scrollToSection('lms')} className="inline-flex items-center font-bold text-sm text-brand-navy hover:text-brand-orange">
                    Explore LMS Features <i className="fa-solid fa-chevron-right ml-2 text-xs"></i>
                  </a>
                </div>

                <div className="clay-card p-8 flex flex-col justify-between">
                  <div>
                    <div className="w-14 h-14 rounded-2xl bg-green-100 text-green-700 flex items-center justify-center text-2xl font-bold mb-6">
                      <i className="fa-solid fa-mobile-screen"></i>
                    </div>
                    <h3 className="text-xl font-bold text-brand-navy mb-3">Parent Mobile App</h3>
                    <p className="text-sm text-brand-charcoal/80 leading-relaxed mb-6">
                      Provide total transparency to parents through real-time notifications, project showcases, attendance, and mentor chats.
                    </p>
                  </div>
                  <a href="#parent-app" onClick={() => scrollToSection('parent-app')} className="inline-flex items-center font-bold text-sm text-green-700 hover:text-green-800">
                    Explore Mobile App <i className="fa-solid fa-chevron-right ml-2 text-xs"></i>
                  </a>
                </div>
              </div>
            </div>
          </section>

          {/* ERP Module Detailed */}
          <section id="erp" className="py-20 bg-brand-grayLight/50 px-4 sm:px-8">
            <div className="max-w-7xl mx-auto">
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
                <div className="space-y-6">
                  <span className="px-4 py-1.5 rounded-full text-xs font-bold uppercase tracking-wider bg-orange-100 text-brand-orange">Module 01 • Operations</span>
                  <h2 className="text-3xl sm:text-4xl font-extrabold text-brand-navy">Automate Administrative & Financial Overhead</h2>
                  <p className="text-brand-charcoal/80 leading-relaxed">
                    Say goodbye to manual spreadsheets. The Coding Club ERP gives administrators total clarity on club resources, finances, and student attendance records across multiple branches or school partner sites.
                  </p>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
                    <div className="clay-card p-4 bg-white">
                      <i className="fa-solid fa-file-invoice-dollar text-brand-orange text-xl mb-2"></i>
                      <h4 className="font-bold text-brand-navy text-sm">Automated Invoicing</h4>
                      <p className="text-xs text-gray-500 mt-1">Generate automated term bills and track payments in real time.</p>
                    </div>
                    <div className="clay-card p-4 bg-white">
                      <i className="fa-solid fa-cubes text-brand-orange text-xl mb-2"></i>
                      <h4 className="font-bold text-brand-navy text-sm">Inventory Tracking</h4>
                      <p className="text-xs text-gray-500 mt-1">Monitor robotics kits, laptops, micro-controllers, and club gear.</p>
                    </div>
                    <div className="clay-card p-4 bg-white">
                      <i className="fa-solid fa-user-check text-brand-orange text-xl mb-2"></i>
                      <h4 className="font-bold text-brand-navy text-sm">Smart Attendance</h4>
                      <p className="text-xs text-gray-500 mt-1">Digital check-ins synced directly with parent mobile alerts.</p>
                    </div>
                    <div className="clay-card p-4 bg-white">
                      <i className="fa-solid fa-chart-pie text-brand-orange text-xl mb-2"></i>
                      <h4 className="font-bold text-brand-navy text-sm">Club Resource Allocation</h4>
                      <p className="text-xs text-gray-500 mt-1">Allocate instructors, rooms, and time-slots seamlessly.</p>
                    </div>
                  </div>
                </div>

                <div className="relative">
                  <div className="clay-card p-3 bg-white">
                    <img src="https://images.unsplash.com/photo-1551836022-d5d88e9218df?auto=format&fit=crop&w=1000&q=80" alt="ERP Dashboard Administration" className="rounded-2xl w-full h-[280px] sm:h-[400px] object-cover" />
                  </div>
                  <div className="absolute -bottom-6 -left-6 clay-card p-4 bg-brand-navy text-white hidden sm:block">
                    <div className="flex items-center space-x-3">
                      <i className="fa-solid fa-bolt text-brand-orange text-2xl"></i>
                      <div>
                        <p className="text-xs text-gray-300">Admin Efficiency</p>
                        <p className="text-lg font-bold">70% Time Saved</p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </section>

          {/* LMS Module Detailed */}
          <section id="lms" className="py-20 bg-white px-4 sm:px-8">
            <div className="max-w-7xl mx-auto">
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
                <div className="order-2 lg:order-1 relative">
                  <div className="clay-card p-3 bg-white">
                    <img src="https://images.unsplash.com/photo-1517694712202-14dd9538aa97?auto=format&fit=crop&w=1000&q=80" alt="Student coding on computer" className="rounded-2xl w-full h-[280px] sm:h-[400px] object-cover" />
                  </div>
                  <div className="absolute -top-6 -right-6 clay-card p-4 bg-brand-orange text-white hidden sm:block">
                    <div className="flex items-center space-x-3">
                      <i className="fa-solid fa-code-commit text-2xl"></i>
                      <div>
                        <p className="text-xs text-white/80">Code Submissions</p>
                        <p className="text-lg font-bold">Auto-Graded Engine</p>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="order-1 lg:order-2 space-y-6">
                  <span className="px-4 py-1.5 rounded-full text-xs font-bold uppercase tracking-wider bg-blue-100 text-blue-700">Module 02 • Learning & Curriculum</span>
                  <h2 className="text-3xl sm:text-4xl font-extrabold text-brand-navy">Interactive Coding Curriculum & Auto-Grading Pipelines</h2>
                  <p className="text-brand-charcoal/80 leading-relaxed">
                    Transform how kids learn to code. Our Learning Management System combines gamified video tutorials, interactive coding sandboxes, quizzes, and automated test-cases so mentors can focus on coaching rather than manual grading.
                  </p>

                  <ul className="space-y-3 font-medium text-sm text-brand-navy">
                    <li className="flex items-center gap-3">
                      <span className="w-6 h-6 rounded-full bg-green-100 text-green-600 flex items-center justify-center text-xs"><i className="fa-solid fa-check"></i></span>
                      <span>Interactive code submission pipelines with instant feedback</span>
                    </li>
                    <li className="flex items-center gap-3">
                      <span className="w-6 h-6 rounded-full bg-green-100 text-green-600 flex items-center justify-center text-xs"><i className="fa-solid fa-check"></i></span>
                      <span>Pre-loaded STEM curriculum (Scratch, Python, Web Dev, Robotics)</span>
                    </li>
                    <li className="flex items-center gap-3">
                      <span className="w-6 h-6 rounded-full bg-green-100 text-green-600 flex items-center justify-center text-xs"><i className="fa-solid fa-check"></i></span>
                      <span>Project showcases and portfolio generation for every student</span>
                    </li>
                    <li className="flex items-center gap-3">
                      <span className="w-6 h-6 rounded-full bg-green-100 text-green-600 flex items-center justify-center text-xs"><i className="fa-solid fa-check"></i></span>
                      <span>Quizzes, badges, and certificates upon module completion</span>
                    </li>
                  </ul>
                </div>
              </div>
            </div>
          </section>

          {/* Parent Mobile App Section */}
          <section id="parent-app" className="py-20 bg-brand-navy text-white px-4 sm:px-8 relative overflow-hidden">
            <div className="max-w-7xl mx-auto">
              <div className="text-center max-w-3xl mx-auto mb-16 space-y-4">
                <span className="px-4 py-1.5 rounded-full text-xs font-bold uppercase tracking-wider bg-brand-orange/20 text-brand-orange border border-brand-orange/30">Module 03 • Parent Engagement</span>
                <h2 className="text-3xl sm:text-4xl font-extrabold">Dedicated Mobile App for Parents</h2>
                <p className="text-gray-300 text-sm leading-relaxed">
                  Keep parents connected with their child's tech journey. Build long-term trust with real-time updates, direct mentor chats, and student project visibility right on their smartphones.
                </p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-8 items-center">
                <div className="space-y-6">
                  <div className="clay-card-dark p-6 space-y-2">
                    <div className="text-brand-orange text-xl font-bold"><i className="fa-solid fa-bell"></i></div>
                    <h4 className="font-bold text-white text-base">Real-Time Notifications</h4>
                    <p className="text-xs text-gray-300">Instant push alerts for class schedules, attendance checks, and club announcements.</p>
                  </div>
                  <div className="clay-card-dark p-6 space-y-2">
                    <div className="text-brand-orange text-xl font-bold"><i className="fa-solid fa-chart-line"></i></div>
                    <h4 className="font-bold text-white text-base">Progress & Skill Tracking</h4>
                    <p className="text-xs text-gray-300">Visual progress bars showing concepts mastered, quiz scores, and badges earned.</p>
                  </div>
                </div>

                <div className="flex justify-center">
                  <div className="phone-mockup w-full max-w-[300px] p-5 bg-white text-brand-navy space-y-5">
                    <div className="flex items-center justify-between border-b pb-3">
                      <div>
                        <p className="text-xs font-extrabold">Coding Clubs Kenya</p>
                        <p className="text-[10px] text-gray-500">Parent Dashboard</p>
                      </div>
                      <span className="w-2 h-2 rounded-full bg-green-500"></span>
                    </div>

                    <div className="flex items-center space-x-3 bg-brand-grayLight p-3 rounded-2xl">
                      <div className="w-10 h-10 rounded-full bg-brand-navy text-white font-bold flex items-center justify-center text-sm">EO</div>
                      <div>
                        <h5 className="text-xs font-bold text-brand-navy">Emmanuel Otieno</h5>
                        <p className="text-[10px] text-gray-500">Level 3 Python Master</p>
                      </div>
                    </div>

                    <div className="space-y-2">
                      <div className="flex justify-between text-[11px] font-bold">
                        <span>Term Coding Score</span>
                        <span className="text-brand-orange">94%</span>
                      </div>
                      <div className="w-full bg-gray-200 h-2 rounded-full overflow-hidden">
                        <div className="bg-brand-orange h-2 w-[94%]"></div>
                      </div>
                    </div>

                    <div className="p-3 bg-blue-50 rounded-2xl border border-blue-100 space-y-2">
                      <div className="flex items-center space-x-2">
                        <i className="fa-solid fa-comments text-brand-navy text-xs"></i>
                        <span className="text-[11px] font-bold text-brand-navy">Mentor Alex</span>
                      </div>
                      <p className="text-[10px] text-gray-600">"Emmanuel built a fantastic game today! Check his project tab."</p>
                    </div>

                    <button className="w-full py-2.5 bg-brand-navy text-white font-bold text-xs rounded-xl shadow-sm">
                      Pay Term Fee ($120)
                    </button>
                  </div>
                </div>

                <div className="space-y-6">
                  <div className="clay-card-dark p-6 space-y-2">
                    <div className="text-brand-orange text-xl font-bold"><i className="fa-solid fa-gamepad"></i></div>
                    <h4 className="font-bold text-white text-base">Project Portfolio Showcase</h4>
                    <p className="text-xs text-gray-300">Parents can play games and view apps created by their children directly in the app.</p>
                  </div>
                  <div className="clay-card-dark p-6 space-y-2">
                    <div className="text-brand-orange text-xl font-bold"><i className="fa-solid fa-credit-card"></i></div>
                    <h4 className="font-bold text-white text-base">Direct Fee Clearance</h4>
                    <p className="text-xs text-gray-300">Seamless mobile money or card payments with auto-generated receipt downloads.</p>
                  </div>
                </div>
              </div>
            </div>
          </section>

          {/* Pricing Plans */}
          <section id="pricing" className="py-20 bg-white px-4 sm:px-8">
            <div className="max-w-7xl mx-auto">
              <div className="text-center max-w-2xl mx-auto mb-16">
                <h2 className="text-3xl font-extrabold text-brand-navy">Flexible Plans for Every Scale</h2>
                <p className="text-brand-charcoal/70 text-sm mt-2">Whether you are an independent coding club or a multi-campus academy.</p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                {pricingPlans.map((plan) => (
                  <div key={plan.name} className={`clay-card p-8 flex flex-col justify-between ${plan.highlighted ? 'bg-brand-navy text-white relative' : ''}`}>
                    {plan.highlighted && (
                      <div className="absolute -top-3 left-1/2 transform -translate-x-1/2 px-4 py-1 bg-brand-orange text-white text-[10px] font-extrabold uppercase rounded-full tracking-wider">Most Popular</div>
                    )}
                    <div className="space-y-4">
                      <span className={`text-xs font-bold uppercase tracking-wider ${plan.highlighted ? 'text-brand-orange' : 'text-gray-400'}`}>{plan.label}</span>
                      <h3 className={`text-2xl font-bold ${plan.highlighted ? 'text-white' : 'text-brand-navy'}`}>{plan.name}</h3>
                      <p className={`text-2xl font-extrabold ${plan.highlighted ? 'text-white' : 'text-brand-navy'}`}>Request a quote</p>
                      <p className={`text-xs ${plan.highlighted ? 'text-gray-300' : 'text-gray-500'}`}>{plan.desc}</p>
                      <hr className={plan.highlighted ? 'border-gray-700' : 'border-gray-100'} />
                      <ul className={`space-y-2 text-xs font-medium ${plan.highlighted ? 'text-gray-200' : 'text-gray-600'}`}>
                        {plan.features.map((feature) => (
                          <li key={feature}><i className={`fa-solid fa-check mr-2 ${plan.highlighted ? 'text-brand-orange' : 'text-green-500'}`}></i>{feature}</li>
                        ))}
                      </ul>
                    </div>
                    <a href={`https://wa.me/254716815025?text=${plan.waMessage}`} target="_blank" rel="noopener noreferrer" className={`mt-8 w-full text-center py-3 rounded-xl font-bold text-sm ${plan.highlighted ? 'bg-brand-orange hover:bg-brand-orangeHover clay-button' : 'border border-brand-navy hover:bg-brand-grayLight'}`}>
                      Request a quote
                    </a>
                  </div>
                ))}
              </div>
            </div>
          </section>

          {/* Demo Request Call to Action */}
          <section id="demo" className="py-20 bg-brand-grayLight/60 px-4 sm:px-8">
            <div className="max-w-4xl mx-auto clay-card p-8 sm:p-12 bg-white">
              <div className="text-center space-y-3 mb-8">
                <h2 className="text-3xl font-extrabold text-brand-navy">Experience the Coding Club System</h2>
                <p className="text-sm text-brand-charcoal/70">
                  Book a personalized walkthrough with the <strong>Coding Clubs Kenya</strong> team to see how ERP, LMS, and the Parent Mobile App can elevate your center.
                </p>
              </div>

              <form onSubmit={handleDemoSubmit} className="space-y-4 max-w-xl mx-auto">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-bold text-brand-navy mb-1">Your Name</label>
                    <input type="text" required placeholder="e.g. Jane Doe" className="w-full px-4 py-3 rounded-xl border border-gray-200 text-sm focus:outline-none focus:border-brand-orange" />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-brand-navy mb-1">Institution/School Name</label>
                    <input type="text" required placeholder="e.g. Nairobi STEM Academy" className="w-full px-4 py-3 rounded-xl border border-gray-200 text-sm focus:outline-none focus:border-brand-orange" />
                  </div>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-bold text-brand-navy mb-1">Email Address</label>
                    <input type="email" required placeholder="e.g. jane@school.ac.ke" className="w-full px-4 py-3 rounded-xl border border-gray-200 text-sm focus:outline-none focus:border-brand-orange" />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-brand-navy mb-1">Estimated Students</label>
                    <select className="w-full px-4 py-3 rounded-xl border border-gray-200 text-sm focus:outline-none focus:border-brand-orange">
                      <option>1 - 50 Students</option>
                      <option>51 - 200 Students</option>
                      <option>200+ Students</option>
                    </select>
                  </div>
                </div>
                <button type="submit" className="w-full py-4 bg-brand-orange text-white font-bold text-sm rounded-xl clay-button hover:bg-brand-orangeHover transition-all">
                  Submit Request for Demonstration
                </button>
              </form>
              {demoSuccess && (
                <div id="demo-success" className="mt-4 p-4 bg-green-100 text-green-700 font-bold text-center text-xs rounded-xl">
                  Thank you! The Coding Clubs Kenya team will reach out shortly to schedule your demo.
                </div>
              )}
            </div>
          </section>

          {/* Footer */}
          <footer className="bg-brand-navy text-white pt-16 pb-12 px-4 sm:px-8">
            <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-4 gap-8 pb-12 border-b border-gray-800">
              <div className="space-y-4">
                <div className="flex items-center space-x-2">
                  <div className="w-8 h-8 rounded-xl bg-brand-orange text-white font-bold flex items-center justify-center text-sm"><i className="fa-solid fa-code"></i></div>
                  <span className="font-extrabold text-lg">Coding Club System</span>
                </div>
                <p className="text-xs text-gray-400 leading-relaxed">
                  A flagship software product developed by <strong>Coding Clubs Kenya</strong> to revolutionize STEM club administration and student learning experience.
                </p>
              </div>

              <div>
                <h4 className="font-bold text-sm text-brand-orange mb-4">System Modules</h4>
                <ul className="space-y-2 text-xs text-gray-300">
                  <li><a href="#erp" className="hover:text-white">ERP Fee Management</a></li>
                  <li><a href="#erp" className="hover:text-white">Inventory & Allocation</a></li>
                  <li><a href="#lms" className="hover:text-white">Coding Sandbox LMS</a></li>
                  <li><a href="#lms" className="hover:text-white">Automated Grading Engine</a></li>
                  <li><a href="#parent-app" className="hover:text-white">Parent Mobile App</a></li>
                </ul>
              </div>

              <div>
                <h4 className="font-bold text-sm text-brand-orange mb-4">Quick Links</h4>
                <ul className="space-y-2 text-xs text-gray-300">
                  <li><a href="#overview" className="hover:text-white">System Overview</a></li>
                  <li><a href="#pricing" className="hover:text-white">Pricing Options</a></li>
                  <li><a href="#demo" className="hover:text-white">Book Demonstration</a></li>
                  <li><a href="#" className="hover:text-white">Coding Clubs Kenya Portal</a></li>
                </ul>
              </div>

              <div>
                <h4 className="font-bold text-sm text-brand-orange mb-4">Contact & Support</h4>
                <ul className="space-y-2 text-xs text-gray-300">
                  <li><i className="fa-solid fa-envelope mr-2 text-brand-orange"></i>codingclubskenya@gmail.com</li>
                  <li><i className="fa-solid fa-phone mr-2 text-brand-orange"></i>+254 716 815 025 / 0798 734 442</li>
                  <li><i className="fa-solid fa-location-dot mr-2 text-brand-orange"></i>Nairobi, Kenya</li>
                </ul>
              </div>
            </div>

            <div className="max-w-7xl mx-auto pt-6 flex flex-col sm:flex-row justify-between items-center text-xs text-gray-500">
              <p>&copy; 2026 Coding Club System. A product by Coding Clubs Kenya. All rights reserved.</p>
              <div className="flex space-x-4 mt-4 sm:mt-0">
                <a href="#" className="hover:text-gray-300">Privacy Policy</a>
                <a href="#" className="hover:text-gray-300">Terms of Service</a>
              </div>
            </div>
          </footer>
        </>
      )}
    </div>
  );
};

export default PublicHome;
