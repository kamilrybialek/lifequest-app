import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import Database from 'better-sqlite3';
import path from 'path';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3001;

// Middleware
app.use(cors());
app.use(express.json());

// Database connection (using SQLite from the main app)
const dbPath = path.join(__dirname, '../../lifequest.db');
const db = new Database(dbPath);

// Simple admin authentication middleware
const adminAuth = (req: express.Request, res: express.Response, next: express.NextFunction) => {
  const email = req.headers['x-admin-email'] as string;

  if (!email || email !== 'kamil.rybialek@gmail.com') {
    return res.status(403).json({ error: 'Unauthorized' });
  }

  // Get admin from database
  const admin = db.prepare('SELECT * FROM admin_users WHERE email = ? AND is_active = 1').get(email);

  if (!admin) {
    return res.status(403).json({ error: 'Admin not found' });
  }

  (req as any).admin = admin;
  next();
};

// ===== ROUTES =====

// Health check
app.get('/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// Admin login check
app.post('/api/admin/login', (req, res) => {
  const { email } = req.body;

  if (email !== 'kamil.rybialek@gmail.com') {
    return res.status(403).json({ error: 'Unauthorized' });
  }

  const admin = db.prepare('SELECT * FROM admin_users WHERE email = ? AND is_active = 1').get(email);

  if (!admin) {
    return res.status(404).json({ error: 'Admin not found' });
  }

  // Update last login
  db.prepare('UPDATE admin_users SET last_login = ? WHERE id = ?').run(new Date().toISOString(), (admin as any).id);

  res.json({ admin, token: 'simple-token-for-now' });
});

// ===== USER MANAGEMENT =====

app.get('/api/admin/users', adminAuth, (req, res) => {
  try {
    const users = db.prepare(`
      SELECT
        u.*,
        us.total_xp,
        us.level,
        us.finance_streak,
        us.mental_streak,
        us.physical_streak,
        us.nutrition_streak,
        us.last_active_date
      FROM users u
      LEFT JOIN user_stats us ON u.id = us.user_id
      ORDER BY u.created_at DESC
    `).all();

    res.json({ users });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

app.get('/api/admin/users/:id', adminAuth, (req, res) => {
  try {
    const userId = parseInt(req.params.id);

    const user = db.prepare('SELECT * FROM users WHERE id = ?').get(userId);
    const stats = db.prepare('SELECT * FROM user_stats WHERE user_id = ?').get(userId);
    const financeProgress = db.prepare('SELECT * FROM finance_progress WHERE user_id = ?').get(userId);
    const mentalProgress = db.prepare('SELECT * FROM mental_progress WHERE user_id = ?').get(userId);
    const physicalProgress = db.prepare('SELECT * FROM physical_progress WHERE user_id = ?').get(userId);

    res.json({
      user,
      stats,
      financeProgress,
      mentalProgress,
      physicalProgress,
    });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

// ===== ANALYTICS =====

app.get('/api/admin/analytics', adminAuth, (req, res) => {
  try {
    const totalUsers = db.prepare('SELECT COUNT(*) as count FROM users').get() as { count: number };
    const activeUsers = db.prepare(`
      SELECT COUNT(*) as count FROM users
      WHERE id IN (SELECT DISTINCT user_id FROM user_activity WHERE created_at >= datetime('now', '-7 days'))
    `).get() as { count: number };
    const totalTasks = db.prepare('SELECT COUNT(*) as count FROM daily_tasks').get() as { count: number };
    const completedTasks = db.prepare('SELECT COUNT(*) as count FROM daily_tasks WHERE completed = 1').get() as { count: number };

    res.json({
      totalUsers: totalUsers.count,
      activeUsers: activeUsers.count,
      totalTasks: totalTasks.count,
      completedTasks: completedTasks.count,
      completionRate: totalTasks.count ? (completedTasks.count / totalTasks.count) * 100 : 0,
    });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

// ===== TASK TEMPLATES =====

app.get('/api/admin/task-templates', adminAuth, (req, res) => {
  try {
    const templates = db.prepare(`
      SELECT tt.*, au.email as created_by_email
      FROM task_templates tt
      LEFT JOIN admin_users au ON tt.created_by = au.id
      WHERE tt.is_active = 1
      ORDER BY tt.pillar, tt.title
    `).all();

    res.json({ templates });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

app.post('/api/admin/task-templates', adminAuth, (req, res) => {
  try {
    const { pillar, title, description, duration, xp, difficulty } = req.body;
    const admin = (req as any).admin;

    const result = db.prepare(`
      INSERT INTO task_templates
      (pillar, title, description, duration_minutes, xp_reward, difficulty, created_by)
      VALUES (?, ?, ?, ?, ?, ?, ?)
    `).run(pillar, title, description, duration, xp, difficulty, admin.id);

    // Log activity
    db.prepare(`
      INSERT INTO admin_activity_logs (admin_id, action, target_type, target_id, details)
      VALUES (?, 'create_task_template', 'task_template', ?, ?)
    `).run(admin.id, result.lastInsertRowid, JSON.stringify({ title, pillar }));

    res.json({ id: result.lastInsertRowid, message: 'Task template created' });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

app.delete('/api/admin/task-templates/:id', adminAuth, (req, res) => {
  try {
    const templateId = parseInt(req.params.id);
    const admin = (req as any).admin;

    db.prepare('UPDATE task_templates SET is_active = 0 WHERE id = ?').run(templateId);

    // Log activity
    db.prepare(`
      INSERT INTO admin_activity_logs (admin_id, action, target_type, target_id)
      VALUES (?, 'delete_task_template', 'task_template', ?)
    `).run(admin.id, templateId);

    res.json({ message: 'Task template deleted' });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

// ===== CONTENT MANAGEMENT =====

app.get('/api/admin/content', adminAuth, (req, res) => {
  try {
    const { pillar, type } = req.query;
    let query = `
      SELECT ci.*, au.email as created_by_email
      FROM content_items ci
      LEFT JOIN admin_users au ON ci.created_by = au.id
      WHERE 1=1
    `;
    const params: any[] = [];

    if (pillar) {
      query += ' AND ci.pillar = ?';
      params.push(pillar);
    }
    if (type) {
      query += ' AND ci.type = ?';
      params.push(type);
    }

    query += ' ORDER BY ci.pillar, ci.order_index, ci.created_at DESC';

    const content = db.prepare(query).all(...params);
    res.json({ content });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

app.post('/api/admin/content', adminAuth, (req, res) => {
  try {
    const { type, pillar, title, content, orderIndex } = req.body;
    const admin = (req as any).admin;

    const result = db.prepare(`
      INSERT INTO content_items
      (type, pillar, title, content, order_index, created_by)
      VALUES (?, ?, ?, ?, ?, ?)
    `).run(type, pillar, title, content, orderIndex || 0, admin.id);

    db.prepare(`
      INSERT INTO admin_activity_logs (admin_id, action, target_type, target_id)
      VALUES (?, 'create_content', 'content_item', ?)
    `).run(admin.id, result.lastInsertRowid);

    res.json({ id: result.lastInsertRowid, message: 'Content created' });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

// ===== PUSH NOTIFICATIONS =====

app.post('/api/admin/notifications', adminAuth, (req, res) => {
  try {
    const { targetUserId, targetSegment, title, body, data, scheduledAt } = req.body;
    const admin = (req as any).admin;

    const result = db.prepare(`
      INSERT INTO push_notifications
      (target_user_id, target_segment, title, body, data, scheduled_at, created_by)
      VALUES (?, ?, ?, ?, ?, ?, ?)
    `).run(
      targetUserId || null,
      targetSegment || null,
      title,
      body,
      data || null,
      scheduledAt || null,
      admin.id
    );

    db.prepare(`
      INSERT INTO admin_activity_logs (admin_id, action, target_type, target_id)
      VALUES (?, 'create_notification', 'push_notification', ?)
    `).run(admin.id, result.lastInsertRowid);

    res.json({ id: result.lastInsertRowid, message: 'Notification created' });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

app.get('/api/admin/notifications', adminAuth, (req, res) => {
  try {
    const notifications = db.prepare(`
      SELECT * FROM push_notifications
      ORDER BY created_at DESC
      LIMIT 100
    `).all();

    res.json({ notifications });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

// ===== ACTIVITY LOGS =====

app.get('/api/admin/activity-logs', adminAuth, (req, res) => {
  try {
    const logs = db.prepare(`
      SELECT aal.*, au.email as admin_email, au.name as admin_name
      FROM admin_activity_logs aal
      JOIN admin_users au ON aal.admin_id = au.id
      ORDER BY aal.created_at DESC
      LIMIT 100
    `).all();

    res.json({ logs });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

// ===== FEEDBACK =====

app.get('/api/admin/feedback', adminAuth, (req, res) => {
  try {
    const { status } = req.query;
    let query = `
      SELECT uf.*, u.email as user_email, u.name as user_name
      FROM user_feedback uf
      JOIN users u ON uf.user_id = u.id
    `;

    if (status) {
      query += ' WHERE uf.status = ?';
      const feedback = db.prepare(query + ' ORDER BY uf.created_at DESC').all(status);
      return res.json({ feedback });
    }

    const feedback = db.prepare(query + ' ORDER BY uf.created_at DESC').all();
    res.json({ feedback });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

// Start server
app.listen(PORT, () => {
  console.log(`🚀 Admin API server running on http://localhost:${PORT}`);
  console.log(`📊 Database: ${dbPath}`);
  console.log(`👤 Admin email: kamil.rybialek@gmail.com`);
});
