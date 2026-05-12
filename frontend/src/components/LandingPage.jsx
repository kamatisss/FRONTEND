import React from 'react';
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
  Wrench
} from 'lucide-react';

const FADE_UP = {
  hidden: { opacity: 0, y: 40 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.6, ease: "easeOut" } }
};

const STAGGER = {
  hidden: { opacity: 0 },
  visible: { opacity: 1, transition: { staggerChildren: 0.1 } }
};

export default function LandingPage() {
  return (
    <div className="font-sans text-slate-900 bg-slate-50 min-h-screen overflow-hidden">
      
      {/* ─── 1. HERO SECTION ─── */}
      <section className="relative h-screen flex items-center justify-center overflow-hidden">
        {/* Background Image */}
        <div className="absolute inset-0 z-0">
          <img 
            src="https://images.unsplash.com/photo-1558904541-efa843a96f09?q=80&w=2000&auto=format&fit=crop" 
            alt="Beautiful landscaped garden" 
            className="w-full h-full object-cover"
          />
          {/* Soft gradient overlay */}
          <div className="absolute inset-0 bg-gradient-to-r from-slate-900/90 via-slate-900/70 to-slate-900/40 backdrop-blur-[2px]"></div>
        </div>

        {/* Navbar inside Hero */}
        <nav className="absolute top-0 left-0 w-full z-20 flex justify-between items-center px-6 md:px-12 py-6">
          <div className="flex items-center gap-2 text-white">
            <Leaf size={28} className="text-emerald-400" />
            <span className="text-2xl font-black tracking-tight">Garden Studio</span>
          </div>
          <div className="hidden md:flex gap-8 text-white/90 font-medium">
            <a href="#services" className="hover:text-emerald-400 transition-colors">Services</a>
            <a href="#showcase" className="hover:text-emerald-400 transition-colors">3D Studio</a>
            <a href="#how-it-works" className="hover:text-emerald-400 transition-colors">How it Works</a>
          </div>
          <div className="flex gap-4">
            <Link to="/login" className="hidden md:flex px-5 py-2.5 text-white hover:text-emerald-400 font-bold transition-colors">
              Log In
            </Link>
            <Link to="/register" className="px-5 py-2.5 bg-emerald-500 hover:bg-emerald-600 text-white rounded-full font-bold shadow-lg shadow-emerald-500/30 transition-all active:scale-95">
              Sign Up
            </Link>
          </div>
        </nav>

        {/* Hero Content */}
        <div className="relative z-10 text-center px-4 max-w-5xl mx-auto mt-16">
          <motion.div initial="hidden" animate="visible" variants={STAGGER}>
            <motion.span variants={FADE_UP} className="inline-block py-1 px-3 rounded-full bg-emerald-500/20 border border-emerald-400/30 text-emerald-300 font-semibold text-sm mb-6 backdrop-blur-md">
              ✨ Premium Landscape Design
            </motion.span>
            <motion.h1 variants={FADE_UP} className="text-5xl md:text-7xl font-black text-white leading-tight mb-6 tracking-tight drop-shadow-xl">
              Transform Your Space Into a <span className="text-transparent bg-clip-text bg-gradient-to-r from-emerald-400 to-teal-200">Living Masterpiece</span>.
            </motion.h1>
            <motion.p variants={FADE_UP} className="text-lg md:text-2xl text-slate-200 mb-10 max-w-3xl mx-auto font-light leading-relaxed">
              Experience the future of outdoor living. Visualize your dream garden with our AI-powered 3D studio, and let our experts bring it to life.
            </motion.p>
            <motion.div variants={FADE_UP} className="flex flex-col sm:flex-row items-center justify-center gap-4">
              <Link to="/studio" className="w-full sm:w-auto px-8 py-4 bg-emerald-500 hover:bg-emerald-600 text-white rounded-full font-extrabold text-lg transition-all shadow-xl shadow-emerald-500/30 hover:-translate-y-1 flex items-center justify-center gap-2">
                Start Designing <ArrowRight size={20} />
              </Link>
              <a href="#services" className="w-full sm:w-auto px-8 py-4 bg-white/10 hover:bg-white/20 text-white backdrop-blur-md border border-white/20 rounded-full font-bold text-lg transition-all flex items-center justify-center">
                Explore Services
              </a>
            </motion.div>
          </motion.div>
        </div>
        
        {/* Scroll Indicator */}
        <motion.div 
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1.5, duration: 1 }}
          className="absolute bottom-8 left-1/2 -translate-x-1/2 text-white/50 animate-bounce"
        >
          <div className="w-8 h-12 border-2 border-white/30 rounded-full flex justify-center pt-2">
            <div className="w-1 h-3 bg-white/50 rounded-full"></div>
          </div>
        </motion.div>
      </section>

      {/* ─── 2. FEATURED SERVICES ─── */}
      <section id="services" className="py-24 px-6 md:px-12 bg-white relative">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-emerald-600 font-bold tracking-wider uppercase text-sm mb-3">Our Expertise</h2>
            <h3 className="text-4xl md:text-5xl font-black text-slate-900 tracking-tight">Premium Services</h3>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {[
              { title: "Garden Design", icon: <Leaf size={28} />, desc: "Bespoke botanical layouts tailored to your local climate and personal aesthetic." },
              { title: "3D Virtual Landscaping", icon: <ImageIcon size={28} />, desc: "Immersive 3D previews of your future garden using our state-of-the-art studio." },
              { title: "Plant Recommendations", icon: <Trees size={28} />, desc: "Expert curation of flora to ensure year-round vibrancy and sustainability." },
              { title: "Hardscape Installation", icon: <ShieldCheck size={28} />, desc: "Premium stonework, paving, and structural elements built to last generations." },
              { title: "Outdoor Lighting", icon: <Sun size={28} />, desc: "Architectural and mood lighting to bring your garden to life after dark." },
              { title: "Lawn Maintenance", icon: <Wrench size={28} />, desc: "Comprehensive care plans to keep your outdoor sanctuary in pristine condition." }
            ].map((service, i) => (
              <motion.div 
                key={i}
                initial="hidden"
                whileInView="visible"
                viewport={{ once: true, margin: "-50px" }}
                variants={FADE_UP}
                className="group p-8 rounded-3xl bg-slate-50 border border-slate-100 hover:bg-white hover:shadow-2xl hover:shadow-emerald-900/5 transition-all duration-300 relative overflow-hidden"
              >
                <div className="absolute top-0 right-0 w-32 h-32 bg-emerald-50 rounded-bl-full -z-10 group-hover:scale-110 transition-transform"></div>
                <div className="w-14 h-14 bg-emerald-100 text-emerald-600 rounded-2xl flex items-center justify-center mb-6 shadow-inner">
                  {service.icon}
                </div>
                <h4 className="text-xl font-bold text-slate-900 mb-3">{service.title}</h4>
                <p className="text-slate-600 leading-relaxed">{service.desc}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ─── 3. 3D VIRTUAL GARDEN SHOWCASE ─── */}
      <section id="showcase" className="py-24 px-6 md:px-12 bg-slate-900 relative overflow-hidden">
        {/* Glow Effects */}
        <div className="absolute top-1/2 left-1/4 -translate-y-1/2 w-96 h-96 bg-emerald-500/20 blur-[100px] rounded-full pointer-events-none"></div>
        <div className="absolute bottom-0 right-0 w-[500px] h-[500px] bg-teal-500/10 blur-[120px] rounded-full pointer-events-none"></div>

        <div className="max-w-7xl mx-auto flex flex-col lg:flex-row items-center gap-16 relative z-10">
          <motion.div 
            initial="hidden" whileInView="visible" viewport={{ once: true }} variants={FADE_UP}
            className="w-full lg:w-1/2 text-white"
          >
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/10 border border-white/20 text-emerald-400 font-semibold text-sm mb-6">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
              AI-Powered Editor
            </div>
            <h2 className="text-4xl md:text-6xl font-black mb-6 leading-tight">Design your garden <br/><span className="text-transparent bg-clip-text bg-gradient-to-r from-emerald-400 to-teal-300">before you dig.</span></h2>
            <p className="text-lg text-slate-300 mb-8 font-light leading-relaxed">
              Upload a photo of your yard, and our AI instantly maps the terrain. Drag and drop premium plants, furniture, and materials into a hyper-realistic 3D space to see exactly how it will look.
            </p>
            <ul className="space-y-4 mb-10">
              {[
                "Instant Terrain Depth Mapping",
                "Thousands of 3D botanical assets",
                "Real-time cost estimation",
                "One-click professional booking"
              ].map((item, i) => (
                <li key={i} className="flex items-center gap-3 text-slate-200 font-medium">
                  <CheckCircleIcon className="text-emerald-400" /> {item}
                </li>
              ))}
            </ul>
            <Link to="/studio" className="inline-flex items-center gap-2 px-8 py-4 bg-emerald-500 hover:bg-emerald-400 text-slate-900 rounded-full font-bold transition-all shadow-lg shadow-emerald-500/20 active:scale-95">
              Launch 3D Studio <ChevronRight size={20} />
            </Link>
          </motion.div>

          <motion.div 
            initial={{ opacity: 0, x: 50 }} whileInView={{ opacity: 1, x: 0 }} viewport={{ once: true }} transition={{ duration: 0.8 }}
            className="w-full lg:w-1/2"
          >
            {/* Mockup Container */}
            <div className="relative rounded-2xl bg-white/5 border border-white/10 p-2 backdrop-blur-md shadow-2xl overflow-hidden">
              <div className="absolute inset-0 bg-gradient-to-tr from-white/5 to-transparent pointer-events-none"></div>
              <img 
                src="https://images.unsplash.com/photo-1584622650111-993a426fbf0a?q=80&w=1200&auto=format&fit=crop" 
                alt="3D Editor Mockup" 
                className="w-full h-auto rounded-xl shadow-inner opacity-90 mix-blend-lighten"
              />
              {/* Floating UI Element */}
              <div className="absolute bottom-6 left-6 bg-white/10 backdrop-blur-xl border border-white/20 p-4 rounded-xl flex items-center gap-4 shadow-2xl">
                <div className="w-12 h-12 rounded-full bg-emerald-500 flex items-center justify-center text-white font-bold">
                  ₱
                </div>
                <div>
                  <p className="text-xs text-slate-300 font-medium">Live Estimate</p>
                  <p className="text-lg font-black text-white">₱12,500</p>
                </div>
              </div>
            </div>
          </motion.div>
        </div>
      </section>

      {/* ─── 4. HOW IT WORKS ─── */}
      <section id="how-it-works" className="py-24 px-6 md:px-12 bg-slate-50">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-emerald-600 font-bold tracking-wider uppercase text-sm mb-3">Process</h2>
            <h3 className="text-4xl font-black text-slate-900">4 Steps to Your Paradise</h3>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-4 gap-8 relative">
            {/* Connecting Line */}
            <div className="hidden md:block absolute top-12 left-[10%] right-[10%] h-0.5 bg-slate-200 -z-10"></div>

            {[
              { step: "01", title: "Upload Photo", desc: "Take a picture of your current outdoor space." },
              { step: "02", title: "Generate 3D", desc: "Our engine maps the depth and terrain automatically." },
              { step: "03", title: "Design", desc: "Drag & drop premium plants and materials." },
              { step: "04", title: "Build", desc: "Save your design or book our pros to install it." }
            ].map((item, i) => (
              <motion.div 
                key={i}
                initial="hidden" whileInView="visible" viewport={{ once: true }} variants={FADE_UP}
                className="relative flex flex-col items-center text-center"
              >
                <div className="w-24 h-24 rounded-full bg-white border-4 border-slate-50 shadow-xl flex items-center justify-center text-2xl font-black text-emerald-600 mb-6 relative z-10">
                  {item.step}
                </div>
                <h4 className="text-xl font-bold text-slate-900 mb-2">{item.title}</h4>
                <p className="text-slate-500 px-4">{item.desc}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ─── 5. PLANT & MATERIAL GALLERY ─── */}
      <section className="py-24 px-6 md:px-12 bg-white">
        <div className="max-w-7xl mx-auto">
          <div className="flex flex-col md:flex-row justify-between items-end mb-12 gap-6">
            <div>
              <h2 className="text-emerald-600 font-bold tracking-wider uppercase text-sm mb-3">Inspiration</h2>
              <h3 className="text-4xl font-black text-slate-900">Premium Materials</h3>
            </div>
            <Link to="/studio" className="font-bold text-emerald-600 hover:text-emerald-700 flex items-center gap-1 transition-colors">
              View full catalog <ArrowRight size={18} />
            </Link>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <GalleryImage src="https://images.unsplash.com/photo-1598902108854-10e335adac99?q=80&w=600&auto=format&fit=crop" label="Monstera Deliciosa" height="h-64 md:h-80" />
            <GalleryImage src="https://images.unsplash.com/photo-1584622781564-1d987f7333c1?q=80&w=600&auto=format&fit=crop" label="Natural Stone" height="h-64 md:h-64 mt-0 md:mt-16" />
            <GalleryImage src="https://images.unsplash.com/photo-1600585154340-be6161a56a0c?q=80&w=600&auto=format&fit=crop" label="Outdoor Lounge" height="h-64 md:h-80" />
            <GalleryImage src="https://images.unsplash.com/photo-1524404987053-ad221800f37c?q=80&w=600&auto=format&fit=crop" label="Tropical Palms" height="h-64 md:h-64 mt-0 md:mt-16" />
          </div>
        </div>
      </section>

      {/* ─── 6. CUSTOMER TESTIMONIALS ─── */}
      <section className="py-24 px-6 md:px-12 bg-emerald-900 text-white overflow-hidden">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-emerald-400 font-bold tracking-wider uppercase text-sm mb-3">Reviews</h2>
            <h3 className="text-4xl font-black">Loved by Homeowners</h3>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {[
              { text: "Being able to see the 3D design before spending any money gave me so much confidence. The installation team executed it perfectly.", name: "Sarah M.", role: "Homeowner" },
              { text: "The app is incredibly fun to use, and the final garden looks exactly like the 3D render. Worth every penny.", name: "David L.", role: "Property Developer" },
              { text: "They transformed my boring backyard into a tropical resort. The plant recommendations were spot on for our climate.", name: "Elena R.", role: "Homeowner" }
            ].map((review, i) => (
              <motion.div 
                key={i}
                initial="hidden" whileInView="visible" viewport={{ once: true }} variants={FADE_UP}
                className="bg-white/10 backdrop-blur-lg border border-white/10 p-8 rounded-3xl relative"
              >
                <Quote className="absolute top-6 right-6 text-emerald-500/30" size={40} />
                <div className="flex gap-1 mb-6">
                  {[...Array(5)].map((_, i) => <Star key={i} size={16} className="fill-emerald-400 text-emerald-400" />)}
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

      {/* ─── 7. STATISTICS / TRUST ─── */}
      <section className="py-20 px-6 md:px-12 bg-white border-b border-slate-100">
        <div className="max-w-7xl mx-auto">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8 divide-x-0 md:divide-x divide-slate-100 text-center">
            {[
              { icon: <ShieldCheck />, num: "500+", label: "Completed Projects" },
              { icon: <Users />, num: "98%", label: "Happy Clients" },
              { icon: <Trees />, num: "1,200+", label: "Plants Available" },
              { icon: <Clock />, num: "15+", label: "Years Experience" }
            ].map((stat, i) => (
              <div key={i} className="flex flex-col items-center p-4">
                <div className="text-emerald-500 mb-4">{stat.icon}</div>
                <h4 className="text-4xl font-black text-slate-900 mb-2">{stat.num}</h4>
                <p className="text-sm font-bold text-slate-500 uppercase tracking-wider">{stat.label}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ─── 8. CALL TO ACTION ─── */}
      <section className="py-24 px-6 md:px-12 relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-emerald-500 to-teal-700 -z-20"></div>
        {/* Abstract shapes */}
        <div className="absolute top-0 right-0 w-full h-full bg-[url('https://www.transparenttextures.com/patterns/cubes.png')] opacity-10 mix-blend-overlay pointer-events-none -z-10"></div>
        
        <div className="max-w-4xl mx-auto text-center text-white relative z-10">
          <h2 className="text-4xl md:text-6xl font-black mb-8 leading-tight">Ready to build your dream garden?</h2>
          <p className="text-xl text-emerald-100 mb-10 font-light max-w-2xl mx-auto">
            Create an account today to access the 3D studio, save your designs, and connect with our expert landscaping team.
          </p>
          <div className="flex flex-col sm:flex-row justify-center gap-4">
            <Link to="/register" className="px-8 py-4 bg-white text-emerald-700 hover:bg-slate-50 rounded-full font-black text-lg transition-all shadow-2xl active:scale-95">
              Create Free Account
            </Link>
            <Link to="/studio" className="px-8 py-4 bg-transparent border border-white/30 hover:bg-white/10 rounded-full font-bold text-lg transition-all active:scale-95">
              Try Studio as Guest
            </Link>
          </div>
        </div>
      </section>

      {/* ─── 9. FOOTER ─── */}
      <footer className="bg-slate-950 text-slate-400 py-16 px-6 md:px-12">
        <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-4 gap-12 mb-12">
          
          {/* Brand */}
          <div className="col-span-1 md:col-span-1">
            <div className="flex items-center gap-2 text-white mb-6">
              <Leaf size={24} className="text-emerald-500" />
              <span className="text-xl font-black tracking-tight">Garden Studio</span>
            </div>
            <p className="text-sm leading-relaxed mb-6">
              Elevating outdoor living spaces with AI technology and premium landscaping craftsmanship.
            </p>
          </div>

          {/* Links */}
          <div>
            <h4 className="text-white font-bold mb-6">Quick Links</h4>
            <ul className="space-y-3 text-sm">
              <li><Link to="/studio" className="hover:text-emerald-400 transition-colors">3D Studio</Link></li>
              <li><a href="#services" className="hover:text-emerald-400 transition-colors">Services</a></li>
              <li><Link to="/login" className="hover:text-emerald-400 transition-colors">Login</Link></li>
              <li><Link to="/register" className="hover:text-emerald-400 transition-colors">Sign Up</Link></li>
            </ul>
          </div>

          {/* Contact */}
          <div>
            <h4 className="text-white font-bold mb-6">Contact Us</h4>
            <ul className="space-y-4 text-sm">
              <li className="flex items-start gap-3">
                <MapPin size={18} className="text-emerald-500 shrink-0 mt-0.5" />
                <span>123 Botanical Way, Green District<br/>Manila, Philippines 1000</span>
              </li>
              <li className="flex items-center gap-3">
                <Phone size={18} className="text-emerald-500 shrink-0" />
                <span>+63 912 345 6789</span>
              </li>
              <li className="flex items-center gap-3">
                <Mail size={18} className="text-emerald-500 shrink-0" />
                <span>hello@gardenstudio.com</span>
              </li>
            </ul>
          </div>

          {/* Newsletter */}
          <div>
            <h4 className="text-white font-bold mb-6">Newsletter</h4>
            <p className="text-sm mb-4">Get seasonal gardening tips and design inspiration.</p>
            <div className="flex">
              <input 
                type="email" 
                placeholder="Your email address" 
                className="bg-slate-900 border border-slate-800 rounded-l-lg px-4 py-2 text-sm w-full focus:outline-none focus:border-emerald-500"
              />
              <button className="bg-emerald-500 hover:bg-emerald-600 text-white px-4 py-2 rounded-r-lg transition-colors">
                <ArrowRight size={18} />
              </button>
            </div>
          </div>

        </div>
        
        {/* Copyright */}
        <div className="max-w-7xl mx-auto pt-8 border-t border-slate-800 text-sm flex flex-col md:flex-row justify-between items-center gap-4">
          <p>© {new Date().getFullYear()} Garden Studio. All rights reserved.</p>
          <div className="flex gap-4">
            <a href="#" className="hover:text-white transition-colors">Privacy Policy</a>
            <a href="#" className="hover:text-white transition-colors">Terms of Service</a>
          </div>
        </div>
      </footer>

    </div>
  );
}

// Mini Component for Gallery
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
    <svg {...props} xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"></path>
      <polyline points="22 4 12 14.01 9 11.01"></polyline>
    </svg>
  );
}
