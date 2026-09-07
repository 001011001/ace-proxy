import { useRouter } from 'next/router';
import {
  LayoutDashboard, Package, Truck, Landmark,
  DollarSign, ShieldAlert, Sparkles, Store,
  Settings, ClipboardList, Users, Calendar,
  ShoppingCart, ShieldCheck, Globe, BarChart3, Bell,
  MessageSquare, Headphones, Wand2,
} from 'lucide-react';

interface NavItem {
  id: string;
  label: string;
  icon: React.ReactNode;
  href: string;
  section: string;
}

const NAV_ITEMS: NavItem[] = [
  { id:'dashboard', label:'BI看板', icon:<LayoutDashboard size={18}/>, href:'/admin/dashboard', section:'核心' },
  { id:'orders', label:'订单管理', icon:<ClipboardList size={18}/>, href:'/admin/orders', section:'核心' },
  { id:'products', label:'产品管理', icon:<Store size={18}/>, href:'/admin/products', section:'核心' },
  { id:'auto-listing', label:'AI一键上架', icon:<Wand2 size={18}/>, href:'/admin/auto-listing', section:'核心' },
  { id:'purchase-orders', label:'采购单', icon:<ShoppingCart size={18}/>, href:'/admin/purchase-orders', section:'核心' },
  { id:'customer-service', label:'客服工作台', icon:<Headphones size={18}/>, href:'/admin/customer-service', section:'核心' },
  { id:'payment', label:'支付管理', icon:<DollarSign size={18}/>, href:'/admin/payment', section:'财务' },
  { id:'vault', label:'金库与财务', icon:<Landmark size={18}/>, href:'/admin/vault', section:'财务' },
  { id:'finance', label:'损益报表', icon:<BarChart3 size={18}/>, href:'/admin/finance', section:'财务' },
  { id:'suppliers', label:'供应商', icon:<Users size={18}/>, href:'/admin/suppliers', section:'供应链' },
  { id:'warehouse', label:'仓库管理', icon:<Truck size={18}/>, href:'/admin/warehouse', section:'供应链' },
  { id:'holiday', label:'节假日管理', icon:<Calendar size={18}/>, href:'/admin/holiday', section:'运营' },
  { id:'compliance', label:'合规中心', icon:<ShieldCheck size={18}/>, href:'/admin/compliance', section:'运营' },
  { id:'stations', label:'站点管理', icon:<Globe size={18}/>, href:'/admin/stations', section:'运营' },
  { id:'notifications', label:'通知管理', icon:<Bell size={18}/>, href:'/admin/notifications', section:'运营' },
  { id:'ai-sentinel', label:'AI哨兵', icon:<Sparkles size={18}/>, href:'/admin/ai-sentinel', section:'AI' },
  { id:'settings', label:'系统设置', icon:<Settings size={18}/>, href:'/admin/settings', section:'系统' },
];

export default function Sidebar() {
  const router = useRouter();
  const currentPath = router.pathname;

  const sections = Array.from(new Set(NAV_ITEMS.map(i => i.section)));

  return (
    <aside className="w-[240px] bg-ink flex flex-col shrink-0 min-h-screen border-r-4 border-black">
      {/* Logo — brutal square */}
      <div className="px-5 py-5 border-b-2 border-white/10">
        <div className="flex items-center gap-3" onClick={() => router.push('/admin/dashboard')} style={{cursor:'pointer'}}>
          <div className="w-10 h-10 bg-terracotta flex items-center justify-center border-3 border-white/20"
               style={{boxShadow:'3px 3px 0 #F97316'}}>
            <span className="text-white font-bold text-sm font-display">A</span>
          </div>
          <div>
            <h1 className="text-white font-bold text-sm font-display tracking-tight uppercase">AceProxy</h1>
            <p className="text-[10px] text-terracotta font-display uppercase tracking-wider">指挥中心</p>
          </div>
        </div>
      </div>

      {/* Nav Sections */}
      <nav className="flex-1 py-3 overflow-y-auto">
        {sections.map(section => (
          <div key={section} className="mb-2">
            <div className="px-5 py-1.5 text-[10px] font-display font-bold tracking-[2px] text-terracotta uppercase">
              {section}
            </div>
            {NAV_ITEMS.filter(i => i.section === section).map(item => {
              const active = currentPath === item.href || currentPath.startsWith(item.href + '/');
              return (
                <button
                  key={item.id}
                  onClick={() => router.push(item.href)}
                  className={`w-full flex items-center gap-3 px-5 py-2.5 text-sm font-display font-bold transition-all border-l-4 ${
                    active
                      ? 'bg-terracotta/20 border-terracotta text-white'
                      : 'border-transparent text-white/50 hover:text-white hover:bg-white/5'
                  }`}
                >
                  {item.icon}
                  {item.label}
                </button>
              );
            })}
          </div>
        ))}
      </nav>

      {/* Footer */}
      <div className="px-5 py-4 border-t-2 border-white/10">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 bg-terracotta flex items-center justify-center border-2 border-white/20">
            <span className="text-white text-xs font-bold font-display">GM</span>
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-white text-xs font-bold font-display truncate">总经理</p>
            <div className="flex items-center gap-1.5 mt-1">
              <span className="w-2 h-2 bg-success relative inline-flex">
                <span className="absolute inset-0 bg-success animate-ping opacity-60"/>
              </span>
              <span className="text-[10px] text-success font-bold font-display uppercase">在线</span>
            </div>
          </div>
        </div>
      </div>
    </aside>
  );
}
