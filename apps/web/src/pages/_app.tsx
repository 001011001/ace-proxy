import type { AppProps } from 'next/app';
import { Component, ReactNode } from 'react';
import { GoogleOAuthProvider } from '@react-oauth/google';
import dynamic from 'next/dynamic';
import { useRouter } from 'next/router';
import '../styles/globals.css';
import { ToastProvider } from '@/components/ux/Toast';
import MobileBottomNav from '@/components/ux/MobileBottomNav';

// Lazy-load ChatWidget to avoid SSR hydration issues
const ChatWidget = dynamic(() => import('@/components/chat/ChatWidget'), {
  ssr: false,
});

class ErrorBoundary extends Component<{ children: ReactNode }, { hasError: boolean }> {
  constructor(props: any) {
    super(props);
    this.state = { hasError: false };
  }
  static getDerivedStateFromError() {
    return { hasError: true };
  }
  render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen flex items-center justify-center p-4 bg-canvas-warm">
          <div className="bg-white border-4 border-black p-8 text-center" style={{ boxShadow: '6px 6px 0 #000' }}>
            <p className="font-display font-bold text-lg mb-2">出错了</p>
            <p className="text-sm text-ink-mute mb-4">请刷新页面重试</p>
            <button
              onClick={() => window.location.reload()}
              className="px-6 py-3 bg-terracotta text-white font-display font-bold border-3 border-black"
            >
              刷新
            </button>
          </div>
        </div>
      );
    }
    return this.props.children;
  }
}

function ChatWidgetWrapper() {
  const router = useRouter();
  // Only show ChatWidget on consumer pages, NOT on admin pages
  const isAdminPage = router.pathname.startsWith('/admin');
  if (isAdminPage) return null;
  return <ChatWidget />;
}

/**
 * ConsumerPageWrapper — reserves bottom space on mobile so the fixed
 * MobileBottomNav never overlaps page content / footers. Admin pages
 * render the nav as null, so no padding is applied there.
 */
function ConsumerPageWrapper({ children }: { children: ReactNode }) {
  const router = useRouter();
  const isAdminPage = router.pathname.startsWith('/admin');
  if (isAdminPage) return <>{children}</>;
  return <div className="pb-16 md:pb-0">{children}</div>;
}

export default function App({ Component, pageProps }: AppProps) {
  const googleClientId = process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID || '';

  const app = (
    <>
      <ConsumerPageWrapper>
        <Component {...pageProps} />
      </ConsumerPageWrapper>
      <ChatWidgetWrapper />
      <MobileBottomNav />
    </>
  );

  return (
    <ErrorBoundary>
      <ToastProvider>
        {googleClientId ? (
          <GoogleOAuthProvider clientId={googleClientId}>
            {app}
          </GoogleOAuthProvider>
        ) : (
          app
        )}
      </ToastProvider>
    </ErrorBoundary>
  );
}
