import { useEffect, useRef, type ReactNode } from 'react';
import { ClerkProvider, SignIn, SignUp, useClerk, useUser } from '@clerk/react';
import { publishableKeyFromHost } from '@clerk/react/internal';
import { shadcn } from '@clerk/themes';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { ArrowDownRight, ArrowLeft, ArrowRight, Check, Compass, LogOut, Sparkles } from 'lucide-react';
import { ErrorBoundary } from '@/components/error-boundary';
import { Toaster } from '@/components/ui/toaster';
import { TooltipProvider } from '@/components/ui/tooltip';
import { useEnsureAttendeeAccess, useHealthCheck } from '@workspace/api-client-react';
import NotFound from '@/pages/not-found';
import { Link, Route, Router as WouterRouter, Switch, useLocation } from 'wouter';

const queryClient = new QueryClient();
const clerkPubKey = publishableKeyFromHost(
  window.location.hostname,
  import.meta.env.VITE_CLERK_PUBLISHABLE_KEY,
);
const clerkProxyUrl = import.meta.env.VITE_CLERK_PROXY_URL;
const basePath = import.meta.env.BASE_URL.replace(/\/$/, '');

function stripBase(path: string) {
  return basePath && path.startsWith(basePath) ? path.slice(basePath.length) || '/' : path;
}

if (!clerkPubKey) throw new Error('Missing VITE_CLERK_PUBLISHABLE_KEY in .env file');

const clerkAppearance = {
  theme: shadcn,
  cssLayerName: 'clerk',
  options: {
    logoPlacement: 'inside' as const,
    logoLinkUrl: basePath || '/',
    logoImageUrl: `${window.location.origin}${basePath}/logo.svg`,
  },
  variables: {
    colorPrimary: '#177e79',
    colorForeground: '#182e3c',
    colorMutedForeground: '#687780',
    colorDanger: '#b5483c',
    colorBackground: '#fcfaf4',
    colorInput: '#f6f2e8',
    colorInputForeground: '#182e3c',
    colorNeutral: '#d7d5c9',
    fontFamily: "'DM Sans', sans-serif",
    borderRadius: '0.8rem',
  },
  elements: {
    rootBox: 'w-full flex justify-center',
    cardBox: 'bg-[#fcfaf4] rounded-2xl w-[440px] max-w-full overflow-hidden',
    card: '!shadow-none !border-0 !bg-transparent !rounded-none',
    footer: '!shadow-none !border-0 !bg-transparent !rounded-none',
    headerTitle: 'text-[#11283b] font-semibold tracking-tight',
    headerSubtitle: 'text-[#687780]',
    socialButtonsBlockButtonText: 'text-[#182e3c] font-semibold',
    formFieldLabel: 'text-[#263e4b] font-semibold',
    footerActionLink: 'text-[#177e79] font-semibold',
    footerActionText: 'text-[#687780]',
    dividerText: 'text-[#687780]',
    identityPreviewEditButton: 'text-[#177e79]',
    formFieldSuccessText: 'text-[#267b6a]',
    alertText: 'text-[#7d342e]',
    logoBox: 'mb-2',
    logoImage: 'max-h-10',
    socialButtonsBlockButton: 'border-[#d7d5c9] hover:bg-[#f2eee3]',
    formButtonPrimary: 'bg-[#177e79] hover:bg-[#126b67] text-white shadow-none',
    formFieldInput: 'bg-[#f6f2e8] border-[#d7d5c9] text-[#182e3c]',
    footerAction: 'border-t border-[#e2dfd3]',
    dividerLine: 'bg-[#d7d5c9]',
    alert: 'bg-[#fff0eb] border-[#e9c5b9]',
    otpCodeFieldInput: 'bg-[#f6f2e8] border-[#d7d5c9]',
    formFieldRow: 'mb-4',
    main: 'gap-5',
  },
};

function Brand({ dark = false }: { dark?: boolean }) {
  return (
    <div className={`brand-lockup${dark ? ' brand-dark' : ''}`} data-testid="brand-unleash">
      <span className="brand-mark" aria-hidden="true">u</span>
      <span>Unleash Your Future Self</span>
    </div>
  );
}

