import React, { useState } from 'react';
import Head from 'next/head';

/**
 * AceProxy Global Portal 2.0
 * Features: Multi-language (CN/EN/ID), Neo-Brutalist Design, Project Roadmap, Trust Signals
 */

const TRANSLATIONS = {
  EN: {
    nav: { features: "Services", roadmap: "Vision", download: "Get App" },
    hero: {
      tag: "GLOBAL CURATED LIFESTYLE",
      title: "PREMIUM GLOBAL SOURCING STEWARD",
      subtitle: "Connecting world-class manufacturing networks directly to your doorstep. Experience the pinnacle of flexible supply chains with AI-driven quality assurance and priority global logistics.",
      cta: "ACCESS PILOT PROGRAM"
    },
    pillars: {
      title: "THE ACEPROXY STANDARD",
      p1: { t: "Elite Sourcing", d: "Direct access to our exclusive manufacturing network. Hand-picked quality from the world's leading production hubs." },
      p2: { t: "VisionQC 2.0", d: "Your private quality controller. Our AI-driven multi-point inspection ensures perfection before your items cross the border." },
      p3: { t: "Priority Express", d: "Exclusive logistics channels. High-priority clearing and smart routing designed for seamless cross-border delivery." }
    },
    trust: {
      title: "SECURITY & TRANSPARENCY",
      text: "Secured by world-leading payment bridges including WorldFirst (Ant Group). Experience localized, high-priority fund management with bank-grade encryption.",
      badge: "OFFICIAL WORLD FIRST PARTNER"
    },
    roadmap: {
      title: "OUR EVOLUTION",
      q1: "2026 Q1: Jakarta Premium Pilot. Establishing elite community nodes.",
      q3: "2026 Q3: Regional Expansion. Launching multi-market service hubs.",
      y2027: "2027: Redefining the Global Direct-to-Consumer Supply Chain."
    },
    download: {
      title: "JOIN THE ELITE PILOT",
      sub: "Request your access to the Jakarta Beta and redefine your sourcing experience.",
      scan: "SCAN TO ACCESS (ANDROID)"
    }
  },
  CN: {
    nav: { features: "精选服务", roadmap: "项目愿景", download: "立即加入" },
    hero: {
      tag: "全球精选生活方式",
      title: "全球精选直供管家平台",
      subtitle: "将全球顶级的制造网络直接连接至您的家门口。通过 AI 驱动的品质保障与专属跨境物流，体验极致的柔性供应链服务。",
      cta: "开启试点体验"
    },
    pillars: {
      title: "ACEPROXY 服务标准",
      p1: { t: "全球精选直供", d: "直接访问我们的独家制造网络。从全球顶尖生产中心为您手工挑选极致好物。" },
      p2: { t: "VisionQC 2.0 质检", d: "您的私属品控专家。AI 多点视觉检测，在货物出境前确保每一件都是臻品。" },
      p3: { t: "专属优先物流", d: "特快跨境通道。基于智能算法的优先级清关与路由，为您的包裹提供极致的运输体验。" }
    },
    trust: {
      title: "安全与透明",
      text: "通过包括万里汇（蚂蚁集团）在内的全球领先支付桥梁提供保障。体验本地化、高优先级的资金管理与银行级加密保护。",
      badge: "万里汇官方合作伙伴"
    },
    roadmap: {
      title: "全球进化之路",
      q1: "2026 Q1: 雅加达高端试点。建立核心社区服务节点。",
      q3: "2026 Q3: 区域扩张。启动多市场服务枢纽。",
      y2027: "2027: 重新定义全球直连消费者的供应链网络。"
    },
    download: {
      title: "加入精英试点计划",
      sub: "申请您的雅加达测试版访问权限，即刻重塑您的跨境采购体验。",
      scan: "扫码开启 (安卓)"
    }
  },
  ID: {
    nav: { features: "Layanan", roadmap: "Visi", download: "Unduh" },
    hero: {
      tag: "GAYA HIDUP TERKURASI GLOBAL",
      title: "STEWARD SOURCING GLOBAL PREMIUM",
      subtitle: "Menghubungkan jaringan manufaktur kelas dunia langsung ke pintu Anda. Rasakan rantai pasokan fleksibel terbaik dengan jaminan kualitas bertenaga AI.",
      cta: "AKSES PROGRAM PILOT"
    },
    pillars: {
      title: "STANDAR ACEPROXY",
      p1: { t: "Elite Sourcing", d: "Akses langsung ke jaringan manufaktur eksklusif kami. Kualitas pilihan dari pusat produksi terkemuka dunia." },
      p2: { t: "VisionQC 2.0", d: "Pengontrol kualitas pribadi Anda. Inspeksi AI kami memastikan kesempurnaan sebelum barang Anda menyeberang perbatasan." },
      p3: { t: "Priority Express", d: "Saluran logistik eksklusif. Kliring prioritas tinggi yang dirancang untuk pengiriman lintas batas yang lancar." }
    },
    trust: {
      title: "KEAMANAN & TRANSPARANSI",
      text: "Diamankan oleh mitra pembayaran terkemuka dunia termasuk WorldFirst (Ant Group). Rasakan manajemen dana prioritas tinggi dengan enkripsi tingkat bank.",
      badge: "MITRA RESMI WORLD FIRST"
    },
    roadmap: {
      title: "EVOLUSI KAMI",
      q1: "2026 Q1: Pilot Premium Jakarta. Membangun simpul komunitas elit.",
      q3: "2026 Q3: Ekspansi Regional. Peluncuran hub layanan multi-pasar.",
      y2027: "2027: Mendefinisikan Ulang Rantai Pasokan Langsung ke Konsumen Global."
    },
    download: {
      title: "GABUNG PILOT ELITE",
      sub: "Ajukan akses Anda ke Beta Jakarta dan definisikan ulang pengalaman sourcing Anda.",
      scan: "PINDAI UNTUK AKSES (ANDROID)"
    }
  }
};


