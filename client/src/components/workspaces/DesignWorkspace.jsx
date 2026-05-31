import React, { useState, useRef, useEffect, useMemo } from 'react';
import axios from 'axios';
import { motion, AnimatePresence } from 'framer-motion';
import { FiMessageSquare, FiCheckCircle, FiAlertTriangle, FiEye, FiLayout, FiMaximize2, FiCpu, FiStar } from 'react-icons/fi';
import styles from './DesignWorkspace.module.css';

const MOCKUP_SECTIONS = [
  { id: 'nav', name: 'Global Navigation', score: 85, a11y: 'Pass' },
  { id: 'hero', name: 'Primary Action Area', score: 72, a11y: 'Warning' },
  { id: 'form', name: 'Form / Inputs', score: 90, a11y: 'Pass' },
  { id: 'footer', name: 'Footer / Secondary Links', score: 65, a11y: 'Fail' }
];

const AI_TEAMMATE_REPLIES = [
  "I'd suggest increasing the contrast ratio here to meet WCAG AA standards. The gray on dark blue is currently 3.2:1.",
  "Great catch! We should also ensure the focus states are distinct for keyboard navigation.",
  "Consider reducing the cognitive load by grouping these inputs. The spacing feels a bit tight.",
  "I love this direction, but let's make sure the primary call-to-action stands out more against the background.",
  "Let's verify this layout on mobile breakpoints—the touch targets might be too small.",
  "Good eye. The visual weight here competes with the primary action — consider reducing opacity.",
  "This pattern is common in our design system. I can share the token if that helps.",
];

// ── Scene resolver: picks the right mockup based on task text ──────────────
const resolveScene = (task) => {
  if (!task) return 'settings';
  const text = `${task.title || ''} ${task.description || ''} ${task.category || ''} ${task.businessContext || ''}`.toLowerCase();

  if (text.includes('checkout') || text.includes('cart') || text.includes('payment') || text.includes('order')) return 'checkout';
  if (text.includes('onboard') || text.includes('sign up') || text.includes('signup') || text.includes('register') || text.includes('welcome')) return 'onboarding';
  if (text.includes('dashboard') || text.includes('metric') || text.includes('chart') || text.includes('analytics') || text.includes('widget')) return 'dashboard';
  if (text.includes('modal') || text.includes('dialog') || text.includes('popup') || text.includes('confirmation')) return 'modal';
  if (text.includes('nav') || text.includes('navigation') || text.includes('menu') || text.includes('sidebar')) return 'navigation';
  if (text.includes('form') || text.includes('input') || text.includes('field') || text.includes('label')) return 'form';
  if (text.includes('landing') || text.includes('hero') || text.includes('homepage') || text.includes('home page')) return 'landing';

  if (text.includes('button') || text.includes('contrast') || text.includes('cta') || text.includes('primary action') || text.includes('save changes') || text.includes('submit')) return 'settings';
  if (text.includes('profile') || text.includes('account') || text.includes('user setting') || text.includes('preference')) return 'settings';

  return 'settings'; // default
};

// ── Individual scene components ────────────────────────────────────────────

