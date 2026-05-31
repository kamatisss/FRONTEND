import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import {
  Leaf,
  MapPin,
  Phone,
  Mail,
  ChevronRight,
  Star,
  Quote,
  ArrowRight,
  ShieldCheck,
  Clock,
  Users,
  Image as ImageIcon,
  Trees,
  Sun,
  Wrench,
  Menu,
  X,
} from 'lucide-react';

/* ─── Animation Variants ──────────────────────────────────── */
const FADE_UP = {
  hidden: { opacity: 0, y: 40 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.6, ease: 'easeOut' } },
};
const STAGGER = {
  hidden: { opacity: 0 },
  visible: { opacity: 1, transition: { staggerChildren: 0.12 } },
};

/* ─── Smooth scroll helper ────────────────────────────────── */
function scrollTo(id) {
  const el = document.getElementById(id);
  if (el) el.scrollIntoView({ behavior: 'smooth' });
}

/* ─── Services data ───────────────────────────────────────── */
const SERVICES = [
  { title: 'Garden Design',         icon: <Leaf size={28} />,        desc: 'Bespoke botanical layouts tailored to your local climate and personal aesthetic.' },
  { title: '3D Virtual Landscaping',icon: <ImageIcon size={28} />,   desc: 'Immersive 3D previews of your future garden using our state-of-the-art studio.' },
  { title: 'Plant Recommendations', icon: <Trees size={28} />,       desc: 'Expert curation of flora to ensure year-round vibrancy and sustainability.' },
  { title: 'Hardscape Installation',icon: <ShieldCheck size={28} />, desc: 'Premium stonework, paving, and structural elements built to last generations.' },
  { title: 'Outdoor Lighting',      icon: <Sun size={28} />,         desc: 'Architectural and mood lighting to bring your garden to life after dark.' },
  { title: 'Lawn Maintenance',      icon: <Wrench size={28} />,      desc: 'Comprehensive care plans to keep your outdoor sanctuary in pristine condition.' },
];

const STEPS = [
  { step: '01', title: 'Upload Photo',  desc: 'Take a picture of your current outdoor space.' },
  { step: '02', title: 'Generate 3D',  desc: 'Our engine maps the depth and terrain automatically.' },
  { step: '03', title: 'Design',       desc: 'Drag & drop premium plants and materials.' },
  { step: '04', title: 'Build',        desc: 'Save your design or book our pros to install it.' },
];

const REVIEWS = [
  { text: 'Being able to see the 3D design before spending any money gave me so much confidence. The installation team executed it perfectly.', name: 'Sarah M.', role: 'Homeowner' },
  { text: 'The app is incredibly fun to use, and the final garden looks exactly like the 3D render. Worth every penny.', name: 'David L.', role: 'Property Developer' },
  { text: 'They transformed my boring backyard into a tropical resort. The plant recommendations were spot on for our climate.', name: 'Elena R.', role: 'Homeowner' },
];

const STATS = [
  { icon: <ShieldCheck />, num: '500+',  label: 'Completed Projects' },
  { icon: <Users />,       num: '98%',   label: 'Happy Clients' },
  { icon: <Trees />,       num: '1,200+',label: 'Plants Available' },
  { icon: <Clock />,       num: '15+',   label: 'Years Experience' },
];

/* ══════════════════════════════════════════════════════════════
   MAIN COMPONENT
   ══════════════════════════════════════════════════════════════ */