export default function Landing() {
  const [lang, setLang] = useState<'EN' | 'CN' | 'ID'>('EN');
  const t = TRANSLATIONS[lang];

  return (
    <div style={{ backgroundColor: '#fff', color: '#000', fontFamily: 'Arial Black, sans-serif' }}>
      <Head>
        <title>AceProxy | {t.hero.title}</title>
      </Head>

      {/* Nav */}
      <nav style={styles.nav}>
        <div style={styles.logo}>ACEPROXY</div>
        <div style={styles.navLinks}>
          <a href="#features" style={styles.navItem}>{t.nav.features}</a>
          <a href="#roadmap" style={styles.navItem}>{t.nav.roadmap}</a>
          <select 
            value={lang} 
            onChange={(e) => setLang(e.target.value as any)}
            style={styles.langPicker}
          >
            <option value="EN">English</option>
            <option value="CN">简体中文</option>
            <option value="ID">Bahasa Indonesia</option>
          </select>
          <a href="#download" style={styles.downloadBtnNav}>{t.nav.download}</a>
        </div>
      </nav>

      {/* Hero */}
      <section style={styles.hero}>
        <div style={styles.heroTag}>{t.hero.tag}</div>
        <h1 style={styles.heroTitle}>{t.hero.title}</h1>
        <p style={styles.heroSubtitle}>{t.hero.subtitle}</p>
        <a href="#download" style={styles.heroCta}>{t.hero.cta}</a>
      </section>

      {/* Pillars */}
      <section id="features" style={styles.section}>
        <h2 style={styles.sectionTitle}>{t.pillars.title}</h2>
        <div style={styles.grid}>
          <div style={styles.card}>
            <div style={styles.cardNum}>01</div>
            <h3 style={styles.cardTitle}>{t.pillars.p1.t}</h3>
            <p style={styles.cardText}>{t.pillars.p1.d}</p>
          </div>
          <div style={styles.card}>
            <div style={styles.cardNum}>02</div>
            <h3 style={styles.cardTitle}>{t.pillars.p2.t}</h3>
            <p style={styles.cardText}>{t.pillars.p2.d}</p>
          </div>
          <div style={styles.card}>
            <div style={styles.cardNum}>03</div>
            <h3 style={styles.cardTitle}>{t.pillars.p3.t}</h3>
            <p style={styles.cardText}>{t.pillars.p3.d}</p>
          </div>
        </div>
      </section>

      {/* Trust */}
      <section style={styles.trustSection}>
        <div style={styles.trustContent}>
          <h2 style={styles.trustTitle}>{t.trust.title}</h2>
          <p style={styles.trustText}>{t.trust.text}</p>
          <div style={styles.trustBadge}>{t.trust.badge}</div>
        </div>
      </section>

      {/* Roadmap */}
      <section id="roadmap" style={styles.section}>
        <h2 style={styles.sectionTitle}>{t.roadmap.title}</h2>
        <div style={styles.roadmapBox}>
          <div style={styles.roadmapItem}>
            <div style={styles.dot}></div>
            <p>{t.roadmap.q1}</p>
          </div>
          <div style={styles.roadmapItem}>
            <div style={styles.dot}></div>
            <p>{t.roadmap.q3}</p>
          </div>
          <div style={styles.roadmapItem}>
            <div style={styles.dot}></div>
            <p>{t.roadmap.y2027}</p>
          </div>
        </div>
      </section>

      {/* Download */}
      <section id="download" style={styles.downloadSection}>
        <div style={styles.downloadBox}>
          <h2 style={styles.downloadTitle}>{t.download.title}</h2>
          <p style={styles.downloadSub}>{t.download.sub}</p>
          <div style={styles.qrArea}>
            <div style={styles.qrPlaceholder}>
               <img src="https://api.qrserver.com/v1/create-qr-code/?size=180x180&data=AceProxy_Jakarta_RC" alt="QR" style={{width: '180px'}} />
               <div style={styles.scanLine}></div>
            </div>
            <p style={styles.scanText}>{t.download.scan}</p>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer style={styles.footer}>
        <div style={styles.footerLogo}>ACEPROXY</div>
        <div style={styles.footerText}>© 2026 AceProxy. Global Sourcing Stewards. Industrial-Grade Direct Sourcing.</div>
      </footer>
    </div>
  );
}

