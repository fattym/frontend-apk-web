import { useState, useEffect } from 'react';

const roleContent = {
  school: {
    question: 'Let us plan for your school or club',
    fields: [
      ['Contact person', 'e.g. Jane Doe', 'text', 'contact-name'],
      ['Work email', 'e.g. jane@school.ac.ke', 'email', 'contact-email'],
      ['Phone number', 'e.g. +254 700 000 000', 'tel', 'contact-phone'],
      ['Organisation name', 'e.g. Nairobi STEM Academy', 'text', 'organisation-name'],
      ['Location or town', 'e.g. Nairobi', 'text', 'location'],
      ['Number of learners', 'Select learner count', 'select', 'learner-count'],
    ],
    cta: 'Explore school tools',
  },
  parent: {
    question: 'Let us connect you to your learner',
    fields: [
      ['Your full name', 'e.g. Jane Doe', 'text', 'contact-name'],
      ['Email address', 'e.g. jane@example.com', 'email', 'contact-email'],
      ['Phone number', 'e.g. +254 700 000 000', 'tel', 'contact-phone'],
      ['Learner name', 'e.g. Amina Ndungu', 'text', 'learner-name'],
      ['School or club', 'e.g. Nairobi Coding Club', 'text', 'organisation-name'],
      ['Preferred contact method', 'Choose a contact method', 'contact', 'preferred-contact'],
    ],
    cta: 'See the parent experience',
  },
  student: {
    question: 'Let us shape your learning path',
    fields: [
      ['Student name', 'e.g. Jabali Otieno', 'text', 'contact-name'],
      ['Email address', 'e.g. student@example.com', 'email', 'contact-email'],
      ['Parent or guardian phone', 'e.g. +254 700 000 000', 'tel', 'contact-phone'],
      ['School or club', 'e.g. Nairobi Coding Club', 'text', 'organisation-name'],
      ['Location or town', 'e.g. Nairobi', 'text', 'location'],
      ['I want to learn', 'Choose a focus', 'select', 'learning-focus'],
    ],
    cta: 'Start learning',
  },
};

const selectOptionsMap = {
  'learner-count': ['Select learner count', '1 - 50 learners', '51 - 200 learners', '200+ learners'],
  'learning-focus': ['Choose a focus', 'Web development', 'Python', 'Robotics'],
  'preferred-contact': ['Choose a contact method', 'Phone call', 'WhatsApp', 'Email'],
};

const roleIcons = { school: 'fa-school', parent: 'fa-user-group', student: 'fa-laptop-code' };
const roleBadge = {
  school: 'bg-orange-100 text-brand-orange',
  parent: 'bg-blue-100 text-blue-700',
  student: 'bg-green-100 text-green-700',
};
const roleLabel = { school: 'A school or club', parent: 'A parent or guardian', student: 'A student' };
const roleDesc = {
  school: 'I manage a learning program, team, or coding club.',
  parent: 'I want to support and follow a learner\'s progress.',
  student: 'I want to learn, build projects, and grow my coding skills.',
};

const Navbar = ({ mobileMenuOpen, setMobileMenuOpen, onNavigate }) => (
  <nav className="sticky top-0 z-50 bg-white/90 backdrop-blur-md border-b border-gray-100 py-4 px-4 sm:px-8">
    <div className="max-w-7xl mx-auto flex items-center justify-between">
      <a href="#" className="flex min-w-0 items-center space-x-2 sm:space-x-3 group">
        <div className="w-9 h-9 sm:w-10 sm:h-10 shrink-0 rounded-2xl bg-brand-navy flex items-center justify-center text-brand-orange font-bold text-lg sm:text-xl shadow-md group-hover:scale-105 transition-transform">
          <i className="fa-solid font-mono fa-code"></i>
        </div>
        <div className="min-w-0">
          <span className="text-base sm:text-xl font-extrabold text-brand-navy tracking-tight block leading-tight truncate">
            Coding Club System
          </span>
          <span className="text-[8px] sm:text-[10px] font-semibold text-brand-orange tracking-widest uppercase whitespace-nowrap">
            By Coding Clubs Kenya
          </span>
        </div>
      </a>

      <div className="hidden md:flex items-center space-x-8 font-medium text-sm text-brand-navy">
        <a href="#overview" onClick={(e) => onNavigate(e, 'overview')} className="hover:text-brand-orange transition-colors">
          Overview
        </a>
        <a href="#erp" className="hover:text-brand-orange transition-colors">
          ERP Module
        </a>
        <a href="#lms" className="hover:text-brand-orange transition-colors">
          LMS Module
        </a>
        <a href="#parent-app" className="hover:text-brand-orange transition-colors">
          Parent Mobile App
        </a>
        <a href="#pricing" className="hover:text-brand-orange transition-colors">
          Pricing
        </a>
        <a href="#onboarding" className="hover:text-brand-orange transition-colors">
          Get Started
        </a>
      </div>

      <div className="hidden md:flex items-center space-x-4">
        <a
          href="#demo"
          className="px-5 py-2.5 rounded-xl text-sm font-semibold text-brand-navy hover:bg-brand-grayLight transition-colors"
        >
          Log In
        </a>
        <a
          href="#demo"
          className="px-6 py-2.5 text-sm font-bold text-white bg-brand-orange hover:bg-brand-orangeHover clay-button transition-all"
        >
          Request Demo
        </a>
      </div>

      <div className="flex items-center gap-1 md:hidden">
        <button
          type="button"
          onClick={(e) => onNavigate(e, 'overview')}
          className="px-2 py-2 text-xs font-bold text-brand-navy hover:text-brand-orange focus:outline-none"
          aria-label="View overview"
        >
          Overview
        </button>
        <button
          type="button"
          onClick={() => setMobileMenuOpen((v) => !v)}
          className="text-brand-navy focus:outline-none p-2"
          aria-label="Open navigation menu"
        >
          <i className="fa-solid fa-bars text-2xl"></i>
        </button>
      </div>
    </div>

    <div className={`md:hidden bg-white border-b border-gray-100 px-4 pt-4 pb-6 space-y-4 ${mobileMenuOpen ? '' : 'hidden'}`}>
      <a href="#overview" onClick={(e) => onNavigate(e, 'overview')} className="block text-brand-navy font-semibold py-2 hover:text-brand-orange">
        Overview
      </a>
      <a href="#erp" className="block text-brand-navy font-semibold py-2 hover:text-brand-orange">
        ERP Module
      </a>
      <a href="#lms" className="block text-brand-navy font-semibold py-2 hover:text-brand-orange">
        LMS Module
      </a>
      <a href="#parent-app" className="block text-brand-navy font-semibold py-2 hover:text-brand-orange">
        Parent Mobile App
      </a>
      <a href="#pricing" className="block text-brand-navy font-semibold py-2 hover:text-brand-orange">
        Pricing
      </a>
      <a href="#onboarding" className="block text-brand-navy font-semibold py-2 hover:text-brand-orange">
        Get Started
      </a>
      <div className="pt-2 flex flex-col space-y-3">
        <a href="#demo" className="w-full text-center px-5 py-2.5 rounded-xl font-semibold text-brand-navy bg-brand-grayLight">
          Log In
        </a>
        <a href="#demo" className="w-full text-center px-6 py-2.5 font-bold text-white bg-brand-orange clay-button">
          Request Demo
        </a>
      </div>
    </div>
  </nav>
);

