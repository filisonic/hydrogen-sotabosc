import {Suspense} from 'react';
import {Await, Link, NavLink} from 'react-router';
import {MEMBERSHIP_PUBLIC} from '~/lib/featureFlags';
import {CONTACT_EMAIL} from '~/lib/site/contact';

/**
 * @param {FooterProps}
 */
export function Footer({footer: footerPromise, header, publicStoreDomain, directoryChrome = false}) {
  const year = new Date().getFullYear();

  return (
    <Suspense>
      <Await resolve={footerPromise}>
        {(footer) => (
          <footer className={`site-footer${directoryChrome ? ' site-footer--directory' : ''}`}>
            <div className="site-footer-top">
              <div className="site-footer-brand">
                <Link to="/" className="site-footer-logo">
                  Sotabosc
                </Link>
                <p className="site-footer-tagline">
                  Barcelona’s living creative map — a directory, journal, and
                  toolkit for culture, ecology, and the creative city.
                </p>
                <a href={`mailto:${CONTACT_EMAIL}`} className="site-footer-email">
                  {CONTACT_EMAIL}
                </a>
              </div>

              <nav className="site-footer-cols" aria-label="Footer">
                <div className="site-footer-col">
                  <h3>Explore</h3>
                  <Link to="/city">Directory</Link>
                  <Link to="/discover">Discover</Link>
                  <Link to="/blogs/news">Journal</Link>
                  <Link to="/labs">Labs</Link>
                  <Link to="/tools">Tools</Link>
                </div>
                <div className="site-footer-col">
                  <h3>Shop</h3>
                  <Link to="/collections">Store</Link>
                  <Link to="/gallery">Gallery</Link>
                  {MEMBERSHIP_PUBLIC ? (
                    <Link to="/membership">Membership</Link>
                  ) : null}
                </div>
                <div className="site-footer-col">
                  <h3>Studio</h3>
                  <Link to="/research">Research</Link>
                  <Link to="/media">Media</Link>
                  <Link to="/contact">Contact</Link>
                </div>
              </nav>
            </div>

            <div className="site-footer-bottom">
              <div className="site-footer-bottom-inner">
                <span className="site-footer-copyright">
                  © {year} Sotabosc, Barcelona.
                </span>
                {footer?.menu && header.shop.primaryDomain?.url && (
                  <FooterMenu
                    menu={footer.menu}
                    primaryDomainUrl={header.shop.primaryDomain.url}
                    publicStoreDomain={publicStoreDomain}
                  />
                )}
              </div>
            </div>
          </footer>
        )}
      </Await>
    </Suspense>
  );
}

/**
 * @param {{
 *   menu: FooterQuery['menu'];
 *   primaryDomainUrl: FooterProps['header']['shop']['primaryDomain']['url'];
 *   publicStoreDomain: string;
 * }}
 */
function FooterMenu({menu, primaryDomainUrl, publicStoreDomain}) {
  return (
    <nav className="site-footer-legal" role="navigation" aria-label="Legal">
      {(menu || FALLBACK_FOOTER_MENU).items.map((item) => {
        if (!item.url) return null;
        // if the url is internal, we strip the domain
        const url =
          item.url.includes('myshopify.com') ||
          item.url.includes(publicStoreDomain) ||
          item.url.includes(primaryDomainUrl)
            ? new URL(item.url).pathname
            : item.url;
        const isExternal = !url.startsWith('/');
        return isExternal ? (
          <a href={url} key={item.id} rel="noopener noreferrer" target="_blank">
            {item.title}
          </a>
        ) : (
          <NavLink end key={item.id} prefetch="intent" to={url}>
            {item.title}
          </NavLink>
        );
      })}
    </nav>
  );
}

const FALLBACK_FOOTER_MENU = {
  id: 'gid://shopify/Menu/199655620664',
  items: [
    {
      id: 'gid://shopify/MenuItem/461633060920',
      resourceId: 'gid://shopify/ShopPolicy/23358046264',
      tags: [],
      title: 'Privacy Policy',
      type: 'SHOP_POLICY',
      url: '/policies/privacy-policy',
      items: [],
    },
    {
      id: 'gid://shopify/MenuItem/461633093688',
      resourceId: 'gid://shopify/ShopPolicy/23358013496',
      tags: [],
      title: 'Refund Policy',
      type: 'SHOP_POLICY',
      url: '/policies/refund-policy',
      items: [],
    },
    {
      id: 'gid://shopify/MenuItem/461633126456',
      resourceId: 'gid://shopify/ShopPolicy/23358111800',
      tags: [],
      title: 'Shipping Policy',
      type: 'SHOP_POLICY',
      url: '/policies/shipping-policy',
      items: [],
    },
    {
      id: 'gid://shopify/MenuItem/461633159224',
      resourceId: 'gid://shopify/ShopPolicy/23358079032',
      tags: [],
      title: 'Terms of Service',
      type: 'SHOP_POLICY',
      url: '/policies/terms-of-service',
      items: [],
    },
  ],
};

/**
 * @typedef {Object} FooterProps
 * @property {Promise<FooterQuery|null>} footer
 * @property {HeaderQuery} header
 * @property {string} publicStoreDomain
 * @property {boolean} [directoryChrome]
 */

/** @typedef {import('storefrontapi.generated').FooterQuery} FooterQuery */
/** @typedef {import('storefrontapi.generated').HeaderQuery} HeaderQuery */