const SettingsMockup = ({ task }) => (
  <div className={styles.scene}>
    {/* App nav */}
    <div className={styles.sceneNav}>
      <div className={styles.sceneNavLogo}>AppName</div>
      <div className={styles.sceneNavLinks}><span>Home</span><span>Projects</span><span className={styles.sceneNavActive}>Settings</span><span>Help</span></div>
      <div className={styles.sceneNavAvatar}>JD</div>
    </div>

    {/* Page layout */}
    <div className={styles.sceneLayout}>
      {/* Sidebar */}
      <div className={styles.sceneSidebar}>
        {['General', 'Profile', 'Notifications', 'Security', 'Billing', 'Integrations'].map((item, i) => (
          <div key={item} className={`${styles.sceneSidebarItem} ${i === 0 ? styles.sceneSidebarItemActive : ''}`}>{item}</div>
        ))}
      </div>

      {/* Content */}
      <div className={styles.sceneContent}>
        <div className={styles.scenePageTitle}>General Settings</div>
        <div className={styles.scenePageSubtitle}>Manage your account preferences and display options.</div>

        <div className={styles.sceneCard}>
          <div className={styles.sceneCardTitle}>Display Name</div>
          <div className={styles.sceneFieldRow}>
            <div className={styles.sceneField}><div className={styles.sceneLabel}>First Name</div><div className={styles.sceneInput}>Jordan</div></div>
            <div className={styles.sceneField}><div className={styles.sceneLabel}>Last Name</div><div className={styles.sceneInput}>Davis</div></div>
          </div>
          <div className={styles.sceneField}><div className={styles.sceneLabel}>Email</div><div className={styles.sceneInput}>jordan.davis@company.com</div></div>
          <div className={styles.sceneField}><div className={styles.sceneLabel}>Timezone</div><div className={styles.sceneSelectInput}><span>UTC +05:30 — Mumbai</span><span className={styles.sceneChevron}>▾</span></div></div>

          {/* THE PROBLEM BUTTON — low contrast "Save Changes" */}
          <div className={styles.sceneActionRow}>
            <div className={styles.sceneSecondaryBtn}>Cancel</div>
            {/* Save Changes is the problematic button — barely visible */}
            <div className={styles.sceneProblemBtnWrapper}>
              <div className={styles.sceneSaveBtn}>Save Changes</div>
              <div className={styles.sceneProblemTag}>⚠ Low contrast</div>
            </div>
          </div>
        </div>

        <div className={styles.sceneCard}>
          <div className={styles.sceneCardTitle}>Appearance</div>
          <div className={styles.sceneToggleRow}><div className={styles.sceneToggleLabel}><strong>Dark Mode</strong><span>Use dark theme across the app</span></div><div className={styles.sceneToggle}><div className={styles.sceneToggleKnob} /></div></div>
          <div className={styles.sceneToggleRow}><div className={styles.sceneToggleLabel}><strong>Compact View</strong><span>Reduce spacing in list views</span></div><div className={`${styles.sceneToggle} ${styles.sceneToggleOff}`}><div className={styles.sceneToggleKnob} /></div></div>
        </div>
      </div>
    </div>
  </div>
);