function Header() {
  return (
    <header className="site-header">
      <Link href="/" className="brand-link" data-testid="link-home-brand"><Brand /></Link>
      <nav className="header-links" aria-label="Main navigation">
        <Link href="/instructors" className="nav-quiet" data-testid="link-instructors-nav">For instructors</Link>
        <Link href="/instructor/login" className="nav-quiet" data-testid="link-instructor-login-nav">Instructor login</Link>
        <Link href="/attendee/login" className="nav-quiet" data-testid="link-attendee-login-nav">Attendee sign in</Link>
        <Link href="/attendee/sign-up" className="nav-cta" data-testid="link-attendee-signup-nav">Join a workshop <ArrowRight size={13} /></Link>
      </nav>
    </header>
  );
}

function Footer() {
  return (
    <footer className="section closing">
      <Link href="/" className="closing-brand" data-testid="link-home-footer"><Brand /></Link>
      <div className="footer-links">
        <Link href="/instructors" data-testid="link-instructors-footer">Instructor program</Link>
        <Link href="/attendee/login" data-testid="link-attendee-login-footer">Attendee sign in</Link>
        <span>© Unleash Your Future Self</span>
      </div>
    </footer>
  );
}

function HomePage() {
  return (
    <main className="app-shell">
      <section className="hero">
        <Header />
        <div className="hero-art" aria-hidden="true">
          <div className="doorway"><div className="door-light" /><div className="door-path" /></div>
          <span className="orb orb-one" /><span className="orb orb-two" /><span className="orb orb-three" />
        </div>
        <div className="hero-content fade-in">
          <div className="eyebrow">Make space for your next chapter</div>
          <h1>Unleash your <em>future self.</em></h1>
          <p className="hero-copy">A fresh perspective. A direction that feels like you. And a first step you can actually take.</p>
          <div className="button-row">
            <Link href="/attendee/sign-up" className="button button-gold" data-testid="link-start-your-next-chapter">Step into your future <ArrowRight size={15} /></Link>
            <Link href="/instructors" className="button button-outline" data-testid="link-workshops-for-groups">Bring it to my audience</Link>
          </div>
          <div className="hero-note"><span className="note-line" /> Live, guided experience · $47 / seat</div>
        </div>
      </section>

      <section className="section experience" id="experience">
        <div className="experience-aside">
          <div className="eyebrow section-kicker">The experience</div>
          <h2 className="section-title">A little room to <em>reimagine.</em></h2>
          <p className="section-lede">The future doesn’t have to be a five-year plan. It can begin with a moment of possibility—and a small, honest step forward.</p>
          <div className="duration-mark"><strong>90</strong><span>minutes, live</span></div>
        </div>
        <div className="journey-list">
          <div className="journey-step">
            <span className="step-number">01</span>
            <div><h3>Step beyond the familiar</h3><p>With gentle guidance, loosen the grip of “how things are” and make room for a future that feels worth moving toward.</p></div>
          </div>
          <div className="journey-step">
            <span className="step-number">02</span>
            <div><h3>Meet a possible you</h3><p>Explore a vivid, personal picture of what life could look and feel like when you’re moving in a direction that fits.</p></div>
          </div>
          <div className="journey-step">
            <span className="step-number">03</span>
            <div><h3>Bring the insight back</h3><p>Turn what you discovered into one meaningful next step—clear enough to carry into your real life.</p></div>
          </div>
          <div className="journey-step">
            <span className="step-number">04</span>
            <div><h3>Leave with something doable</h3><p>No grand reinvention required. Just a fresh perspective and a first move that belongs to you.</p></div>
          </div>
        </div>
      </section>

      <section className="section manifesto">
        <div className="manifesto-inner fade-in">
          <div className="eyebrow">A future worth moving toward</div>
          <h2>Unleash your <em>future self.</em></h2>
          <p>Not by becoming someone else. By finding the thread that feels like you, and following it—one practical step at a time.</p>
          <Link href="/attendee/sign-up" className="button button-gold" data-testid="link-join-experience">Explore the experience <ArrowRight size={15} /></Link>
        </div>
      </section>

      <section className="for-who">
        <div className="who-panel">
          <div className="eyebrow">For your own next chapter</div>
          <h2>Come curious.<br /><em>Leave with direction.</em></h2>
          <p>Join a live guided workshop and give yourself 90 minutes to imagine more possibilities, then choose one step you can actually take.</p>
          <Link href="/attendee/sign-up" className="text-link" data-testid="link-attendee-signup-main">Create an attendee account <ArrowRight size={14} /></Link>
        </div>
        <div className="who-panel">
          <div className="eyebrow">For people who guide people</div>
          <h2>Bring a new kind<br /><em>of possibility.</em></h2>
          <p>Facilitate the future-self experience for your group. The instructor program equips you to host a thoughtful, practical workshop.</p>
          <Link href="/instructors" className="text-link" data-testid="link-instructor-program-main">Explore the instructor program <ArrowRight size={14} /></Link>
        </div>
      </section>
      <Footer />
    </main>
  );
}

