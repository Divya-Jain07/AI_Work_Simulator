import { useEffect, useMemo, useState } from 'react';
import { motion } from 'framer-motion';
import { create } from 'zustand';
import {
  FiCheckCircle,
  FiMaximize2,
  FiMessageCircle,
  FiMove,
} from 'react-icons/fi';

const severityMeta = {
  Critical: {
    label: 'Critical',
    chip: 'border-red-300/35 bg-red-500/18 text-red-100',
    pin: 'bg-red-500 shadow-red-500/60',
    ring: 'ring-red-400/35',
    glow: 'rgba(239,68,68,0.48)'
  },
  High: {
    label: 'Warning',
    chip: 'border-orange-300/35 bg-orange-500/18 text-orange-100',
    pin: 'bg-orange-400 shadow-orange-400/60',
    ring: 'ring-orange-300/35',
    glow: 'rgba(251,146,60,0.48)'
  },
  Medium: {
    label: 'Improvement',
    chip: 'border-sky-300/35 bg-sky-500/18 text-sky-100',
    pin: 'bg-sky-400 shadow-sky-400/60',
    ring: 'ring-sky-300/35',
    glow: 'rgba(56,189,248,0.48)'
  },
  Low: {
    label: 'Polish',
    chip: 'border-cyan-300/30 bg-cyan-500/16 text-cyan-100',
    pin: 'bg-cyan-300 shadow-cyan-300/55',
    ring: 'ring-cyan-300/30',
    glow: 'rgba(103,232,249,0.42)'
  },
  Resolved: {
    label: 'Resolved',
    chip: 'border-emerald-300/35 bg-emerald-500/16 text-emerald-100',
    pin: 'bg-emerald-400 shadow-emerald-400/60',
    ring: 'ring-emerald-300/35',
    glow: 'rgba(52,211,153,0.42)'
  }
};

const initialIssues = [
  {
    id: 'cta-hierarchy',
    title: 'Primary CTA loses command of the flow',
    type: 'Hierarchy',
    severity: 'Critical',
    status: 'Open',
    x: 28,
    y: 48,
    timestamp: 'Just now',
    insight: 'AI detected competing contrast and density around the checkout action.',
    description: 'The main checkout action should become the clearest next step in the first scan path.',
    recommendation: 'Increase CTA visual weight, reduce adjacent contrast, and use direct action copy.',
    comments: [
      { id: 'c-1', author: 'AI reviewer', text: 'The action is visible, but not dominant enough for a conversion-critical step.', time: 'now' }
    ]
  },
  {
    id: 'nav-contrast',
    title: 'Header links need stronger contrast',
    type: 'Accessibility',
    severity: 'High',
    status: 'Open',
    x: 78,
    y: 17,
    timestamp: '1m ago',
    insight: 'Navigation affordance weakens when viewed against the dark shell.',
    description: 'Secondary links are too quiet for an enterprise checkout surface.',
    recommendation: 'Lift the link token toward slate-200 and add a clearer hover/focus treatment.',
    comments: []
  },
  {
    id: 'card-gutters',
    title: 'Card gutters drift from the 8px system',
    type: 'Spacing',
    severity: 'Medium',
    status: 'Open',
    x: 56,
    y: 72,
    timestamp: '2m ago',
    insight: 'AI spacing pass found mixed horizontal rhythm across the summary cards.',
    description: 'The card row feels less intentional because the gutters do not repeat consistently.',
    recommendation: 'Normalize the card gutters to 24px and align internal padding to the same grid.',
    comments: []
  },
  {
    id: 'body-scale',
    title: 'Supporting copy needs stronger hierarchy',
    type: 'Typography',
    severity: 'Low',
    status: 'Open',
    x: 43,
    y: 34,
    timestamp: '3m ago',
    insight: 'The subcopy is readable but not expressive enough for the hero density.',
    description: 'The helper line is visually subdued below the main message.',
    recommendation: 'Increase body text by 1px and use a stronger semantic muted token.',
    comments: []
  }
];

const useReviewStore = create((set) => ({
  issues: initialIssues,
  selectedIssueId: initialIssues[0].id,
  zoom: 96,
  selectIssue: (id) => set({ selectedIssueId: id }),
  setZoom: (updater) => set((state) => ({
    zoom: Math.min(120, Math.max(72, typeof updater === 'function' ? updater(state.zoom) : updater))
  })),
  updateIssue: (id, patch) => set((state) => ({
    issues: state.issues.map((issue) => issue.id === id ? { ...issue, ...patch } : issue)
  })),
  addComment: (id, text) => set((state) => ({
    issues: state.issues.map((issue) => issue.id === id
      ? { ...issue, comments: [...issue.comments, { id: `c-${Date.now()}`, author: 'You', text, time: 'now' }] }
      : issue)
  }))
}));