const CheckoutMockup = ({ task }) => (
  <div className={styles.scene}>
    <div className={styles.sceneNav}>
      <div className={styles.sceneNavLogo}>ShopFlow</div>
      <div className={styles.sceneNavLinks}><span>Home</span><span>Shop</span><span>Cart (3)</span></div>
    </div>
    <div className={styles.sceneSteps}>
      <div className={`${styles.sceneStep} ${styles.sceneStepDone}`}><span>✓</span> Cart</div>
      <div className={styles.sceneStepLine} />
      <div className={`${styles.sceneStep} ${styles.sceneStepActive}`}><span>2</span> Checkout</div>
      <div className={styles.sceneStepLine} />
      <div className={styles.sceneStep}><span>3</span> Confirm</div>
    </div>
    <div className={styles.sceneCheckoutBody}>
      <div className={styles.sceneFormSection}>
        <div className={styles.sceneCardTitle}>Shipping Information</div>
        <div className={styles.sceneFieldRow}>
          <div className={styles.sceneField}><div className={styles.sceneLabel}>First Name</div><div className={styles.sceneInput} /></div>
          <div className={styles.sceneField}><div className={styles.sceneLabel}>Last Name</div><div className={styles.sceneInput} /></div>
        </div>
        <div className={styles.sceneField}><div className={styles.sceneLabel}>Email</div><div className={styles.sceneInput} /></div>
        <div className={styles.sceneField}><div className={styles.sceneLabel}>Address</div><div className={styles.sceneInput} /></div>
        <div className={styles.sceneFieldRow}>
          <div className={styles.sceneField}><div className={styles.sceneLabel}>City</div><div className={styles.sceneInput} /></div>
          <div className={styles.sceneField}><div className={styles.sceneLabel}>ZIP</div><div className={styles.sceneInput} /></div>
        </div>
        <div className={styles.sceneCardTitle} style={{ marginTop: '1.25rem' }}>Payment</div>
        <div className={styles.scenePayRow}>
          <div className={`${styles.scenePayChip} ${styles.scenePayChipActive}`}>💳 Card</div>
          <div className={styles.scenePayChip}>🏦 Bank</div>
          <div className={styles.scenePayChip}>🅿️ PayPal</div>
        </div>
        <div className={styles.sceneField}><div className={styles.sceneLabel}>Card Number</div><div className={styles.sceneInput} /></div>
        <div className={styles.sceneFieldRow}>
          <div className={styles.sceneField}><div className={styles.sceneLabel}>Expiry</div><div className={styles.sceneInput} /></div>
          <div className={styles.sceneField}><div className={styles.sceneLabel}>CVV</div><div className={styles.sceneInput} /></div>
        </div>
        <div className={styles.sceneActionRow} style={{ marginTop: '1rem' }}>
          <div className={styles.sceneSecondaryBtn}>Back</div>
          <div className={styles.scenePrimaryBtn}>Place Order →</div>
        </div>
      </div>
      <div className={styles.sceneSummaryCard}>
        <div className={styles.sceneCardTitle}>Order Summary</div>
        {[{ name: 'Wireless Headphones Pro', qty: '1 · Black', price: '$129', color: '#312e81' }, { name: 'USB-C Hub 7-in-1', qty: '2 · Silver', price: '$78', color: '#0f766e' }].map(item => (
          <div key={item.name} className={styles.sceneOrderItem}>
            <div className={styles.sceneProductThumb} style={{ background: `linear-gradient(135deg, ${item.color}, ${item.color}aa)` }} />
            <div className={styles.sceneProductInfo}><div className={styles.sceneProductName}>{item.name}</div><div className={styles.sceneProductMeta}>Qty: {item.qty}</div></div>
            <div className={styles.sceneProductPrice}>{item.price}</div>
          </div>
        ))}
        <div className={styles.sceneDivider} />
        <div className={styles.sceneSummaryRow}><span>Subtotal</span><span>$207</span></div>
        <div className={styles.sceneSummaryRow}><span>Shipping</span><span style={{ color: '#10b981' }}>Free</span></div>
        <div className={styles.sceneSummaryRow}><span>Tax (8%)</span><span>$16.56</span></div>
        <div className={styles.sceneDivider} />
        <div className={`${styles.sceneSummaryRow} ${styles.sceneSummaryTotal}`}><strong>Total</strong><strong>$223.56</strong></div>
        <div className={styles.sceneSecureBadge}>🔒 SSL Secured</div>
      </div>
    </div>
  </div>
);

const OnboardingMockup = ({ task }) => (
  <div className={styles.scene} style={{ alignItems: 'center', justifyContent: 'center', background: 'linear-gradient(135deg, #0f172a 0%, #1e1b4b 100%)' }}>
    <div className={styles.sceneOnboardCard}>
      <div className={styles.sceneOnboardLogo}>✦ AppName</div>
      <div className={styles.sceneOnboardSteps}>
        {['Account', 'Profile', 'Preferences', 'Done'].map((s, i) => (
          <React.Fragment key={s}>
            <div className={`${styles.sceneOnboardStep} ${i < 2 ? styles.sceneOnboardStepDone : i === 2 ? styles.sceneOnboardStepActive : ''}`}>{i < 2 ? '✓' : i + 1}</div>
            {i < 3 && <div className={styles.sceneOnboardLine} />}
          </React.Fragment>
        ))}
      </div>
      <div className={styles.sceneOnboardTitle}>Set your preferences</div>
      <div className={styles.sceneOnboardSubtitle}>Help us personalize your experience</div>
      <div className={styles.sceneField}><div className={styles.sceneLabel}>Job Title</div><div className={styles.sceneInput}>Product Designer</div></div>
      <div className={styles.sceneField}><div className={styles.sceneLabel}>Team Size</div>
        <div className={styles.sceneChipRow}>
          {['1–5', '6–20', '21–50', '50+'].map((c, i) => (
            <div key={c} className={`${styles.sceneChip} ${i === 1 ? styles.sceneChipActive : ''}`}>{c}</div>
          ))}
        </div>
      </div>
      <div className={styles.sceneField}><div className={styles.sceneLabel}>Use case</div>
        <div className={styles.sceneChipRow}>
          {['Design', 'Engineering', 'Product', 'Analytics'].map((c, i) => (
            <div key={c} className={`${styles.sceneChip} ${i === 0 ? styles.sceneChipActive : ''}`}>{c}</div>
          ))}
        </div>
      </div>
      <div className={styles.scenePrimaryBtn} style={{ width: '100%', textAlign: 'center', marginTop: '0.75rem' }}>Continue →</div>
      <div className={styles.sceneOnboardSkip}>Skip for now</div>
    </div>
  </div>
);

