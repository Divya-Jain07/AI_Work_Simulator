import { useCallback, useContext, useEffect, useMemo, useRef, useState } from 'react';
import axios from 'axios';
import { io } from 'socket.io-client';
import { AuthContext } from './AuthContext';
import { WorkplaceContext } from './workplaceContextObject';
import { DEFAULT_ROLE_ID, ROLE_CATALOG, ROLE_LIST } from '../config/roleCatalog';

const API_URL = 'http://localhost:5000';

const upsertById = (items, item) => {
  if (!item?._id) return items;
  const exists = items.some((current) => current._id === item._id);
  if (exists) {
    return items.map((current) => (current._id === item._id ? { ...current, ...item } : current));
  }
  return [item, ...items];
};

export const WorkplaceProvider = ({ children }) => {
  const { user, setUserFromWorkplace } = useContext(AuthContext);
  const [roles, setRoles] = useState(ROLE_LIST);
  const [roleContext, setRoleContext] = useState(user?.roleContext || null);
  const [selectedRoleId, setSelectedRoleId] = useState(
    user?.roleContext?.activeRole?.id || user?.activeWorkRole || DEFAULT_ROLE_ID
  );
  const [tasks, setTasks] = useState([]);
  const [connected, setConnected] = useState(false);
  const [loading, setLoading] = useState(true);
  const [assigning, setAssigning] = useState(false);
  const [switchingRole, setSwitchingRole] = useState(false);
  const [activity, setActivity] = useState([]);
  const socketRef = useRef(null);
  const lastAppliedRoleRef = useRef(null);

  const activeRoleId = selectedRoleId || roleContext?.activeRole?.id || user?.activeWorkRole || DEFAULT_ROLE_ID;
  const activeRoleDefinition = ROLE_CATALOG[activeRoleId] || ROLE_CATALOG[DEFAULT_ROLE_ID];

  const pushActivity = useCallback((event) => {
    setActivity((current) => [
      { id: `${Date.now()}-${Math.random()}`, createdAt: new Date().toISOString(), ...event },
      ...current
    ].slice(0, 8));
  }, []);

  const activeRoleIdRef = useRef(activeRoleId);
  useEffect(() => {
    activeRoleIdRef.current = activeRoleId;
  }, [activeRoleId]);

  const refreshTasks = useCallback(async () => {
    if (!user) return;
    const { data } = await axios.get(`${API_URL}/api/tasks`);
    setTasks(data);
  }, [user]);

  const loadRoleState = useCallback(async () => {
    if (!user) return;
    setLoading(true);
    try {
      const { data } = await axios.get(`${API_URL}/api/roles`);
      setRoles(mergeRoles(data.roles));
      const serverRoleId = data.current?.activeRole?.id;
      if (serverRoleId) {
        setSelectedRoleId(serverRoleId);
        setRoleContext(buildResolvedRoleContext(serverRoleId, data.current));
        await refreshTasks();
      }
    } finally {
      setLoading(false);
    }
  }, [refreshTasks, user]);

  const applyRoleContext = useCallback((context) => {
    if (!context?.activeRole?.id) return;

    setSelectedRoleId(context.activeRole.id);
    setRoleContext(buildResolvedRoleContext(context.activeRole.id, context));
    // We no longer clear tasks here so they don't vanish from the UI
    refreshTasks();
    setUserFromWorkplace?.({ activeWorkRole: context.activeRole.id, roleContext: context });

    if (lastAppliedRoleRef.current !== context.activeRole.id) {
      lastAppliedRoleRef.current = context.activeRole.id;
      pushActivity({
        type: 'role',
        title: `${context.activeRole.label} mode activated`,
        detail: 'Dashboard, teammate, skills, and task pipeline updated.'
      });
    }
  }, [pushActivity, refreshTasks, setUserFromWorkplace]);

  const buildPreviewRoleContext = useCallback((roleId) => {
    return buildResolvedRoleContext(roleId);
  }, []);

  const hasLoadedRef = useRef(false);

  useEffect(() => {
    if (user?.token && !hasLoadedRef.current) {
      hasLoadedRef.current = true;
      queueMicrotask(() => loadRoleState());
    }
  }, [user?.token, loadRoleState]);

  // Reset the loaded ref if user logs out
  useEffect(() => {
    if (!user?.token) {
      hasLoadedRef.current = false;
    }
  }, [user?.token]);

  useEffect(() => {
    if (!user?.token) return undefined;

    const socket = io(API_URL, {
      auth: { token: user.token },
      transports: ['websocket', 'polling']
    });

    socketRef.current = socket;

    socket.on('connect', () => setConnected(true));
    socket.on('disconnect', () => setConnected(false));
    socket.on('role:context', (context) => {
      if (!context?.activeRole?.id) return;
      setSelectedRoleId((currentRoleId) => currentRoleId || context.activeRole.id);
      setRoleContext((currentContext) => (
        currentContext?.activeRole?.id
          ? currentContext
          : buildResolvedRoleContext(context.activeRole.id, context)
      ));
    });
    socket.on('role:changed', applyRoleContext);
    socket.on('task:assigned', ({ task, roleContext: context }) => {
      if (context?.activeRole?.id) {
        setSelectedRoleId(context.activeRole.id);
        setRoleContext(buildResolvedRoleContext(context.activeRole.id, context));
      }
      if (task) setTasks((current) => upsertById(current, task));
      pushActivity({
        type: 'task',
        title: 'AI Manager assigned a new task',
        detail: task?.title
      });
    });
    socket.on('submission:evaluated', ({ submission, roleContext: context, skillGraph }) => {
      if (context?.activeRole?.id) {
        setSelectedRoleId(context.activeRole.id);
        setRoleContext(buildResolvedRoleContext(context.activeRole.id, context));
      }
      if (submission?.task) {
        setTasks((current) => current.map((task) => (
          task._id === submission.task ? { ...task, status: 'Evaluated', lastEvaluationScore: submission.score } : task
        )));
      }
      setUserFromWorkplace?.({
        roleContext: context,
        roleSkillGraph: skillGraph
      });
      pushActivity({
        type: 'evaluation',
        title: `Evaluator returned ${submission?.score}/10`,
        detail: submission?.feedback
      });
    });

    return () => {
      socket.disconnect();
      socketRef.current = null;
    };
  }, [applyRoleContext, pushActivity, setUserFromWorkplace, user?.token]);

  const changeRole = useCallback(async (roleId) => {
    if (!roleId || switchingRole) return { ok: false };
    if (roleId === activeRoleId) return { ok: true };

    setSwitchingRole(true);
    const previewContext = buildPreviewRoleContext(roleId);
    if (previewContext) {
      setSelectedRoleId(roleId);
      setRoleContext(previewContext);
      setUserFromWorkplace?.({ activeWorkRole: roleId, roleContext: previewContext });
      pushActivity({
        type: 'role',
        title: `${previewContext.activeRole.label} mode activated`,
        detail: 'Updating your workplace in real time.'
      });
    }

    try {
      const { data } = await axios.patch(`${API_URL}/api/roles/active`, { roleId });
      applyRoleContext(data);
      return { ok: true };
    } catch (error) {
      pushActivity({ type: 'error', title: 'Role switch failed', detail: error.response?.data?.message || error.message });
      return { ok: false, message: error.response?.data?.message || error.message };
    } finally {
      setSwitchingRole(false);
    }
  }, [activeRoleId, applyRoleContext, buildPreviewRoleContext, pushActivity, setUserFromWorkplace, switchingRole]);

  const requestTask = useCallback(async () => {
    setAssigning(true);
    try {
      const socket = socketRef.current;
      if (socket?.connected) {
        return await new Promise((resolve, reject) => {
          socket.emit('task:assign', { roleId: activeRoleId }, (response) => {
            if (!response?.ok) reject(new Error(response?.message || 'Task assignment failed'));
            else resolve(response.task);
          });
        });
      }

      const { data } = await axios.post(`${API_URL}/api/ai/manager/assign`, { roleId: activeRoleId });
      setTasks((current) => upsertById(current, data.task));
      if (data.roleContext?.activeRole?.id) {
        setSelectedRoleId(data.roleContext.activeRole.id);
        setRoleContext(buildResolvedRoleContext(data.roleContext.activeRole.id, data.roleContext));
      }
      return data.task;
    } finally {
      setAssigning(false);
    }
  }, [activeRoleId]);

  const evaluateTask = useCallback(async ({ taskId, content }) => {
    const socket = socketRef.current;
    if (socket?.connected) {
      return await new Promise((resolve, reject) => {
        socket.emit('submission:evaluate', { taskId, content }, (response) => {
          if (!response?.ok) reject(new Error(response?.message || 'Evaluation failed'));
          else resolve(response);
        });
      });
    }

    const { data } = await axios.post(`${API_URL}/api/ai/evaluator/evaluate`, { taskId, content });
    return data;
  }, []);

  const value = useMemo(() => ({
    roles,
    roleContext: buildResolvedRoleContext(activeRoleId, roleContext),
    activeRoleDefinition,
    tasks,
    connected,
    loading,
    assigning,
    switchingRole,
    activity,
    activeRoleId,
    changeRole,
    requestTask,
    evaluateTask,
    refreshTasks,
    setTasks
  }), [roles, roleContext, activeRoleDefinition, tasks, connected, loading, assigning, switchingRole, activity, activeRoleId, changeRole, requestTask, evaluateTask, refreshTasks]);

  return (
    <WorkplaceContext.Provider value={value}>
      {children}
    </WorkplaceContext.Provider>
  );
};

