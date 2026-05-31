import { useState, useEffect, useContext, useMemo, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
import Editor from '@monaco-editor/react';
import { motion } from 'framer-motion';
import { FiArrowLeft, FiCheckCircle, FiClock, FiSend, FiShield, FiTarget, FiChevronLeft, FiChevronRight, FiBookOpen, FiCpu } from 'react-icons/fi';
import Chatbot from '../components/ui/Chatbot';
import { getWorkspaceComponent } from '../components/workspaces/Workspaces';
import { AuthContext } from '../context/AuthContext';
import { WorkplaceContext } from '../context/workplaceContextObject';
import styles from './Workspace.module.css';

const starterByRole = {
  frontend_developer: `// Frontend investigation notes
// 1. Reproduce the UI behavior
// 2. Identify the component/state issue
// 3. Explain the fix and edge cases
`,
  backend_developer: `// Backend investigation notes
// 1. Reproduce the API failure
// 2. Identify the controller/service/data issue
// 3. Explain the fix, status codes, and security impact
`,
  data_analyst: `// Analyst response
// 1. State the question and assumptions
// 2. Summarize the key data findings
// 3. Recommend the decision and caveats
`,
  uiux_designer: `// UX review
// 1. Identify the workflow or hierarchy problem
// 2. Propose the design change
// 3. Cover accessibility, states, and product impact
`
};

const normalizeSkillUpdates = (skillUpdates = {}) => {
  if (Array.isArray(skillUpdates)) return Object.fromEntries(skillUpdates);
  return skillUpdates || {};
};

const Workspace = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { updateSkills } = useContext(AuthContext);
  const { roleContext, evaluateTask, refreshTasks } = useContext(WorkplaceContext);

  const [task, setTask] = useState(null);
  const [code, setCode] = useState('');
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [evaluation, setEvaluation] = useState(null);
  const [error, setError] = useState('');

  // Leetcode-style states
  const [activeTab, setActiveTab] = useState('description');
  const [checkedRequirements, setCheckedRequirements] = useState({});
  const [checkedAcceptance, setCheckedAcceptance] = useState({});
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [sidebarWidth, setSidebarWidth] = useState(550);
  const [isResizing, setIsResizing] = useState(false);

  const startResizing = useCallback((mouseDownEvent) => {
    mouseDownEvent.preventDefault();
    setIsResizing(true);
  }, []);

  const stopResizing = useCallback(() => {
    setIsResizing(false);
  }, []);

  const resize = useCallback((mouseMoveEvent) => {
    if (isResizing) {
      const newWidth = mouseMoveEvent.clientX;
      if (newWidth >= 280 && newWidth <= 900) {
        setSidebarWidth(newWidth);
      }
    }
  }, [isResizing]);

  useEffect(() => {
    if (isResizing) {
      window.addEventListener('mousemove', resize);
      window.addEventListener('mouseup', stopResizing);
    } else {
      window.removeEventListener('mousemove', resize);
      window.removeEventListener('mouseup', stopResizing);
    }
    return () => {
      window.removeEventListener('mousemove', resize);
      window.removeEventListener('mouseup', stopResizing);
    };
  }, [isResizing, resize, stopResizing]);

  useEffect(() => {
    const fetchTask = async () => {
      try {
        const { data } = await axios.get(`${import.meta.env.VITE_API_URL || ''}/api/tasks/${id}`);
        setTask(data);
        setCode(starterByRole[data.role] || starterByRole.frontend_developer);
        if (data.status === 'Evaluated') {
          const subRes = await axios.get(`${import.meta.env.VITE_API_URL || ''}/api/tasks/${id}/submissions`);
          if (subRes.data.length > 0) {
            const lastSub = subRes.data[subRes.data.length - 1];
            setEvaluation(lastSub);
            setCode(lastSub.content);
          }
        }
      } catch (fetchError) {
        setError(fetchError.response?.data?.message || 'Unable to load task.');
      } finally {
        setLoading(false);
      }
    };
    fetchTask();
  }, [id]);

  const skillDeltas = useMemo(() => normalizeSkillUpdates(evaluation?.skillUpdates), [evaluation]);

  // Normalise whichever field name the server uses, and sanitize any direct
  // LinkedIn Learning links into keyword-search URLs as a final client-side guard.
  const learningRecs = useMemo(() => {
    const raw = evaluation?.learningRecommendations || evaluation?.recommendations || [];
    return raw.map(rec => {
      const url = rec.courseUrl || '';
      const isDirect = url.includes('linkedin.com/learning/') && !url.includes('/search?');
      if (isDirect) {
        const kw = encodeURIComponent(
          (rec.courseTitle || rec.text || 'professional development')
            .replace(/[^a-zA-Z0-9 ]/g, ' ').replace(/\s+/g, ' ').trim().slice(0, 80)
        );
        return { ...rec, courseUrl: `https://www.linkedin.com/learning/search?keywords=${kw}` };
      }
      return rec;
    });
  }, [evaluation]);

  const handleSubmit = async () => {
    if (!code.trim()) return;

    try {
      setSubmitting(true);
      setError('');
      const data = await evaluateTask({ taskId: id, content: code });
      setEvaluation(data.submission);
      updateSkills(data.newSkills);
      setTask((current) => ({ ...current, status: 'Evaluated', lastEvaluationScore: data.submission?.score }));
      refreshTasks(task?.role);

      // Auto-switch to Evaluator Lens to view grade instantly!
      setActiveTab('evaluator');
    } catch (submitError) {
      setError(submitError.message || 'Evaluation failed.');
    } finally {
      setSubmitting(false);
    }
  };

  const tabs = useMemo(() => [
    { id: 'description', label: 'Description', icon: <FiBookOpen /> },
    { id: 'requirements', label: 'Requirements', icon: <FiTarget /> },
    { id: 'acceptance', label: 'Acceptance Criteria', icon: <FiCheckCircle /> },
    { id: 'evaluator', label: 'Evaluator Lens', icon: <FiShield />, hasBadge: !!evaluation },
    { id: 'teammate', label: 'AI Teammate', icon: <FiCpu /> }
  ], [evaluation]);

  if (loading) return <div className={styles.loading}>Loading workspace...</div>;
  if (!task) return <div className={styles.loading}>{error || 'Task not found.'}</div>;

  return (
    <div className={`${styles.workspace} ${!sidebarOpen ? styles.workspaceCollapsed : ''}`}>
      <div
        className={`${styles.leftPane} ${!sidebarOpen ? styles.leftPaneCollapsed : ''}`}
        style={{ width: sidebarOpen ? sidebarWidth : 0 }}
      >
        <div className={styles.paneHeader}>
          <button className={styles.backButton} onClick={() => navigate('/dashboard')} title="Back to Command Center">
            <FiArrowLeft />
          </button>

          <div className={styles.paneDivider} />

          <div className={styles.tabBar}>
            {tabs.map((tab) => (
              <button
                key={tab.id}
                className={`${styles.tabButton} ${activeTab === tab.id ? styles.tabButtonActive : ''}`}
                onClick={() => setActiveTab(tab.id)}
              >
                {tab.icon}
                <span>{tab.label}</span>
                {tab.hasBadge && <span className={styles.tabEvaluationBadge}>✓</span>}
              </button>
            ))}
          </div>

          <button
            className={styles.sidebarToggleButton}
            onClick={() => setSidebarOpen(false)}
            title="Collapse Sidebar"
          >
            <FiChevronLeft size={20} />
          </button>
        </div>

        <div className={styles.tabContent}>
          {activeTab === 'description' && (
            <motion.div
              className={styles.tabPane}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
            >
              <div className={styles.taskTopline}>
                <span className={styles.categoryBadge}>{task.category}</span>
                <span className={styles.deadlineBadge}><FiClock /> {task.deadline}</span>
              </div>
              <div className={styles.taskHeader}>
                <h1>{task.title}</h1>
                <span className={`${styles.difficulty} ${task.difficulty?.toLowerCase() === 'easy' ? styles.difficultyEasy :
                  task.difficulty?.toLowerCase() === 'medium' ? styles.difficultyMedium :
                    styles.difficultyHard
                  }`}>{task.difficulty}</span>
              </div>
              <p className={styles.description}>{task.description}</p>
              {task.businessContext && (
                <div className={styles.contextBox}>
                  <strong>Business Context</strong>
                  <p>{task.businessContext}</p>
                </div>
              )}

              {/* Core Evaluation Metrics checklist */}
              <div className={styles.panel} style={{ padding: '0.75rem 0' }}>
                <h2 style={{ fontSize: '0.95rem', marginBottom: '0.5rem', display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                  <FiShield /> Core Evaluation Metrics
                </h2>
                <p className={styles.panelMutedText}>These are the key criteria your manager will use to judge your submission:</p>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.4rem' }}>
                  {(task.evaluationCriteria || roleContext?.evaluationCriteria || []).map((criteria, i) => (
                    <div key={i} className={styles.checklistRow}>
                      <span style={{ color: 'var(--role-accent, #38bdf8)', marginRight: '0.2rem' }}>•</span>
                      <label style={{ cursor: 'default' }}>{criteria}</label>
                    </div>
                  ))}
                </div>
              </div>

              {/* Related/Target Skill badging at the bottom of description tab */}
              {task.skills && task.skills.length > 0 && (
                <div style={{ marginTop: '0.5rem', paddingTop: '0.75rem', borderTop: '1px solid rgba(255, 255, 255, 0.06)' }}>
                  <span style={{ fontSize: '0.75rem', textTransform: 'uppercase', color: '#64748b', fontWeight: 'bold', display: 'block', marginBottom: '0.4rem' }}>
                    Target Skills
                  </span>
                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.35rem' }}>
                    {task.skills.map((skill, i) => (
                      <span key={i} style={{
                        fontSize: '0.7rem',
                        fontWeight: '600',
                        color: 'var(--role-accent, #38bdf8)',
                        background: 'rgba(56, 189, 248, 0.08)',
                        border: '1px solid rgba(56, 189, 248, 0.15)',
                        padding: '0.15rem 0.5rem',
                        borderRadius: '4px'
                      }}>
                        {skill}
                      </span>
                    ))}
                  </div>
                </div>
              )}
            </motion.div>
          )}

          {activeTab === 'requirements' && (
            <motion.div
              className={styles.tabPane}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
            >
              <div className={styles.panel} style={{ padding: 0 }}>
                <h2><FiTarget /> Task Requirements</h2>
                <p className={styles.panelMutedText}>Check off tasks as you satisfy them in your workspace:</p>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem', marginTop: '0.5rem' }}>
                  {(task.requirements || []).map((req, i) => {
                    const isChecked = !!checkedRequirements[i];
                    return (
                      <div key={i} className={`${styles.checklistRow} ${isChecked ? styles.checklistRowChecked : ''}`}>
                        <input
                          type="checkbox"
                          id={`req-${i}`}
                          checked={isChecked}
                          onChange={(e) => setCheckedRequirements(prev => ({ ...prev, [i]: e.target.checked }))}
                        />
                        <label htmlFor={`req-${i}`}>{req}</label>
                      </div>
                    );
                  })}
                </div>
              </div>
            </motion.div>
          )}

          {activeTab === 'acceptance' && (
            <motion.div
              className={styles.tabPane}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
            >
              <div className={styles.panel} style={{ padding: 0 }}>
                <h2><FiCheckCircle /> Acceptance Criteria</h2>
                <p className={styles.panelMutedText}>Ensure all quality guidelines are met prior to submit:</p>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem', marginTop: '0.5rem' }}>
                  {(task.acceptanceCriteria || []).map((crit, i) => {
                    const isChecked = !!checkedAcceptance[i];
                    return (
                      <div key={i} className={`${styles.checklistRow} ${isChecked ? styles.checklistRowChecked : ''}`}>
                        <input
                          type="checkbox"
                          id={`crit-${i}`}
                          checked={isChecked}
                          onChange={(e) => setCheckedAcceptance(prev => ({ ...prev, [i]: e.target.checked }))}
                        />
                        <label htmlFor={`crit-${i}`}>{crit}</label>
                      </div>
                    );
                  })}
                </div>
              </div>
            </motion.div>
          )}

          {activeTab === 'evaluator' && (
            <motion.div
              className={styles.tabPane}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
            >
              {evaluation ? (
                <div className={styles.evaluationCard} style={{ padding: 0, background: 'transparent', border: 0 }}>
                  <div className={styles.evaluationHeader} style={{ padding: '0.5rem 0 1rem 0' }}>
                    <div>
                      <span>AI Evaluator</span>
                      <h2>Review Complete</h2>
                    </div>
                    <div className={styles.scoreCircle}>
                      <strong>{evaluation.score}</strong>
                      <span>/10</span>
                    </div>
                  </div>

                  <p className={styles.feedback}>{evaluation.feedback}</p>

                  <div className={styles.reviewGrid}>
                    <div className={styles.strengthBox}>
                      <h3>Strengths</h3>
                      {(evaluation.strengths || []).map((item, i) => <span key={i}>{item}</span>)}
                    </div>
                    <div className={styles.weaknessBox}>
                      <h3>Weaknesses</h3>
                      {(evaluation.weaknesses || []).map((item, i) => <span key={i}>{item}</span>)}
                    </div>
                    <div className={styles.suggestionBox}>
                      <h3>Suggestions</h3>
                      {(evaluation.suggestions || []).map((item, i) => <span key={i}>{item}</span>)}
                    </div>
                  </div>

                  <div className={styles.skillBadges}>
                    {Object.entries(skillDeltas).map(([skill, delta]) => (
                      <span key={skill}>{skill.replace(/([A-Z])/g, ' $1')} {Number(delta) >= 0 ? '+' : ''}{delta}</span>
                    ))}
                  </div>

                  {learningRecs.length > 0 && (
                    <div className={styles.learningRecommendationsSection}>
                      <h3>Recommended Learning</h3>
                      <div className={styles.learningRecommendationsList}>
                        {learningRecs.map((rec, i) => (
                          <div key={i} className={styles.learningCard}>
                            <div className={styles.learningCardHeader}>
                              <span className={rec.type === 'weakness' ? styles.badgeWeakness : styles.badgeSuggestion}>
                                {rec.type === 'weakness' ? 'Focus Area' : 'Suggestion'}
                              </span>
                            </div>
                            <p>{rec.text}</p>
                            {rec.courseUrl && (
                              <a
                                href={rec.courseUrl}
                                target="_blank"
                                rel="noopener noreferrer"
                                className={styles.learningLink}
                              >
                                Explore Course: {rec.courseTitle || 'Learn More'}
                              </a>
                            )}
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              ) : (
                <div className={styles.emptyEvaluationState}>
                  <FiShield size={36} />
                  <h3>Awaiting Submission</h3>
                  <p>Submit your solution inside the workspace on the right to receive full AI evaluator scores, strength/weakness logs, and personalized recommendations.</p>
                </div>
              )}
            </motion.div>
          )}

          {activeTab === 'teammate' && (
            <motion.div
              className={styles.tabPane}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              style={{ flex: 1, display: 'flex', flexDirection: 'column' }}
            >
              <div className={styles.chatWrapper} style={{ flex: 1, display: 'flex', flexDirection: 'column', height: '100%' }}>
                <Chatbot key={`${task._id}-${task.role}`} taskId={task._id} roleId={task.role} teammate={roleContext?.teammate} />
              </div>
            </motion.div>
          )}
        </div>
      </div>

      {sidebarOpen && (
        <div
          className={styles.resizerBar}
          onMouseDown={startResizing}
          title="Drag to resize instructions pane"
        />
      )}

      <div className={styles.rightPane}>
        <div className={styles.editorHeader}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            {!sidebarOpen && (
              <button
                className={styles.sidebarExpandButton}
                onClick={() => setSidebarOpen(true)}
                title="Show Instructions"
              >
                <FiChevronRight /> <span>Instructions</span>
              </button>
            )}
            <div>
              <span>Submission workspace</span>
              <h2>{task.role?.replaceAll('_', ' ')}</h2>
            </div>
          </div>
          <button
            className={styles.submitButton}
            onClick={handleSubmit}
            disabled={submitting || task.status === 'Evaluated'}
          >
            <FiSend />
            {submitting ? 'Evaluating...' : (task.status === 'Evaluated' ? 'Evaluated' : 'Submit for review')}
          </button>
        </div>
        {error && <div className={styles.errorBanner}>{error}</div>}
        <div className={styles.editorContainer}>
          {(() => {
            const WorkspaceComponent = getWorkspaceComponent(task.role);
            return <WorkspaceComponent value={code} onChange={setCode} task={task} />;
          })()}
        </div>
      </div>
    </div>
  );
};

export default Workspace;