const DashboardMockup = ({ task }) => (
  <div className={styles.scene}>
    <div className={styles.sceneNav}>
      <div className={styles.sceneNavLogo}>Analytics</div>
      <div className={styles.sceneNavLinks}><span>Overview</span><span className={styles.sceneNavActive}>Dashboard</span><span>Reports</span><span>Settings</span></div>
      <div className={styles.sceneNavAvatar}>A</div>
    </div>
    <div className={styles.sceneLayout}>
      <div className={styles.sceneSidebar}>
        {['Dashboard', 'Users', 'Revenue', 'Conversions', 'Campaigns', 'Exports'].map((item, i) => (
          <div key={item} className={`${styles.sceneSidebarItem} ${i === 0 ? styles.sceneSidebarItemActive : ''}`}>{item}</div>
        ))}
      </div>
      <div className={styles.sceneContent}>
        <div className={styles.scenePageTitle}>Dashboard Overview</div>
        <div className={styles.sceneDashMetrics}>
          {[{ label: 'Total Users', val: '24,831', delta: '+12%', up: true }, { label: 'Revenue', val: '$48.2K', delta: '+8.4%', up: true }, { label: 'Churn Rate', val: '3.2%', delta: '-0.4%', up: false }, { label: 'Avg. Session', val: '4m 12s', delta: '+0:22', up: true }].map(m => (
            <div key={m.label} className={styles.sceneDashMetric}>
              <div className={styles.sceneDashMetricLabel}>{m.label}</div>
              <div className={styles.sceneDashMetricVal}>{m.val}</div>
              <div className={styles.sceneDashMetricDelta} style={{ color: m.up ? '#10b981' : '#f43f5e' }}>{m.delta}</div>
            </div>
          ))}
        </div>
        <div className={styles.sceneDashChartRow}>
          <div className={styles.sceneDashChart}>
            <div className={styles.sceneDashChartTitle}>Weekly Revenue</div>
            <div className={styles.sceneDashBars}>
              {[60, 45, 80, 55, 90, 70, 95].map((h, i) => (
                <div key={i} className={styles.sceneDashBar} style={{ height: `${h}%` }} />
              ))}
            </div>
            <div className={styles.sceneDashBarLabels}>{['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'].map(d => <span key={d}>{d}</span>)}</div>
          </div>
          <div className={styles.sceneDashTable}>
            <div className={styles.sceneDashTableTitle}>Top Pages</div>
            {[{ page: '/dashboard', views: '12,341' }, { page: '/pricing', views: '8,920' }, { page: '/features', views: '6,104' }, { page: '/docs', views: '4,871' }].map(row => (
              <div key={row.page} className={styles.sceneDashTableRow}><span>{row.page}</span><span>{row.views}</span></div>
            ))}
          </div>
        </div>
      </div>
    </div>
  </div>
);

