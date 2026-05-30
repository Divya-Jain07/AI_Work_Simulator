import express from 'express';
import { executeSqlQuery, getSqlSchema } from '../services/sql/sqlExecutionService.js';

const router = express.Router();

router.get('/schema', (req, res) => {
  res.json({ success: true, schema: getSqlSchema() });
});

router.post('/execute', (req, res) => {
  const result = executeSqlQuery(req.body?.query || '');
  res.status(result.success ? 200 : 400).json(result);
});

export default router;
