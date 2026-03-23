import { Flag, Brain, Medal } from 'lucide-react';
import Image from 'next/image';

export default function HomePage() {
  return (
    <>
      <style
        dangerouslySetInnerHTML={{
          __html: `
        .landing-page *, .landing-page *::before, .landing-page *::after { box-sizing: border-box; margin: 0; padding: 0; }
        
        :root {
          --bg: #e0e5ec;
          --text-main: #334155;
          --text-muted: #64748b;
          --accent: #3aa660; 
          --accent-dark: #2d8c55;
          --accent-light: #7de0aa;
          --gold: #eab308;
          
          /* Neumorphism Shadows */
          --shadow-out: 9px 9px 16px rgba(163,177,198,0.6), -9px -9px 16px rgba(255,255,255, 0.7);
          --shadow-out-sm: 5px 5px 10px rgba(163,177,198,0.5), -5px -5px 10px rgba(255,255,255, 0.6);
          --shadow-hover: 12px 12px 20px rgba(163,177,198,0.7), -12px -12px 20px rgba(255,255,255, 0.8);
          --shadow-in: inset 6px 6px 10px 0 rgba(163,177,198, 0.5), inset -6px -6px 10px 0 rgba(255,255,255, 0.6);
          --shadow-in-sm: inset 3px 3px 6px 0 rgba(163,177,198, 0.5), inset -3px -3px 6px 0 rgba(255,255,255, 0.6);
          
          --font-display: 'DM Serif Display', Georgia, serif;
          --font-body: 'DM Sans', system-ui, sans-serif;
          --radius-sm: 10px;
          --radius-md: 16px;
          --radius-lg: 24px;
        }

        html { scroll-behavior: smooth; }

        .landing-page {
          font-family: var(--font-body);
          background: var(--bg);
          color: var(--text-main);
          font-size: 16px;
          line-height: 1.6;
          -webkit-font-smoothing: antialiased;
          min-height: 100vh;
        }

        /* ── ANIMATIONS ───────────────────────────────── */
        @keyframes fadeUp { from { opacity: 0; transform: translateY(24px); } to { opacity: 1; transform: translateY(0); } }
        @keyframes float { 0%, 100% { transform: translateY(0px); } 50% { transform: translateY(-6px); } }

        .animate-fade-up { animation: fadeUp 0.7s ease both; }
        .delay-1 { animation-delay: 0.1s; }
        .delay-2 { animation-delay: 0.2s; }
        .delay-3 { animation-delay: 0.3s; }
        .delay-4 { animation-delay: 0.4s; }

        /* ── NAVBAR ───────────────────────────────────── */
        .nav { 
          position: sticky; top: 0; z-index: 100; 
          background: var(--bg); 
          box-shadow: var(--shadow-out-sm);
          display: flex; align-items: center; justify-content: space-between; 
          padding: 0 40px; height: 72px; 
          border-radius: 0 0 var(--radius-lg) var(--radius-lg);
          margin-bottom: 20px;
        }
        .nav-logo { display: flex; align-items: center; gap: 12px; text-decoration: none; }
        .nav-logo-mark { 
          width: 58px; height: 58px; 
          background: var(--bg); 
          // border-radius: 50%; 
          // box-shadow: var(--shadow-out-sm);
          display: flex; align-items: center; justify-content: center; flex-shrink: 0; 
        }
        .nav-logo-text { font-family: var(--font-display); font-size: 22px; color: var(--text-main); }
        .nav-links { display: flex; align-items: center; gap: 32px; list-style: none; }
        .nav-links a { font-size: 15px; font-weight: 500; color: var(--text-muted); text-decoration: none; transition: color 0.2s; }
        .nav-links a:hover { color: var(--accent); }
        .nav-actions { display: flex; align-items: center; gap: 16px; }

        /* Neumorphic Buttons */
        .btn { 
          font-family: var(--font-body); font-size: 15px; font-weight: 600; 
          border-radius: var(--radius-sm); cursor: pointer; text-decoration: none; 
          display: inline-flex; align-items: center; justify-content: center; gap: 8px;
          border: none; outline: none; transition: all 0.2s ease;
          background: var(--bg); color: var(--text-main);
          box-shadow: var(--shadow-out);
        }
        .btn:hover { box-shadow: var(--shadow-hover); transform: translateY(-1px); color: var(--accent); }
        .btn:active { box-shadow: var(--shadow-in); transform: translateY(1px); }
        
        .btn-ghost { padding: 10px 20px; box-shadow: var(--shadow-out-sm); }
        .btn-primary { padding: 12px 24px; color: var(--accent-dark); }
        .btn-large { padding: 16px 32px; font-size: 16px; border-radius: var(--radius-md); }
        .btn-xl { padding: 18px 40px; font-size: 18px; border-radius: var(--radius-md); }

        /* ── HERO ─────────────────────────────────────── */
        /* ── HERO ─────────────────────────────────────── */
        .hero { 
          display: grid; 
          grid-template-columns: 1fr 1fr; 
          min-height: calc(100vh - 92px); 
          gap: 40px; 
          padding: 40px; 
          position: relative;
          overflow: hidden;
        }
        .hero::before {
          content: '';
          position: absolute;
          bottom: 0;
          left: 0;
          right: 0;
          height: 60%;
          background: url('/images/pitch.png') no-repeat bottom center;
          background-size: cover;
          opacity: 0.15;
          z-index: 0;
          mask-image: linear-gradient(to top, black 20%, transparent 100%);
          -webkit-mask-image: linear-gradient(to top, black 20%, transparent 100%);
        }
        .hero > * { position: relative; z-index: 1; }
        .hero-left { padding: 40px 0; display: flex; flex-direction: column; justify-content: center; }
        .badge { 
          display: inline-flex; align-items: center; gap: 8px; 
          background: var(--bg); box-shadow: var(--shadow-in-sm);
          border-radius: 100px; padding: 6px 16px; 
          font-size: 13px; color: var(--accent-dark); font-weight: 600; 
          width: fit-content; margin-bottom: 28px; 
        }
        .badge-dot { width: 8px; height: 8px; border-radius: 50%; background: var(--accent); box-shadow: 0 0 8px var(--accent); }
        .hero-h1 { font-family: var(--font-display); font-size: clamp(42px, 5vw, 64px); line-height: 1.1; letter-spacing: -1px; color: var(--text-main); margin-bottom: 20px; text-shadow: 2px 2px 4px rgba(163,177,198,0.3); }
        .hero-h1 em { font-style: italic; color: var(--accent-dark); }
        .hero-sub { font-size: 18px; color: var(--text-muted); line-height: 1.6; max-width: 440px; margin-bottom: 40px; }
        .hero-actions { display: flex; align-items: center; gap: 20px; flex-wrap: wrap; margin-bottom: 40px; }
        
        .trust-row { display: flex; align-items: center; gap: 16px; }
        .avatars { display: flex; }
        .av { 
          width: 36px; height: 36px; border-radius: 50%; 
          background: var(--bg); box-shadow: var(--shadow-out-sm);
          display: flex; align-items: center; justify-content: center; 
          font-size: 11px; font-weight: 600; color: var(--text-muted);
          margin-left: -10px; flex-shrink: 0; border: 2px solid var(--bg);
        }
        .av:first-child { margin-left: 0; }
        .trust-text { font-size: 14px; color: var(--text-muted); }
        .trust-text strong { color: var(--text-main); font-weight: 600; }

        .hero-right { 
          // background: var(--bg); 
          // border-radius: var(--radius-lg); 
          // box-shadow: var(--shadow-in);
          // padding: 50px; display: flex; flex-direction: column; justify-content: center; gap: 24px; position: relative; 
        }
        
        /* Neumorphic Cards */
        .neu-card { 
          background: var(--bg); 
          border-radius: var(--radius-md); 
          box-shadow: var(--shadow-out);
          padding: 24px; position: relative; z-index: 1; 
          animation: float 6s ease-in-out infinite; 
        }
        .neu-card:nth-child(2) { animation-delay: -2s; }
        .neu-card:nth-child(3) { animation-delay: -4s; }

        .card-label { font-size: 12px; letter-spacing: 1px; text-transform: uppercase; color: var(--accent-dark); margin-bottom: 12px; font-weight: 600; }
        .card-value { font-family: var(--font-display); font-size: 38px; color: var(--text-main); line-height: 1; margin-bottom: 8px; text-shadow: 1px 1px 2px rgba(255,255,255,0.8); }
        .card-sub { font-size: 13px; color: var(--text-muted); }
        
        .score-pills { display: flex; gap: 10px; margin-top: 14px; flex-wrap: wrap; }
        .score-pill { 
          background: var(--bg); box-shadow: var(--shadow-out-sm);
          border-radius: 100px; padding: 6px 16px; font-size: 14px; font-weight: 600; color: var(--text-muted); 
        }
        .score-pill.hot { box-shadow: var(--shadow-in-sm); color: var(--accent-dark); }
        
        .charity-bar-wrap { margin-top: 16px; }
        .charity-bar-row { display: flex; align-items: center; justify-content: space-between; margin-bottom: 12px; }
        .charity-name { font-size: 15px; font-weight: 500; color: var(--text-main); }
        .charity-pct { font-size: 15px; color: var(--gold); font-weight: 700; }
        .bar-track { height: 10px; background: var(--bg); box-shadow: var(--shadow-in-sm); border-radius: 5px; overflow: hidden; }
        .bar-fill { height: 100%; background: var(--accent); box-shadow: 2px 0 5px rgba(0,0,0,0.1); border-radius: 5px; transition: width 1s ease; }
        .bar-note { font-size: 12px; color: var(--text-muted); margin-top: 10px; }

        /* ── STATS BAR ────────────────────────────────── */
        .stats-bar { 
          display: grid; grid-template-columns: repeat(4, 1fr); 
          margin: 0 40px 60px; padding: 40px 0;
          background: var(--bg); box-shadow: var(--shadow-out); border-radius: var(--radius-lg);
        }
        .stat-cell { text-align: center; position: relative; }
        .stat-cell:not(:last-child)::after {
          content: ''; position: absolute; right: 0; top: 10%; height: 80%; width: 2px;
          background: var(--bg); box-shadow: var(--shadow-in-sm);
        }
        .stat-n { font-family: var(--font-display); font-size: 42px; color: var(--accent-dark); line-height: 1; margin-bottom: 8px; text-shadow: 1px 1px 2px rgba(255,255,255,0.8); }
        .stat-l { font-size: 14px; font-weight: 500; color: var(--text-muted); }

        /* ── HOW IT WORKS ─────────────────────────────── */
        .section { padding: 80px 40px; }
        .section-tag { font-size: 12px; letter-spacing: 1.5px; text-transform: uppercase; font-weight: 600; color: var(--accent-dark); margin-bottom: 16px; }
        .section-h2 { font-family: var(--font-display); font-size: clamp(32px, 3.5vw, 44px); color: var(--text-main); margin-bottom: 12px; line-height: 1.1; }
        .section-sub { font-size: 16px; color: var(--text-muted); max-width: 600px; line-height: 1.6; margin-bottom: 60px; }

        .steps { display: grid; grid-template-columns: repeat(4, 1fr); gap: 30px; }
        .step { 
          background: var(--bg); box-shadow: var(--shadow-out); 
          padding: 32px 24px; border-radius: var(--radius-md); 
          text-align: center; transition: transform 0.2s;
        }
        .step:hover { transform: translateY(-4px); box-shadow: var(--shadow-hover); }
        .step-num { 
          width: 50px; height: 50px; margin: 0 auto 20px;
          border-radius: 50%; background: var(--bg); box-shadow: var(--shadow-out-sm);
          display: flex; align-items: center; justify-content: center; 
          font-family: var(--font-display); font-size: 20px; color: var(--accent-dark); 
        }
        .step h3 { font-size: 17px; font-weight: 600; margin-bottom: 12px; color: var(--text-main); }
        .step p { font-size: 14px; color: var(--text-muted); line-height: 1.6; }

        /* ── FEATURES ─────────────────────────────────── */
        .features { 
          display: grid; grid-template-columns: repeat(3, 1fr); gap: 30px; 
          margin: 0 40px 80px;
        }
        .feature-card { 
          background: var(--bg); box-shadow: var(--shadow-in); 
          padding: 40px 32px; border-radius: var(--radius-lg); 
        }
        .feature-icon { 
          width: 56px; height: 56px; border-radius: var(--radius-round); 
          background: var(--bg); box-shadow: var(--shadow-out);
          display: flex; align-items: center; justify-content: center; margin-bottom: 24px; 
        }
        .feature-card h3 { font-size: 18px; font-weight: 600; margin-bottom: 12px; color: var(--text-main); }
        .feature-card p { font-size: 15px; color: var(--text-muted); line-height: 1.6; }

        /* ── DRAW BREAKDOWN ───────────────────────────── */
        .draw-section { padding: 80px 40px; display: grid; grid-template-columns: 1fr 1fr; gap: 80px; align-items: center; }
        .prize-tiers { display: flex; flex-direction: column; gap: 20px; margin-top: 40px; }
        .prize-tier { 
          display: flex; align-items: center; gap: 20px; padding: 20px 24px; 
          background: var(--bg); box-shadow: var(--shadow-out); border-radius: var(--radius-md); 
        }
        .tier-badge { 
          font-family: var(--font-display); font-size: 22px; color: var(--text-main);
          width: 54px; height: 54px; border-radius: 50%; 
          background: var(--bg); box-shadow: var(--shadow-in-sm);
          display: flex; align-items: center; justify-content: center; flex-shrink: 0; 
        }
        .tier-badge.gold { color: var(--gold); }
        .tier-badge.silver { color: #94a3b8; }
        .tier-badge.bronze { color: #b45309; }
        .tier-info { flex: 1; }
        .tier-name { font-size: 16px; font-weight: 600; color: var(--text-main); margin-bottom: 4px; }
        .tier-desc { font-size: 13px; color: var(--text-muted); }
        .tier-pct { font-family: var(--font-display); font-size: 28px; color: var(--accent-dark); }
        
        .draw-right { }
        .draw-pool-card { 
          background: var(--bg); box-shadow: var(--shadow-out);
          border-radius: var(--radius-lg); padding: 40px; margin-bottom: 30px; text-align: center;
        }
        .pool-label { font-size: 14px; color: var(--text-muted); letter-spacing: 1px; text-transform: uppercase; font-weight: 600; margin-bottom: 12px; }
        .pool-amount { font-family: var(--font-display); font-size: 64px; color: var(--accent-dark); margin-bottom: 8px; line-height: 1; text-shadow: 2px 2px 4px rgba(163,177,198,0.4); }
        .pool-note { font-size: 14px; color: var(--text-muted); }
        
        .draw-detail-cards { display: grid; grid-template-columns: 1fr 1fr; gap: 20px; }
        .detail-card { 
          background: var(--bg); box-shadow: var(--shadow-in-sm); 
          border-radius: var(--radius-md); padding: 24px; text-align: center;
        }
        .detail-card-label { font-size: 12px; color: var(--text-muted); margin-bottom: 8px; text-transform: uppercase; letter-spacing: 0.5px; font-weight: 600; }
        .detail-card-value { font-size: 16px; font-weight: 600; color: var(--text-main); }

        /* ── PRICING ──────────────────────────────────── */
        .pricing-section { padding: 100px 40px; }
        .pricing-header { text-align: center; margin-bottom: 60px; }
        .plans-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 40px; max-width: 800px; margin: 0 auto; }
        .plan-card { 
          position: relative;
          background: var(--bg); box-shadow: var(--shadow-out); 
          border-radius: var(--radius-lg); padding: 40px; 
        }
        .plan-card.featured { box-shadow: var(--shadow-in), 0 0 0 2px var(--accent-light); }
        .plan-badge { 
          position: absolute;
          top: 0; right: 0;
          transform: translate(12px, -12px);
          background: linear-gradient(135deg, var(--accent-dark), var(--accent));
          color: white; font-size: 11px; font-weight: 700; 
          padding: 6px 16px; border-radius: 100px; 
          text-transform: uppercase; letter-spacing: 0.5px;
          box-shadow: 4px 4px 10px rgba(10,50,20,0.25);
          z-index: 10;
        }
        .plan-name { font-size: 15px; font-weight: 600; color: var(--text-muted); margin-bottom: 8px; text-transform: uppercase; letter-spacing: 1px; }
        .plan-price { font-family: var(--font-display); font-size: 52px; color: var(--text-main); line-height: 1; margin-bottom: 8px; }
        .plan-price sup { font-size: 24px; vertical-align: super; }
        .plan-price sub { font-family: var(--font-body); font-size: 16px; color: var(--text-muted); font-weight: 500; }
        .plan-desc { font-size: 14px; color: var(--text-muted); margin-bottom: 32px; }
        
        .plan-btn { width: 100%; margin-bottom: 32px; }
        .plan-features { display: flex; flex-direction: column; gap: 16px; }
        .plan-feat { display: flex; align-items: flex-start; gap: 12px; font-size: 14px; color: var(--text-main); font-weight: 500; }
        .feat-check { 
          width: 20px; height: 20px; border-radius: 50%; 
          background: var(--bg); box-shadow: var(--shadow-out-sm); 
          display: flex; align-items: center; justify-content: center; flex-shrink: 0; margin-top: 2px; color: var(--accent);
        }

        /* ── CHARITIES ────────────────────────────────── */
        .charity-grid { display: grid; grid-template-columns: repeat(3, 1fr); gap: 30px; margin-top: 40px; }
        .charity-card { 
          background: var(--bg); box-shadow: var(--shadow-out); 
          border-radius: var(--radius-md); padding: 30px; text-align: center;
        }
        .charity-logo { 
          width: 60px; height: 60px; border-radius: 50%; 
          background: var(--bg); box-shadow: var(--shadow-in-sm); 
          display: flex; align-items: center; justify-content: center; font-size: 28px; margin: 0 auto 20px; 
        }
        .charity-cname { font-size: 16px; font-weight: 600; color: var(--text-main); margin-bottom: 4px; }
        .charity-cat { font-size: 13px; color: var(--text-muted); margin-bottom: 20px; }
        .charity-bar-bg { height: 8px; background: var(--bg); box-shadow: var(--shadow-in-sm); border-radius: 4px; margin-bottom: 12px; overflow: hidden; }
        .charity-bar-fill { height: 100%; background: var(--accent); border-radius: 4px; }
        .charity-support { font-size: 12px; font-weight: 500; color: var(--text-muted); }

        /* ── TESTIMONIALS ─────────────────────────────── */
        .testimonials { padding: 80px 40px; }
        .testimonial-grid { display: grid; grid-template-columns: repeat(3, 1fr); gap: 30px; margin-top: 40px; }
        .testimonial-card { 
          background: var(--bg); box-shadow: var(--shadow-in); 
          border-radius: var(--radius-lg); padding: 32px; 
        }
        .testimonial-stars { color: var(--gold); font-size: 15px; margin-bottom: 16px; letter-spacing: 2px; text-shadow: 1px 1px 2px rgba(0,0,0,0.1); }
        .testimonial-text { font-size: 15px; color: var(--text-main); line-height: 1.6; margin-bottom: 24px; font-style: italic; }
        .testimonial-author { display: flex; align-items: center; gap: 12px; }
        .t-av { 
          width: 44px; height: 44px; border-radius: 50%; 
          background: var(--bg); box-shadow: var(--shadow-out-sm); 
          display: flex; align-items: center; justify-content: center; font-size: 14px; font-weight: 600; color: var(--accent-dark); 
        }
        .t-name { font-size: 15px; font-weight: 600; color: var(--text-main); }
        .t-role { font-size: 12px; color: var(--text-muted); }

        /* ── CTA ──────────────────────────────────────── */
        .cta-section { padding: 100px 40px; text-align: center; }
        .cta-wrapper {
          background: var(--bg); box-shadow: var(--shadow-out); border-radius: var(--radius-xl);
          padding: 80px 40px; max-width: 900px; margin: 0 auto;
        }
        .cta-eyebrow { font-size: 13px; letter-spacing: 1.5px; text-transform: uppercase; color: var(--accent-dark); margin-bottom: 20px; font-weight: 600; }
        .cta-h2 { font-family: var(--font-display); font-size: clamp(36px, 4vw, 52px); color: var(--text-main); letter-spacing: -1px; margin-bottom: 20px; line-height: 1.1; text-shadow: 2px 2px 4px rgba(163,177,198,0.3); }
        .cta-sub { font-size: 18px; color: var(--text-muted); max-width: 500px; margin: 0 auto 40px; line-height: 1.6; }
        .cta-actions { display: flex; align-items: center; justify-content: center; gap: 20px; }
        .cta-note { font-size: 13px; font-weight: 500; color: var(--text-muted); margin-top: 24px; }

        /* ── FOOTER ───────────────────────────────────── */
        footer { padding: 60px 40px; margin-top: 40px; }
        .footer-inner {
          background: var(--bg); box-shadow: var(--shadow-in); border-radius: var(--radius-lg);
        }
        .footer-top { display: grid; grid-template-columns: 1.5fr 1fr 1fr 1fr; gap: 40px; padding: 50px 40px; }
        .footer-brand p { font-size: 14px; color: var(--text-muted); margin-top: 16px; line-height: 1.6; max-width: 260px; }
        .footer-col h4 { font-size: 14px; font-weight: 600; letter-spacing: 0.5px; color: var(--text-main); margin-bottom: 20px; text-transform: uppercase; }
        .footer-col ul { list-style: none; display: flex; flex-direction: column; gap: 12px; }
        .footer-col a { font-size: 14px; color: var(--text-muted); text-decoration: none; font-weight: 500; transition: color 0.2s; }
        .footer-col a:hover { color: var(--accent); }
        .footer-bottom { 
          display: flex; align-items: center; justify-content: space-between; 
          padding: 24px 40px; border-top: 2px solid var(--bg); box-shadow: 0 -2px 5px rgba(255,255,255,0.4); 
        }
        .footer-copy { font-size: 13px; font-weight: 500; color: var(--text-muted); }
        .footer-legal { display: flex; gap: 24px; }
        .footer-legal a { font-size: 13px; font-weight: 500; color: var(--text-muted); text-decoration: none; transition: color 0.2s; }
        .footer-legal a:hover { color: var(--accent); }

        /* ── MOBILE ───────────────────────────────────── */
        @media (max-width: 900px) {
          .nav { padding: 0 20px; height: 64px; }
          .nav-links { display: none; }
          .hero { grid-template-columns: 1fr; gap: 30px; padding: 20px; }
          .hero-left { padding: 20px 0; }
          .hero-right { padding: 30px; }
          .stats-bar { grid-template-columns: 1fr 1fr; margin: 0 20px 40px; gap: 20px; box-shadow: var(--shadow-in); background: transparent; padding: 20px; }
          .stat-cell { background: var(--bg); box-shadow: var(--shadow-out-sm); padding: 20px; border-radius: var(--radius-md); }
          .stat-cell:not(:last-child)::after { display: none; }
          .section { padding: 60px 20px; }
          .steps { grid-template-columns: 1fr; gap: 20px; }
          .features { grid-template-columns: 1fr; gap: 20px; margin: 0 20px 60px; }
          .draw-section { grid-template-columns: 1fr; gap: 40px; padding: 60px 20px; }
          .plans-grid { grid-template-columns: 1fr; gap: 30px; }
          .charity-grid { grid-template-columns: 1fr 1fr; gap: 20px; }
          .testimonial-grid { grid-template-columns: 1fr; gap: 20px; }
          .pricing-section { padding: 60px 20px; }
          .cta-section { padding: 60px 20px; }
          .cta-wrapper { padding: 40px 20px; }
          .footer-top { grid-template-columns: 1fr 1fr; gap: 40px; padding: 40px 20px; }
          .footer-brand { grid-column: 1 / -1; }
          .footer-bottom { flex-direction: column; gap: 16px; padding: 20px; text-align: center; }
        }
        @media (max-width: 560px) {
          .hero-h1 { font-size: 38px; }
          .charity-grid { grid-template-columns: 1fr; }
          .draw-detail-cards { grid-template-columns: 1fr; }
          .cta-actions { flex-direction: column; width: 100%; }
          .cta-actions .btn { width: 100%; }
          .footer-top { grid-template-columns: 1fr; }
        }
      `,
        }}
      />

      <div className="landing-page">
        <nav className="nav">
          <a href="#" className="nav-logo">
            <div className="nav-logo-mark" style={{ overflow: 'hidden' }}>
              <Image
                src="/images/GolfDraw.png"
                alt="GolfDraw"
                width={58}
                height={58}
                style={{ width: '100%', height: '100%', objectFit: 'cover' }}
              />
            </div>
            <span className="nav-logo-text">GolfDraw</span>
          </a>
          <ul className="nav-links">
            <li>
              <a href="#how-it-works">How it works</a>
            </li>
            <li>
              <a href="#prizes">Prizes</a>
            </li>
            <li>
              <a href="#charities">Charities</a>
            </li>
            <li>
              <a href="#pricing">Pricing</a>
            </li>
          </ul>
          <div className="nav-actions">
            <a href="/login" className="btn btn-ghost">
              Sign in
            </a>
            <a href="/login" className="btn btn-primary">
              Get started
            </a>
          </div>
        </nav>

        <section className="hero">
          <div className="hero-left">
            <div className="badge animate-fade-up">
              <div className="badge-dot"></div>
              Monthly draw live — ₹40,000 jackpot
            </div>
            <h1 className="hero-h1 animate-fade-up delay-1">
              Golf scores.
              <br />
              <em>Real prizes.</em>
              <br />
              Good causes.
            </h1>
            <p className="hero-sub animate-fade-up delay-2">
              Track your golf scores, enter monthly prize draws, and
              automatically contribute to a charity you believe in — all with
              one subscription.
            </p>
            <div className="hero-actions animate-fade-up delay-3">
              <a href="/login" className="btn btn-primary btn-large">
                Start playing — ₹100/mo
              </a>
              <a href="#how-it-works" className="btn btn-ghost btn-large">
                See how it works
              </a>
            </div>
            <div className="trust-row animate-fade-up delay-4">
              <div className="avatars">
                <div className="av">JM</div>
                <div className="av">KR</div>
                <div className="av">AP</div>
                <div className="av">DL</div>
                <div className="av">SW</div>
              </div>
              <span className="trust-text">
                <strong>2,400+</strong> golfers already playing
              </span>
            </div>
          </div>

          <div className="hero-right">
            <Image
              src="/images/Golf.png"
              alt="GolfDraw"
              width={600}
              height={400}
              priority
              style={{ width: '100%', height: 'auto' }}
            />
          </div>
        </section>

        <div className="stats-bar">
          <div className="stat-cell animate-fade-up delay-1">
            <div className="stat-n">₹8.4L</div>
            <div className="stat-l">Total prizes awarded</div>
          </div>
          <div className="stat-cell animate-fade-up delay-2">
            <div className="stat-n">₹1.2L</div>
            <div className="stat-l">Donated to charities</div>
          </div>
          <div className="stat-cell animate-fade-up delay-3">
            <div className="stat-n">2,400+</div>
            <div className="stat-l">Active golfers</div>
          </div>
          <div className="stat-cell animate-fade-up delay-4">
            <div className="stat-n">36</div>
            <div className="stat-l">Charity partners</div>
          </div>
        </div>

        <section className="section" id="how-it-works">
          <div className="section-tag">How it works</div>
          <h2 className="section-h2">Four steps to your first draw</h2>
          <p className="section-sub">
            No complicated rules. Subscribe, play golf, and we handle the rest —
            draws run automatically every month.
          </p>
          <div className="steps">
            <div className="step">
              <div className="step-num">1</div>
              <h3>Subscribe</h3>
              <p>
                Choose a monthly or yearly plan. Your subscription funds the
                monthly prize pool and contributes to your chosen charity —
                automatically.
              </p>
            </div>
            <div className="step">
              <div className="step-num">2</div>
              <h3>Track your scores</h3>
              <p>
                Submit your score after each round (1–45). We keep your last 5 —
                newest scores replace the oldest automatically. No manual
                management needed.
              </p>
            </div>
            <div className="step">
              <div className="step-num">3</div>
              <h3>Enter the draw</h3>
              <p>
                Active subscribers are entered every month automatically. A draw
                number is matched against your scores — 3, 4, or 5 matches wins
                a prize.
              </p>
            </div>
            <div className="step">
              <div className="step-num">4</div>
              <h3>Win & give back</h3>
              <p>
                Winners upload a score screenshot for verification, then receive
                their prize. Your charity gets its share every single month
                regardless.
              </p>
            </div>
          </div>
        </section>

        <section className="features">
          <div className="feature-card">
            <div className="feature-icon">
              <svg width="24" height="24" viewBox="0 0 22 22" fill="none">
                <circle
                  cx="11"
                  cy="11"
                  r="5"
                  stroke="var(--accent)"
                  strokeWidth="1.5"
                />
                <path
                  d="M11 3.5v2M11 16.5v2M3.5 11h2M16.5 11h2"
                  stroke="var(--accent)"
                  strokeWidth="1.5"
                  strokeLinecap="round"
                />
              </svg>
            </div>
            <h3>Rolling 5-score window</h3>
            <p>
              Only your most recent 5 scores count toward each draw. Play more
              rounds and your window naturally improves — older rounds roll off
              automatically with zero admin on your part.
            </p>
          </div>
          <div className="feature-card">
            <div className="feature-icon">
              <svg width="24" height="24" viewBox="0 0 22 22" fill="none">
                <path
                  d="M4 18 L11 4 L18 18"
                  stroke="#534AB7"
                  strokeWidth="1.5"
                  strokeLinejoin="round"
                  fill="none"
                />
                <path
                  d="M7 13h8"
                  stroke="#534AB7"
                  strokeWidth="1.5"
                  strokeLinecap="round"
                />
              </svg>
            </div>
            <h3>Jackpot rollover</h3>
            <p>
              No 5-match winner in a month? The jackpot carries forward and
              compounds into the next pool. It keeps growing until someone hits
              the magic number — making each draw more exciting than the last.
            </p>
          </div>
          <div className="feature-card">
            <div className="feature-icon">
              <svg width="24" height="24" viewBox="0 0 22 22" fill="none">
                <path
                  d="M11 3L13.5 9H19.5L14.5 13L16.5 19L11 15.5L5.5 19L7.5 13L2.5 9H8.5Z"
                  fill="#854F0B"
                  opacity="0.85"
                />
              </svg>
            </div>
            <h3>Verified winners only</h3>
            <p>
              Every winner uploads a screenshot of their official scorecard. Our
              admin team reviews and approves before any payment is released —
              completely transparent and fair for all players.
            </p>
          </div>
        </section>

        <section className="draw-section" id="prizes">
          <div>
            <div className="section-tag">Prize structure</div>
            <h2 className="section-h2">How the pool is split</h2>
            <p
              style={{
                fontSize: '16px',
                color: 'var(--text-muted)',
                lineHeight: '1.6',
                marginBottom: '8px',
              }}
            >
              Every subscription contributes to the monthly prize pool,
              distributed across three match tiers.
            </p>
            <div className="prize-tiers">
              <div className="prize-tier">
                <div className="tier-badge gold">5</div>
                <div className="tier-info">
                  <div className="tier-name">5-match jackpot</div>
                  <div className="tier-desc">Rollover enabled if no winner</div>
                </div>
                <div className="tier-pct">40%</div>
              </div>
              <div className="prize-tier">
                <div className="tier-badge silver">4</div>
                <div className="tier-info">
                  <div className="tier-name">4-match prize</div>
                  <div className="tier-desc">
                    Split equally among all 4-match winners
                  </div>
                </div>
                <div className="tier-pct">35%</div>
              </div>
              <div className="prize-tier">
                <div className="tier-badge bronze">3</div>
                <div className="tier-info">
                  <div className="tier-name">3-match prize</div>
                  <div className="tier-desc">
                    Split equally among all 3-match winners
                  </div>
                </div>
                <div className="tier-pct">25%</div>
              </div>
            </div>
          </div>
          <div className="draw-right">
            <div className="draw-pool-card">
              <div className="pool-label">Current jackpot pool</div>
              <div className="pool-amount">₹40,000</div>
              <div className="pool-note">Including last month's rollover</div>
            </div>
            <div className="draw-detail-cards">
              <div className="detail-card">
                <div className="detail-card-label">Draw mode</div>
                <div className="detail-card-value">Algorithms</div>
              </div>
              <div className="detail-card">
                <div className="detail-card-label">Draw date</div>
                <div className="detail-card-value">1st of each month</div>
              </div>
              <div className="detail-card">
                <div className="detail-card-label">Number range</div>
                <div className="detail-card-value">1 – 45</div>
              </div>
              <div className="detail-card">
                <div className="detail-card-label">Charity cut</div>
                <div className="detail-card-value">Min. 10%</div>
              </div>
            </div>
          </div>
        </section>

        <section className="pricing-section" id="pricing">
          <div className="pricing-header">
            <div className="section-tag">Pricing</div>
            <h2 className="section-h2">Simple, transparent plans</h2>
            <p style={{ fontSize: '16px', color: 'var(--text-muted)' }}>
              No hidden fees. Cancel anytime.
            </p>
          </div>
          <div className="plans-grid">
            <div className="plan-card">
              <div className="plan-name">Monthly</div>
              <div className="plan-price">
                <sup>₹</sup>100<sub> / month</sub>
              </div>
              <div className="plan-desc">Billed monthly. Cancel anytime.</div>
              <a href="/login" className="btn btn-ghost plan-btn">
                Get started
              </a>
              <div className="plan-features">
                <div className="plan-feat">
                  <div className="feat-check">
                    <svg width="10" height="8" viewBox="0 0 8 6" fill="none">
                      <path
                        d="M1 3l2 2 4-4"
                        stroke="currentColor"
                        strokeWidth="2"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      />
                    </svg>
                  </div>
                  Monthly prize draw entry
                </div>
                <div className="plan-feat">
                  <div className="feat-check">
                    <svg width="10" height="8" viewBox="0 0 8 6" fill="none">
                      <path
                        d="M1 3l2 2 4-4"
                        stroke="currentColor"
                        strokeWidth="2"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      />
                    </svg>
                  </div>
                  Score tracking (rolling 5)
                </div>
                <div className="plan-feat">
                  <div className="feat-check">
                    <svg width="10" height="8" viewBox="0 0 8 6" fill="none">
                      <path
                        d="M1 3l2 2 4-4"
                        stroke="currentColor"
                        strokeWidth="2"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      />
                    </svg>
                  </div>
                  Minimum 10% to charity
                </div>
              </div>
            </div>
            <div className="plan-card featured">
              <div className="plan-badge">Best value — save ₹200+</div>
              <div className="plan-name">Yearly</div>
              <div className="plan-price">
                <sup>₹</sup>999<sub> / year</sub>
              </div>
              <div className="plan-desc">
                That's ₹83.25/mo · billed annually.
              </div>
              <a href="/login" className="btn btn-primary plan-btn">
                Get started
              </a>
              <div className="plan-features">
                <div className="plan-feat">
                  <div className="feat-check">
                    <svg width="10" height="8" viewBox="0 0 8 6" fill="none">
                      <path
                        d="M1 3l2 2 4-4"
                        stroke="currentColor"
                        strokeWidth="2"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      />
                    </svg>
                  </div>
                  Everything in monthly
                </div>
                <div className="plan-feat">
                  <div className="feat-check">
                    <svg width="10" height="8" viewBox="0 0 8 6" fill="none">
                      <path
                        d="M1 3l2 2 4-4"
                        stroke="currentColor"
                        strokeWidth="2"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      />
                    </svg>
                  </div>
                  12 draws for the price of 10
                </div>
                <div className="plan-feat">
                  <div className="feat-check">
                    <svg width="10" height="8" viewBox="0 0 8 6" fill="none">
                      <path
                        d="M1 3l2 2 4-4"
                        stroke="currentColor"
                        strokeWidth="2"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      />
                    </svg>
                  </div>
                  Priority verification
                </div>
              </div>
            </div>
          </div>
        </section>

        <section className="section" id="charities">
          <div className="section-tag" style={{ textAlign: 'center' }}>
            Giving back
          </div>
          <h2 className="section-h2" style={{ textAlign: 'center' }}>
            Choose a cause you care about
          </h2>
          <p
            className="section-sub"
            style={{ textAlign: 'center', margin: '0 auto 40px' }}
          >
            At least 10% of every subscription goes directly to your chosen
            charity each month — automatically, every billing cycle.
          </p>
          <div className="charity-grid">
            <div className="charity-card">
              <div className="charity-logo">
                <Flag size={32} color="var(--accent-dark)" />
              </div>
              <div className="charity-cname">St Andrews Links Trust</div>
              <div className="charity-cat">Golf & sport · Scotland</div>
              <div className="charity-bar-bg">
                <div
                  className="charity-bar-fill"
                  style={{ width: '72%' }}
                ></div>
              </div>
              <div className="charity-support">72% of members support this</div>
            </div>
            <div className="charity-card">
              <div className="charity-logo">
                <Brain size={32} color="#534AB7" />
              </div>
              <div className="charity-cname">Alzheimer's Research UK</div>
              <div className="charity-cat">Health & research · UK</div>
              <div className="charity-bar-bg">
                <div
                  className="charity-bar-fill"
                  style={{ width: '48%' }}
                ></div>
              </div>
              <div className="charity-support">48% of members support this</div>
            </div>
            <div className="charity-card">
              <div className="charity-logo">
                <Medal size={32} color="var(--gold)" />
              </div>
              <div className="charity-cname">Youth Sport Trust</div>
              <div className="charity-cat">Youth & education · UK</div>
              <div className="charity-bar-bg">
                <div
                  className="charity-bar-fill"
                  style={{ width: '31%' }}
                ></div>
              </div>
              <div className="charity-support">31% of members support this</div>
            </div>
          </div>
          <div style={{ textAlign: 'center', marginTop: '40px' }}>
            <button className="btn btn-ghost">Browse all charities</button>
          </div>
        </section>

        <section className="testimonials">
          <div className="section-tag" style={{ textAlign: 'center' }}>
            What players say
          </div>
          <h2 className="section-h2" style={{ textAlign: 'center' }}>
            Golfers love GolfDraw
          </h2>
          <div className="testimonial-grid">
            <div className="testimonial-card">
              <div className="testimonial-stars">★★★★★</div>
              <p className="testimonial-text">
                "Won ₹340 in the 4-match draw last month. The verification
                process was painless — uploaded my screenshot and had the money
                within a week."
              </p>
              <div className="testimonial-author">
                <div className="t-av">JM</div>
                <div>
                  <div className="t-name">James Mitchell</div>
                  <div className="t-role">Member since Jan 2024</div>
                </div>
              </div>
            </div>
            <div className="testimonial-card">
              <div className="testimonial-stars">★★★★★</div>
              <p className="testimonial-text">
                "Love that 15% of my subscription goes to the junior golf
                foundation I care about. Feels like playing for something bigger
                than just the prize."
              </p>
              <div className="testimonial-author">
                <div className="t-av">KR</div>
                <div>
                  <div className="t-name">Karen Reid</div>
                  <div className="t-role">Member since Mar 2024</div>
                </div>
              </div>
            </div>
            <div className="testimonial-card">
              <div className="testimonial-stars">★★★★★</div>
              <p className="testimonial-text">
                "Simple concept, executed really well. I just play golf and
                submit my score — everything else is handled. The jackpot is now
                at ₹4k and I'm feeling lucky."
              </p>
              <div className="testimonial-author">
                <div className="t-av">AP</div>
                <div>
                  <div className="t-name">Alan Peters</div>
                  <div className="t-role">Member since Oct 2023</div>
                </div>
              </div>
            </div>
          </div>
        </section>

        <section className="cta-section">
          <div className="cta-wrapper">
            <div className="cta-eyebrow">Join today</div>
            <h2 className="cta-h2">Ready to play your first draw?</h2>
            <p className="cta-sub">
              Join 2,400+ golfers tracking scores, winning prizes, and giving
              back to causes they care about.
            </p>
            <div className="cta-actions">
              <a href="/login" className="btn btn-primary btn-xl">
                Start for ₹9 / month
              </a>
              <button className="btn btn-ghost btn-xl">Learn more</button>
            </div>
            <p className="cta-note">
              No commitment · Cancel anytime · First draw entry immediate
            </p>
          </div>
        </section>

        <footer>
          <div className="footer-inner">
            <div className="footer-top">
              <div className="footer-brand">
                <a
                  href="#"
                  className="nav-logo"
                  style={{ textDecoration: 'none', display: 'inline-flex' }}
                >
                  <div
                    className="nav-logo-mark"
                    style={{
                      width: '32px',
                      height: '32px',
                      overflow: 'hidden',
                    }}
                  >
                    <Image
                      src="/images/GolfDraw.png"
                      alt="GolfDraw"
                      width={32}
                      height={32}
                      style={{
                        width: '100%',
                        height: '100%',
                        objectFit: 'cover',
                      }}
                    />
                  </div>
                  <span className="nav-logo-text" style={{ fontSize: '18px' }}>
                    GolfDraw
                  </span>
                </a>
                <p>
                  Golf performance tracking meets monthly prize draws and
                  charitable giving. One subscription, three good things.
                </p>
              </div>
              <div className="footer-col">
                <h4>Product</h4>
                <ul>
                  <li>
                    <a href="#">How it works</a>
                  </li>
                  <li>
                    <a href="#">Prize draws</a>
                  </li>
                  <li>
                    <a href="#">Score tracking</a>
                  </li>
                  <li>
                    <a href="#">Pricing</a>
                  </li>
                </ul>
              </div>
              <div className="footer-col">
                <h4>Charities</h4>
                <ul>
                  <li>
                    <a href="#">Browse directory</a>
                  </li>
                  <li>
                    <a href="#">Partner with us</a>
                  </li>
                  <li>
                    <a href="#">Impact reports</a>
                  </li>
                </ul>
              </div>
              <div className="footer-col">
                <h4>Company</h4>
                <ul>
                  <li>
                    <a href="#">About</a>
                  </li>
                  <li>
                    <a href="#">Contact</a>
                  </li>
                  <li>
                    <a href="#">Privacy policy</a>
                  </li>
                  <li>
                    <a href="#">Terms of service</a>
                  </li>
                </ul>
              </div>
            </div>
            <div className="footer-bottom">
              <span className="footer-copy">
                © 2025 GolfDraw Ltd. All rights reserved.
              </span>
              <div className="footer-legal">
                <a href="#">Privacy</a>
                <a href="#">Terms</a>
                <a href="#">Cookies</a>
              </div>
            </div>
          </div>
        </footer>
      </div>
    </>
  );
}