const FloatingQuoteAction = ({ onNavigate }) => (
  <a
    href="#pricing"
    onClick={(e) => onNavigate(e, 'pricing')}
    title="Request a quote"
    aria-label="Request a quote"
    className="fixed bottom-5 right-5 z-40 inline-flex items-center gap-2 px-4 py-3 bg-brand-orange text-white rounded-full font-bold text-sm shadow-lg hover:bg-brand-orangeHover hover:-translate-y-1 transition-all"
  >
    <i className="fa-solid fa-cart-plus text-base"></i>
    <span className="hidden sm:inline">Shop For School Items</span>
  </a>
);

const OnboardingSection = ({ selectedRole, formValues, onSelectRole, onReset, onComplete, onFieldChange }) => {
  const selected = selectedRole ? roleContent[selectedRole] : null;

  return (
    <section id="onboarding" className="py-12 sm:py-20 bg-brand-grayLight/60 px-4 sm:px-8">
      <div className="max-w-5xl mx-auto">
        <div className="text-center max-w-2xl mx-auto mb-10 space-y-3">
          <span className="px-4 py-1.5 rounded-full text-xs font-bold uppercase tracking-wider bg-orange-100 text-brand-orange">
            Find your best starting point
          </span>
          <h2 className="text-2xl sm:text-4xl font-extrabold text-brand-navy">
            How will you use Coding Club System?
          </h2>
          <p className="text-sm text-brand-charcoal/70">
            Choose your role and we will point you to the tools and next step that fit you best.
          </p>
        </div>

        <div className="clay-card bg-white p-4 sm:p-10">
          <div className="flex items-center gap-3 mb-8" aria-label="Onboarding progress">
            <div className="h-2 flex-1 rounded-full bg-brand-orange transition-all"></div>
            <div
              className={`h-2 flex-1 rounded-full transition-all ${selectedRole ? 'bg-brand-orange' : 'bg-gray-200'}`}
            ></div>
          </div>

          <div id="onboarding-step-one" className={selectedRole ? 'hidden' : 'block'}>
            <div className="flex items-center justify-between gap-4 mb-6">
              <div>
                <p className="text-xs font-bold uppercase tracking-wider text-brand-orange">Step 1 of 2</p>
                <h3 className="text-xl sm:text-2xl font-extrabold text-brand-navy mt-1">I am a...</h3>
              </div>
              <span className="hidden sm:block text-xs font-semibold text-gray-400">Select one option</span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {(Object.keys(roleContent)).map((role) => {
                const isSelected = selectedRole === role;
                return (
                  <button
                    key={role}
                    type="button"
                    onClick={() => onSelectRole(role)}
                    className={`onboarding-role clay-card p-5 text-left hover:border-brand-orange focus:outline-none focus:ring-2 focus:ring-brand-orange/40 ${isSelected ? 'border-brand-orange ring-2 ring-brand-orange/30' : 'border-transparent'}`}
                  >
                    <span className={`w-12 h-12 rounded-2xl flex items-center justify-center text-xl mb-4 ${roleBadge[role]}`}>
                      <i className={`fa-solid ${roleIcons[role]}`}></i>
                    </span>
                    <span className="block font-bold text-brand-navy">{roleLabel[role]}</span>
                    <span className="block text-xs text-gray-500 mt-2 leading-relaxed">{roleDesc[role]}</span>
                  </button>
                );
              })}
            </div>
          </div>

          <div id="onboarding-step-two" className={selectedRole ? 'block' : 'hidden'}>
            <div className="flex items-center justify-between gap-4 mb-6">
              <div>
                <p className="text-xs font-bold uppercase tracking-wider text-brand-orange">Step 2 of 2</p>
                <h3 id="onboarding-question" className="text-xl sm:text-2xl font-extrabold text-brand-navy mt-1">
                  {selected ? selected.question : ''}
                </h3>
              </div>
              <button type="button" onClick={onReset} className="text-xs font-bold text-brand-navy hover:text-brand-orange">
                Change role
              </button>
            </div>

            <div id="onboarding-details" className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-6">
              {selected &&
                selected.fields.map(([label, placeholder, type, fieldName]) => {
                  const isSelect = type === 'select' || type === 'contact';
                  const inputClass =
                    'mt-2 w-full px-4 py-3 rounded-xl border border-gray-200 text-sm font-normal focus:outline-none focus:border-brand-orange';
                  return (
                    <label key={fieldName} className="block text-xs font-bold text-brand-navy">
                      {label}
                      {isSelect ? (
                        <select
                          name={fieldName}
                          required
                          value={formValues[fieldName] || ''}
                          onChange={onFieldChange}
                          className={inputClass}
                        >
                          {(selectOptionsMap[fieldName] || []).map((opt, i) => (
                            <option key={i} value={i === 0 ? '' : opt}>
                              {opt}
                            </option>
                          ))}
                        </select>
                      ) : (
                        <input
                          name={fieldName}
                          type={type}
                          required
                          value={formValues[fieldName] || ''}
                          onChange={onFieldChange}
                          placeholder={placeholder}
                          className={inputClass}
                          {...(type === 'tel'
                            ? {
                                inputMode: 'tel',
                                pattern: '[+0-9 ()-]{7,}',
                                title: 'Enter a valid phone number with at least 7 digits',
                              }
                            : {})}
                        />
                      )}
                    </label>
                  );
                })}
            </div>
            <button
              type="button"
              id="onboarding-cta"
              onClick={onComplete}
              className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-6 py-3 bg-brand-orange hover:bg-brand-orangeHover text-white font-bold rounded-xl clay-button transition-all"
            >
              {selected ? selected.cta : ''}
              <i className="fa-solid fa-arrow-right text-xs"></i>
            </button>
          </div>
        </div>
      </div>
    </section>
  );
};