const ModalMockup = ({ task }) => (
  <div className={styles.scene} style={{ position: 'relative' }}>
    {/* Blurred background app */}
    <div className={styles.sceneModalBg}>
      <div className={styles.sceneNav}><div className={styles.sceneNavLogo}>AppName</div></div>
      <div style={{ padding: '2rem', display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '1rem' }}>
        {[1, 2, 3, 4, 5, 6].map(i => <div key={i} style={{ height: 80, background: 'rgba(255,255,255,0.03)', borderRadius: 8, border: '1px solid rgba(255,255,255,0.06)' }} />)}
      </div>
    </div>
    {/* Overlay */}
    <div className={styles.sceneOverlay} />
    {/* Modal */}
    <div className={styles.sceneModal}>
      <div className={styles.sceneModalHeader}>
        <div>
          <div className={styles.sceneCardTitle}>Delete Project</div>
          <div className={styles.scenePageSubtitle}>This action cannot be undone.</div>
        </div>
        <div className={styles.sceneModalClose}>✕</div>
      </div>
      <div className={styles.sceneModalBody}>
        <div className={styles.sceneModalWarning}>
          <FiAlertTriangle style={{ color: '#f59e0b' }} />
          <span>All data, files, and collaborators will be permanently removed.</span>
        </div>
        <div className={styles.sceneField}><div className={styles.sceneLabel}>Type <strong style={{ color: '#f87171' }}>DELETE</strong> to confirm</div><div className={styles.sceneInput} /></div>
      </div>
      <div className={styles.sceneModalFooter}>
        <div className={styles.sceneSecondaryBtn}>Cancel</div>
        <div className={styles.sceneDangerBtn}>Delete Project</div>
      </div>
    </div>
  </div>
);

const NavigationMockup = ({ task }) => (
  <div className={styles.scene}>
    {/* Top nav — the focus */}
    <div className={styles.sceneNavFull}>
      <div className={styles.sceneNavLogo}>Platform</div>
      <div className={styles.sceneNavFullLinks}>
        <span className={styles.sceneNavActive}>Home</span>
        <span>Products</span>
        <span>Solutions</span>
        <span>Pricing</span>
        <span>Blog</span>
        <span>Docs</span>
      </div>
      <div className={styles.sceneNavFullActions}>
        <div className={styles.sceneSecondaryBtn} style={{ padding: '0.3rem 0.75rem', fontSize: '0.7rem' }}>Log in</div>
        <div className={styles.scenePrimaryBtn} style={{ padding: '0.3rem 0.75rem', fontSize: '0.7rem' }}>Sign up free</div>
      </div>
    </div>

    {/* Annotate nav problem areas */}
    <div className={styles.sceneNavAnnotations}>
      <div className={styles.sceneAnnotationCard}><span className={styles.sceneAnnotationBadge}>⚠</span> Active state color blends with background — low contrast</div>
      <div className={styles.sceneAnnotationCard}><span className={styles.sceneAnnotationBadge}>⚠</span> Touch targets on mobile may be under 44×44px</div>
    </div>

    {/* Page body placeholder */}
    <div style={{ padding: '2rem', display: 'flex', flexDirection: 'column', gap: '1rem' }}>
      <div style={{ height: 120, background: 'rgba(99,102,241,0.08)', borderRadius: 12, border: '1px solid rgba(99,102,241,0.15)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#64748b', fontSize: '0.75rem' }}>Hero Section (below nav)</div>
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '1rem' }}>
        {[1, 2, 3].map(i => <div key={i} style={{ height: 64, background: 'rgba(255,255,255,0.03)', borderRadius: 8, border: '1px solid rgba(255,255,255,0.06)' }} />)}
      </div>
    </div>
  </div>
);