const styles: Record<string, React.CSSProperties> = {
  nav: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: '30px 50px',
    borderBottom: '4px solid #000',
    backgroundColor: '#fff',
    position: 'sticky',
    top: 0,
    zIndex: 100,
  },
  logo: { fontSize: '24px', fontWeight: 900, backgroundColor: '#F97316', padding: '4px 10px', border: '3px solid #000', boxShadow: '4px 4px 0 #000' },
  navLinks: { display: 'flex', gap: '20px', alignItems: 'center' },
  navItem: { textDecoration: 'none', color: '#000', fontSize: '14px', fontWeight: 800, textTransform: 'uppercase' },
  langPicker: { padding: '5px 10px', border: '2px solid #000', fontWeight: 800, cursor: 'pointer' },
  downloadBtnNav: { 
    textDecoration: 'none', 
    backgroundColor: '#F97316', 
    color: '#000', 
    padding: '8px 16px', 
    fontSize: '14px', 
    fontWeight: 900, 
    border: '3px solid #000', 
    boxShadow: '4px 4px 0 #000' 
  },
  hero: {
    padding: '120px 50px',
    backgroundColor: '#FFF7ED',
    textAlign: 'center',
    borderBottom: '4px solid #000',
  },
  heroTag: { fontSize: '12px', fontWeight: 900, letterSpacing: '2px', marginBottom: '20px', opacity: 0.6 },
  heroTitle: { fontSize: '80px', fontWeight: 900, letterSpacing: '-4px', lineHeight: 0.9, marginBottom: '30px', textTransform: 'uppercase' },
  heroSubtitle: { fontSize: '20px', maxWidth: '800px', margin: '0 auto 40px', lineHeight: 1.4, fontWeight: 700 },
  heroCta: {
    display: 'inline-block',
    textDecoration: 'none',
    backgroundColor: '#F97316',
    color: '#000',
    padding: '24px 48px',
    fontSize: '24px',
    fontWeight: 900,
    border: '5px solid #000',
    boxShadow: '10px 10px 0 #000',
    transition: '0.1s',
  },
  section: { padding: '100px 50px', borderBottom: '4px solid #000' },
  sectionTitle: { fontSize: '48px', fontWeight: 900, marginBottom: '60px', textTransform: 'uppercase' },
  grid: { display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '40px' },
  card: { padding: '40px', border: '4px solid #000', boxShadow: '8px 8px 0 #000', backgroundColor: '#fff' },
  cardNum: { fontSize: '40px', fontWeight: 900, marginBottom: '20px', opacity: 0.2 },
  cardTitle: { fontSize: '24px', fontWeight: 900, marginBottom: '16px' },
  cardText: { fontSize: '16px', lineHeight: 1.5, fontWeight: 700, color: '#475569' },
  trustSection: { padding: '100px 50px', backgroundColor: '#000', color: '#fff', borderBottom: '4px solid #000' },
  trustContent: { maxWidth: '800px' },
  trustTitle: { fontSize: '48px', fontWeight: 900, marginBottom: '24px', color: '#F97316' },
  trustText: { fontSize: '20px', lineHeight: 1.6, marginBottom: '30px', fontWeight: 700, opacity: 0.8 },
  trustBadge: { display: 'inline-block', border: '2px solid #F97316', padding: '10px 20px', color: '#F97316', fontWeight: 900, fontSize: '14px' },
  roadmapBox: { display: 'flex', flexDirection: 'column', gap: '30px' },
  roadmapItem: { display: 'flex', alignItems: 'center', gap: '20px' },
  dot: { width: '20px', height: '20px', backgroundColor: '#F97316', border: '3px solid #000' },
  downloadSection: { padding: '120px 50px', textAlign: 'center' },
  downloadBox: { display: 'inline-block', padding: '80px', border: '5px solid #000', boxShadow: '15px 15px 0 #F97316', backgroundColor: '#fff' },
  downloadTitle: { fontSize: '48px', fontWeight: 900, marginBottom: '16px' },
  downloadSub: { fontSize: '18px', fontWeight: 700, color: '#64748B', marginBottom: '40px' },
  qrArea: { display: 'flex', flexDirection: 'column', alignItems: 'center' },
  qrPlaceholder: { 
    width: '200px', 
    height: '200px', 
    backgroundColor: '#F8FAFC', 
    border: '3px solid #000', 
    display: 'flex', 
    alignItems: 'center', 
    justifyContent: 'center',
    position: 'relative',
    overflow: 'hidden'
  },
  scanLine: { 
    position: 'absolute', 
    top: 0, 
    left: 0, 
    width: '100%', 
    height: '4px', 
    backgroundColor: '#F97316', 
    boxShadow: '0 0 10px #F97316',
    animation: 'scan 2s linear infinite'
  },
  scanText: { marginTop: '20px', fontSize: '14px', fontWeight: 900 },
  footer: { padding: '60px 50px', borderTop: '4px solid #000', display: 'flex', justifyContent: 'space-between', alignItems: 'center' },
  footerLogo: { fontSize: '20px', fontWeight: 900 },
  footerText: { fontSize: '12px', fontWeight: 800, opacity: 0.6 }
};

// Add global CSS for the scan animation
if (typeof document !== 'undefined') {
  const styleSheet = document.createElement("style");
  styleSheet.innerText = `
    @keyframes scan {
      0% { top: 0; }
      50% { top: 100%; }
      100% { top: 0; }
    }
  `;
  document.head.appendChild(styleSheet);
}