const Button = ({ active, children, className = '', ...props }) => (
  <button
    className={`inline-flex min-h-9 items-center justify-center gap-2 rounded-md border px-3 text-sm font-semibold transition hover:border-cyan-300/35 hover:bg-white/[0.09] disabled:cursor-not-allowed disabled:opacity-55 ${
      active
        ? 'border-cyan-300/40 bg-cyan-300/14 text-cyan-100 shadow-[0_0_20px_rgba(34,211,238,0.12)]'
        : 'border-white/10 bg-white/[0.05] text-slate-300'
    } ${className}`}
    {...props}
  >
    {children}
  </button>
);

const ProductMockup = ({ zoom }) => (
  <motion.div
    className="relative aspect-[1.52] w-full max-w-[min(100%,68rem)] overflow-hidden rounded-[clamp(0.75rem,1.5vw,1.2rem)] border border-white/18 bg-slate-100 shadow-[0_36px_95px_rgba(0,0,0,0.45)]"
    style={{ scale: zoom / 100 }}
    transition={{ type: 'spring', stiffness: 130, damping: 24 }}
  >
    <div className="absolute inset-0 bg-[radial-gradient(circle_at_20%_12%,rgba(59,130,246,0.16),transparent_30%),radial-gradient(circle_at_84%_18%,rgba(20,184,166,0.16),transparent_26%)]" />
    <div className="relative z-10 flex h-[13%] items-center justify-between bg-slate-950 px-[5%]">
      <div className="flex items-center gap-3">
        <span className="h-[clamp(1rem,2vw,1.7rem)] w-[clamp(1rem,2vw,1.7rem)] rounded-md bg-gradient-to-br from-cyan-300 to-blue-600" />
        <strong className="text-[clamp(0.72rem,1.45vw,1.05rem)] text-white">Acme Checkout</strong>
      </div>
      <div className="flex items-center gap-[clamp(0.5rem,1.6vw,1rem)]">
        <span className="h-2.5 w-[clamp(2.8rem,6vw,5rem)] rounded-full bg-slate-700" />
        <span className="h-2.5 w-[clamp(3.4rem,7vw,6rem)] rounded-full bg-sky-500/70" />
      </div>
    </div>

    <div className="relative z-10 grid gap-[5%] px-[6%] py-[5%] md:grid-cols-[1.04fr_0.96fr]">
      <section>
        <h3 className="max-w-xl text-[clamp(1.25rem,3.8vw,3rem)] font-black leading-[1.04] tracking-normal text-slate-950">
          Complete your team subscription
        </h3>
        <p className="mt-[clamp(0.65rem,1.4vw,1rem)] max-w-lg text-[clamp(0.78rem,1.35vw,1rem)] leading-7 text-slate-500">
          Review seats, billing, and compliance before activation.
        </p>
        <button className="mt-[clamp(1rem,2.3vw,1.8rem)] rounded-md bg-blue-600 px-[clamp(1rem,2.8vw,1.75rem)] py-[clamp(0.75rem,1.6vw,1rem)] text-sm font-black text-white shadow-xl shadow-blue-600/20">
          Continue checkout
        </button>
      </section>

      <section className="rounded-xl bg-slate-200 p-[7%] shadow-inner">
        <div className="mb-5 h-4 w-40 rounded-full bg-slate-400" />
        <div className="mb-3 h-3 w-64 max-w-full rounded-full bg-slate-300" />
        <div className="h-3 w-48 max-w-full rounded-full bg-slate-300" />
      </section>
    </div>

    <div className="relative z-10 grid gap-[clamp(0.85rem,2vw,1.8rem)] px-[6%] pb-[5%] md:grid-cols-3">
      {[
        ['Team plan', 'bg-indigo-100'],
        ['Billing', 'bg-white'],
        ['Trust', 'bg-orange-100']
      ].map(([label, color]) => (
        <article key={label} className={`min-h-[clamp(5.5rem,11vw,8rem)] rounded-xl border border-slate-200 p-[clamp(0.9rem,2vw,1.25rem)] ${color}`}>
          <h4 className="mb-4 text-[clamp(0.8rem,1.4vw,1rem)] font-black text-slate-800">{label}</h4>
          <div className="mb-3 h-3 w-2/3 rounded-full bg-slate-300" />
          <div className="h-3 w-1/2 rounded-full bg-slate-200" />
        </article>
      ))}
    </div>
  </motion.div>
);

