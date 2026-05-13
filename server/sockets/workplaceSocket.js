import jwt from 'jsonwebtoken';
import User from '../models/User.js';
import { assignRoleTask, evaluateRoleSubmission, switchUserRole } from '../services/taskOrchestrator.js';
import { buildRoleContext } from '../services/roleEngine.js';

const getTokenFromSocket = (socket) => {
  const authToken = socket.handshake.auth?.token;
  const bearer = socket.handshake.headers?.authorization;
  if (authToken) return authToken;
  if (bearer?.startsWith('Bearer ')) return bearer.split(' ')[1];
  return null;
};

export const registerWorkplaceSocket = (io) => {
  io.use(async (socket, next) => {
    try {
      const token = getTokenFromSocket(socket);
      if (!token) return next(new Error('Socket authentication required'));

      const decoded = jwt.verify(token, process.env.JWT_SECRET || 'fallback_secret');
      const user = await User.findById(decoded.id).select('-password');
      if (!user) return next(new Error('User not found'));

      socket.user = user;
      socket.join(`user:${user._id}`);
      next();
    } catch (error) {
      next(new Error('Socket authentication failed'));
    }
  });

  io.on('connection', (socket) => {
    socket.join(`user:${socket.user._id}`);
    socket.emit('role:context', buildRoleContext(socket.user));

    socket.on('role:change', async ({ roleId } = {}, callback) => {
      try {
        const user = await User.findById(socket.user._id).select('-password');
        const roleContext = await switchUserRole({ user, roleId });
        socket.user = user;
        socket.emit('role:changed', roleContext);
        io.to(`user:${user._id}`).emit('role:changed', roleContext);
        callback?.({ ok: true, roleContext });
      } catch (error) {
        callback?.({ ok: false, message: error.message });
      }
    });

    socket.on('task:assign', async ({ roleId } = {}, callback) => {
      try {
        const user = await User.findById(socket.user._id).select('-password');
        const result = await assignRoleTask({ user, requestedRoleId: roleId });
        io.to(`user:${user._id}`).emit('task:assigned', result);
        callback?.({ ok: true, ...result });
      } catch (error) {
        callback?.({ ok: false, message: error.message });
      }
    });

    socket.on('submission:evaluate', async ({ taskId, content } = {}, callback) => {
      try {
        const user = await User.findById(socket.user._id).select('-password');
        const result = await evaluateRoleSubmission({ user, taskId, content });
        io.to(`user:${user._id}`).emit('submission:evaluated', result);
        callback?.({ ok: true, ...result });
      } catch (error) {
        callback?.({ ok: false, message: error.message });
      }
    });
  });
};