const FormMockup = ({ task }) => (
  <div className={styles.scene} style={{ alignItems: 'center', padding: '2rem' }}>
    <div className={styles.sceneFormCard}>
      <div className={styles.sceneCardTitle} style={{ fontSize: '1rem', marginBottom: '0.25rem' }}>Contact Sales</div>
      <div className={styles.scenePageSubtitle} style={{ marginBottom: '1.5rem' }}>Fill in the form and we'll get back to you within 24 hours.</div>
      <div className={styles.sceneFieldRow}>
        <div className={styles.sceneField}><div className={styles.sceneLabel}>First Name *</div><div className={styles.sceneInput}>Jordan</div></div>
        <div className={styles.sceneField}><div className={styles.sceneLabel}>Last Name *</div><div className={styles.sceneInput}>Davis</div></div>
      </div>
      <div className={styles.sceneField}><div className={styles.sceneLabel}>Work Email *</div><div className={styles.sceneInput}>jordan@company.com</div></div>
      <div className={styles.sceneField}><div className={styles.sceneLabel}>Company</div><div className={styles.sceneInput}>Acme Corp</div></div>
      <div className={styles.sceneField}><div className={styles.sceneLabel}>Message</div><div className={styles.sceneTextarea} /></div>
      <div className={styles.sceneField}>
        <div className={styles.sceneCheckRow}><div className={styles.sceneCheckbox} /><span style={{ fontSize: '0.7rem', color: '#64748b' }}>I agree to the privacy policy and terms of service.</span></div>
      </div>
      <div className={styles.scenePrimaryBtn} style={{ width: '100%', textAlign: 'center', marginTop: '0.5rem' }}>Send Message</div>
      {/* Problem area highlight */}
      <div className={styles.sceneProblemBtnWrapper} style={{ marginTop: '0.75rem', justifyContent: 'center' }}>
        <div className={styles.sceneSaveBtn}>Save draft</div>
        <div className={styles.sceneProblemTag}>⚠ Low visibility</div>
      </div>
    </div>
  </div>
);

const LandingMockup = ({ task }) => (
  <div className={styles.scene}>
    <div className={styles.sceneNav}>
      <div className={styles.sceneNavLogo}>ProductName</div>
      <div className={styles.sceneNavLinks}><span>Features</span><span>Pricing</span><span>Blog</span></div>
      <div className={styles.scenePrimaryBtn} style={{ padding: '0.3rem 0.75rem', fontSize: '0.7rem' }}>Get Started</div>
    </div>
    <div className={styles.sceneLandingHero}>
      <div className={styles.sceneLandingBadge}>✦ Now in public beta</div>
      <div className={styles.sceneLandingTitle}>Design systems<br />that scale.</div>
      <div className={styles.sceneLandingSubtitle}>The all-in-one platform for teams who care about craft, consistency, and shipping with confidence.</div>
      <div className={styles.sceneLandingCtas}>
        <div className={styles.scenePrimaryBtn}>Start for free →</div>
        <div className={styles.sceneSecondaryBtn}>See demo</div>
      </div>
    </div>
    <div className={styles.sceneLandingFeatures}>
      {[{ icon: '⚡', title: 'Fast by default', desc: 'Built for performance from day one.' }, { icon: '♿', title: 'Accessible', desc: 'WCAG AA compliant out of the box.' }, { icon: '🎨', title: 'Customizable', desc: 'Tokens, themes, and overrides.' }].map(f => (
        <div key={f.title} className={styles.sceneLandingFeature}>
          <span className={styles.sceneLandingIcon}>{f.icon}</span>
          <strong>{f.title}</strong>
          <span>{f.desc}</span>
        </div>
      ))}
    </div>
  </div>
);

const SCENE_MAP = {
  settings: SettingsMockup,
  checkout: CheckoutMockup,
  onboarding: OnboardingMockup,
  dashboard: DashboardMockup,
  modal: ModalMockup,
  navigation: NavigationMockup,
  form: FormMockup,
  landing: LandingMockup,
};

