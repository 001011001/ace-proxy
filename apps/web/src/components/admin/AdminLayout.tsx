import Head from 'next/head';
import Sidebar from './Sidebar';
import { Bell, RefreshCw } from 'lucide-react';

interface Props {
  title: string;
  children: React.ReactNode;
  actions?: React.ReactNode;
}

export default function AdminLayout({ title, children, actions }: Props) {
  return (
    <>
      <Head>
        <title>{title} · AceProxy Admin</title>
      </Head>
      <div className="flex min-h-screen bg-[#F5F0EB]">
        <Sidebar />
        <div className="flex-1 flex flex-col min-w-0">
          {/* Top Bar — Neo-Brutalism */}
          <header className="nav-bar-brutal h-14 shrink-0">
            <h2 className="text-lg font-display font-bold text-ink uppercase tracking-[-0.02em]">{title}</h2>
            <div className="flex-1" />
            {actions}
            <button className="btn-brutal-ghost w-9 h-9 !p-0 flex items-center justify-center ml-2">
              <Bell size={17} />
            </button>
            <button className="btn-brutal-xs-outline ml-2 flex items-center gap-1">
              <RefreshCw size={12} />
              刷新
            </button>
          </header>
          <main className="flex-1 p-6 overflow-y-auto">
            {children}
          </main>
        </div>
      </div>
    </>
  );
}
