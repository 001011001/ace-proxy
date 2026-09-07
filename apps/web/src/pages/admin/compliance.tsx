import { useState, useEffect } from 'react';
import AdminLayout from '@/components/admin/AdminLayout';
import { Shield, CheckCircle2, XCircle, AlertTriangle, Search, Globe } from 'lucide-react';

interface ComplianceResult {
  passed: boolean;
  banned: string[];
  restricted: Array<{ label: string; requiredDocs: string[] }>;
  countryIssues: string[];
  hsCodeSuggestion: string | null;
}

interface CountryInfo {
  code: string;
  agency: string;
  ruleCount: number;
}

export default function CompliancePage() {
  const [productName, setProductName] = useState('');
  const [category, setCategory] = useState('electronics');
  const [country, setCountry] = useState('ID');
  const [result, setResult] = useState<ComplianceResult | null>(null);
  const [loading, setLoading] = useState(false);
  const [countries, setCountries] = useState<CountryInfo[]>([]);
  const [bannedCats, setBannedCats] = useState<any[]>([]);
  const [restrictedCats, setRestrictedCats] = useState<any[]>([]);

  useEffect(() => {
    fetchCountries();
    fetchBannedCategories();
    fetchRestrictedCategories();
  }, []);

  const fetchCountries = async () => {
    try {
      const res = await fetch('/api/compliance/countries');
      setCountries((await res.json()) || []);
    } catch { }
  };

  const fetchBannedCategories = async () => {
    try {
      const res = await fetch('/api/compliance/banned-categories');
      setBannedCats((await res.json()) || []);
    } catch { }
  };

  const fetchRestrictedCategories = async () => {
    try {
      const res = await fetch('/api/compliance/restricted-categories');
      setRestrictedCats((await res.json()) || []);
    } catch { }
  };

  const checkCompliance = async () => {
    if (!productName.trim()) return;
    setLoading(true);
    try {
      const res = await fetch('/api/compliance/check', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name: productName, category, destinationCountry: country }),
      });
      setResult(await res.json());
    } catch { } finally {
      setLoading(false);
    }
  };

  return (
    <AdminLayout title="合规中心">
      <div className="grid grid-cols-3 gap-6">
        {/* 左侧：合规检查面板 */}
        <div className="col-span-2 space-y-6">
          <div className="card">
            <div className="card-header">
              <h3 className="text-heading-sm font-display font-semibold flex items-center gap-2">
                <Shield size={20} className="text-terracotta" />
                产品合规检查
              </h3>
              <p className="text-sm text-ink-mute mt-1">检查产品是否可以合规上架到目标国家</p>
            </div>
            <div className="p-5 space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="label-text">产品名称 *</label>
                  <input
                    type="text"
                    value={productName}
                    onChange={(e) => setProductName(e.target.value)}
                    placeholder="输入产品名称...如: iPhone 充电宝"
                    className="input-field w-full mt-1"
                    onKeyDown={(e) => e.key === 'Enter' && checkCompliance()}
                  />
                </div>
                <div>
                  <label className="label-text">品类</label>
                  <select value={category} onChange={(e) => setCategory(e.target.value)} className="input-field w-full mt-1">
                    <option value="electronics">电子产品</option>
                    <option value="fashion">服装</option>
                    <option value="beauty">化妆品</option>
                    <option value="home">家居</option>
                    <option value="toys">玩具</option>
                    <option value="sports">运动用品</option>
                    <option value="food">食品</option>
                    <option value="automotive">汽车用品</option>
                    <option value="baby">婴儿用品</option>
                    <option value="pet">宠物用品</option>
                  </select>
                </div>
              </div>
              <div>
                <label className="label-text">
                  <Globe size={14} className="inline mr-1" />
                  目的国家
                </label>
                <select value={country} onChange={(e) => setCountry(e.target.value)} className="input-field w-full mt-1">
                  <option value="ID">印尼 (BPOM)</option>
                  <option value="TH">泰国 (FDA)</option>
                  <option value="PH">菲律宾 (FDA)</option>
                  <option value="BR">巴西 (ANVISA)</option>
                </select>
              </div>
              <button
                onClick={checkCompliance}
                disabled={loading || !productName.trim()}
                className="btn-primary"
              >
                {loading ? '检查中...' : '开始合规检查'}
              </button>
            </div>
          </div>

          {/* 检查结果 */}
          {result && (
            <div className="card">
              <div className="card-header">
                <h3 className="text-heading-sm font-display font-semibold">检查结果</h3>
              </div>
              <div className="p-5 space-y-4">
                {/* 总体判定 */}
                <div className={`flex items-center gap-3 p-4 ${result.passed ? 'bg-success/10 border border-success/20' : 'bg-danger/10 border border-danger/20'}`}>
                  {result.passed
                    ? <CheckCircle2 size={28} className="text-success" />
                    : <XCircle size={28} className="text-danger" />
                  }
                  <div>
                    <p className={`text-lg font-semibold ${result.passed ? 'text-success' : 'text-danger'}`}>
                      {result.passed ? '合规通过' : '不合规 - 禁止上架'}
                    </p>
                    <p className="text-sm text-ink-mute">
                      {result.passed ? '该产品可以安全上架到目标国家' : '该产品存在合规风险，请检查下方详情'}
                    </p>
                  </div>
                </div>

                {/* 禁止品类 */}
                {result.banned.length > 0 && (
                  <div className="bg-danger/5 border border-danger/20 p-4">
                    <h4 className="font-semibold text-danger mb-2 flex items-center gap-2">
                      <XCircle size={16} /> 禁运品类（{result.banned.length}项）
                    </h4>
                    <ul className="list-disc list-inside text-sm space-y-1">
                      {result.banned.map((b, i) => <li key={i} className="text-danger">{b}</li>)}
                    </ul>
                  </div>
                )}

                {/* 限制品类 */}
                {result.restricted.length > 0 && (
                  <div className="bg-warning/5 border border-warning/20 p-4">
                    <h4 className="font-semibold text-warning mb-2 flex items-center gap-2">
                      <AlertTriangle size={16} /> 限制品类（{result.restricted.length}项 - 可运输但需额外文件）
                    </h4>
                    {result.restricted.map((r, i) => (
                      <div key={i} className="mb-2 last:mb-0">
                        <p className="text-sm font-medium text-warning">{r.label}</p>
                        <p className="text-xs text-ink-mute">需要文件: {r.requiredDocs.join('、')}</p>
                      </div>
                    ))}
                  </div>
                )}

                {/* 国家法规 */}
                {result.countryIssues.length > 0 && (
                  <div className="bg-ink-light/5 border border-ink-light/10 p-4">
                    <h4 className="font-semibold mb-2 flex items-center gap-2">
                      <Globe size={16} /> 目的国法规要求（{result.countryIssues.length}项）
                    </h4>
                    <ul className="list-disc list-inside text-sm space-y-1">
                      {result.countryIssues.map((c, i) => <li key={i}>{c}</li>)}
                    </ul>
                  </div>
                )}

                {/* HS Code */}
                {result.hsCodeSuggestion && (
                  <div className="flex items-center gap-2 p-3 bg-ink/5 ">
                    <Search size={16} className="text-terracotta" />
                    <span className="text-sm">建议 HS Code:</span>
                    <span className="text-sm font-semibold text-terracotta">{result.hsCodeSuggestion}</span>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>

        {/* 右侧：合规知识库 */}
        <div className="space-y-6">
          {/* 禁运品类清单 */}
          <div className="card">
            <div className="card-header flex items-center justify-between">
              <h4 className="text-body font-semibold flex items-center gap-2">
                <XCircle size={16} className="text-danger" /> 禁运品类
              </h4>
              <span className="badge-danger">{bannedCats.length}</span>
            </div>
            <div className="p-3 max-h-[280px] overflow-y-auto">
              {bannedCats.map((cat, i) => (
                <div key={i} className="py-2 border-b border-ink/5 last:border-0">
                  <p className="text-xs font-semibold text-danger">{cat.category.replace('_', ' ')}</p>
                  <p className="text-[11px] text-ink-mute mt-1">{cat.items.join('、')}</p>
                </div>
              ))}
            </div>
          </div>

          {/* 限制品类清单 */}
          <div className="card">
            <div className="card-header flex items-center justify-between">
              <h4 className="text-body font-semibold flex items-center gap-2">
                <AlertTriangle size={16} className="text-warning" /> 限制品类
              </h4>
              <span className="badge-warning">{restrictedCats.length}</span>
            </div>
            <div className="p-3 max-h-[280px] overflow-y-auto">
              {restrictedCats.map((cat, i) => (
                <div key={i} className="py-2 border-b border-ink/5 last:border-0">
                  <p className="text-xs font-semibold">{cat.label}</p>
                  <p className="text-[11px] text-ink-mute mt-1">{cat.requiredDocs.join('、')}</p>
                </div>
              ))}
            </div>
          </div>

          {/* 支持国家 */}
          <div className="card">
            <div className="card-header">
              <h4 className="text-body font-semibold flex items-center gap-2">
                <Globe size={16} /> 目的国法规覆盖
              </h4>
            </div>
            <div className="p-3 space-y-2">
              {countries.map((c) => (
                <div key={c.code} className="flex items-center justify-between py-1.5 border-b border-ink/5 last:border-0">
                  <div>
                    <p className="text-xs font-semibold">{c.code}</p>
                    <p className="text-[10px] text-ink-mute">{c.agency}</p>
                  </div>
                  <span className="text-[10px] bg-ink/5 px-2 py-0.5 ">{c.ruleCount}条法规</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </AdminLayout>
  );
}
