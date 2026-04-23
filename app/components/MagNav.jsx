import {Suspense} from 'react';
import {Await, Link, NavLink, useAsyncValue} from 'react-router';
import {useAnalytics, useOptimisticCart} from '@shopify/hydrogen';
import {useAside} from '~/components/Aside';

/**
 * Primary site navigation — fixed editorial bar (Hydrogen cart / search / account).
 *
 * @param {{
 *   cart?: Promise<import('storefrontapi.generated').CartApiQueryFragment | null>;
 *   isLoggedIn?: Promise<boolean>;
 *   header?: import('storefrontapi.generated').HeaderQuery | null;
 * }} props
 */
const MAG_ACCOUNT_LINK_CLASS = 'mag-nav-action-link';

/**
 * Guest `/account` runs the account layout loader and throws before login.
 * Customer Account API entry is `/account/login` (see `account_.login.jsx`).
 */
function MagNavAccountLink({isLoggedIn}) {
  const authState = isLoggedIn ?? Promise.resolve(false);
  return (
    <Suspense
      fallback={
        <NavLink prefetch="intent" to="/account/login" className={MAG_ACCOUNT_LINK_CLASS}>
          Sign in
        </NavLink>
      }
    >
      <Await
        resolve={authState}
        errorElement={
          <NavLink prefetch="intent" to="/account/login" className={MAG_ACCOUNT_LINK_CLASS}>
            Sign in
          </NavLink>
        }
      >
        {(loggedIn) => (
          <NavLink
            prefetch="intent"
            to={loggedIn ? '/account' : '/account/login'}
            className={MAG_ACCOUNT_LINK_CLASS}
          >
            {loggedIn ? 'Account' : 'Sign in'}
          </NavLink>
        )}
      </Await>
    </Suspense>
  );
}

export function MagNav({cart, isLoggedIn, header}) {
  const showMenu = Boolean(header?.menu && header?.shop?.primaryDomain?.url);

  return (
    <nav className="mag-nav" aria-label="Primary">
      <Link to="/" className="mag-logo">
        Sotabosc
      </Link>
      <div className="mag-links">
        <Link to="/city">Directory</Link>
        <Link to="/city-world">City world</Link>
        <Link to="/tools">Tools</Link>
        <Link to="/labs">Labs</Link>
        <Link to="/collections">Store</Link>
        <Link to="/gallery">Gallery</Link>
        <Link to="/work">Work</Link>
        <Link to="/membership" className="mag-pill mag-pill-primary">
          Membership
        </Link>
        <Link to="/contact" className="mag-pill">
          Contact
        </Link>
      </div>
      <div className="mag-nav-actions">
        {showMenu ? <MagNavMenuToggle /> : null}
        <MagNavSearchToggle />
        <MagNavAccountLink isLoggedIn={isLoggedIn} />
        {cart != null ? <MagNavCartToggle cart={cart} /> : null}
      </div>
    </nav>
  );
}

function MagNavMenuToggle() {
  const {open} = useAside();
  return (
    <button
      type="button"
      className="mag-nav-menu-btn reset"
      onClick={() => open('mobile')}
      aria-label="Open menu"
    >
      Menu
    </button>
  );
}

function MagNavSearchToggle() {
  const {open} = useAside();
  return (
    <button type="button" className="mag-nav-action-btn reset" onClick={() => open('search')}>
      Search
    </button>
  );
}

function MagNavCartToggle({cart}) {
  return (
    <Suspense fallback={<MagNavCartBadge count={null} />}>
      <Await resolve={cart}>
        <MagNavCartBanner />
      </Await>
    </Suspense>
  );
}

function MagNavCartBanner() {
  const originalCart = useAsyncValue();
  const cartResolved = useOptimisticCart(originalCart);
  return <MagNavCartBadge count={cartResolved?.totalQuantity ?? 0} />;
}

function MagNavCartBadge({count}) {
  const {open} = useAside();
  const {publish, shop, cart, prevCart} = useAnalytics();

  return (
    <a
      href="/cart"
      className="mag-nav-action-link"
      onClick={(e) => {
        e.preventDefault();
        open('cart');
        publish('cart_viewed', {
          cart,
          prevCart,
          shop,
          url: typeof window !== 'undefined' ? window.location.href : '',
        });
      }}
    >
      Cart
      {typeof count === 'number' && count > 0 ? ` ${count}` : ''}
    </a>
  );
}
