import { useState } from 'react';
import Head from 'next/head';
import Link from 'next/link';

interface StepLog {
  text: string;
  done: boolean;
  error?: boolean;
}

interface ListingResult {
  productId: string;
  titleLocal: string;
  descriptionLocal: string;
  priceLocal: number;
  currency: string;
  shippingEstimate: number;
  estimatedDelivery: string;
  profitMarginPct: number;
  imageResult?: {
    originalCount: number;
    processedCount: number;
    cutoutUrls: string[];
    sceneUrls: string[];
    finalUrls: string[];
    summary: { total: number; success: number; failed: number; totalDurationMs: number };
  };
  steps: string[];
  error?: string;
}

const COUNTRY_OPTIONS = [
  { code: 'ID', label: '🇮🇩 印尼 (Indonesia)', currency: 'IDR' },
  { code: 'TH', label: '🇹🇭 泰国 (Thailand)', currency: 'THB' },
  { code: 'PH', label: '🇵🇭 菲律宾 (Philippines)', currency: 'PHP' },
  { code: 'BR', label: '🇧🇷 巴西 (Brazil)', currency: 'BRL' },
];

export default function AutoListingPage() {
  const [url, setUrl] = useState('');
  const [targetCountry, setTargetCountry] = useState('ID');
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<ListingResult | null>(null);
  const [stepLogs, setStepLogs] = useState<StepLog[]>([]);

  const handleSubmit = async () => {
    if (!url.trim()) return;

    setLoading(true);
    setResult(null);
    setStepLogs([
      { text: '🔍 解析链接...', done: false },
      { text: '📥 采集商品数据...', done: false },
      { text: '💰 价格分析优化...', done: false },
      { text: '🌐 AI 翻译本地化...', done: false },
      { text: '🎨 AI 智能修图（抠图→换场景→加文字）...', done: false },
      { text: '📦 国际运费计算...', done: false },
      { text: '🏷️ 智能定价...', done: false },
      { text: '✅ 写入数据库...', done: false },
    ]);

    try {
      const API_BASE = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';
      const res = await fetch(`${API_BASE}/auto-listing/list-from-url`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ url: url.trim(), targetCountry }),
      });

      const data: ListingResult = await res.json();

      if (!res.ok || data.error) {
        setStepLogs(prev => prev.map((s, i) => ({
          ...s,
          done: i === prev.length - 1,
          error: i === prev.length - 1,
        })));
        setResult({ ...data, error: data.error || `HTTP ${res.status}` });
        return;
      }

      // 按 steps 映射进度
      setStepLogs(data.steps.map((step, i) => ({
        text: step,
        done: true,
        error: step.startsWith('❌'),
      })));

      setResult(data);
    } catch (err: any) {
      setResult({ error: err.message } as ListingResult);
      setStepLogs(prev => prev.map(s => ({ ...s, done: false, error: false })));
    } finally {
      setLoading(false);
    }
  };

  const handleBulkList = async () => {
    const urls = url.split('\n').filter(u => u.trim());
    if (urls.length === 0) return;

    setLoading(true);
    setResult(null);
    setStepLogs([{ text: `🔄 批量上架 ${urls.length} 个商品...`, done: false }]);

    const results: ListingResult[] = [];
    const failures: string[] = [];

    for (let i = 0; i < urls.length; i++) {
      setStepLogs([{ text: `🔄 [${i + 1}/${urls.length}] 处理: ${urls[i].substring(0, 60)}...`, done: false }]);

      try {
        const API_BASE = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';
        const res = await fetch(`${API_BASE}/auto-listing/list-from-url`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ url: urls[i].trim(), targetCountry }),
        });
        const data: ListingResult = await res.json();
        if (data.productId) {
          results.push(data);
        } else {
          failures.push(`${urls[i]}: ${data.error || 'Unknown error'}`);
        }
      } catch (err: any) {
        failures.push(`${urls[i]}: ${err.message}`);
      }

      // 限速：间隔 2 秒防止 API 限流
      if (i < urls.length - 1) await new Promise(r => setTimeout(r, 2000));
    }

    setStepLogs([{
      text: `✅ 完成: ${results.length}/${urls.length} 成功`,
      done: true,
      error: failures.length > 0,
    }]);

    setResult({
      productId: 'batch',
      titleLocal: `批量上架 ${results.length} 个商品`,
      descriptionLocal: `成功: ${results.length}, 失败: ${failures.length}`,
      priceLocal: 0,
      currency: COUNTRY_OPTIONS.find(c => c.code === targetCountry)?.currency || 'IDR',
      shippingEstimate: 0,
      estimatedDelivery: '',
      profitMarginPct: 0,
      steps: [`✅ 批量完成: ${results.length} 成功, ${failures.length} 失败`],
      error: failures.length > 0 ? failures.join('\n') : undefined,
    });
    setLoading(false);
  };

  const isBulkMode = url.includes('\n') && url.split('\n').filter(u => u.trim()).length > 1;

  return (
    <>
      <Head><title>AI一键上架 · AceProxy Admin</title></Head>

      <div style={styles.container}>
        {/* Header */}
        <div style={styles.header}>
          <div>
            <h1 style={styles.title}>🤖 AI 一键上架</h1>
            <p style={styles.subtitle}>粘贴 1688/淘宝/京东/拼多多 链接 → 自动采集→翻译→修图→定价→上架</p>
          </div>
          <Link href="/admin" style={styles.backBtn}>← 管理后台</Link>
        </div>

        {/* Pipeline Visual */}
        <div style={styles.pipeline}>
          {['粘贴链接', 'AI采集', 'AI翻译', 'AI修图', '定价', '上架'].map((label, i) => (
            <div key={i} style={styles.pipelineStep}>
              <span style={styles.pipelineDot}>{i + 1}</span>
              <span style={styles.pipelineLabel}>{label}</span>
              {i < 5 && <span style={styles.pipelineArrow}>→</span>}
            </div>
          ))}
        </div>

        {/* Input Card */}
        <div style={styles.card}>
          <div style={styles.inputRow}>
            <input
              type="text"
              value={url}
              onChange={e => setUrl(e.target.value)}
              placeholder="https://detail.1688.com/offer/XXXXXXXXX.html （支持多行批量输入）"
              style={styles.urlInput}
              disabled={loading}
            />
          </div>

          <div style={styles.controlRow}>
            <select
              value={targetCountry}
              onChange={e => setTargetCountry(e.target.value)}
              style={styles.select}
              disabled={loading}
            >
              {COUNTRY_OPTIONS.map(c => (
                <option key={c.code} value={c.code}>{c.label}</option>
              ))}
            </select>

            <button
              onClick={handleSubmit}
              disabled={loading || !url.trim()}
              style={{
                ...styles.primaryBtn,
                opacity: loading || !url.trim() ? 0.5 : 1,
              }}
            >
              {loading ? '⏳ 处理中...' : isBulkMode ? '🚀 批量上架' : '🚀 一键上架'}
            </button>

            {isBulkMode && !loading && (
              <span style={styles.bulkHint}>
                📋 检测到 {url.split('\n').filter(u => u.trim()).length} 条链接，将逐一处理
              </span>
            )}
          </div>
        </div>

        {/* Progress */}
        {stepLogs.length > 0 && (
          <div style={styles.card}>
            <h3 style={styles.sectionTitle}>
              📊 处理进度
              {loading && <span style={styles.spinner}> ⟳</span>}
            </h3>
            <div style={styles.progressContainer}>
              <div
                style={{
                  ...styles.progressBar,
                  width: `${(stepLogs.filter(s => s.done).length / stepLogs.length) * 100}%`,
                  transition: 'width 0.5s ease',
                }}
              />
            </div>
            <div style={styles.stepList}>
              {stepLogs.map((log, i) => (
                <div
                  key={i}
                  style={{
                    ...styles.stepItem,
                    opacity: log.done ? 1 : 0.6,
                    color: log.error ? '#ff4444' : log.done ? '#333' : '#999',
                  }}
                >
                  <span style={styles.stepIcon}>
                    {log.error ? '❌' : log.done ? '✅' : '○'}
                  </span>
                  {log.text}
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Result */}
        {result && !result.error && result.productId && (
          <div style={styles.card}>
            <h3 style={styles.sectionTitle}>✅ 上架成功！</h3>

            <div style={styles.resultGrid}>
              <div style={styles.resultItem}>
                <span style={styles.resultLabel}>商品ID</span>
                <span style={styles.resultValue}>{result.productId}</span>
              </div>
              <div style={styles.resultItem}>
                <span style={styles.resultLabel}>标题</span>
                <span style={styles.resultValue}>{result.titleLocal}</span>
              </div>
              <div style={styles.resultItem}>
                <span style={styles.resultLabel}>本地售价</span>
                <span style={styles.resultValueHighlight}>
                  {result.currency} {result.priceLocal?.toLocaleString()}
                </span>
              </div>
              <div style={styles.resultItem}>
                <span style={styles.resultLabel}>利润率</span>
                <span style={{ ...styles.resultValue, color: '#00b341' }}>
                  {result.profitMarginPct}%
                </span>
              </div>
              <div style={styles.resultItem}>
                <span style={styles.resultLabel}>预计运费</span>
                <span style={styles.resultValue}>¥{result.shippingEstimate}</span>
              </div>
              <div style={styles.resultItem}>
                <span style={styles.resultLabel}>预计时效</span>
                <span style={styles.resultValue}>{result.estimatedDelivery}</span>
              </div>
            </div>

            {/* Image Pipeline Preview */}
            {result.imageResult && result.imageResult.finalUrls.length > 0 && (
              <div style={{ marginTop: 20 }}>
                <h4 style={styles.sectionTitle}>
                  🎨 AI 修图结果 ({result.imageResult.summary.success}/{result.imageResult.summary.total} 步成功)
                </h4>
                <div style={styles.imageGallery}>
                  {result.imageResult.finalUrls.slice(0, 4).map((imgUrl, i) => (
                    <div key={i} style={styles.imageCard}>
                      <img
                        src={imgUrl}
                        alt={`上架图 ${i + 1}`}
                        style={styles.previewImg}
                        onError={(e) => {
                          (e.target as HTMLImageElement).style.display = 'none';
                        }}
                      />
                      <span style={styles.imageLabel}>
                        {i === 0 ? '主图' : i === 1 ? '营销图' : `图${i + 1}`}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            <div style={{ marginTop: 16 }}>
              <Link href={`/products/${result.productId}`} style={styles.linkBtn}>
                查看商品页面 →
              </Link>
              <Link href="/admin/products" style={{ ...styles.linkBtn, marginLeft: 12 }}>
                管理商品列表 →
              </Link>
            </div>
          </div>
        )}

        {/* Error */}
        {result?.error && (
          <div style={{ ...styles.card, borderColor: '#ff4444', borderLeft: '6px solid #ff4444' }}>
            <h3 style={{ ...styles.sectionTitle, color: '#ff4444' }}>❌ 处理失败</h3>
            <pre style={styles.errorText}>{result.error}</pre>
          </div>
        )}

        {/* Quick Help */}
        <div style={styles.card}>
          <h3 style={styles.sectionTitle}>📖 支持平台</h3>
          <div style={styles.platformGrid}>
            {[
              { name: '1688', icon: '🏭', status: '✅ 真实API' },
              { name: '淘宝', icon: '🛒', status: '⚠️ 需配置Key' },
              { name: '天猫', icon: '🐱', status: '⚠️ 需配置Key' },
              { name: '京东', icon: '🐶', status: '⚠️ 需配置Key' },
              { name: '拼多多', icon: '💎', status: '⚠️ 需配置Key' },
              { name: 'Amazon', icon: '📦', status: '⚠️ 需配置Key' },
              { name: 'Shopee', icon: '🦐', status: '⚠️ 需配置Key' },
              { name: 'Lazada', icon: '🛍️', status: '⚠️ 需配置Key' },
              { name: 'AliExpress', icon: '🌍', status: '⚠️ 需配置Key' },
            ].map(p => (
              <div key={p.name} style={styles.platformItem}>
                <span style={styles.platformIcon}>{p.icon}</span>
                <span style={styles.platformName}>{p.name}</span>
                <span style={{
                  ...styles.platformStatus,
                  color: p.status.includes('✅') ? '#00b341' : '#ff9800',
                }}>
                  {p.status}
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </>
  );
}

const styles: Record<string, React.CSSProperties> = {
  container: {
    maxWidth: 960,
    margin: '0 auto',
    padding: '24px 16px 80px',
    fontFamily: 'system-ui, -apple-system, sans-serif',
  },
  header: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 20,
  },
  title: {
    fontSize: 28,
    fontWeight: 800,
    margin: 0,
    color: '#111',
  },
  subtitle: {
    fontSize: 14,
    color: '#666',
    marginTop: 6,
    marginBottom: 0,
  },
  backBtn: {
    fontSize: 14,
    color: '#0066ff',
    textDecoration: 'none',
    fontWeight: 600,
    padding: '8px 16px',
    border: '2px solid #0066ff',
    borderRadius: 8,
  },
  pipeline: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    padding: '16px 0',
    overflowX: 'auto',
    flexWrap: 'wrap',
  },
  pipelineStep: {
    display: 'flex',
    alignItems: 'center',
    gap: 6,
  },
  pipelineDot: {
    width: 28,
    height: 28,
    borderRadius: '50%',
    background: '#111',
    color: '#fff',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    fontSize: 13,
    fontWeight: 700,
    flexShrink: 0,
  },
  pipelineLabel: {
    fontSize: 13,
    fontWeight: 600,
    color: '#333',
    whiteSpace: 'nowrap',
  },
  pipelineArrow: {
    fontSize: 14,
    color: '#999',
    margin: '0 4px',
  },
  card: {
    background: '#fff',
    border: '3px solid #111',
    borderRadius: 16,
    padding: 24,
    marginBottom: 20,
    boxShadow: '4px 4px 0 #111',
  },
  inputRow: {
    marginBottom: 16,
  },
  urlInput: {
    width: '100%',
    padding: '14px 18px',
    fontSize: 15,
    border: '3px solid #ddd',
    borderRadius: 12,
    outline: 'none',
    boxSizing: 'border-box',
    fontFamily: 'monospace',
    transition: 'border-color 0.2s',
    minHeight: 48,
    resize: 'vertical',
  },
  controlRow: {
    display: 'flex',
    alignItems: 'center',
    gap: 12,
    flexWrap: 'wrap',
  },
  select: {
    padding: '12px 16px',
    fontSize: 14,
    border: '3px solid #ddd',
    borderRadius: 12,
    background: '#fff',
    cursor: 'pointer',
    fontWeight: 600,
    outline: 'none',
    minWidth: 220,
  },
  primaryBtn: {
    padding: '12px 32px',
    fontSize: 16,
    fontWeight: 700,
    background: '#111',
    color: '#fff',
    border: 'none',
    borderRadius: 12,
    cursor: 'pointer',
    transition: 'transform 0.1s',
  },
  bulkHint: {
    fontSize: 13,
    color: '#ff9800',
    fontWeight: 600,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 700,
    margin: '0 0 16px',
    color: '#111',
  },
  progressContainer: {
    height: 8,
    background: '#eee',
    borderRadius: 4,
    marginBottom: 16,
    overflow: 'hidden',
  },
  progressBar: {
    height: '100%',
    background: 'linear-gradient(90deg, #0066ff, #00b341)',
    borderRadius: 4,
    width: 0,
  },
  spinner: {
    animation: 'spin 1s linear infinite',
    display: 'inline-block',
  },
  stepList: {
    display: 'flex',
    flexDirection: 'column',
    gap: 8,
  },
  stepItem: {
    display: 'flex',
    alignItems: 'center',
    gap: 10,
    fontSize: 14,
    padding: '6px 0',
  },
  stepIcon: {
    width: 20,
    textAlign: 'center',
    flexShrink: 0,
  },
  resultGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))',
    gap: 16,
  },
  resultItem: {
    display: 'flex',
    flexDirection: 'column',
    gap: 4,
  },
  resultLabel: {
    fontSize: 12,
    fontWeight: 600,
    color: '#999',
    textTransform: 'uppercase',
    letterSpacing: '0.5px',
  },
  resultValue: {
    fontSize: 15,
    fontWeight: 600,
    color: '#333',
    wordBreak: 'break-word',
  },
  resultValueHighlight: {
    fontSize: 20,
    fontWeight: 800,
    color: '#0066ff',
  },
  imageGallery: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fill, minmax(140px, 1fr))',
    gap: 12,
  },
  imageCard: {
    border: '2px solid #eee',
    borderRadius: 12,
    overflow: 'hidden',
    textAlign: 'center',
    background: '#fafafa',
  },
  previewImg: {
    width: '100%',
    aspectRatio: '1',
    objectFit: 'cover',
  },
  imageLabel: {
    display: 'block',
    fontSize: 12,
    fontWeight: 600,
    color: '#666',
    padding: '6px 0',
  },
  linkBtn: {
    display: 'inline-block',
    padding: '8px 20px',
    fontSize: 14,
    fontWeight: 600,
    color: '#0066ff',
    textDecoration: 'none',
    border: '2px solid #0066ff',
    borderRadius: 8,
    cursor: 'pointer',
  },
  errorText: {
    color: '#ff4444',
    fontSize: 13,
    whiteSpace: 'pre-wrap',
    wordBreak: 'break-word',
    background: '#fff5f5',
    padding: 12,
    borderRadius: 8,
    margin: 0,
  },
  platformGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fill, minmax(140px, 1fr))',
    gap: 8,
  },
  platformItem: {
    display: 'flex',
    alignItems: 'center',
    gap: 8,
    padding: '8px 12px',
    background: '#f8f8f8',
    borderRadius: 8,
    border: '1px solid #eee',
  },
  platformIcon: {
    fontSize: 18,
    flexShrink: 0,
  },
  platformName: {
    fontSize: 13,
    fontWeight: 600,
    color: '#333',
  },
  platformStatus: {
    fontSize: 11,
    fontWeight: 600,
    marginLeft: 'auto',
  },
};