const mergeRoles = (serverRoles = []) => {
  const merged = { ...ROLE_CATALOG };

  serverRoles.forEach((role) => {
    if (!role?.id) return;
    merged[role.id] = {
      ...(merged[role.id] || {}),
      ...role
    };
  });

  return Object.values(merged);
};

const buildResolvedRoleContext = (roleId, serverContext = {}) => {
  const role = ROLE_CATALOG[roleId] || ROLE_CATALOG[DEFAULT_ROLE_ID];
  const serverContextMatchesRole = serverContext.activeRole?.id === role.id;

  return {
    activeRole: {
      ...(serverContextMatchesRole ? serverContext.activeRole : {}),
      id: role.id,
      label: role.label,
      headline: role.headline
    },
    taskCategories: role.taskCategories,
    dashboardWidgets: role.dashboardWidgets,
    teammate: {
      ...(serverContextMatchesRole ? serverContext.teammate : {}),
      name: role.teammateName,
      title: role.teammateTitle
    },
    evaluationCriteria: serverContextMatchesRole && serverContext.evaluationCriteria?.length
      ? serverContext.evaluationCriteria
      : role.evaluationCriteria,
    learningRecommendations: serverContextMatchesRole && serverContext.learningRecommendations?.length
      ? serverContext.learningRecommendations
      : role.learningRecommendations,
    skillGraph: {
      ...role.defaultSkillGraph,
      ...(serverContextMatchesRole ? serverContext.skillGraph : {})
    }
  };
};
