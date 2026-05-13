import { useState, useEffect, useContext, useMemo } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
import Editor from '@monaco-editor/react';
import { motion } from 'framer-motion';
import { FiArrowLeft, FiCheckCircle, FiClock, FiSend, FiShield, FiTarget } from 'react-icons/fi';
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

  useEffect(() => {
    const fetchTask = async () => {
      try {
        const { data } = await axios.get(`http://localhost:5000/api/tasks/${id}`);
        setTask(data);
        setCode(starterByRole[data.role] || starterByRole.frontend_developer);
        if (data.status === 'Evaluated') {
          const subRes = await axios.get(`http://localhost:5000/api/tasks/${id}/submissions`);
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
    } catch (submitError) {
      setError(submitError.message || 'Evaluation failed.');
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) return <div className={styles.loading}>Loading workspace...</div>;
  if (!task) return <div className={styles.loading}>{error || 'Task not found.'}</div>;

  return (
    <div className={styles.workspace}>
      <div className={styles.leftPane}>
        <button className={styles.backButton} onClick={() => navigate('/')}>
          <FiArrowLeft /> Back to command center
        </button>

        <motion.section
          className={styles.taskDetails}
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <div className={styles.taskTopline}>
            <span>{task.category}</span>
            <span><FiClock /> {task.deadline}</span>
          </div>
          <div className={styles.taskHeader}>
            <h1>{task.title}</h1>
            <span className={styles.difficulty}>{task.difficulty}</span>
          </div>
          <p className={styles.description}>{task.description}</p>
          {task.businessContext && (
            <div className={styles.contextBox}>
              <strong>Business context</strong>
              <p>{task.businessContext}</p>
            </div>
          )}
        </motion.section>

        <section className={styles.detailGrid}>
          <div className={styles.panel}>
            <h2><FiTarget /> Requirements</h2>
            <ul>
              {(task.requirements || []).map((req) => <li key={req}>{req}</li>)}
            </ul>
          </div>
          <div className={styles.panel}>
            <h2><FiCheckCircle /> Acceptance criteria</h2>
            <ul>
              {(task.acceptanceCriteria || []).map((criteria) => <li key={criteria}>{criteria}</li>)}
            </ul>
          </div>
          <div className={styles.panel}>
            <h2><FiShield /> Evaluator lens</h2>
            <ul>
              {(task.evaluationCriteria || roleContext?.evaluationCriteria || []).map((criteria) => <li key={criteria}>{criteria}</li>)}
            </ul>
          </div>
        </section>

        {evaluation && (
          <motion.section
            className={styles.evaluationCard}
            initial={{ opacity: 0, y: 14 }}
            animate={{ opacity: 1, y: 0 }}
          >
            <div className={styles.evaluationHeader}>
              <div>
                <span>AI Evaluator</span>
                <h2>Review complete</h2>
              </div>
              <div className={styles.scoreCircle}>
                <strong>{evaluation.score}</strong>
                <span>/10</span>
              </div>
            </div>

            <p className={styles.feedback}>{evaluation.feedback}</p>

            <div className={styles.reviewGrid}>
              <div>
                <h3>Strengths</h3>
                {(evaluation.strengths || []).map((item) => <span key={item}>{item}</span>)}
              </div>
              <div>
                <h3>Weaknesses</h3>
                {(evaluation.weaknesses || []).map((item) => <span key={item}>{item}</span>)}
              </div>
              <div>
                <h3>Suggestions</h3>
                {(evaluation.suggestions || []).map((item) => <span key={item}>{item}</span>)}
              </div>
            </div>

            <div className={styles.skillBadges}>
              {Object.entries(skillDeltas).map(([skill, delta]) => (
                <span key={skill}>{skill.replace(/([A-Z])/g, ' $1')} {Number(delta) >= 0 ? '+' : ''}{delta}</span>
              ))}
            </div>
          </motion.section>
        )}

        <div className={styles.chatWrapper}>
          <Chatbot key={`${task._id}-${task.role}`} roleId={task.role} teammate={roleContext?.teammate} />
        </div>
      </div>

      <div className={styles.rightPane}>
        <div className={styles.editorHeader}>
          <div>
            <span>Submission workspace</span>
            <h2>{task.role?.replaceAll('_', ' ')}</h2>
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
            return <WorkspaceComponent value={code} onChange={setCode} />;
          })()}
        </div>
      </div>
    </div>
  );
};

export default Workspace;
