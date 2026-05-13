import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { FiMessageSquare, FiCheckCircle, FiAlertTriangle, FiEye, FiLayout, FiMaximize2, FiCpu, FiStar, FiChevronRight } from 'react-icons/fi';
import styles from './DesignWorkspace.module.css';

const MOCKUP_SECTIONS = [
  { id: 'nav', name: 'Global Navigation', score: 85, a11y: 'Pass' },
  { id: 'hero', name: 'Hero Section', score: 72, a11y: 'Warning' },
  { id: 'form', name: 'Checkout Form', score: 90, a11y: 'Pass' },
  { id: 'footer', name: 'Footer Links', score: 65, a11y: 'Fail' }
];

const AI_TEAMMATE_REPLIES = [
  "I'd suggest increasing the contrast ratio here to meet WCAG AA standards. The gray on dark blue is currently 3.2:1.",
  "Great catch! We should also ensure the focus states are distinct for keyboard navigation.",
  "Consider reducing the cognitive load by grouping these inputs. The spacing feels a bit tight.",
  "I love this direction, but let's make sure the primary call-to-action stands out more against the background.",
  "Let's verify this layout on mobile breakpoints—the touch targets might be too small."
];

export const DesignWorkspace = ({ value, onChange }) => {
  const [activeTab, setActiveTab] = useState('comments'); // comments, a11y, score
  const [pins, setPins] = useState([]);
  const [selectedPinId, setSelectedPinId] = useState(null);
  const [draftComment, setDraftComment] = useState('');
  const mockupRef = useRef(null);

  // Sync internal state to the parent's `value` whenever pins change
  useEffect(() => {
    const serializedFeedback = pins.map(p => `[${p.x}%, ${p.y}%] User: ${p.text}\nAI: ${p.aiReply}`).join('\n\n');
    onChange(serializedFeedback);
  }, [pins, onChange]);

  const handleMockupClick = (e) => {
    if (e.target.closest(`.${styles.pin}`)) return; // Don't add pin if clicking an existing one

    const rect = mockupRef.current.getBoundingClientRect();
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

    setPins([...pins, newPin]);
    setSelectedPinId(newPin.id);
    setActiveTab('comments');
  };

  const submitComment = (id) => {
    if (!draftComment.trim()) return;

    setPins(currentPins => currentPins.map(pin => {
      if (pin.id === id) {
        return { ...pin, text: draftComment };
      }
      return pin;
    }));
    setDraftComment('');

    // Simulate AI teammate reply after a short delay
    setTimeout(() => {
      setPins(currentPins => currentPins.map(pin => {
        if (pin.id === id && !pin.aiReply) {
          const randomReply = AI_TEAMMATE_REPLIES[Math.floor(Math.random() * AI_TEAMMATE_REPLIES.length)];
          return { ...pin, aiReply: randomReply };
        }
        return pin;
      }));
    }, 1500);
  };

  return (
    <div className={styles.container}>
      <header className={styles.header}>
        <div className={styles.headerLeft}>
          <div className={styles.badge}>UI/UX Task</div>
          <h2>Design Review: Checkout Flow v3</h2>
        </div>
        <div className={styles.headerRight}>
          <div className={styles.teammateAvatar}>
            <FiCpu />
            <span>Senior Product Designer (AI)</span>
          </div>
          <button className={styles.actionBtn}><FiMaximize2 /> Present</button>
        </div>
      </header>

      <div className={styles.workspaceBody}>
        {/* Interactive Mockup Area */}
        <div className={styles.mockupContainer}>
          <div className={styles.toolbar}>
            <div className={styles.toolGroup}>
              <button className={styles.activeTool}><FiMessageSquare /> Comment</button>
              <button><FiLayout /> Inspect</button>
            </div>
            <span>1200px × 800px (Desktop)</span>
          </div>

          <div className={styles.mockupWrapper} ref={mockupRef} onClick={handleMockupClick}>
            <div className={styles.mockupContent}>
              {/* Abstract Representation of a Mockup */}
              <div className={styles.mockNav}></div>
              <div className={styles.mockHero}>
                <div className={styles.mockTitle}></div>
                <div className={styles.mockSubtitle}></div>
              </div>
              <div className={styles.mockGrid}>
                <div className={styles.mockCard}></div>
                <div className={styles.mockCard}></div>
                <div className={styles.mockCard}></div>
              </div>
            </div>

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
                  <div className={styles.checkItem}>
                    <FiCheckCircle className={styles.textSuccess} />
                    <div>
                      <strong>Color Contrast</strong>
                      <span>Passes 4.5:1 ratio on primary text.</span>
                    </div>
                  </div>
                  <div className={styles.checkItem}>
                    <FiAlertTriangle className={styles.textWarning} />
                    <div>
                      <strong>Touch Targets</strong>
                      <span>Secondary nav links are under 44x44px.</span>
                    </div>
                  </div>
                  <div className={styles.checkItem}>
                    <FiAlertTriangle className={styles.textDanger} />
                    <div>
                      <strong>Focus States</strong>
                      <span>Missing visible focus rings on form inputs.</span>
                    </div>
                  </div>
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
                        <div className={styles.progressFill} style={{ width: `${section.score}%` }}></div>
                      </div>
                    </div>
                  ))}
                </div>
                <div className={styles.aiSummary}>
                  <h4><FiCpu /> AI Heuristic Evaluation</h4>
                  <p>The visual hierarchy is strong, but the footer lacks proper negative space, making it feel cluttered. Consistency in corner radii across cards would elevate the premium feel.</p>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