function InstructorsPage() {
  return (
    <main className="app-shell">
      <Header />
      <section className="page-top">
        <div className="eyebrow">For people who bring people together</div>
        <h1>Make your next event <em>the one they remember.</em></h1>
        <p>Bring Unleash Your Future Self to your workshop, retreat, webinar, or VIP session. They don’t just hear about possibility. They help create it, then leave with a next step that’s theirs.</p>
      </section>
      <section className="section instructor-content">
        <div>
          <div className="eyebrow section-kicker">A meaningful experience, made shareable</div>
          <h2 className="section-title">Good questions can<br /><em>open a door.</em></h2>
          <p className="section-lede">Unleash Your Future Self is a live, guided workshop designed for groups. Instructors create a welcoming environment where people can explore what matters, imagine a future that fits, and leave with a practical first step.</p>
          <div className="bullets">
            <div className="bullet"><Check className="bullet-check" size={17} /><span>Lead a 90-minute guided experience with a clear beginning, middle, and next step.</span></div>
            <div className="bullet"><Check className="bullet-check" size={17} /><span>Support participants as they explore possibility at their own pace.</span></div>
            <div className="bullet"><Check className="bullet-check" size={17} /><span>Bring a reflective, practical format to your community or organization.</span></div>
          </div>
        </div>
        <aside className="instructor-card">
          <div className="eyebrow section-kicker">A note about access</div>
          <h3>Instructor accounts are invite-only.</h3>
          <p>We welcome thoughtful facilitators who want to bring this work to groups. Request access and our team will be in touch about the program.</p>
          <Link href="/instructor/login" className="button button-dark" data-testid="link-instructor-sign-in">Instructor sign in <ArrowRight size={15} /></Link>
          <p style={{ marginTop: 20, marginBottom: 0 }}>Not an instructor yet? There isn’t a public instructor sign-up. Start with a request for access.</p>
          <Link href="/instructor/login#request-access" className="text-link" style={{ marginTop: 16 }} data-testid="link-request-instructor-access">Request access <ArrowDownRight size={14} /></Link>
        </aside>
      </section>
      <section className="section manifesto">
        <div className="manifesto-inner">
          <div className="eyebrow">Make room for the next chapter</div>
          <h2>Guide the moment<br />someone sees <em>more.</em></h2>
          <p>A small shift in perspective can become a meaningful step. Help make that moment possible for your group.</p>
          <Link href="/instructor/login#request-access" className="button button-gold" data-testid="link-request-access-cta">Request instructor access <ArrowRight size={15} /></Link>
        </div>
      </section>
      <Footer />
    </main>
  );
}

function AuthStory({ instructor = false, signup = false }: { instructor?: boolean; signup?: boolean }) {
  return (
    <div className="auth-story">
      <Link href="/" data-testid="link-auth-home"><Brand /></Link>
      <div className="auth-story-copy">
        <div className="eyebrow">{instructor ? 'For facilitators' : signup ? 'Your next chapter starts here' : 'A moment for what’s next'}</div>
        <h1>{instructor ? <>Make space for <em>possibility.</em></> : <>Make space for your <em>next chapter.</em></>}</h1>
        <p>{instructor ? 'Sign in to your instructor space, or ask about bringing the experience to your group.' : 'A fresh perspective. A direction that feels like you. And a first step you can actually take.'}</p>
      </div>
      <div className="auth-caption">Unleash Your Future Self · A guided future-self workshop</div>
    </div>
  );
}

