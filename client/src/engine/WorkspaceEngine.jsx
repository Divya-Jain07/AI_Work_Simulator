import { useEffect, useMemo } from 'react';
import { useQuery } from '@tanstack/react-query';
import { WORKSPACE_ROLE, resolveWorkspaceDefinition } from '../config/workspaceConfig';
import WorkspaceLayout from '../components/workspace/WorkspaceLayout';
import { useWorkspaceEngineStore } from './workspaceEngineStore';
import styles from './WorkspaceEngine.module.css';

const getWorkflowStage = (task) => {
  if (task?.status === 'Evaluated') return 'reviewed';
  if (task?.status === 'Submitted') return 'evaluation';
  if (task?.status === 'In Progress') return 'execution';
  return 'briefing';
};

const getProgress = (task) => {
  if (task?.status === 'Evaluated') return 100;
  if (task?.status === 'Submitted') return 78;
  if (task?.status === 'In Progress') return 46;
  return 18;
};

export const WorkspaceEngine = ({ task, value, onChange, onSubmit, submitting, disabled }) => {
  const { data: liveTask } = useQuery({
    queryKey: ['workspace-engine-task', task?._id],
    queryFn: async () => task,
    initialData: task,
    enabled: !!task,
    staleTime: 30_000
  });

  const definition = useMemo(() => resolveWorkspaceDefinition(liveTask), [liveTask]);
  const setWorkspaceContext = useWorkspaceEngineStore((state) => state.setWorkspaceContext);
  const setActiveTool = useWorkspaceEngineStore((state) => state.setActiveTool);
  const activeTool = useWorkspaceEngineStore((state) => state.activeTool);
  const workflowStage = getWorkflowStage(liveTask);
  const progress = getProgress(liveTask);
  const focusedSubmissionMode = [
    WORKSPACE_ROLE.DATA_ANALYST,
    WORKSPACE_ROLE.BACKEND_ENGINEER,
    WORKSPACE_ROLE.FRONTEND_ENGINEER,
    WORKSPACE_ROLE.UI_UX_DESIGNER
  ].includes(definition.role);

  useEffect(() => {
    setWorkspaceContext({
      role: definition.role,
      taskType: definition.taskType,
      workflowStage,
      activeTool: activeTool || definition.sidebarItems[0]?.id,
      progress
    });
  }, [activeTool, definition.role, definition.sidebarItems, definition.taskType, progress, setWorkspaceContext, workflowStage]);

  return (
    <div className={`${styles.engineShell} ${focusedSubmissionMode ? styles.engineShellFocused : ''}`}>
      {!focusedSubmissionMode && (
        <nav className={styles.roleRail} aria-label="Adaptive workspace tools">
          {definition.sidebarItems.map((item) => {
            const Icon = item.icon;
            const isActive = (activeTool || definition.sidebarItems[0]?.id) === item.id;
            return (
              <button
                key={item.id}
                className={`${styles.railButton} ${isActive ? styles.railButtonActive : ''}`}
                onClick={() => setActiveTool(item.id)}
                title={item.label}
              >
                <Icon />
              </button>
            );
          })}
        </nav>
      )}

      <section className={`${styles.workspaceRegion} ${focusedSubmissionMode ? styles.workspaceRegionFocused : ''}`}>
        {!focusedSubmissionMode && (
          <header className={styles.engineHeader}>
            <div>
              <h3>{definition.teammatePersona.title} workspace</h3>
              <span>{definition.taskType.replaceAll('_', ' ').toLowerCase()} - {progress}% progress</span>
            </div>
            <span className={styles.stagePill}>{workflowStage}</span>
          </header>
        )}

        <main className={styles.canvas}>
          <WorkspaceLayout
            definition={definition}
            task={liveTask}
            value={value}
            onChange={onChange}
            onSubmit={onSubmit}
            submitting={submitting}
            disabled={disabled}
          />
        </main>
      </section>
    </div>
  );
};

export default WorkspaceEngine;
