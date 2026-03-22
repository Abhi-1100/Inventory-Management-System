'use client';

import Link from 'next/link';
import './landing.css';
import Logo from '@/components/shared/Logo';

export default function LandingPage() {
  return (
    <div className="landing-page font-sans text-[#393939] bg-white antialiased">
      {/* ── Header ── */}
      <header className="fixed top-0 w-full z-50 border-b border-[#A4B6C2]/20"
        style={{ background: 'rgba(255,255,255,0.70)', backdropFilter: 'blur(10px)' }}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-20 flex items-center justify-between">
          {/* Logo */}
          <div className="flex items-center gap-2">
            <Logo size={40} className="drop-shadow-lg" />
            <span className="text-2xl font-extrabold tracking-tight text-[#393939]">
              Core<span className="text-[#A4B6C2]">Inventory</span>
            </span>
          </div>

          {/* Nav */}
          <nav className="hidden md:flex items-center space-x-8 text-sm font-medium">
            <a className="hover:text-accent transition-colors" href="#features">Features</a>
            <a className="hover:text-accent transition-colors" href="#showcase">Platform</a>
            <a className="hover:text-accent transition-colors" href="#pricing">Pricing</a>
            <Link
              href="/login"
              className="px-5 py-2.5 bg-accent text-white rounded-lg hover:bg-accent-hover transition-all shadow-md font-semibold"
            >
              Get Started
            </Link>
          </nav>

          {/* Mobile menu icon */}
          <button className="md:hidden text-[#393939]">
            <svg className="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path d="M4 6h16M4 12h16m-7 6h7" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" />
            </svg>
          </button>
        </div>
      </header>

      <main>
        {/* ── Hero ── */}
        <section className="relative pt-32 pb-20 lg:pt-48 lg:pb-32 overflow-hidden bg-white">
          {/* Dimmed background image — exactly like reference design (~8% opacity) */}
          <div className="absolute inset-0 z-0">
            <img
              src="/hero-bg.png"
              alt=""
              aria-hidden="true"
              className="w-full h-full object-cover"
              style={{ opacity: 0.08 }}
            />
            {/* Soft white vignette so edges fade cleanly */}
            <div className="absolute inset-0"
              style={{
                background: 'radial-gradient(ellipse at center, rgba(255,255,255,0) 40%, rgba(255,255,255,0.85) 100%)'
              }}
            />
          </div>

          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10 text-center">
            <h2 className="text-sm font-bold tracking-[0.3em] uppercase text-[#A4B6C2] mb-4 animate-[fadeInUp_0.8s_ease-out_forwards]">
              A Better Way To
            </h2>
            <h1 className="text-6xl md:text-8xl font-black text-[#393939] tracking-tighter mb-8"
              style={{ animation: 'fadeInUp 0.8s ease-out 0.1s forwards', opacity: 0 }}>
              MANAGE
            </h1>
            <p className="max-w-2xl mx-auto text-xl text-[#A4B6C2] mb-10"
              style={{ animation: 'fadeInUp 0.8s ease-out 0.2s forwards', opacity: 0 }}>
              Transform your supply chain with real-time visibility, intelligent automation,
              and enterprise-grade analytics built for modern scale.
            </p>

            <div className="flex flex-col sm:flex-row justify-center gap-4"
              style={{ animation: 'fadeInUp 0.8s ease-out 0.3s forwards', opacity: 0 }}>
              <Link
                href="/login"
                className="px-8 py-4 bg-accent text-white text-lg font-bold rounded-lg hover:scale-105 transition-transform shadow-xl shadow-accent/20 inline-block"
              >
                Get Started Free
              </Link>
              <a href="#showcase"
                className="px-8 py-4 bg-white border border-[#A4B6C2]/30 text-[#393939] text-lg font-bold rounded-lg hover:bg-[#F8F9FA] transition-colors">
                Book a Demo
              </a>
            </div>
          </div>
        </section>

        {/* ── Trusted By ── */}
        <section className="py-12 border-y border-[#A4B6C2]/10 bg-[#F8F9FA]/50">
          <div className="max-w-7xl mx-auto px-4">
            <p className="text-center text-xs font-bold uppercase tracking-widest text-[#A4B6C2]/60 mb-8">
              Trusted by Global Enterprise Leaders
            </p>
            <div className="flex flex-wrap justify-center items-center gap-8 md:gap-16 opacity-50 grayscale">
              {['PROTO HOMES', 'ARC-CORE', 'LOGISYS', 'SUPPLYPRO', 'NEXUS INTL'].map(brand => (
                <div key={brand} className="text-2xl font-bold">{brand}</div>
              ))}
            </div>
          </div>
        </section>

        {/* ── Value Proposition ── */}
        <section className="py-24 bg-white" id="features">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="grid md:grid-cols-3 gap-12">
              {[
                {
                  icon: (
                    <svg className="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" />
                      <path d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" />
                    </svg>
                  ),
                  title: 'Real-time Stock Visibility',
                  desc: 'Monitor every movement and status change across all warehouses with sub-second latency.',
                },
                {
                  icon: (
                    <svg className="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path d="M13 10V3L4 14h7v7l9-11h-7z" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" />
                    </svg>
                  ),
                  title: 'Automated Workflows',
                  desc: 'Eliminate manual entry with AI-driven reorder points and automated supply chain routing.',
                },
                {
                  icon: (
                    <svg className="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" />
                    </svg>
                  ),
                  title: 'Enterprise Analytics',
                  desc: 'Gain actionable insights with high-fidelity dashboards and predictive inventory modeling.',
                },
              ].map(card => (
                <div key={card.title}
                  className="p-8 rounded-lg bg-[#F8F9FA] hover:shadow-xl transition-shadow">
                  <div className="w-12 h-12 bg-white rounded-lg flex items-center justify-center text-accent shadow-sm mb-6">
                    {card.icon}
                  </div>
                  <h3 className="text-xl font-bold mb-4">{card.title}</h3>
                  <p className="text-[#A4B6C2]">{card.desc}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* ── Product Showcase ── */}
        <section className="py-24 bg-[#F8F9FA]" id="showcase">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-16">
              <h2 className="text-4xl font-extrabold text-[#393939] mb-4">Command Your Inventory</h2>
              <p className="text-[#A4B6C2] max-w-2xl mx-auto">
                One unified platform for all your stock items, purchase orders, and multi-warehouse operations.
              </p>
            </div>

            {/* Dashboard mockup */}
            <div className="relative mx-auto max-w-5xl rounded-lg shadow-2xl overflow-hidden border border-[#A4B6C2]/20 bg-white p-2">
              <div className="bg-[#393939]/5 h-6 w-full flex items-center px-4 gap-1.5 mb-2 rounded-t">
                <div className="w-2 h-2 rounded-full bg-red-400" />
                <div className="w-2 h-2 rounded-full bg-yellow-400" />
                <div className="w-2 h-2 rounded-full bg-green-400" />
              </div>
              {/* Visual mockup of dashboard */}
              <div className="bg-[#0d1117] rounded-b p-6 min-h-[320px] flex flex-col gap-4">
                {/* Top bar */}
                <div className="flex justify-between items-center">
                  <div className="h-4 w-32 bg-white/10 rounded" />
                  <div className="flex gap-2">
                    <div className="h-7 w-20 bg-accent/80 rounded" />
                    <div className="h-7 w-20 bg-white/10 rounded" />
                  </div>
                </div>
                {/* Stat cards row */}
                <div className="grid grid-cols-4 gap-3">
                  {['Total SKUs', 'Warehouses', 'Orders Today', 'Low Stock'].map((s, i) => (
                    <div key={s} className="bg-white/5 rounded-lg p-3">
                      <div className="text-xs text-white/40 mb-1">{s}</div>
                      <div className={`text-xl font-bold ${i === 3 ? 'text-red-400' : 'text-white'}`}>
                        {['12,450', '6', '238', '14'][i]}
                      </div>
                    </div>
                  ))}
                </div>
                {/* Chart placeholder */}
                <div className="flex-1 bg-white/5 rounded-lg p-4 flex items-end gap-2">
                  {[40, 65, 50, 80, 70, 90, 60, 75, 85, 95, 70, 88].map((h, i) => (
                    <div key={i} className="flex-1 rounded-sm bg-accent/70"
                      style={{ height: `${h}%` }} />
                  ))}
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* ── Feature Deep Dive ── */}
        <section className="py-24">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-32">
            {/* Deep Dive 1 */}
            <div className="flex flex-col lg:flex-row items-center gap-16">
              <div className="flex-1">
                <h3 className="text-3xl font-bold mb-6">Precision Product Management</h3>
                <p className="text-[#A4B6C2] text-lg leading-relaxed mb-6">
                  Organize your entire catalog with custom attributes, category hierarchies, and rich media.
                  CoreInventory handles millions of SKUs with ease, ensuring data integrity across every touchpoint.
                </p>
                <ul className="space-y-3">
                  {['Global Batch Tracking', 'Serialized Inventory', 'Barcode & RFID Ready'].map(item => (
                    <li key={item} className="flex items-center gap-3 font-medium">
                      <span className="w-5 h-5 bg-accent/10 text-accent rounded-full flex items-center justify-center text-xs">✓</span>
                      {item}
                    </li>
                  ))}
                </ul>
              </div>
              <div className="flex-1 bg-[#F8F9FA] rounded-lg p-8 border border-[#A4B6C2]/10">
                <div className="aspect-video bg-white rounded-lg shadow-inner flex flex-col p-4 gap-3">
                  {[1, 2, 3, 4].map(i => (
                    <div key={i} className="flex items-center gap-3">
                      <div className="w-8 h-8 bg-accent/10 rounded flex items-center justify-center">
                        <div className="w-4 h-4 bg-accent/40 rounded-sm" />
                      </div>
                      <div className="flex-1 h-3 bg-[#F8F9FA] rounded" />
                      <div className="w-12 h-3 bg-[#A4B6C2]/20 rounded" />
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Deep Dive 2 */}
            <div className="flex flex-col lg:flex-row-reverse items-center gap-16">
              <div className="flex-1">
                <h3 className="text-3xl font-bold mb-6">Optimized Operations</h3>
                <p className="text-[#A4B6C2] text-lg leading-relaxed mb-6">
                  From receipts to deliveries, our operations module streamlines the physical movement of goods.
                  Optimize picking routes and automate label generation for peak efficiency.
                </p>
                <div className="grid grid-cols-2 gap-4">
                  <div className="p-4 bg-[#F8F9FA] rounded-lg border-l-4 border-accent">
                    <div className="font-bold text-accent">99.9%</div>
                    <div className="text-xs font-bold uppercase text-[#A4B6C2]">Accuracy Rate</div>
                  </div>
                  <div className="p-4 bg-[#F8F9FA] rounded-lg border-l-4 border-[#A4B6C2]">
                    <div className="font-bold text-[#393939]">-40%</div>
                    <div className="text-xs font-bold uppercase text-[#A4B6C2]">Processing Time</div>
                  </div>
                </div>
              </div>
              <div className="flex-1 bg-[#F8F9FA] rounded-lg p-8 border border-[#A4B6C2]/10">
                <div className="aspect-video bg-white rounded-lg shadow-inner flex items-center justify-center p-6">
                  <div className="w-full flex flex-col gap-3">
                    {[
                      { label: 'Receipts', color: 'bg-green-100', bar: 'bg-green-400', w: '75%' },
                      { label: 'Transfers', color: 'bg-blue-100', bar: 'bg-blue-400', w: '55%' },
                      { label: 'Deliveries', color: 'bg-accent/10', bar: 'bg-accent', w: '90%' },
                    ].map(s => (
                      <div key={s.label} className="flex items-center gap-3">
                        <span className="w-20 text-xs text-[#A4B6C2] font-medium">{s.label}</span>
                        <div className="flex-1 bg-[#F8F9FA] h-4 rounded-full overflow-hidden">
                          <div className={`h-full ${s.bar} rounded-full`} style={{ width: s.w }} />
                        </div>
                        <span className="text-xs font-bold text-[#393939]">{s.w}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* ── Pricing ── */}
        <section className="py-24 bg-[#F8F9FA]" id="pricing">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-16">
              <h2 className="text-4xl font-extrabold text-[#393939] mb-4">Scale at Your Speed</h2>
              <p className="text-[#A4B6C2]">Flexible plans for growing teams and global enterprises.</p>
            </div>

            <div className="grid md:grid-cols-3 gap-8">
              {/* Basic */}
              <div className="bg-white p-10 rounded-lg border border-[#A4B6C2]/10 flex flex-col">
                <h4 className="text-lg font-bold mb-2">Basic</h4>
                <div className="text-4xl font-black mb-6">$199<span className="text-sm font-normal text-[#A4B6C2]">/mo</span></div>
                <ul className="space-y-4 mb-10 flex-grow text-[#A4B6C2]">
                  {['Up to 2 Warehouses', '5,000 SKUs', 'Basic Reporting', 'Standard Support'].map(f => (
                    <li key={f} className="flex items-center gap-2">
                      <span className="text-accent">✓</span> {f}
                    </li>
                  ))}
                </ul>
                <Link
                  href="/login"
                  className="w-full py-3 border border-[#393939] text-center font-bold rounded-lg hover:bg-[#393939] hover:text-white transition-colors block"
                >
                  Start Basic
                </Link>
              </div>

              {/* Pro */}
              <div className="bg-white p-10 rounded-lg border-2 border-accent flex flex-col relative transform scale-105 shadow-2xl">
                <div className="absolute -top-4 left-1/2 -translate-x-1/2 bg-accent text-white px-4 py-1 rounded-full text-xs font-bold uppercase tracking-wider">
                  Most Popular
                </div>
                <h4 className="text-lg font-bold mb-2">Pro</h4>
                <div className="text-4xl font-black mb-6 text-accent">$599<span className="text-sm font-normal text-[#A4B6C2]">/mo</span></div>
                <ul className="space-y-4 mb-10 flex-grow">
                  {['Unlimited Warehouses', '50,000 SKUs', 'Advanced Analytics', 'Priority 24/7 Support', 'API Access'].map(f => (
                    <li key={f} className="flex items-center gap-2 text-[#393939] font-medium">
                      <span className="text-accent">✓</span> {f}
                    </li>
                  ))}
                </ul>
                <Link
                  href="/login"
                  className="w-full py-3 bg-accent text-white text-center font-bold rounded-lg hover:bg-accent-hover transition-colors shadow-lg block"
                >
                  Go Pro Now
                </Link>
              </div>

              {/* Enterprise */}
              <div className="bg-white p-10 rounded-lg border border-[#A4B6C2]/10 flex flex-col">
                <h4 className="text-lg font-bold mb-2">Enterprise</h4>
                <div className="text-4xl font-black mb-6">Custom</div>
                <ul className="space-y-4 mb-10 flex-grow text-[#A4B6C2]">
                  {['Unlimited Everything', 'Custom Integrations', 'Dedicated Account Manager', 'On-site Training'].map(f => (
                    <li key={f} className="flex items-center gap-2">
                      <span className="text-accent">✓</span> {f}
                    </li>
                  ))}
                </ul>
                <Link
                  href="/login"
                  className="w-full py-3 border border-[#393939] text-center font-bold rounded-lg hover:bg-[#393939] hover:text-white transition-colors block"
                >
                  Contact Sales
                </Link>
              </div>
            </div>
          </div>
        </section>

        {/* ── Final CTA ── */}
        <section className="py-24 bg-[#393939] text-white relative overflow-hidden">
          <div className="absolute right-0 bottom-0 opacity-10 pointer-events-none">
            <svg height="400" viewBox="0 0 200 200" width="400">
              <path d="M44.7,-76.4C58.1,-69.2,69.2,-58.1,76.4,-44.7C83.7,-31.3,87.1,-15.7,86.1,-0.6C85.1,14.5,79.7,29,71.2,41.4C62.7,53.8,51.1,64.1,37.8,71.5C24.5,78.9,9.5,83.4,-5.2,84.4C-19.9,85.4,-34.3,82.9,-46.8,75.3C-59.3,67.7,-69.9,55.1,-76.3,40.8C-82.7,26.5,-84.9,10.5,-83.4,-4.8C-81.9,-20.1,-76.7,-34.7,-68.2,-47.4C-59.7,-60.1,-47.9,-70.8,-34.5,-78C-21.1,-85.2,-6.1,-88.9,10.5,-86.1C27.1,-83.3,31.3,-83.6,44.7,-76.4Z"
                fill="#FFFFFF" transform="translate(100 100)" />
            </svg>
          </div>

          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center relative z-10">
            <h2 className="text-4xl md:text-5xl font-black mb-8">Ready to optimize your inventory?</h2>
            <p className="text-[#A4B6C2] text-xl mb-12 max-w-2xl mx-auto">
              Join 500+ global enterprises using CoreInventory to power their supply chain.
            </p>
            <div className="flex flex-col sm:flex-row justify-center gap-4">
              <Link
                href="/login"
                className="px-10 py-5 bg-accent text-white text-xl font-bold rounded-lg hover:bg-accent-hover transition-all inline-block"
              >
                Start Your Free Trial
              </Link>
              <a href="#features"
                className="px-10 py-5 border border-white/30 text-white text-xl font-bold rounded-lg hover:bg-white/10 transition-all">
                Talk to an Expert
              </a>
            </div>
          </div>
        </section>
      </main>

      {/* ── Footer ── */}
      <footer className="bg-white py-16 border-t border-[#A4B6C2]/10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid md:grid-cols-4 gap-12 mb-16">
            {/* Brand */}
            <div className="col-span-1">
              <div className="flex items-center gap-2 mb-6">
                <Logo size={32} />
                <span className="text-xl font-bold tracking-tight text-[#393939]">CoreInventory</span>
              </div>
              <p className="text-[#A4B6C2] text-sm leading-relaxed">
                Leading-edge inventory management for modern enterprises. Built for speed, scale, and accuracy.
              </p>
            </div>

            {/* Platform */}
            <div>
              <h5 className="font-bold mb-6">Platform</h5>
              <ul className="space-y-4 text-sm text-[#A4B6C2]">
                {['Warehouse Management', 'Order Fulfilment', 'API Reference', 'Integrations'].map(l => (
                  <li key={l}><a className="hover:text-accent transition-colors" href="#">{l}</a></li>
                ))}
              </ul>
            </div>

            {/* Company */}
            <div>
              <h5 className="font-bold mb-6">Company</h5>
              <ul className="space-y-4 text-sm text-[#A4B6C2]">
                {['About Us', 'Customers', 'Careers', 'Contact'].map(l => (
                  <li key={l}><a className="hover:text-accent transition-colors" href="#">{l}</a></li>
                ))}
              </ul>
            </div>

            {/* Legal */}
            <div>
              <h5 className="font-bold mb-6">Legal</h5>
              <ul className="space-y-4 text-sm text-[#A4B6C2]">
                {['Privacy Policy', 'Terms of Service', 'Security'].map(l => (
                  <li key={l}><a className="hover:text-accent transition-colors" href="#">{l}</a></li>
                ))}
              </ul>
            </div>
          </div>

          <div className="pt-8 border-t border-[#A4B6C2]/10 flex flex-col md:flex-row justify-between items-center gap-4">
            <p className="text-[#A4B6C2] text-xs">© 2026 CoreInventory. All rights reserved.</p>
            <div className="flex gap-6">
              <a className="text-[#A4B6C2] hover:text-accent transition-colors" href="#">
                <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M24 4.557c-.883.392-1.832.656-2.828.775 1.017-.609 1.798-1.574 2.165-2.724-.951.564-2.005.974-3.127 1.195-.897-.957-2.178-1.555-3.594-1.555-3.179 0-5.515 2.966-4.797 6.045-4.091-.205-7.719-2.165-10.148-5.144-1.29 2.213-.669 5.108 1.523 6.574-.806-.026-1.566-.247-2.229-.616-.054 2.281 1.581 4.415 3.949 4.89-.693.188-1.452.232-2.224.084.626 1.956 2.444 3.379 4.6 3.419-2.07 1.623-4.678 2.348-7.29 2.04 2.179 1.397 4.768 2.212 7.548 2.212 9.142 0 14.307-7.721 13.995-14.646.962-.695 1.797-1.562 2.457-2.549z" />
                </svg>
              </a>
              <a className="text-[#A4B6C2] hover:text-accent transition-colors" href="#">
                <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M19 0h-14c-2.761 0-5 2.239-5 5v14c0 2.761 2.239 5 5 5h14c2.762 0 5-2.239 5-5v-14c0-2.761-2.238-5-5-5zm-11 19h-3v-11h3v11zm-1.5-12.268c-.966 0-1.75-.79-1.75-1.764s.784-1.764 1.75-1.764 1.75.79 1.75 1.764-.783 1.764-1.75 1.764zm13.5 12.268h-3v-5.604c0-3.368-4-3.113-4 0v5.604h-3v-11h3v1.765c1.396-2.586 7-2.777 7 2.476v6.759z" />
                </svg>
              </a>
            </div>
          </div>
        </div>
      </footer>

      {/* ── Keyframes ── */}
      <style>{`
        @keyframes fadeInUp {
          from { opacity: 0; transform: translateY(20px); }
          to   { opacity: 1; transform: translateY(0); }
        }
        .animate-fadeInUp {
          animation: fadeInUp 0.8s ease-out forwards;
        }
        html { scroll-behavior: smooth; }
      `}</style>
    </div>
  );
}
