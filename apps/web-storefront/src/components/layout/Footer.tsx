import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';

/** 页脚 */
export function Footer() {
  const { t } = useTranslation();
  const year = new Date().getFullYear();

  const linkGroups = [
    {
      title: t('footer.about'),
      links: [
        { label: t('nav.products'), href: '/products' },
        { label: t('nav.arbibot'), href: '/arbibot' },
      ],
    },
    {
      title: t('footer.help'),
      links: [
        { label: t('nav.orders'), href: '/orders' },
        { label: t('nav.account'), href: '/account' },
      ],
    },
  ];

  return (
    <footer className="mt-huge border-t-3 border-ink bg-ink text-white">
      <div className="mx-auto max-w-7xl px-lg2 py-huge">
        <div className="grid gap-xl2 md:grid-cols-4">
          {/* 品牌 */}
          <div className="md:col-span-2">
            <div className="flex items-center gap-2">
              <span className="flex h-10 w-10 items-center justify-center rounded-sm border-3 border-white bg-terracotta font-display text-heading-md">
                A
              </span>
              <span className="font-display text-heading-xl">AceProxy</span>
            </div>
            <p className="mt-md2 max-w-sm font-body text-body-sm text-gray-300">{t('footer.tagline')}</p>
          </div>

          {/* 链接组 */}
          {linkGroups.map((group) => (
            <div key={group.title}>
              <h4 className="font-display text-heading-sm uppercase tracking-wide">{group.title}</h4>
              <ul className="mt-md2 space-y-2">
                {group.links.map((link) => (
                  <li key={link.href}>
                    <Link
                      to={link.href}
                      className="font-body text-body-sm text-gray-300 transition-colors hover:text-terracotta"
                    >
                      {link.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        {/* 版权 */}
        <div className="mt-xl2 flex flex-col items-center justify-between gap-2 border-t-2 border-gray-700 pt-lg2 sm:flex-row">
          <p className="font-body text-caption text-gray-400">
            © {year} AceProxy. {t('footer.rights')}.
          </p>
          <div className="flex gap-4">
            <span className="font-body text-caption text-gray-400">{t('footer.terms')}</span>
            <span className="font-body text-caption text-gray-400">{t('footer.privacy')}</span>
          </div>
        </div>
      </div>
    </footer>
  );
}