const ReviewPin = ({ issue, index, selected, onClick }) => {
  const meta = issue.status === 'Resolved' ? severityMeta.Resolved : severityMeta[issue.severity];

  return (
    <motion.button
      type="button"
      aria-label={`Open review pin ${index + 1}`}
      className={`absolute z-20 grid h-[clamp(2rem,3.4vw,2.55rem)] w-[clamp(2rem,3.4vw,2.55rem)] -translate-x-1/2 -translate-y-1/2 place-items-center rounded-full border border-white/60 text-sm font-black text-white shadow-xl ring-[clamp(0.25rem,0.8vw,0.5rem)] transition ${meta.pin} ${
        selected ? `${meta.ring} scale-110` : 'ring-white/10'
      }`}
      style={{ left: `${issue.x}%`, top: `${issue.y}%` }}
      onClick={onClick}
      whileHover={{ scale: 1.12 }}
      whileTap={{ scale: 0.96 }}
      animate={{ boxShadow: [`0 0 0 0 ${meta.glow}`, '0 0 0 14px rgba(255,255,255,0)', `0 0 0 0 ${meta.glow}`] }}
      transition={{ duration: 2.4, repeat: Infinity, ease: 'easeInOut' }}
    >
      {issue.status === 'Resolved' ? <FiCheckCircle /> : index + 1}
    </motion.button>
  );
};

const Canvas = ({ issues, selectedIssue, onSelect }) => {
  const zoom = useReviewStore((state) => state.zoom);

  return (
    <section className="relative min-h-[clamp(28rem,62vh,48rem)] min-w-0 overflow-hidden rounded-lg border border-white/10 bg-slate-950/40">
      <div className="absolute inset-0 bg-[linear-gradient(rgba(148,163,184,0.055)_1px,transparent_1px),linear-gradient(90deg,rgba(148,163,184,0.055)_1px,transparent_1px)] bg-[size:28px_28px]" />
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_20%,rgba(56,189,248,0.14),transparent_36%)]" />
      <div className="relative grid h-full min-h-[inherit] place-items-center overflow-auto p-[clamp(1rem,3vw,2rem)]">
        <div className="relative w-full max-w-6xl">
          <ProductMockup zoom={zoom} />
          {issues.map((issue, index) => (
            <ReviewPin key={issue.id} issue={issue} index={index} selected={selectedIssue.id === issue.id} onClick={() => onSelect(issue.id)} />
          ))}
        </div>
      </div>
      <div className="absolute bottom-4 left-1/2 hidden -translate-x-1/2 items-center gap-2 rounded-full border border-white/10 bg-slate-950/70 px-3 py-2 text-xs font-semibold text-slate-300 backdrop-blur-xl md:flex">
        <FiMaximize2 /> Canvas centered
        <span className="h-4 w-px bg-white/10" />
        <FiMove /> Pan mode ready
      </div>
    </section>
  );
};

