import { NextPageContext } from 'next';
import Link from 'next/link';

interface ErrorProps {
  statusCode?: number;
  message?: string;
}

function ErrorPage({ statusCode, message }: ErrorProps) {
  const code = statusCode || 500;
  const msg = message || (
    code === 404
      ? 'Halaman tidak ditemukan.'
      : 'Terjadi kesalahan pada server.'
  );

  return (
    <div className="min-h-screen bg-[#FFF7ED] flex items-center justify-center px-4">
      <div className="text-center max-w-md w-full">
        <div
          className="bg-white p-10"
          style={{
            border: '4px solid #111',
            boxShadow: '8px 8px 0 #111',
          }}
        >
          <div className="w-16 h-16 border-4 border-[#111] bg-[#FFF7ED] flex items-center justify-center mx-auto mb-6">
            <span className="font-black text-2xl text-[#DC2626]">{code}</span>
          </div>
          <h1 className="text-xl font-black text-[#111] uppercase tracking-[-0.02em] mb-3"
            style={{ fontFamily: "'Archivo Black', 'Arial Black', sans-serif" }}>
            {code === 404 ? '404 — Not Found' : 'Oops! Error'}
          </h1>
          <p className="text-[#666] mb-8 leading-relaxed font-bold">{msg}</p>
          <Link
            href="/"
            className="inline-flex items-center gap-2 px-6 py-3 font-bold text-sm uppercase text-white bg-[#F97316]"
            style={{
              border: '3px solid #111',
              boxShadow: '4px 4px 0 #111',
              fontFamily: "'Archivo Black', 'Arial Black', sans-serif",
            }}
          >
            Kembali ke Beranda
          </Link>
        </div>
      </div>
    </div>
  );
}

ErrorPage.getInitialProps = ({ res, err }: NextPageContext) => {
  const statusCode = res ? res.statusCode : err ? err.statusCode : 404;
  return { statusCode };
};

export default ErrorPage;
