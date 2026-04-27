/**
 * @param {Route.LoaderArgs}
 */
export async function loader({request, context}) {
  try {
    return await context.customerAccount.login({
      countryCode: context.storefront.i18n.country,
    });
  } catch (error) {
    console.error('[account/login] Failed to initiate login:', error);
    throw error;
  }
}

export default function Login() {
  return (
    <div style={{
      minHeight: '100vh',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      backgroundColor: 'var(--surface)',
      color: 'var(--ink)',
    }}>
      <div style={{ textAlign: 'center' }}>
        <p style={{ fontSize: 'var(--step-1)', fontWeight: 700, letterSpacing: '0.1em' }}>
          Redirecting to sign in…
        </p>
      </div>
    </div>
  );
}

/** @typedef {import('./+types/account_.login').Route} Route */