const HeroSection = ({ activeTab, onSwitchTab }) => {
  const tabBtn = (tab) =>
    activeTab === tab
      ? 'tab-btn px-6 py-3 rounded-2xl font-bold text-sm transition-all bg-brand-navy text-white shadow-md'
      : 'tab-btn px-6 py-3 rounded-2xl font-bold text-sm transition-all bg-white text-brand-navy hover:bg-brand-grayLight border border-gray-200';

  return (
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
            Designed specifically for schools, academies, and coding clubs. Streamline administrative operations with our
            robust <strong>ERP</strong>, elevate learning with an interactive <strong>Coding LMS</strong>, and build trust
            with parents via a real-time <strong>Mobile App</strong>.
          </p>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-2">
            <a
              href="#demo"
              className="w-full sm:w-auto px-8 py-4 bg-brand-orange hover:bg-brand-orangeHover text-white font-bold rounded-2xl clay-button text-base shadow-lg transition-all flex items-center justify-center gap-2"
            >
              <span>Schedule a Live Demo</span>
              <i className="fa-solid fa-arrow-right text-sm"></i>
            </a>
            <a
              href="#preview"
              className="w-full sm:w-auto px-8 py-4 bg-white text-brand-navy font-bold rounded-2xl clay-card text-base hover:bg-brand-grayLight transition-all flex items-center justify-center gap-2"
            >
              <i className="fa-solid fa-play text-brand-orange"></i>
              <span>Explore System Modules</span>
            </a>
          </div>
        </div>

        <div id="preview" className="max-w-5xl mx-auto mt-8">
          <div className="flex flex-wrap justify-center gap-2 sm:gap-4 mb-6">
            <button onClick={() => onSwitchTab('erp')} id="tab-erp" className={tabBtn('erp')}>
              <i className="fa-solid fa-chart-line mr-2"></i>ERP Dashboard
            </button>
            <button onClick={() => onSwitchTab('lms')} id="tab-lms" className={tabBtn('lms')}>
              <i className="fa-solid fa-laptop-code mr-2"></i>LMS Learning Space
            </button>
            <button onClick={() => onSwitchTab('app')} id="tab-app" className={tabBtn('app')}>
              <i className="fa-solid fa-mobile-screen-button mr-2"></i>Parent Mobile App
            </button>
          </div>

          <div className="clay-card p-3 sm:p-6 bg-white overflow-hidden min-h-[320px] sm:min-h-[420px] flex items-center justify-center">
            <div id="content-erp" className={`w-full space-y-6 ${activeTab === 'erp' ? '' : 'hidden'}`}>
              <div className="flex items-center justify-between border-b pb-4">
                <div className="flex items-center space-x-3">
                  <span className="p-2.5 rounded-xl bg-orange-100 text-brand-orange font-bold">
                    <i className="fa-solid fa-calculator"></i>
                  </span>
                  <div>
                    <h3 className="font-bold text-brand-navy">ERP Administrative Suite</h3>
                    <p className="text-xs text-gray-500">Live operational overview &amp; automated invoicing</p>
                  </div>
                </div>
                <span className="px-3 py-1 rounded-full text-xs font-bold bg-green-100 text-green-700">
                  System Active
                </span>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="p-4 rounded-2xl bg-brand-grayLight border border-gray-100">
                  <span className="text-xs font-semibold text-gray-500">Term Revenue</span>
                  <p className="text-2xl font-extrabold text-brand-navy mt-1">$42,850</p>
                  <span className="text-[11px] text-green-600 font-semibold">
                    <i className="fa-solid fa-arrow-trend-up"></i> +14% vs last term
                  </span>
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
                      <td className="p-3 font-semibold text-brand-navy">Amina Ndung&apos;u</td>
                      <td className="p-3 text-gray-600">Python Young Pros (Level 2)</td>
                      <td className="p-3">
                        <span className="px-2 py-0.5 rounded bg-green-100 text-green-700 font-bold">Paid</span>
                      </td>
                      <td className="p-3 text-brand-orange font-bold cursor-pointer">#INV-8839</td>
                    </tr>
                    <tr>
                      <td className="p-3 font-semibold text-brand-navy">Liam Omondi</td>
                      <td className="p-3 text-gray-600">Robotics &amp; Arduino</td>
                      <td className="p-3">
                        <span className="px-2 py-0.5 rounded bg-amber-100 text-amber-700 font-bold">Partial</span>
                      </td>
                      <td className="p-3 text-brand-orange font-bold cursor-pointer">#INV-8840</td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>

            <div id="content-lms" className={`w-full space-y-6 ${activeTab === 'lms' ? '' : 'hidden'}`}>
              <div className="flex items-center justify-between border-b pb-4">
                <div className="flex items-center space-x-3">
                  <span className="p-2.5 rounded-xl bg-blue-100 text-blue-600 font-bold">
                    <i className="fa-solid fa-code"></i>
                  </span>
                  <div>
                    <h3 className="font-bold text-brand-navy">Interactive Coding LMS Playground</h3>
                    <p className="text-xs text-gray-500">Automated grading pipeline &amp; project sandbox</p>
                  </div>
                </div>
                <span className="px-3 py-1 rounded-full text-xs font-bold bg-brand-orange text-white">
                  Python 3.10 Engine
                </span>
              </div>
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                <div className="bg-gray-900 text-green-400 p-4 rounded-xl font-mono text-xs space-y-2">
                  <div className="text-gray-500"># Lesson 4: Loop Challenge</div>
                  <div>
                    <span className="text-purple-400">def</span>{' '}
                    <span className="text-blue-300">calculate_score</span>(projects):
                  </div>
                  <div className="pl-4">
                    <span className="text-purple-400">return</span> sum(projects) *{' '}
                    <span className="text-amber-300">1.25</span>
                  </div>
                  <div className="mt-4 text-gray-400"># Automated tests output:</div>
                  <div className="text-green-300">✔ Test Case 1: Passed (0.02s)</div>
                  <div className="text-green-300">✔ Test Case 2: Passed (0.01s)</div>
                </div>
                <div className="space-y-3">
                  <h4 className="font-bold text-sm text-brand-navy">Curriculum Progress</h4>
                  <div className="space-y-2">
                    <div>
                      <div className="flex justify-between text-xs font-semibold mb-1">
                        <span>Variables &amp; Data Types</span>
                        <span className="text-brand-orange">100%</span>
                      </div>
                      <div className="w-full bg-gray-200 h-2 rounded-full overflow-hidden">
                        <div className="bg-brand-orange h-2 w-full"></div>
                      </div>
                    </div>
                    <div>
                      <div className="flex justify-between text-xs font-semibold mb-1">
                        <span>Functions &amp; Logic Pipelines</span>
                        <span className="text-brand-navy">75%</span>
                      </div>
                      <div className="w-full bg-gray-200 h-2 rounded-full overflow-hidden">
                        <div className="bg-brand-navy h-2 w-[75%]"></div>
                      </div>
                    </div>
                  </div>
                  <div className="p-3 bg-brand-grayLight rounded-xl border border-gray-200 text-xs">
                    <span className="font-bold text-brand-navy">Mentor Feedback:</span>
                    <p className="text-gray-600 mt-1">
                      "Excellent clean code syntax on your recent game submission, Jabali!"
                    </p>
                  </div>
                </div>
              </div>
            </div>

            <div id="content-app" className={`w-full flex justify-center py-4 ${activeTab === 'app' ? '' : 'hidden'}`}>
              <div className="phone-mockup w-full max-w-[280px] p-4 space-y-4">
                <div className="flex items-center justify-between border-b pb-2">
                  <div className="flex items-center space-x-2">
                    <div className="w-8 h-8 rounded-full bg-brand-orange text-white font-bold flex items-center justify-center text-xs">
                      CK
                    </div>
                    <div>
                      <p className="text-xs font-extrabold text-brand-navy">Parent Connect</p>
                      <p className="text-[10px] text-gray-500">Student: Stacy K.</p>
                    </div>
                  </div>
                  <i className="fa-solid fa-bell text-brand-orange text-sm"></i>
                </div>
                <div className="bg-brand-grayLight p-3 rounded-xl space-y-2">
                  <div className="flex justify-between items-center text-xs">
                    <span className="font-bold text-brand-navy">Today&apos;s Attendance</span>
                    <span className="px-2 py-0.5 rounded bg-green-100 text-green-700 font-bold text-[10px]">
                      Present
                    </span>
                  </div>
                  <p className="text-[11px] text-gray-500">Coding Club Lab - 04:15 PM</p>
                </div>
                <div className="bg-brand-navy text-white p-3 rounded-xl space-y-1">
                  <p className="text-[10px] text-brand-orange uppercase font-bold tracking-wider">
                    Latest Project Showcase
                  </p>
                  <p className="text-xs font-bold">Space Invaders PyGame</p>
                  <p className="text-[10px] text-gray-300">Grade: 98% • Outstanding Project</p>
                </div>
                <div className="flex justify-between items-center p-2 rounded-lg border border-gray-100 text-xs">
                  <span className="font-semibold text-gray-600">Term Fee Balance</span>
                  <span className="font-bold text-green-600">Clear</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

const PillarsSection = () => (
  <section className="py-16 bg-white border-y border-gray-100 px-4 sm:px-8">
    <div className="max-w-7xl mx-auto">
      <div className="text-center max-w-2xl mx-auto mb-16">
        <h2 className="text-3xl font-extrabold text-brand-navy">Complete Ecosystem for Tech Education</h2>
        <p className="text-brand-charcoal/70 mt-3 text-sm">
          Everything you need to run, teach, and keep parents engaged seamlessly under one umbrella powered by Coding
          Clubs Kenya.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        <div className="clay-card p-8 flex flex-col justify-between">
          <div>
            <div className="w-14 h-14 rounded-2xl bg-orange-100 text-brand-orange flex items-center justify-center text-2xl font-bold mb-6">
              <i className="fa-solid fa-boxes-stacked"></i>
            </div>
            <h3 className="text-xl font-bold text-brand-navy mb-3">Robust School ERP</h3>
            <p className="text-sm text-brand-charcoal/80 leading-relaxed mb-6">
              Simplify fee collection, generate digital invoices, control club inventory, and manage student attendance
              effortlessly.
            </p>
          </div>
          <a href="#erp" className="inline-flex items-center font-bold text-sm text-brand-orange hover:text-brand-orangeHover">
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
              Empower students with structured curriculum, automated code tests, project upload portals, and interactive
              quizzes.
            </p>
          </div>
          <a href="#lms" className="inline-flex items-center font-bold text-sm text-brand-navy hover:text-brand-orange">
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
              Provide total transparency to parents through real-time notifications, project showcases, attendance, and
              mentor chats.
            </p>
          </div>
          <a href="#parent-app" className="inline-flex items-center font-bold text-sm text-green-700 hover:text-green-800">
            Explore Mobile App <i className="fa-solid fa-chevron-right ml-2 text-xs"></i>
          </a>
        </div>
      </div>
    </div>
  </section>
);

const ErpSection = () => (
  <section id="erp" className="py-20 bg-brand-grayLight/50 px-4 sm:px-8">
    <div className="max-w-7xl mx-auto">
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
        <div className="space-y-6">
          <span className="px-4 py-1.5 rounded-full text-xs font-bold uppercase tracking-wider bg-orange-100 text-brand-orange">
            Module 01 • Operations
          </span>
          <h2 className="text-3xl sm:text-4xl font-extrabold text-brand-navy">
            Automate Administrative &amp; Financial Overhead
          </h2>
          <p className="text-brand-charcoal/80 leading-relaxed">
            Say goodbye to manual spreadsheets. The Coding Club ERP gives administrators total clarity on club
            resources, finances, and student attendance records across multiple branches or school partner sites.
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
              <p className="text-xs text-gray-500 mt-1">
                Monitor robotics kits, laptops, micro-controllers, and club gear.
              </p>
            </div>
            <div className="clay-card p-4 bg-white">
              <i className="fa-solid fa-user-check text-brand-orange text-xl mb-2"></i>
              <h4 className="font-bold text-brand-navy text-sm">Smart Attendance</h4>
              <p className="text-xs text-gray-500 mt-1">
                Digital check-ins synced directly with parent mobile alerts.
              </p>
            </div>
            <div className="clay-card p-4 bg-white">
              <i className="fa-solid fa-chart-pie text-brand-orange text-xl mb-2"></i>
              <h4 className="font-bold text-brand-navy text-sm">Club Resource Allocation</h4>
              <p className="text-xs text-gray-500 mt-1">
                Allocate instructors, rooms, and time-slots seamlessly.
              </p>
            </div>
          </div>
        </div>

        <div className="relative">
          <div className="clay-card p-3 bg-white">
            <img
              src="https://images.unsplash.com/photo-1551836022-d5d88e9218df?auto=format&fit=crop&w=1000&q=80"
              alt="ERP Dashboard Administration"
              className="rounded-2xl w-full h-[280px] sm:h-[400px] object-cover"
            />
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
);

const LmsSection = () => (
  <section id="lms" className="py-20 bg-white px-4 sm:px-8">
    <div className="max-w-7xl mx-auto">
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
        <div className="order-2 lg:order-1 relative">
          <div className="clay-card p-3 bg-white">
            <img
              src="https://images.unsplash.com/photo-1517694712202-14dd9538aa97?auto=format&fit=crop&w=1000&q=80"
              alt="Student coding on computer"
              className="rounded-2xl w-full h-[280px] sm:h-[400px] object-cover"
            />
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
          <span className="px-4 py-1.5 rounded-full text-xs font-bold uppercase tracking-wider bg-blue-100 text-blue-700">
            Module 02 • Learning &amp; Curriculum
          </span>
          <h2 className="text-3xl sm:text-4xl font-extrabold text-brand-navy">
            Interactive Coding Curriculum &amp; Auto-Grading Pipelines
          </h2>
          <p className="text-brand-charcoal/80 leading-relaxed">
            Transform how kids learn to code. Our Learning Management System combines gamified video tutorials,
            interactive coding sandboxes, quizzes, and automated test-cases so mentors can focus on coaching rather
            than manual grading.
          </p>

          <ul className="space-y-3 font-medium text-sm text-brand-navy">
            <li className="flex items-center gap-3">
              <span className="w-6 h-6 rounded-full bg-green-100 text-green-600 flex items-center justify-center text-xs">
                <i className="fa-solid fa-check"></i>
              </span>
              <span>Interactive code submission pipelines with instant feedback</span>
            </li>
            <li className="flex items-center gap-3">
              <span className="w-6 h-6 rounded-full bg-green-100 text-green-600 flex items-center justify-center text-xs">
                <i className="fa-solid fa-check"></i>
              </span>
              <span>Pre-loaded STEM curriculum (Scratch, Python, Web Dev, Robotics)</span>
            </li>
            <li className="flex items-center gap-3">
              <span className="w-6 h-6 rounded-full bg-green-100 text-green-600 flex items-center justify-center text-xs">
                <i className="fa-solid fa-check"></i>
              </span>
              <span>Project showcases and portfolio generation for every student</span>
            </li>
            <li className="flex items-center gap-3">
              <span className="w-6 h-6 rounded-full bg-green-100 text-green-600 flex items-center justify-center text-xs">
                <i className="fa-solid fa-check"></i>
              </span>
              <span>Quizzes, badges, and certificates upon module completion</span>
            </li>
          </ul>
        </div>
      </div>
    </div>
  </section>
);

const ParentAppSection = () => (
  <section id="parent-app" className="py-20 bg-brand-navy text-white px-4 sm:px-8 relative overflow-hidden">
    <div className="max-w-7xl mx-auto">
      <div className="text-center max-w-3xl mx-auto mb-16 space-y-4">
        <span className="px-4 py-1.5 rounded-full text-xs font-bold uppercase tracking-wider bg-brand-orange/20 text-brand-orange border border-brand-orange/30">
          Module 03 • Parent Engagement
        </span>
        <h2 className="text-3xl sm:text-4xl font-extrabold">Dedicated Mobile App for Parents</h2>
        <p className="text-gray-300 text-sm leading-relaxed">
          Keep parents connected with their child's tech journey. Build long-term trust with real-time updates, direct
          mentor chats, and student project visibility right on their smartphones.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-8 items-center">
        <div className="space-y-6">
          <div className="clay-card-dark p-6 space-y-2">
            <div className="text-brand-orange text-xl font-bold">
              <i className="fa-solid fa-bell"></i>
            </div>
            <h4 className="font-bold text-white text-base">Real-Time Notifications</h4>
            <p className="text-xs text-gray-300">
              Instant push alerts for class schedules, attendance checks, and club announcements.
            </p>
          </div>
          <div className="clay-card-dark p-6 space-y-2">
            <div className="text-brand-orange text-xl font-bold">
              <i className="fa-solid fa-chart-line"></i>
            </div>
            <h4 className="font-bold text-white text-base">Progress &amp; Skill Tracking</h4>
            <p className="text-xs text-gray-300">
              Visual progress bars showing concepts mastered, quiz scores, and badges earned.
            </p>
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
              <div className="w-10 h-10 rounded-full bg-brand-navy text-white font-bold flex items-center justify-center text-sm">
                EO
              </div>
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
              <p className="text-[10px] text-gray-600">
                "Emmanuel built a fantastic game today! Check his project tab."
              </p>
            </div>

            <button className="w-full py-2.5 bg-brand-navy text-white font-bold text-xs rounded-xl shadow-sm">
              Pay Term Fee ($120)
            </button>
          </div>
        </div>

        <div className="space-y-6">
          <div className="clay-card-dark p-6 space-y-2">
            <div className="text-brand-orange text-xl font-bold">
              <i className="fa-solid fa-gamepad"></i>
            </div>
            <h4 className="font-bold text-white text-base">Project Portfolio Showcase</h4>
            <p className="text-xs text-gray-300">
              Parents can play games and view apps created by their children directly in the app.
            </p>
          </div>
          <div className="clay-card-dark p-6 space-y-2">
            <div className="text-brand-orange text-xl font-bold">
              <i className="fa-solid fa-credit-card"></i>
            </div>
            <h4 className="font-bold text-white text-base">Direct Fee Clearance</h4>
            <p className="text-xs text-gray-300">
              Seamless mobile money or card payments with auto-generated receipt downloads.
            </p>
          </div>
        </div>
      </div>
    </div>
  </section>
);

const PricingSection = () => (
  <section id="pricing" className="py-20 bg-white px-4 sm:px-8">
    <div className="max-w-7xl mx-auto">
      <div className="text-center max-w-2xl mx-auto mb-16">
        <h2 className="text-3xl font-extrabold text-brand-navy">Flexible Plans for Every Scale</h2>
        <p className="text-brand-charcoal/70 text-sm mt-2">
          Whether you are an independent coding club or a multi-campus academy.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        <div className="clay-card p-8 flex flex-col justify-between">
          <div className="space-y-4">
            <span className="text-xs font-bold uppercase tracking-wider text-gray-400">Starter Club</span>
            <h3 className="text-2xl font-bold text-brand-navy">Essential</h3>
            <p className="text-2xl font-extrabold text-brand-navy">Request a quote</p>
            <p className="text-xs text-gray-500">Ideal for single coding clubs with up to 50 students.</p>
            <hr className="border-gray-100" />
            <ul className="space-y-2 text-xs font-medium text-gray-600">
              <li>
                <i className="fa-solid fa-check text-green-500 mr-2"></i>Basic ERP &amp; Attendance
              </li>
              <li>
                <i className="fa-solid fa-check text-green-500 mr-2"></i>Standard LMS Coding Sandbox
              </li>
              <li>
                <i className="fa-solid fa-check text-green-500 mr-2"></i>Parent Email Updates
              </li>
            </ul>
          </div>
          <a
            href="https://wa.me/254716815025?text=Hello%20Coding%20Clubs%20Kenya%2C%20I%20would%20like%20a%20quote%20for%20the%20Essential%20plan."
            target="_blank"
            rel="noopener noreferrer"
            className="mt-8 w-full text-center py-3 rounded-xl border border-brand-navy text-brand-navy font-bold text-sm hover:bg-brand-grayLight"
          >
            Request a quote
          </a>
        </div>

        <div className="clay-card p-8 bg-brand-navy text-white flex flex-col justify-between relative transform lg:-translate-y-2">
          <div className="absolute -top-3 left-1/2 transform -translate-x-1/2 px-4 py-1 bg-brand-orange text-white text-[10px] font-extrabold uppercase rounded-full tracking-wider">
            Most Popular
          </div>
          <div className="space-y-4">
            <span className="text-xs font-bold uppercase tracking-wider text-brand-orange">Pro Academy</span>
            <h3 className="text-2xl font-bold text-white">System Complete</h3>
            <p className="text-2xl font-extrabold text-white">Request a quote</p>
            <p className="text-xs text-gray-300">Full access for growing STEM academies up to 300 students.</p>
            <hr className="border-gray-700" />
            <ul className="space-y-2 text-xs font-medium text-gray-200">
              <li>
                <i className="fa-solid fa-check text-brand-orange mr-2"></i>Advanced ERP + Invoicing Module
              </li>
              <li>
                <i className="fa-solid fa-check text-brand-orange mr-2"></i>Full LMS + Auto-grading Pipelines
              </li>
              <li>
                <i className="fa-solid fa-check text-brand-orange mr-2"></i>Dedicated Parent Mobile App Access
              </li>
              <li>
                <i className="fa-solid fa-check text-brand-orange mr-2"></i>Mentor Chat &amp; Portfolio Showcase
              </li>
            </ul>
          </div>
          <a
            href="https://wa.me/254716815025?text=Hello%20Coding%20Clubs%20Kenya%2C%20I%20would%20like%20a%20quote%20for%20the%20System%20Complete%20plan."
            target="_blank"
            rel="noopener noreferrer"
            className="mt-8 w-full text-center py-3 rounded-xl bg-brand-orange text-white font-bold text-sm clay-button hover:bg-brand-orangeHover"
          >
            Request a quote
          </a>
        </div>

        <div className="clay-card p-8 flex flex-col justify-between">
          <div className="space-y-4">
            <span className="text-xs font-bold uppercase tracking-wider text-gray-400">Enterprise</span>
            <h3 className="text-2xl font-bold text-brand-navy">Institutional</h3>
            <p className="text-2xl font-extrabold text-brand-navy">Request a quote</p>
            <p className="text-xs text-gray-500">
              For large school networks and nationwide club franchises.
            </p>
            <hr className="border-gray-100" />
            <ul className="space-y-2 text-xs font-medium text-gray-600">
              <li>
                <i className="fa-solid fa-check text-green-500 mr-2"></i>Unlimited Students &amp; Branches
              </li>
              <li>
                <i className="fa-solid fa-check text-green-500 mr-2"></i>Custom Domain &amp; White-labeling
              </li>
              <li>
                <i className="fa-solid fa-check text-green-500 mr-2"></i>Dedicated Server &amp; API Support
              </li>
            </ul>
          </div>
          <a
            href="https://wa.me/254716815025?text=Hello%20Coding%20Clubs%20Kenya%2C%20I%20would%20like%20a%20quote%20for%20the%20Institutional%20plan."
            target="_blank"
            rel="noopener noreferrer"
            className="mt-8 w-full text-center py-3 rounded-xl border border-brand-navy text-brand-navy font-bold text-sm hover:bg-brand-grayLight"
          >
            Request a quote
          </a>
        </div>
      </div>
    </div>
  </section>
);

const DemoSection = ({ submitted, onSubmit }) => (
  <section id="demo" className="py-20 bg-brand-grayLight/60 px-4 sm:px-8">
    <div className="max-w-4xl mx-auto clay-card p-8 sm:p-12 bg-white">
      <div className="text-center space-y-3 mb-8">
        <h2 className="text-3xl font-extrabold text-brand-navy">Experience the Coding Club System</h2>
        <p className="text-sm text-brand-charcoal/70">
          Book a personalized walkthrough with the <strong>Coding Clubs Kenya</strong> team to see how ERP, LMS, and the
          Parent Mobile App can elevate your center.
        </p>
      </div>

      <form onSubmit={onSubmit} className="space-y-4 max-w-xl mx-auto">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-bold text-brand-navy mb-1">Your Name</label>
            <input
              type="text"
              required
              placeholder="e.g. Jane Doe"
              className="w-full px-4 py-3 rounded-xl border border-gray-200 text-sm focus:outline-none focus:border-brand-orange"
            />
          </div>
          <div>
            <label className="block text-xs font-bold text-brand-navy mb-1">Institution/School Name</label>
            <input
              type="text"
              required
              placeholder="e.g. Nairobi STEM Academy"
              className="w-full px-4 py-3 rounded-xl border border-gray-200 text-sm focus:outline-none focus:border-brand-orange"
            />
          </div>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-bold text-brand-navy mb-1">Email Address</label>
            <input
              type="email"
              required
              placeholder="e.g. jane@school.ac.ke"
              className="w-full px-4 py-3 rounded-xl border border-gray-200 text-sm focus:outline-none focus:border-brand-orange"
            />
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
        <button
          type="submit"
          className="w-full py-4 bg-brand-orange text-white font-bold text-sm rounded-xl clay-button hover:bg-brand-orangeHover transition-all"
        >
          Submit Request for Demonstration
        </button>
      </form>
      {submitted && (
        <div
          id="demo-success"
          className="mt-4 p-4 bg-green-100 text-green-700 font-bold text-center text-xs rounded-xl"
        >
          Thank you! The Coding Clubs Kenya team will reach out shortly to schedule your demo.
        </div>
      )}
    </div>
  </section>
);

const Footer = () => (
  <footer className="bg-brand-navy text-white pt-16 pb-12 px-4 sm:px-8">
    <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-4 gap-8 pb-12 border-b border-gray-800">
      <div className="space-y-4">
        <div className="flex items-center space-x-2">
          <div className="w-8 h-8 rounded-xl bg-brand-orange text-white font-bold flex items-center justify-center text-sm">
            <i className="fa-solid fa-code"></i>
          </div>
          <span className="font-extrabold text-lg">Coding Club System</span>
        </div>
        <p className="text-xs text-gray-400 leading-relaxed">
          A flagship software product developed by <strong>Coding Clubs Kenya</strong> to revolutionize STEM club
          administration and student learning experience.
        </p>
      </div>

      <div>
        <h4 className="font-bold text-sm text-brand-orange mb-4">System Modules</h4>
        <ul className="space-y-2 text-xs text-gray-300">
          <li>
            <a href="#erp" className="hover:text-white">
              ERP Fee Management
            </a>
          </li>
          <li>
            <a href="#erp" className="hover:text-white">
              Inventory &amp; Allocation
            </a>
          </li>
          <li>
            <a href="#lms" className="hover:text-white">
              Coding Sandbox LMS
            </a>
          </li>
          <li>
            <a href="#lms" className="hover:text-white">
              Automated Grading Engine
            </a>
          </li>
          <li>
            <a href="#parent-app" className="hover:text-white">
              Parent Mobile App
            </a>
          </li>
        </ul>
      </div>

      <div>
        <h4 className="font-bold text-sm text-brand-orange mb-4">Quick Links</h4>
        <ul className="space-y-2 text-xs text-gray-300">
          <li>
            <a href="#overview" className="hover:text-white">
              System Overview
            </a>
          </li>
          <li>
            <a href="#pricing" className="hover:text-white">
              Pricing Options
            </a>
          </li>
          <li>
            <a href="#demo" className="hover:text-white">
              Book Demonstration
            </a>
          </li>
          <li>
            <a href="#" className="hover:text-white">
              Coding Clubs Kenya Portal
            </a>
          </li>
        </ul>
      </div>

      <div>
        <h4 className="font-bold text-sm text-brand-orange mb-4">Contact &amp; Support</h4>
        <ul className="space-y-2 text-xs text-gray-300">
          <li>
            <i className="fa-solid fa-envelope mr-2 text-brand-orange"></i>codingclubskenya@gmail.com
          </li>
          <li>
            <i className="fa-solid fa-phone mr-2 text-brand-orange"></i>+254 716 815 025 / 0798 734 442
          </li>
          <li>
            <i className="fa-solid fa-location-dot mr-2 text-brand-orange"></i>Nairobi, Kenya
          </li>
        </ul>
      </div>
    </div>

    <div className="max-w-7xl mx-auto pt-6 flex flex-col sm:flex-row justify-between items-center text-xs text-gray-500">
      <p>&copy; 2026 Coding Club System. A product by Coding Clubs Kenya. All rights reserved.</p>
      <div className="flex space-x-4 mt-4 sm:mt-0">
        <a href="#" className="hover:text-gray-300">
          Privacy Policy
        </a>
        <a href="#" className="hover:text-gray-300">
          Terms of Service
        </a>
      </div>
    </div>
  </footer>
);

const LandingPage = () => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [activeTab, setActiveTab] = useState('erp');
  const [onboardingActive, setOnboardingActive] = useState(true);
  const [selectedRole, setSelectedRole] = useState(null);
  const [formValues, setFormValues] = useState({});
  const [demoSubmitted, setDemoSubmitted] = useState(false);
  const [targetSection, setTargetSection] = useState(null);

  useEffect(() => {
    document.title = 'Coding Club System | Powered by Coding Clubs Kenya';
  }, []);

  useEffect(() => {
    if (targetSection) {
      const el = document.getElementById(targetSection);
      if (el) {
        el.scrollIntoView({ behavior: 'smooth' });
      }
      setTargetSection(null);
    }
  }, [targetSection]);

  const revealAndScroll = (id) => {
    setOnboardingActive(false);
    setMobileMenuOpen(false);
    setTargetSection(id);
  };

  const onNavigate = (e, id) => {
    e.preventDefault();
    revealAndScroll(id);
  };

  const onSelectRole = (role) => {
    setSelectedRole(role);
    setFormValues({});
  };

  const onReset = () => {
    setSelectedRole(null);
    setFormValues({});
  };

  const onFieldChange = (e) => {
    const { name, value } = e.target;
    setFormValues((prev) => ({ ...prev, [name]: value }));
  };

  const onComplete = () => {
    if (!selectedRole) return;
    const selected = roleContent[selectedRole];
    const emptyField = selected.fields.find(([, , , fieldName]) => !formValues[fieldName]);
    if (emptyField) {
      return;
    }
    const phone = formValues['contact-phone'] || '';
    if (phone.replace(/\D/g, '').length < 7) {
      return;
    }
    revealAndScroll('demo');
  };

  const handleDemoSubmit = (e) => {
    e.preventDefault();
    setDemoSubmitted(true);
  };

  return (
    <div className="antialiased overflow-x-hidden landing-font">
      <Navbar
        mobileMenuOpen={mobileMenuOpen}
        setMobileMenuOpen={setMobileMenuOpen}
        onNavigate={onNavigate}
      />
      <FloatingQuoteAction onNavigate={onNavigate} />
      <OnboardingSection
        selectedRole={selectedRole}
        formValues={formValues}
        onSelectRole={onSelectRole}
        onReset={onReset}
        onComplete={onComplete}
        onFieldChange={onFieldChange}
      />
      {!onboardingActive && (
        <>
          <HeroSection activeTab={activeTab} onSwitchTab={setActiveTab} />
          <PillarsSection />
          <ErpSection />
          <LmsSection />
          <ParentAppSection />
          <PricingSection />
          <DemoSection submitted={demoSubmitted} onSubmit={handleDemoSubmit} />
          <Footer />
        </>
      )}
    </div>
  );
};

export default LandingPage;
