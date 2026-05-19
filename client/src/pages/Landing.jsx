import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  FiArrowRight,
  FiBarChart2,
  FiCpu,
  FiMessageSquare,
  FiTarget,
  FiZap
} from 'react-icons/fi';
import styles from './Landing.module.css';

const features = [
  {
    icon: FiZap,
    title: 'AI Manager assigns real tasks',
    description: 'Get role-specific bugs, fixes, and deliverables — the same shape of work you would see on the job.'
  },
  {
    icon: FiCpu,
    title: 'Focused workspace',
    description: 'Code, debug APIs, analyze data, or review UX in a workspace built for your track.'
  },
  {
    icon: FiMessageSquare,
    title: 'AI teammate support',
    description: 'Ask questions and get hints from a role-aware collaborator while you work.'
  },
  {
    icon: FiTarget,
    title: 'Evaluation & feedback',
    description: 'Submit your solution and receive a score with strengths, gaps, and next steps.'
  },
  {
    icon: FiBarChart2,
    title: 'Skills & progress',
    description: 'Watch your skill graph grow and track completed tasks across your simulation.'
  }
];

const fadeUp = {
  initial: { opacity: 0, y: 20 },
  whileInView: { opacity: 1, y: 0 },
  viewport: { once: true, margin: '-40px' },
  transition: { duration: 0.45 }
};

const Landing = () => {
  return (
    <div className={styles.page}>
      <nav className={styles.navbar}>
        <div className={styles.navLeft}>
          <Link to="/login" className={styles.loginBtn}>Login</Link>
        </div>
        <Link to="/" className={styles.brand}>
          <FiCpu />
          <span>WorkSim AI</span>
        </Link>
        <div className={styles.navRight} aria-hidden="true" />
      </nav>

      <main>
        <section className={styles.hero}>
          <motion.div
            className={styles.heroGlow}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.8 }}
          />
          <motion.div
            className={styles.heroContent}
            initial={{ opacity: 0, y: 24 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.55 }}
          >
            <span className={styles.eyebrow}>AI-powered workplace simulator</span>
            <h1>
              Practice your career.
              <br />
              <span>Before the real job.</span>
            </h1>
            <p>
              Step into a virtual internship with an AI manager, teammate, and evaluator.
              Choose your role, complete realistic tasks, and build skills in a safe environment.
            </p>
            <div className={styles.ctaRow}>
              <Link to="/login" className={styles.ctaPrimary}>
                Try Simulation
                <FiArrowRight />
              </Link>
              <Link to="/login" className={styles.ctaSecondary}>
                Enter Platform
              </Link>
            </div>
            <p className={styles.ctaNote}>
              New here? <Link to="/register">Create an account</Link> in under a minute.
            </p>
          </motion.div>

          <motion.div
            className={styles.heroPreview}
            initial={{ opacity: 0, scale: 0.96 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.6, delay: 0.15 }}
          >
            <motion.div className={styles.previewCard}>
              <span className={styles.previewLabel}>Live task</span>
              <strong>Fix React form validation on checkout</strong>
              <p>Frontend Developer · Due before EOD</p>
            </motion.div>
            <motion.div className={`${styles.previewCard} ${styles.previewCardAlt}`}>
              <span className={styles.previewLabel}>Evaluator</span>
              <strong>8.4 / 10</strong>
              <p>Strong state handling · Improve edge-case notes</p>
            </motion.div>
          </motion.div>
        </section>

        <section className={styles.features} id="features">
          <motion.div className={styles.sectionHead} {...fadeUp}>
            <span className={styles.eyebrow}>Platform features</span>
            <h2>Everything you need to simulate real work</h2>
            <p>
              From assignment to submission, WorkSim AI mirrors the rhythm of a modern tech workplace.
            </p>
          </motion.div>

          <div className={styles.featureGrid}>
            {features.map((feature, index) => {
              const Icon = feature.icon;
              return (
                <motion.article
                  key={feature.title}
                  className={styles.featureCard}
                  {...fadeUp}
                  transition={{ duration: 0.45, delay: index * 0.06 }}
                >
                  <div className={styles.featureIcon}>
                    <Icon />
                  </div>
                  <h3>{feature.title}</h3>
                  <p>{feature.description}</p>
                </motion.article>
              );
            })}
          </div>
        </section>

        <section className={styles.ctaSection}>
          <motion.div className={styles.ctaPanel} {...fadeUp}>
            <h2>Ready to enter the workplace?</h2>
            <p>Sign in, pick your role, and get your first assignment from the AI manager.</p>
            <motion.div className={styles.ctaRow}>
              <Link to="/login" className={styles.ctaPrimary}>
                Try Simulation
                <FiArrowRight />
              </Link>
              <Link to="/login" className={styles.ctaSecondary}>
                Enter Platform
              </Link>
            </motion.div>
          </motion.div>
        </section>
      </main>

      <footer className={styles.footer}>
        <span>© {new Date().getFullYear()} WorkSim AI</span>
        <Link to="/login">Login</Link>
        <Link to="/register">Sign up</Link>
      </footer>
    </div>
  );
};

export default Landing;