export default function LandingPage() {
  const [scrolled,     setScrolled]     = useState(false);
  const [mobileOpen,   setMobileOpen]   = useState(false);

  /* Enable free-scroll on body while landing page is mounted */
  useEffect(() => {
    document.body.classList.add('landing-page-active');
    return () => document.body.classList.remove('landing-page-active');
  }, []);

  /* Detect scroll to switch navbar style */
  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 60);
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  const navLinks = [
    { label: 'Services',     id: 'services' },
    { label: '3D Studio',    id: 'showcase' },
    { label: 'How it Works', id: 'how-it-works' },
  ];

  return (
    /* Page wrapper — no overflow constraint here */
    <div className="font-sans text-slate-900 bg-slate-50">

      {/* ══════════════ STICKY NAVBAR ══════════════ */}
      <nav
        id="landing-navbar"
        className={`landing-sticky-nav flex justify-between items-center px-6 md:px-12 py-4 ${
          scrolled ? 'scrolled bg-white shadow-md' : 'bg-transparent'
        }`}
        style={!scrolled ? { background: 'linear-gradient(to bottom, rgba(2,6,23,0.5) 0%, transparent 100%)' } : {}}
      >
        {/* Logo */}
        <div className={`flex items-center gap-2 ${scrolled ? 'text-slate-900' : 'text-white'}`}>
          <Leaf size={26} className="text-emerald-500" />
          <span className="text-xl font-black tracking-tight">Garden Studio</span>
        </div>

        {/* Desktop Links */}
        <div className="hidden md:flex gap-8 font-medium">
          {navLinks.map(({ label, id }) => (
            <button
              key={id}
              onClick={() => scrollTo(id)}
              className={`hover:text-emerald-500 transition-colors bg-transparent border-0 cursor-pointer font-medium ${scrolled ? 'text-slate-700' : 'text-white/90'}`}
            >
              {label}
            </button>
          ))}
        </div>

        {/* CTA Buttons */}
        <div className="hidden md:flex items-center gap-3">
          <Link
            to="/login"
            className={`px-5 py-2 font-bold transition-colors ${scrolled ? 'text-slate-700 hover:text-emerald-500' : 'text-white/90 hover:text-white'}`}
          >
            Log In
          </Link>
          <Link
            to="/register"
            className="px-5 py-2.5 bg-emerald-500 hover:bg-emerald-600 text-white rounded-full font-bold shadow-lg shadow-emerald-500/30 transition-all active:scale-95 text-sm"
          >
            Sign Up Free
          </Link>
        </div>

        {/* Mobile Hamburger */}
        <button
          id="landing-menu-btn"
          className={`md:hidden p-2 ${scrolled ? 'text-slate-900' : 'text-white'}`}
          onClick={() => setMobileOpen(o => !o)}
          aria-label="Toggle menu"
        >
          {mobileOpen ? <X size={24} /> : <Menu size={24} />}
        </button>
      </nav>

      {/* Mobile Menu Drawer */}
      {mobileOpen && (
        <motion.div
          initial={{ opacity: 0, y: -12 }}
          animate={{ opacity: 1, y: 0 }}
          className="md:hidden fixed top-[64px] left-0 right-0 z-40 bg-white shadow-xl border-b border-slate-100 px-6 py-6 flex flex-col gap-4"
        >
          {navLinks.map(({ label, id }) => (
            <button
              key={id}
              onClick={() => { scrollTo(id); setMobileOpen(false); }}
              className="text-left text-slate-900 font-semibold text-lg hover:text-emerald-500 transition-colors bg-transparent border-0 cursor-pointer"
            >
              {label}
            </button>
          ))}
          <hr className="border-slate-100 my-2" />
          <Link to="/login"    className="text-slate-700 font-semibold hover:text-emerald-500 transition-colors">Log In</Link>
          <Link to="/register" className="w-full text-center py-3 bg-emerald-500 hover:bg-emerald-600 text-white rounded-full font-bold transition-all">Sign Up Free</Link>
        </motion.div>
      )}

      {/* ══════════════ SECTION 1 — HERO ══════════════ */}
      <section className="relative h-screen flex items-center justify-center overflow-hidden -mt-[72px]">
        {/* Background image */}
        <div className="absolute inset-0 z-0">
          <img
            src="/landing-hero.png"
            alt="Beautiful landscaped garden"
            className="w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-black/40 backdrop-blur-[1px]" />
        </div>

        {/* Hero Content */}
        <div className="relative z-10 text-center px-4 max-w-5xl mx-auto mt-16">
          <motion.div initial="hidden" animate="visible" variants={STAGGER}>
            <motion.h1
              variants={FADE_UP}
              className="text-5xl md:text-7xl font-black text-white leading-tight mb-6 tracking-tight drop-shadow-lg"
            >
              Transform Your Space Into a{' '}
              <br className="hidden md:block"/>
              <span className="text-white">
                Living Masterpiece.
              </span>
            </motion.h1>

            <motion.p
              variants={FADE_UP}
              className="text-lg md:text-2xl text-white/90 mb-10 max-w-3xl mx-auto font-medium leading-relaxed drop-shadow-md"
            >
              Experience the future of outdoor living. Visualize your dream garden with our AI-powered 3D studio.
            </motion.p>

            <motion.div variants={FADE_UP} className="flex flex-col sm:flex-row items-center justify-center gap-4">
              <Link
                to="/studio"
                className="w-full sm:w-auto px-8 py-4 bg-emerald-500 hover:bg-emerald-600 text-white rounded-full font-extrabold text-lg transition-all shadow-xl shadow-emerald-500/30 hover:-translate-y-1 flex items-center justify-center gap-2"
              >
                Start Designing <ArrowRight size={20} />
              </Link>
              <button
                onClick={() => scrollTo('services')}
                className="w-full sm:w-auto px-8 py-4 bg-transparent hover:bg-white/10 text-white border-2 border-white rounded-full font-bold text-lg transition-all cursor-pointer"
              >
                Explore Services
              </button>
            </motion.div>
          </motion.div>
        </div>

        {/* Scroll Indicator */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1.5, duration: 1 }}
          className="absolute bottom-8 left-1/2 -translate-x-1/2 text-white/70 animate-bounce cursor-pointer"
          onClick={() => scrollTo('showcase')}
          aria-label="Scroll to feature section"
        >
          <div className="w-8 h-12 border-2 border-white/50 rounded-full flex justify-center pt-2">
            <div className="w-1 h-3 bg-white/70 rounded-full" />
          </div>
        </motion.div>
      </section>

      {/* ══════════════ SECTION 2 — FEATURE (3D STUDIO) ══════════════ */}
      <section id="showcase" className="py-24 px-6 md:px-12 bg-white relative overflow-hidden scroll-mt-20">
        <div className="max-w-7xl mx-auto flex flex-col lg:flex-row items-center gap-16 relative z-10">
          {/* Left — Text */}
          <motion.div
            initial="hidden" whileInView="visible" viewport={{ once: true }} variants={FADE_UP}
            className="w-full lg:w-1/2 text-slate-900"
          >
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-50 border border-emerald-100 text-emerald-600 font-bold text-sm mb-6 uppercase tracking-wider">
              AI-Powered Editor
            </div>
            <h2 className="text-4xl md:text-6xl font-black mb-6 leading-tight text-slate-800">
              Design your garden <br />
              before you dig.
            </h2>
            <p className="text-lg text-slate-600 mb-8 font-medium leading-relaxed">
              Upload a photo of your yard, and our AI instantly maps the terrain. Drag and drop premium plants,
              furniture, and materials into a hyper-realistic 3D space to see exactly how it will look.
            </p>
            <ul className="space-y-4 mb-10">
              {[
                'Instant Terrain Mapping',
                'Thousands of 3D botanical assets',
                'Real-time cost estimation',
                'One-click professional booking',
              ].map((item, i) => (
                <li key={i} className="flex items-center gap-3 text-slate-700 font-bold text-lg">
                  <CheckCircleIcon className="text-emerald-500 shrink-0" /> {item}
                </li>
              ))}
            </ul>
            <Link
              to="/studio"
              className="inline-flex items-center gap-2 px-8 py-4 bg-slate-900 hover:bg-slate-800 text-white rounded-full font-bold transition-all shadow-lg active:scale-95"
            >
              Launch 3D Studio <ChevronRight size={20} />
            </Link>
          </motion.div>

          {/* Right — Mockup */}
          <motion.div
            initial={{ opacity: 0, x: 50 }} whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }} transition={{ duration: 0.8 }}
            className="w-full lg:w-1/2 flex justify-center"
          >
            <img
              src="/isometric-mockup.png"
              alt="3D Editor Isometric Mockup"
              className="w-full h-auto max-w-lg object-contain"
              style={{ filter: 'drop-shadow(0 25px 35px rgba(0,0,0,0.1))' }}
            />
          </motion.div>
        </div>
      </section>

      {/* ══════════════ SECTION 3 — SERVICES ══════════════ */}
      <section id="services" className="py-24 px-6 md:px-12 bg-slate-50 relative scroll-mt-20 border-t border-slate-100">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <motion.span
              initial="hidden" whileInView="visible" viewport={{ once: true }} variants={FADE_UP}
              className="inline-block text-emerald-600 font-bold tracking-wider uppercase text-sm mb-3"
            >
              Our Expertise
            </motion.span>
            <motion.h2
              initial="hidden" whileInView="visible" viewport={{ once: true }} variants={FADE_UP}
              className="text-4xl md:text-5xl font-black text-slate-900 tracking-tight"
            >
              Premium Services
            </motion.h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {SERVICES.map((service, i) => (
              <motion.div
                key={i}
                initial="hidden" whileInView="visible" viewport={{ once: true, margin: '-50px' }} variants={FADE_UP}
                className="group p-8 rounded-3xl bg-white border border-slate-100 hover:shadow-2xl hover:shadow-emerald-900/5 transition-all duration-300 relative overflow-hidden"
              >
                <div className="absolute top-0 right-0 w-32 h-32 bg-emerald-50 rounded-bl-full -z-10 group-hover:scale-110 transition-transform" />
                <div className="w-14 h-14 bg-emerald-100 text-emerald-600 rounded-2xl flex items-center justify-center mb-6 shadow-inner">
                  {service.icon}
                </div>
                <h3 className="text-xl font-bold text-slate-900 mb-3">{service.title}</h3>
                <p className="text-slate-600 leading-relaxed">{service.desc}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ══════════════ SECTION 4 — HOW IT WORKS ══════════════ */}
      <section id="how-it-works" className="py-24 px-6 md:px-12 bg-white scroll-mt-20">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <motion.span
              initial="hidden" whileInView="visible" viewport={{ once: true }} variants={FADE_UP}
              className="inline-block text-emerald-600 font-bold tracking-wider uppercase text-sm mb-3"
            >
              Process
            </motion.span>
            <motion.h2
              initial="hidden" whileInView="visible" viewport={{ once: true }} variants={FADE_UP}
              className="text-4xl font-black text-slate-900"
            >
              4 Steps to Your Paradise
            </motion.h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-4 gap-8 relative">
            {/* Connecting line (desktop) */}
            <div className="hidden md:block absolute top-12 left-[10%] right-[10%] h-0.5 bg-slate-100 -z-10" />

            {STEPS.map((item, i) => (
              <motion.div
                key={i}
                initial="hidden" whileInView="visible" viewport={{ once: true }} variants={FADE_UP}
                className="relative flex flex-col items-center text-center"
              >
                <div className="w-24 h-24 rounded-full bg-white border-4 border-slate-50 shadow-xl flex items-center justify-center text-2xl font-black text-emerald-600 mb-6 relative z-10">
                  {item.step}
                </div>
                <h3 className="text-xl font-bold text-slate-900 mb-2">{item.title}</h3>
                <p className="text-slate-500 px-4">{item.desc}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ══════════════ PLANT & MATERIAL GALLERY ══════════════ */}
      <section className="py-24 px-6 md:px-12 bg-slate-50 border-t border-slate-100">
        <div className="max-w-7xl mx-auto">
          <div className="flex flex-col md:flex-row justify-between items-end mb-12 gap-6">
            <div>
              <p className="text-emerald-600 font-bold tracking-wider uppercase text-sm mb-3">Inspiration</p>
              <h2 className="text-4xl font-black text-slate-900">Premium Materials</h2>
            </div>
            <Link to="/studio" className="font-bold text-emerald-600 hover:text-emerald-700 flex items-center gap-1 transition-colors">
              View full catalog <ArrowRight size={18} />
            </Link>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <GalleryImage src="https://images.unsplash.com/photo-1598902108854-10e335adac99?q=80&w=600&auto=format&fit=crop" label="Monstera Deliciosa" height="h-64 md:h-80" />
            <GalleryImage src="https://images.unsplash.com/photo-1584622781564-1d987f7333c1?q=80&w=600&auto=format&fit=crop" label="Natural Stone"      height="h-64 md:h-64 md:mt-16" />
            <GalleryImage src="https://images.unsplash.com/photo-1600585154340-be6161a56a0c?q=80&w=600&auto=format&fit=crop" label="Outdoor Lounge"     height="h-64 md:h-80" />
            <GalleryImage src="https://images.unsplash.com/photo-1524404987053-ad221800f37c?q=80&w=600&auto=format&fit=crop" label="Tropical Palms"     height="h-64 md:h-64 md:mt-16" />
          </div>
        </div>
      </section>

      {/* ══════════════ TESTIMONIALS ══════════════ */}
      <section className="py-24 px-6 md:px-12 bg-emerald-900 text-white overflow-hidden">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <p className="text-emerald-400 font-bold tracking-wider uppercase text-sm mb-3">Reviews</p>
            <h2 className="text-4xl font-black">Loved by Homeowners</h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {REVIEWS.map((review, i) => (
              <motion.div
                key={i}
                initial="hidden" whileInView="visible" viewport={{ once: true }} variants={FADE_UP}
                className="bg-white/10 backdrop-blur-lg border border-white/10 p-8 rounded-3xl relative"
              >
                <Quote className="absolute top-6 right-6 text-emerald-500/30" size={40} />
                <div className="flex gap-1 mb-6">
                  {[...Array(5)].map((_, j) => <Star key={j} size={16} className="fill-emerald-400 text-emerald-400" />)}
                </div>
                <p className="text-lg font-light leading-relaxed mb-6">"{review.text}"</p>
                <div>
                  <p className="font-bold">{review.name}</p>
                  <p className="text-sm text-emerald-300">{review.role}</p>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ══════════════ STATS ══════════════ */}
      <section className="py-20 px-6 md:px-12 bg-white border-b border-slate-100">
        <div className="max-w-7xl mx-auto">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8 text-center divide-x-0 md:divide-x divide-slate-100">
            {STATS.map((stat, i) => (
              <motion.div
                key={i}
                initial="hidden" whileInView="visible" viewport={{ once: true }} variants={FADE_UP}
                className="flex flex-col items-center p-4"
              >
                <div className="text-emerald-500 mb-4">{stat.icon}</div>
                <h3 className="text-4xl font-black text-slate-900 mb-2">{stat.num}</h3>
                <p className="text-sm font-bold text-slate-500 uppercase tracking-wider">{stat.label}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ══════════════ CALL TO ACTION ══════════════ */}
      <section className="py-24 px-6 md:px-12 relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-emerald-500 to-teal-700 -z-20" />
        <div className="absolute top-0 right-0 w-full h-full bg-[url('https://www.transparenttextures.com/patterns/cubes.png')] opacity-10 mix-blend-overlay pointer-events-none -z-10" />

        <div className="max-w-4xl mx-auto text-center text-white relative z-10">
          <motion.h2
            initial="hidden" whileInView="visible" viewport={{ once: true }} variants={FADE_UP}
            className="text-4xl md:text-6xl font-black mb-8 leading-tight"
          >
            Ready to build your dream garden?
          </motion.h2>
          <motion.p
            initial="hidden" whileInView="visible" viewport={{ once: true }} variants={FADE_UP}
            className="text-xl text-emerald-100 mb-10 font-light max-w-2xl mx-auto"
          >
            Create an account today to access the 3D studio, save your designs, and connect with our expert landscaping team.
          </motion.p>
          <motion.div
            initial="hidden" whileInView="visible" viewport={{ once: true }} variants={FADE_UP}
            className="flex flex-col sm:flex-row justify-center gap-4"
          >
            <Link
              to="/register"
              className="px-8 py-4 bg-white text-emerald-700 hover:bg-slate-50 rounded-full font-black text-lg transition-all shadow-2xl active:scale-95"
            >
              Create Free Account
            </Link>
            <Link
              to="/studio"
              className="px-8 py-4 bg-transparent border border-white/30 hover:bg-white/10 rounded-full font-bold text-lg transition-all active:scale-95"
            >
              Try Studio as Guest
            </Link>
          </motion.div>
        </div>
      </section>

      {/* ══════════════ FOOTER ══════════════ */}
      <footer className="bg-slate-950 text-slate-400 pt-16 px-6 md:px-12">
        <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-4 gap-12 pb-12">

          {/* Brand */}
          <div>
            <div className="flex items-center gap-2 text-white mb-5">
              <Leaf size={22} className="text-emerald-500" />
              <span className="text-xl font-black tracking-tight">Garden Studio</span>
            </div>
            <p className="text-sm leading-relaxed mb-6">
              Elevating outdoor living spaces with AI technology and premium landscaping craftsmanship.
            </p>
            {/* Social icons placeholder */}
            <div className="flex gap-3">
              {['fb', 'ig', 'tw'].map(s => (
                <div key={s} className="w-9 h-9 rounded-full bg-white/5 border border-white/10 flex items-center justify-center text-xs font-bold text-slate-400 hover:bg-emerald-500/20 hover:text-emerald-400 cursor-pointer transition-all">
                  {s.toUpperCase()}
                </div>
              ))}
            </div>
          </div>

          {/* Quick Links */}
          <div>
            <h4 className="text-white font-bold mb-5">Quick Links</h4>
            <ul className="space-y-3 text-sm">
              <li><Link to="/studio"   className="hover:text-emerald-400 transition-colors">3D Studio</Link></li>
              <li><button onClick={() => scrollTo('services')} className="hover:text-emerald-400 transition-colors bg-transparent border-0 cursor-pointer text-slate-400 text-sm p-0">Services</button></li>
              <li><button onClick={() => scrollTo('how-it-works')} className="hover:text-emerald-400 transition-colors bg-transparent border-0 cursor-pointer text-slate-400 text-sm p-0">How it Works</button></li>
              <li><Link to="/login"    className="hover:text-emerald-400 transition-colors">Login</Link></li>
              <li><Link to="/register" className="hover:text-emerald-400 transition-colors">Sign Up</Link></li>
            </ul>
          </div>

          {/* Contact */}
          <div>
            <h4 className="text-white font-bold mb-5">Contact Us</h4>
            <ul className="space-y-4 text-sm">
              <li className="flex items-start gap-3">
                <MapPin size={17} className="text-emerald-500 shrink-0 mt-0.5" />
                <span>123 Botanical Way, Green District<br />Pagbilao, Philippines 1000</span>
              </li>
              <li className="flex items-center gap-3">
                <Phone size={17} className="text-emerald-500 shrink-0" />
                <span>+63 912 345 6789</span>
              </li>
              <li className="flex items-center gap-3">
                <Mail size={17} className="text-emerald-500 shrink-0" />
                <span>hello@gardenstudio.com</span>
              </li>
            </ul>
          </div>

          {/* Newsletter */}
          <div>
            <h4 className="text-white font-bold mb-5">Newsletter</h4>
            <p className="text-sm mb-4 leading-relaxed">Get seasonal gardening tips and design inspiration.</p>
            <div className="flex">
              <input
                type="email"
                placeholder="Your email address"
                className="bg-slate-900 border border-slate-800 rounded-l-lg px-4 py-2.5 text-sm w-full focus:outline-none focus:border-emerald-500 text-slate-300 placeholder-slate-600"
              />
              <button className="bg-emerald-500 hover:bg-emerald-600 text-white px-4 py-2.5 rounded-r-lg transition-colors shrink-0">
                <ArrowRight size={17} />
              </button>
            </div>
          </div>
        </div>

        {/* Bottom bar */}
        <div className="max-w-7xl mx-auto py-6 border-t border-slate-800 text-sm flex flex-col md:flex-row justify-between items-center gap-4">
          <p>© {new Date().getFullYear()} Garden Studio. All rights reserved.</p>
          <div className="flex gap-6">
            <a href="#" className="hover:text-white transition-colors">Privacy Policy</a>
            <a href="#" className="hover:text-white transition-colors">Terms of Service</a>
          </div>
        </div>
      </footer>
    </div>
  );
}

/* ─── Sub-components ──────────────────────────────────────── */
function GalleryImage({ src, label, height }) {
  return (
    <motion.div
      initial="hidden" whileInView="visible" viewport={{ once: true }} variants={FADE_UP}
      className={`group relative rounded-2xl overflow-hidden cursor-pointer ${height}`}
    >
      <img src={src} alt={label} className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110" />
      <div className="absolute inset-0 bg-gradient-to-t from-slate-900/80 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-end p-6">
        <p className="text-white font-bold text-lg">{label}</p>
      </div>
    </motion.div>
  );
}

function CheckCircleIcon(props) {
  return (
    <svg
      {...props}
      xmlns="http://www.w3.org/2000/svg"
      width="24" height="24"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="3"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" />
      <polyline points="22 4 12 14.01 9 11.01" />
    </svg>
  );
}
