import { useContext, useMemo, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  FiArrowLeft,
  FiArrowRight,
  FiBarChart2,
  FiCheck,
  FiCpu,
  FiLayout,
  FiMonitor,
  FiZap
} from 'react-icons/fi';
import { AuthContext } from '../context/AuthContext';
import { WorkplaceContext } from '../context/workplaceContextObject';
import { DEFAULT_ROLE_ID } from '../config/roleCatalog';
import styles from './RoleSelect.module.css';

const STEPS = ['welcome', 'role', 'confirm'];

const roleMeta = {
  frontend_developer: { icon: FiMonitor, accentClass: styles.frontend },
  backend_developer: { icon: FiCpu, accentClass: styles.backend },
  data_analyst: { icon: FiBarChart2, accentClass: styles.analyst },
  uiux_designer: { icon: FiLayout, accentClass: styles.uiux }
};

const RoleSelect = () => {
  const { user } = useContext(AuthContext);
  const { roles, activeRoleId, changeRole, switchingRole, loading } = useContext(WorkplaceContext);
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const isSwitchMode = searchParams.get('switch') === '1';

  const [stepIndex, setStepIndex] = useState(isSwitchMode ? 1 : 0);
  const [selectedId, setSelectedId] = useState(
    user?.activeWorkRole || user?.roleContext?.activeRole?.id || DEFAULT_ROLE_ID
  );
  const [error, setError] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const selectedRole = roles.find((role) => role.id === selectedId);
  const busy = submitting || switchingRole || loading;
  const step = STEPS[stepIndex];

  const canGoNext = useMemo(() => {
    if (step === 'welcome') return true;
    if (step === 'role') return Boolean(selectedId);
    return Boolean(selectedId);
  }, [step, selectedId]);

  const goNext = () => {
    if (!canGoNext) return;
    if (stepIndex < STEPS.length - 1) {
      setStepIndex((current) => current + 1);
      setError('');
      return;
    }
    handleFinish();
  };

  const goBack = () => {
    if (stepIndex > 0) {
      setStepIndex((current) => current - 1);
      setError('');
    }
  };

  const handleFinish = async () => {
    if (!selectedId) return;
    setError('');
    setSubmitting(true);

    try {
      const result = await changeRole(selectedId);
      if (!result?.ok) {
        setError(result?.message || 'Could not activate this role. Please try again.');
        return;
      }
      navigate('/dashboard', { replace: true });
    } catch (err) {
      setError(err.message || 'Could not activate this role. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className={styles.page}>
      <div className={styles.shell}>
        <header className={styles.header}>
          <motion.div
            className={styles.brand}
            initial={{ opacity: 0, y: -8 }}
            animate={{ opacity: 1, y: 0 }}
          >
            <FiCpu className={styles.brandIcon} />
            WorkSim AI
          </motion.div>

          <motion.div
            className={styles.stepDots}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
          >
            {STEPS.map((name, index) => (
              <span
                key={name}
                className={`${styles.dot} ${index <= stepIndex ? styles.dotActive : ''}`}
              />
            ))}
          </motion.div>
        </header>

        {error && <motion.div className={styles.error}>{error}</motion.div>}

        <AnimatePresence mode="sync">
          {step === 'welcome' && (
            <motion.section
              key="welcome"
              className={styles.stepPanel}
              initial={{ opacity: 0, x: 24 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -24 }}
            >
              <div className={styles.welcomeIcon}>
                <FiZap />
              </div>
              <h1>Welcome to your AI workplace</h1>
              <p>
                {user?.name ? `Hi ${user.name.split(' ')[0]}, ` : ''}
                practice real-world tasks with an AI manager, teammate, and evaluator — just like a real internship.
              </p>
              <ul className={styles.featureList}>
                <li>Get role-specific assignments</li>
                <li>Work in a focused workspace</li>
                <li>Receive scores and skill growth</li>
              </ul>
            </motion.section>
          )}

          {step === 'role' && (
            <motion.section
              key="role"
              className={styles.stepPanel}
              initial={{ opacity: 0, x: 24 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -24 }}
            >
              <h1>Choose your role</h1>
              <p>Select the track you want to practice today. You can change this anytime from the sidebar.</p>
              <div className={styles.grid}>
                {roles.map((role) => {
                  const meta = roleMeta[role.id] || roleMeta.frontend_developer;
                  const Icon = meta.icon;
                  const isSelected = selectedId === role.id;

                  return (
                    <button
                      key={role.id}
                      type="button"
                      className={`${styles.card} ${meta.accentClass} ${isSelected ? styles.cardSelected : ''}`}
                      onClick={() => setSelectedId(role.id)}
                      aria-pressed={isSelected}
                    >
                      <motion.div className={styles.cardTop}>
                        <div className={styles.iconWrap}>
                          <Icon />
                        </div>
                        <span className={styles.check} aria-hidden="true">
                          <FiCheck />
                        </span>
                      </motion.div>
                      <h2>{role.label}</h2>
                      <p className={styles.cardHeadline}>{role.headline}</p>
                      <div className={styles.tags}>
                        {(role.taskCategories || []).slice(0, 2).map((category) => (
                          <span key={category} className={styles.tag}>{category}</span>
                        ))}
                      </div>
                    </button>
                  );
                })}
              </div>
            </motion.section>
          )}

          {step === 'confirm' && (
            <motion.section
              key="confirm"
              className={styles.stepPanel}
              initial={{ opacity: 0, x: 24 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -24 }}
            >
              <h1>You&apos;re all set</h1>
              <p>Your workplace will be configured for this role.</p>
              <div className={`${styles.summaryCard} ${roleMeta[selectedId]?.accentClass || styles.frontend}`}>
                <div className={styles.summaryTop}>
                  <strong>{selectedRole?.label || 'Selected role'}</strong>
                  {activeRoleId === selectedId && <span className={styles.currentBadge}>Current</span>}
                </div>
                <p>{selectedRole?.headline}</p>
                <small>
                  AI teammate: {selectedRole?.teammateName}
                  {selectedRole?.teammateTitle ? ` · ${selectedRole.teammateTitle}` : ''}
                </small>
              </div>
            </motion.section>
          )}
        </AnimatePresence>

        <footer className={styles.footer}>
          <button
            type="button"
            className={styles.backBtn}
            onClick={goBack}
            disabled={stepIndex === 0 || busy}
          >
            <FiArrowLeft />
            Back
          </button>

          <button
            type="button"
            className={styles.nextBtn}
            onClick={goNext}
            disabled={!canGoNext || busy}
          >
            {busy
              ? 'Setting up...'
              : step === 'confirm'
                ? `Enter as ${selectedRole?.label || 'Intern'}`
                : 'Next'}
            {!busy && <FiArrowRight />}
          </button>
        </footer>
      </div>
    </div>
  );
};

export default RoleSelect;
