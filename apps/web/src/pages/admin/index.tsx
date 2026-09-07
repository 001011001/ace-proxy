import { useEffect } from 'react';
import { useRouter } from 'next/router';

/**
 * /admin → 自动跳转到 /admin/dashboard
 * （旧版硬编码页面已废弃，新版 BI 看板已接入全部后端 API）
 */
export default function AdminIndex() {
  const router = useRouter();
  useEffect(() => {
    router.replace('/admin/dashboard');
  }, [router]);
  return (
    <div className="min-h-screen flex items-center justify-center bg-[#F5F0EB]">
      <p className="text-sm text-ink-mute animate-pulse">正在跳转到BI看板...</p>
    </div>
  );
}