function EntryPage({ instructor = false, signup = false }: { instructor?: boolean; signup?: boolean }) {
  const title = instructor ? 'Instructor sign in' : signup ? 'Join the experience' : 'Attendee sign in';
  const signInHref = instructor ? '/sign-in?portal=instructor' : '/sign-in?portal=attendee';
  return (
    <main className="auth-stage">
      <AuthStory instructor={instructor} signup={signup} />
      <section className="auth-panel">
        <div className="auth-panel-inner">
          <Link href={instructor ? '/instructors' : '/'} className="auth-back" data-testid="link-auth-back"><ArrowLeft size={14} /> Back to {instructor ? 'instructors' : 'home'}</Link>
          <div className="eyebrow section-kicker">{instructor ? 'Invite-only access' : signup ? 'Attendee account' : 'Welcome back'}</div>
          <h2>{title}</h2>
          <p className="auth-sub">{instructor ? 'Already have an instructor account? Continue to secure sign in.' : signup ? 'Create an account to join a live guided workshop.' : 'Pick up where your future-self journey left off.'}</p>
          <div className="auth-choice">
            {instructor ? (
              <>
                <Link href={signInHref} className="button button-dark" data-testid="link-open-instructor-signin">Continue to instructor sign in <ArrowRight size={15} /></Link>
                <div id="request-access">
                  <h3 style={{ color: 'var(--ocean)', fontSize: 17, fontWeight: 600, margin: '26px 0 7px' }}>Request instructor access</h3>
                  <p className="auth-sub" style={{ marginBottom: 14 }}>Instructor accounts are created by invitation. Tell us a little about your group and we’ll help you explore the program.</p>
                  <a className="button button-teal" href="mailto:hello@wizardsofsocial.com?subject=Instructor%20access%20request" data-testid="link-email-instructor-access">Email the team <ArrowRight size={15} /></a>
                </div>
              </>
            ) : signup ? (
              <Link href="/sign-up" className="button button-teal" data-testid="link-open-attendee-signup">Create attendee account <ArrowRight size={15} /></Link>
            ) : (
              <>
                <Link href={signInHref} className="button button-dark" data-testid="link-open-attendee-signin">Continue to sign in <ArrowRight size={15} /></Link>
                <p className="auth-footnote">New here? <Link href="/attendee/sign-up" style={{ color: 'var(--turquoise-deep)', fontWeight: 700 }} data-testid="link-signup-from-login">Create an attendee account</Link></p>
              </>
            )}
          </div>
          {instructor && <p className="auth-footnote">Instructor accounts are invite-only. There is no public instructor self-sign-up.</p>}
          {signup && <p className="auth-footnote">Attendee accounts are open to everyone. You can join a workshop whenever you’re ready.</p>}
        </div>
      </section>
    </main>
  );
}

function SignInPage() {
  const instructorFlow = new URLSearchParams(window.location.search).get('portal') === 'instructor';
  const signInAppearance = instructorFlow
    ? { ...clerkAppearance, elements: { ...clerkAppearance.elements, footerAction: { display: 'none' } } }
    : clerkAppearance;

  return (
    <main className="auth-stage">
      <AuthStory instructor={instructorFlow} />
      <section className="auth-panel">
        <div className="auth-panel-inner">
          <Link href={instructorFlow ? '/instructor/login' : '/attendee/login'} className="auth-back" data-testid="link-signin-back"><ArrowLeft size={14} /> Back to {instructorFlow ? 'instructor access' : 'attendee sign in'}</Link>
          <div className="eyebrow section-kicker">{instructorFlow ? 'Instructor access' : 'Welcome back'}</div>
          <h2>{instructorFlow ? 'Instructor sign in' : 'Sign in to continue'}</h2>
          <p className="auth-sub">{instructorFlow ? 'Sign in with your invited instructor account.' : 'Your next chapter is waiting when you are.'}</p>
          <SignIn
            routing="path"
            path={`${basePath}/sign-in`}
            signUpUrl={instructorFlow ? undefined : `${basePath}/sign-up`}
            forceRedirectUrl={`${basePath}/`}
            appearance={signInAppearance}
          />
        </div>
      </section>
    </main>
  );
}