// ── Main component ─────────────────────────────────────────────────────────
export const DesignWorkspace = ({ value, onChange, task }) => {
  const [activeTab, setActiveTab] = useState('comments');
  const [pins, setPins] = useState([]);
  const [selectedPinId, setSelectedPinId] = useState(null);
  const [draftComment, setDraftComment] = useState('');
  const mockupRef = useRef(null);

  const scene = useMemo(() => resolveScene(task), [task]);
  const SceneComponent = SCENE_MAP[scene] || SettingsMockup;

  // Derive dynamic header info from task
  const taskLabel = task?.category || 'UI/UX Task';
  const taskTitle = task?.title || 'Design Review';
  const pageLabel = task?.description?.split('.')[0] || 'Review the mockup below';

  useEffect(() => {
    const serialized = pins.map(p => `[${p.x}%, ${p.y}%] Comment: ${p.text}${p.aiReply ? `\nAI Teammate: ${p.aiReply}` : ''}`).join('\n\n');
    onChange(serialized || '');
  }, [pins, onChange]);

  const handleMockupClick = (e) => {
    if (e.target.closest(`.${styles.pin}`)) return;
    const rect = mockupRef.current.getBoundingClientRect();
    // Using mockupContent's bounding box naturally accounts for scroll offset
    const x = ((e.clientX - rect.left) / rect.width) * 100;
    const y = ((e.clientY - rect.top) / rect.height) * 100;

    const newPin = {
      id: Date.now().toString(),
      x: x.toFixed(1),
      y: y.toFixed(1),
      text: '',
      aiReply: null,
      isResolved: false,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    };
    setPins(prev => [...prev, newPin]);
    setSelectedPinId(newPin.id);
    setActiveTab('comments');
  };

  const submitComment = async (id) => {
    if (!draftComment.trim()) return;
    const userMessage = draftComment;

    setPins(curr => curr.map(p => p.id === id ? { ...p, text: userMessage } : p));
    setDraftComment('');

    try {
      const contextMessage = `[Design Task Context: ${task?.title || ''} - ${task?.description || ''}]. The user left a design comment: "${userMessage}". Please reply directly to this comment as an AI teammate. Ask for plain text - no formatting.`;

      const { data } = await axios.post('/api/ai/teammate/chat', {
        history: [],
        message: contextMessage,
        roleId: task?.role
      });

      setPins(curr => curr.map(p => {
        if (p.id === id && !p.aiReply) {
          return { ...p, aiReply: data.reply };
        }
        return p;
      }));
    } catch (e) {
      console.error(e);
      setPins(curr => curr.map(p => {
        if (p.id === id && !p.aiReply) {
          return { ...p, aiReply: "I couldn't reach the server right now." };
        }
        return p;
      }));
    }
  };

  return (
    <div className={styles.container}>
      <header className={styles.header}>
        <div className={styles.headerLeft}>
          <div className={styles.badge}>{taskLabel}</div>
          <h2>{taskTitle}</h2>
        </div>
        <div className={styles.headerRight}>
          <div className={styles.teammateAvatar}><FiCpu /><span>Senior Product Designer (AI)</span></div>
          <button className={styles.actionBtn}><FiMaximize2 /> Present</button>
        </div>
      </header>

      <div className={styles.workspaceBody}>
        {/* Mockup Area */}
        <div className={styles.mockupContainer}>
          <div className={styles.toolbar}>
            <div className={styles.toolGroup}>
              <button className={styles.activeTool}><FiMessageSquare /> Comment</button>
              <button><FiLayout /> Inspect</button>
            </div>
            <span>1200px × 800px (Desktop)</span>
          </div>

          {/* Scrollable mockup wrapper */}
          <div className={styles.mockupWrapper}>
            <div className={styles.mockupContent} ref={mockupRef} onClick={handleMockupClick}>
              <SceneComponent task={task} />

              <AnimatePresence>
                {pins.map((pin, index) => (
                  <motion.div
                    key={pin.id}
                    className={`${styles.pin} ${selectedPinId === pin.id ? styles.pinActive : ''} ${pin.isResolved ? styles.pinResolved : ''}`}
                    style={{ left: `${pin.x}%`, top: `${pin.y}%` }}
                    initial={{ scale: 0, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    exit={{ scale: 0, opacity: 0 }}
                    onClick={(e) => { e.stopPropagation(); setSelectedPinId(pin.id); setActiveTab('comments'); }}
                  >
                    {index + 1}
                  </motion.div>
                ))}
              </AnimatePresence>
            </div>
          </div>
        </div>

        {/* Sidebar */}
        <div className={styles.sidebar}>
          <div className={styles.tabs}>
            <button className={activeTab === 'comments' ? styles.tabActive : ''} onClick={() => setActiveTab('comments')}>
              <FiMessageSquare /> Feedback ({pins.length})
            </button>
            <button className={activeTab === 'a11y' ? styles.tabActive : ''} onClick={() => setActiveTab('a11y')}>
              <FiEye /> A11y Audit
            </button>
            <button className={activeTab === 'score' ? styles.tabActive : ''} onClick={() => setActiveTab('score')}>
              <FiStar /> Score
            </button>
          </div>

          <div className={styles.sidebarContent}>
            {activeTab === 'comments' && (
              <div className={styles.commentsList}>
                {pins.length === 0 ? (
                  <div className={styles.emptyState}>
                    <FiMessageSquare />
                    <p>Click anywhere on the mockup to leave feedback or ask a design question.</p>
                  </div>
                ) : (
                  pins.map((pin, index) => (
                    <motion.div
                      key={pin.id}
                      className={`${styles.commentThread} ${selectedPinId === pin.id ? styles.threadActive : ''}`}
                      onClick={() => setSelectedPinId(pin.id)}
                      layout
                    >
                      <div className={styles.threadHeader}>
                        <div className={styles.pinBadge}>{index + 1}</div>
                        <span>{pin.timestamp}</span>
                      </div>

                      {pin.text ? (
                        <div className={styles.commentBubble}>{pin.text}</div>
                      ) : (
                        <div className={styles.commentInput}>
                          <textarea
                            autoFocus
                            placeholder="Type your design feedback..."
                            value={draftComment}
                            onChange={(e) => setDraftComment(e.target.value)}
                            onKeyDown={(e) => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); submitComment(pin.id); } }}
                          />
                          <div className={styles.inputActions}>
                            <button onClick={() => { setPins(pins.filter(p => p.id !== pin.id)); setDraftComment(''); }}>Cancel</button>
                            <button className={styles.btnPrimary} onClick={() => submitComment(pin.id)}>Send</button>
                          </div>
                        </div>
                      )}

                      {pin.aiReply && (
                        <motion.div className={styles.aiReply} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}>
                          <div className={styles.aiAvatar}><FiCpu /></div>
                          <div className={styles.aiMessage}>
                            <strong>AI Teammate</strong>
                            <p>{pin.aiReply}</p>
                          </div>
                        </motion.div>
                      )}
                    </motion.div>
                  ))
                )}
              </div>
            )}

            {activeTab === 'a11y' && (
              <div className={styles.a11yPanel}>
                <div className={styles.a11yScore}>
                  <h3>Overall Accessibility</h3>
                  <div className={styles.scoreCircleWrapper}>
                    <svg viewBox="0 0 36 36" className={styles.circularChart}>
                      <path className={styles.circleBg} d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831" />
                      <path className={styles.circle} strokeDasharray="78, 100" d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831" />
                      <text x="18" y="20.35" className={styles.percentage}>78%</text>
                    </svg>
                  </div>
                  <p>Needs improvement to meet WCAG 2.1 AA standards.</p>
                </div>
                <div className={styles.checklist}>
                  <div className={styles.checkItem}><FiCheckCircle className={styles.textSuccess} /><div><strong>Color Contrast</strong><span>Passes 4.5:1 ratio on primary text.</span></div></div>
                  <div className={styles.checkItem}><FiAlertTriangle className={styles.textWarning} /><div><strong>Touch Targets</strong><span>Secondary nav links are under 44×44px.</span></div></div>
                  <div className={styles.checkItem}><FiAlertTriangle className={styles.textDanger} /><div><strong>Focus States</strong><span>Missing visible focus rings on form inputs.</span></div></div>
                </div>
              </div>
            )}

            {activeTab === 'score' && (
              <div className={styles.scorePanel}>
                <div className={styles.heuristics}>
                  {MOCKUP_SECTIONS.map(section => (
                    <div key={section.id} className={styles.heuristicItem}>
                      <div className={styles.heuristicTop}>
                        <strong>{section.name}</strong>
                        <span>{section.score}/100</span>
                      </div>
                      <div className={styles.progressBar}>
                        <div className={styles.progressFill} style={{ width: `${section.score}%` }} />
                      </div>
                    </div>
                  ))}
                </div>
                <div className={styles.aiSummary}>
                  <h4><FiCpu /> AI Heuristic Evaluation</h4>
                  <p>The visual hierarchy is strong, but secondary actions lack sufficient contrast, making them easy to overlook. Consistency in corner radii and spacing across cards would elevate the premium feel.</p>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