const ReviewPanel = ({ issue }) => {
  const updateIssue = useReviewStore((state) => state.updateIssue);
  const addComment = useReviewStore((state) => state.addComment);
  const [comment, setComment] = useState('');
  const meta = issue.status === 'Resolved' ? severityMeta.Resolved : severityMeta[issue.severity];

  const submitComment = () => {
    if (!comment.trim()) return;
    addComment(issue.id, comment.trim());
    setComment('');
  };

  return (
    <aside className="grid min-h-[clamp(24rem,60vh,48rem)] min-w-0 grid-rows-[auto_minmax(0,1fr)_auto] overflow-hidden rounded-lg border border-white/10 bg-slate-950/62">
      <div className="border-b border-white/10 p-4">
        <div className="mb-3 flex items-start justify-between gap-3">
          <div className="min-w-0">
            <span className="text-[11px] font-black uppercase tracking-wide text-cyan-200">{issue.type}</span>
            <h3 className="mt-1 text-base font-black leading-6 text-white">{issue.title}</h3>
          </div>
          <span className={`shrink-0 rounded-full border px-2.5 py-1 text-[11px] font-black uppercase tracking-wide ${meta.chip}`}>{meta.label}</span>
        </div>
        <p className="text-sm leading-6 text-slate-300">{issue.description}</p>
      </div>

      <div className="min-h-0 space-y-3 overflow-auto p-4">
        <div className="rounded-lg border border-cyan-300/15 bg-cyan-300/[0.06] p-3">
          <div className="mb-2 flex items-center gap-2 text-sm font-black text-cyan-100">
            <FiMessageCircle /> AI comment
          </div>
          <p className="text-sm leading-6 text-slate-300">{issue.insight}</p>
        </div>
        {issue.comments.map((item) => (
          <motion.div key={item.id} layout className="rounded-lg border border-white/10 bg-white/[0.05] p-3">
            <div className="mb-1 flex items-center justify-between gap-2">
              <strong className="text-sm text-white">{item.author}</strong>
              <span className="text-xs text-slate-500">{item.time}</span>
            </div>
            <p className="text-sm leading-6 text-slate-300">{item.text}</p>
          </motion.div>
        ))}
      </div>

      <div className="space-y-3 border-t border-white/10 p-4">
        <label className="block space-y-1.5">
          <span className="text-xs font-black uppercase tracking-wide text-slate-500">Severity</span>
          <select
            value={issue.severity}
            onChange={(event) => updateIssue(issue.id, { severity: event.target.value })}
            className="h-10 w-full rounded-md border border-white/10 bg-slate-950 px-3 text-sm font-semibold text-white outline-none focus:border-cyan-300/50"
          >
            <option>Critical</option>
            <option>High</option>
            <option>Medium</option>
            <option>Low</option>
          </select>
        </label>
        <label className="block space-y-1.5">
          <span className="text-xs font-black uppercase tracking-wide text-slate-500">Recommendation</span>
          <textarea
            value={issue.recommendation}
            onChange={(event) => updateIssue(issue.id, { recommendation: event.target.value })}
            className="min-h-24 w-full resize-y rounded-md border border-white/10 bg-slate-950 p-3 text-sm leading-6 text-white outline-none focus:border-cyan-300/50"
          />
        </label>
        <input
          value={comment}
          onChange={(event) => setComment(event.target.value)}
          onKeyDown={(event) => {
            if (event.key === 'Enter') submitComment();
          }}
          placeholder="Add a comment..."
          className="h-10 w-full rounded-md border border-white/10 bg-slate-950 px-3 text-sm text-white outline-none placeholder:text-slate-600 focus:border-cyan-300/50"
        />
        <div className="grid grid-cols-[1fr_auto] gap-2">
          <Button
            onClick={() => updateIssue(issue.id, { status: issue.status === 'Resolved' ? 'Open' : 'Resolved' })}
            className={issue.status === 'Resolved' ? 'border-emerald-300/35 bg-emerald-300/14 text-emerald-100' : ''}
          >
            <FiCheckCircle /> {issue.status === 'Resolved' ? 'Reopen' : 'Resolve'}
          </Button>
          <Button onClick={submitComment} className="border-cyan-300/35 bg-cyan-300/16 text-cyan-50">
            Add
          </Button>
        </div>
      </div>
    </aside>
  );
};

export const DesignWorkspace = ({ value, onChange }) => {
  const issues = useReviewStore((state) => state.issues);
  const selectedIssueId = useReviewStore((state) => state.selectedIssueId);
  const selectIssue = useReviewStore((state) => state.selectIssue);
  const [mobileTab, setMobileTab] = useState('canvas');
  const selectedIssue = useMemo(() => issues.find((issue) => issue.id === selectedIssueId) || issues[0], [issues, selectedIssueId]);
  const serializedReview = useMemo(() => issues.map((issue, index) => (
    `${index + 1}. [${issue.status}] ${issue.severity} ${issue.type}: ${issue.title}\nIssue: ${issue.description}\nRecommendation: ${issue.recommendation}\nComments: ${issue.comments.map((item) => `${item.author}: ${item.text}`).join(' | ') || 'None'}`
  )).join('\n\n'), [issues]);

  useEffect(() => {
    onChange?.(serializedReview);
  }, [serializedReview, onChange]);

  return (
    <div className="grid h-full min-h-0 grid-rows-[auto_minmax(0,1fr)] overflow-hidden bg-[#050814] text-slate-100">
      <div className="grid grid-cols-2 border-b border-white/10 bg-slate-950/65 p-2 md:hidden">
        {['canvas', 'review'].map((tab) => (
          <button
            key={tab}
            type="button"
            onClick={() => setMobileTab(tab)}
            className={`rounded-md px-3 py-2 text-sm font-black capitalize ${mobileTab === tab ? 'bg-cyan-300/14 text-cyan-100' : 'text-slate-400'}`}
          >
            {tab}
          </button>
        ))}
      </div>

      <main className="min-h-0 overflow-auto bg-[radial-gradient(circle_at_48%_18%,rgba(56,189,248,0.12),transparent_34%)] p-3">
        <div className="grid min-h-full gap-3 md:grid-rows-[minmax(0,1fr)_auto] lg:grid-cols-[minmax(0,3fr)_minmax(16rem,1fr)] lg:grid-rows-1">
          <div className={`${mobileTab === 'canvas' ? 'block' : 'hidden'} min-w-0 md:block`}>
            <Canvas issues={issues} selectedIssue={selectedIssue} onSelect={selectIssue} />
          </div>
          <div className={`${mobileTab === 'review' ? 'block' : 'hidden'} min-w-0 md:block`}>
            <ReviewPanel issue={selectedIssue} />
          </div>
        </div>
      </main>
    </div>
  );
};