function SignUpPage() {
  const { user, isLoaded } = useUser();
  const [, setLocation] = useLocation();
  const ensureAccess = useEnsureAttendeeAccess();
  const ensureAccessRef = useRef(ensureAccess.mutateAsync);
  ensureAccessRef.current = ensureAccess.mutateAsync;
  const handled = useRef(false);

  useEffect(() => {
    if (!isLoaded || !user || handled.current) return;
    handled.current = true;
    const role = user.publicMetadata.role;
    if (role === 'instructor') {
      setLocation('/access-denied');
      return;
    }
    if (role === 'attendee') {
      setLocation('/attendee/home');
      return;
    }
    void ensureAccessRef.current().then(async () => {
      const refreshed = await user.reload();
      if (refreshed.publicMetadata.role === 'attendee') setLocation('/attendee/home');
      else setLocation('/access-denied');
    }).catch(() => {
      handled.current = false;
    });
  }, [isLoaded, setLocation, user]);

  return (
    <main className="auth-stage">
      <AuthStory signup />
      <section className="auth-panel">
        <div className="auth-panel-inner">
          <Link href="/attendee/sign-up" className="auth-back" data-testid="link-signup-back"><ArrowLeft size={14} /> Back to attendee sign up</Link>
          <div className="eyebrow section-kicker">Attendee account</div>
          <h2>Create your account</h2>
          <p className="auth-sub">A little space to imagine what could be next.</p>
          {isLoaded && user ? (
            <div className="loading-card" role="status" data-testid="status-provisioning-attendee"><span className="status-dot" /> Preparing your attendee space…</div>
          ) : (
            <SignUp routing="path" path={`${basePath}/sign-up`} signInUrl={`${basePath}/attendee/login`} forceRedirectUrl={`${basePath}/sign-up`} />
          )}
        </div>
      </section>
    </main>
  );
}

function HomeRedirect() {
  const { user, isLoaded } = useUser();
  const [, setLocation] = useLocation();
  useEffect(() => {
    if (!isLoaded || !user) return;
    const role = user.publicMetadata.role;
    if (role === 'instructor') setLocation('/instructor/home');
    else if (role === 'attendee') setLocation('/attendee/home');
    else setLocation('/attendee/home?newAttendee=1');
  }, [isLoaded, setLocation, user]);
  return <HomePage />;
}

function Portal({ role }: { role: 'attendee' | 'instructor' }) {
  const { user, isLoaded } = useUser();
  const { signOut } = useClerk();
  const [location, setLocation] = useLocation();
  const health = useHealthCheck();
  const ensureAccess = useEnsureAttendeeAccess();
  const ensureAccessRef = useRef(ensureAccess.mutateAsync);
  ensureAccessRef.current = ensureAccess.mutateAsync;
  const handledNewSignUp = useRef(false);
  const actualRole = user?.publicMetadata.role;

  useEffect(() => {
    if (!isLoaded) return;
    if (!user) {
      setLocation(role === 'instructor' ? '/instructor/login' : '/attendee/login');
      return;
    }
    if (role === 'attendee' && actualRole !== 'attendee' && new URLSearchParams(window.location.search).has('newAttendee') && !handledNewSignUp.current) {
      handledNewSignUp.current = true;
      void ensureAccessRef.current().then(async () => {
        const refreshed = await user.reload();
        if (refreshed.publicMetadata.role === 'attendee') setLocation('/attendee/home');
        else setLocation('/access-denied');
      }).catch(() => setLocation('/access-denied'));
      return;
    }
    if (actualRole !== role) setLocation('/access-denied');
  }, [actualRole, isLoaded, role, setLocation, user, location]);

  if (!isLoaded || (user && actualRole !== role && role === 'attendee' && new URLSearchParams(window.location.search).has('newAttendee'))) {
    return <div className="auth-stage" role="status" aria-label="Loading your space"><div className="auth-story"><Brand /></div><div className="auth-panel"><div className="loading-card"><span className="status-dot" /> Opening your space…</div></div></div>;
  }
  if (!user || actualRole !== role) return null;

  const firstName = user.firstName || 'there';
  return (
    <main className="portal">
      <header className="portal-bar">
        <Link href="/" data-testid="link-portal-brand"><Brand dark /></Link>
        <button className="button button-dark" type="button" onClick={() => void signOut({ redirectUrl: basePath || '/' })} data-testid="button-sign-out"><LogOut size={14} /> Sign out</button>
      </header>
      <section className="portal-main">
        <div className="portal-welcome fade-in">
          <div className="eyebrow">{role === 'instructor' ? 'Instructor space' : 'Attendee space'}</div>
          <h1>Welcome, {firstName}.<br /><em>Make room for what’s next.</em></h1>
          <p>{role === 'instructor' ? 'Your instructor account is ready. More ways to support your groups will be added here as the program grows.' : 'Your attendee space is ready. When you’re ready, join a live guided workshop and explore the future that feels like you.'}</p>
          {role === 'attendee' ? (
            <Link href="/" className="button button-teal" data-testid="link-attendee-discover">Explore the experience <Compass size={15} /></Link>
          ) : (
            <Link href="/instructors" className="button button-teal" data-testid="link-instructor-program">Visit instructor program <Sparkles size={15} /></Link>
          )}
        </div>
        <div className="portal-note">
          <span>{role === 'instructor' ? 'A thoughtful space for the people who guide possibility.' : 'A fresh perspective can begin with one small step.'}</span>
          {health.isLoading ? <span className="status-pill" data-testid="status-service-loading"><span className="status-dot" /> Checking your space</span> : health.isError ? <button className="status-pill" type="button" onClick={() => void health.refetch()} data-testid="button-retry-health">Service check unavailable · Retry</button> : <span className="status-pill" data-testid="status-service-ready"><span className="status-dot" /> Your space is ready</span>}
        </div>
      </section>
    </main>
  );
}

function AccessDeniedPage() {
  const { user } = useUser();
  const { signOut } = useClerk();
  const role = user?.publicMetadata.role;
  const hasKnownRole = role === 'instructor' || role === 'attendee';
  const roleLabel = role === 'instructor' ? 'instructor' : 'attendee';
  const correctDestination = role === 'instructor' ? '/instructor/home' : '/attendee/home';
  return (
    <main className="access-denied">
      <div className="denied-inner">
        <Link href="/" data-testid="link-denied-brand"><Brand /></Link>
        <div className="eyebrow">A different door</div>
        <h1>This space isn’t attached to your account.</h1>
        <p>You’re signed in, but this account doesn’t have access to this portal. Choose the space that matches your account, or sign out to switch accounts.</p>
        <div className="button-row" style={{ justifyContent: 'center' }}>
          {hasKnownRole ? <Link href={correctDestination} className="button button-gold" data-testid="link-correct-portal">Go to your {roleLabel} space <ArrowRight size={15} /></Link> : <Link href="/attendee/login" className="button button-gold" data-testid="link-attendee-login-denied">Attendee sign in <ArrowRight size={15} /></Link>}
          <button className="button button-outline" type="button" onClick={() => void signOut({ redirectUrl: `${basePath}/` })} data-testid="button-denied-sign-out">Sign out</button>
        </div>
      </div>
    </main>
  );
}

function RoutedErrorBoundary({ children }: { children: ReactNode }) {
  const [location] = useLocation();
  return <ErrorBoundary resetKey={location}>{children}</ErrorBoundary>;
}

function Router() {
  return (
    <RoutedErrorBoundary>
      <Switch>
        <Route path="/" component={HomeRedirect} />
        <Route path="/instructors" component={InstructorsPage} />
        <Route path="/instructor/login" component={() => <EntryPage instructor />} />
        <Route path="/attendee/login" component={() => <EntryPage />} />
        <Route path="/attendee/sign-up" component={() => <EntryPage signup />} />
        <Route path="/instructor/home" component={() => <Portal role="instructor" />} />
        <Route path="/attendee/home" component={() => <Portal role="attendee" />} />
        <Route path="/access-denied" component={AccessDeniedPage} />
        <Route path="/sign-in/*?" component={SignInPage} />
        <Route path="/sign-up/*?" component={SignUpPage} />
        <Route component={NotFound} />
      </Switch>
    </RoutedErrorBoundary>
  );
}

function ClerkRouter() {
  const [, setLocation] = useLocation();
  return (
    <ClerkProvider
      publishableKey={clerkPubKey}
      proxyUrl={clerkProxyUrl}
      appearance={clerkAppearance}
      signInUrl={`${basePath}/sign-in`}
      signUpUrl={`${basePath}/sign-up`}
      localization={{
        signIn: { start: { title: 'Welcome back', subtitle: 'Sign in to return to your next chapter' } },
        signUp: { start: { title: 'Create your account', subtitle: 'Make space for your next chapter' } },
      }}
      routerPush={(to) => setLocation(stripBase(to))}
      routerReplace={(to) => setLocation(stripBase(to), { replace: true })}
    >
      <QueryClientProvider client={queryClient}>
        <TooltipProvider>
          <Router />
          <Toaster />
        </TooltipProvider>
      </QueryClientProvider>
    </ClerkProvider>
  );
}

function App() {
  return (
    <WouterRouter base={basePath}>
      <ClerkRouter />
    </WouterRouter>
  );
}

export default App;
