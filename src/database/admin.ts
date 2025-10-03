import { getDatabase } from './init';

// ===== ADMIN AUTHENTICATION =====

export const getAdminByEmail = async (email: string) => {
  const db = await getDatabase();
  return await db.getFirstAsync(
    'SELECT * FROM admin_users WHERE email = ? AND is_active = 1',
    [email]
  );
};

export const updateAdminLastLogin = async (adminId: number) => {
  const db = await getDatabase();
  await db.runAsync(
    'UPDATE admin_users SET last_login = ? WHERE id = ?',
    [new Date().toISOString(), adminId]
  );
};

// ===== ADMIN ACTIVITY LOGS =====

export const logAdminActivity = async (
  adminId: number,
  action: string,
  targetType?: string,
  targetId?: number,
  details?: string
) => {
  const db = await getDatabase();
  await db.runAsync(
    `INSERT INTO admin_activity_logs (admin_id, action, target_type, target_id, details)
     VALUES (?, ?, ?, ?, ?)`,
    [adminId, action, targetType || null, targetId || null, details || null]
  );
};

export const getAdminActivityLogs = async (limit = 50) => {
  const db = await getDatabase();
  return await db.getAllAsync(
    `SELECT aal.*, au.email as admin_email, au.name as admin_name
     FROM admin_activity_logs aal
     JOIN admin_users au ON aal.admin_id = au.id
     ORDER BY aal.created_at DESC
     LIMIT ?`,
    [limit]
  );
};

// ===== USER MANAGEMENT =====

export const getAllUsers = async () => {
  const db = await getDatabase();
  return await db.getAllAsync(`
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
  `);
};

export const getUserDetails = async (userId: number) => {
  const db = await getDatabase();

  const user = await db.getFirstAsync('SELECT * FROM users WHERE id = ?', [userId]);
  const stats = await db.getFirstAsync('SELECT * FROM user_stats WHERE user_id = ?', [userId]);
  const financeProgress = await db.getFirstAsync('SELECT * FROM finance_progress WHERE user_id = ?', [userId]);
  const mentalProgress = await db.getFirstAsync('SELECT * FROM mental_progress WHERE user_id = ?', [userId]);
  const physicalProgress = await db.getFirstAsync('SELECT * FROM physical_progress WHERE user_id = ?', [userId]);

  return {
    user,
    stats,
    financeProgress,
    mentalProgress,
    physicalProgress,
  };
};

export const getUserActivity = async (userId: number, limit = 100) => {
  const db = await getDatabase();
  return await db.getAllAsync(
    `SELECT * FROM user_activity
     WHERE user_id = ?
     ORDER BY created_at DESC
     LIMIT ?`,
    [userId, limit]
  );
};

// ===== TASK TEMPLATES =====

export const createTaskTemplate = async (
  adminId: number,
  data: {
    pillar: string;
    title: string;
    description: string;
    duration: number;
    xp: number;
    difficulty: string;
  }
) => {
  const db = await getDatabase();
  const result = await db.runAsync(
    `INSERT INTO task_templates
     (pillar, title, description, duration_minutes, xp_reward, difficulty, created_by)
     VALUES (?, ?, ?, ?, ?, ?, ?)`,
    [data.pillar, data.title, data.description, data.duration, data.xp, data.difficulty, adminId]
  );

  await logAdminActivity(adminId, 'create_task_template', 'task_template', result.lastInsertRowId);
  return result.lastInsertRowId;
};

export const getAllTaskTemplates = async () => {
  const db = await getDatabase();
  return await db.getAllAsync(`
    SELECT tt.*, au.email as created_by_email
    FROM task_templates tt
    LEFT JOIN admin_users au ON tt.created_by = au.id
    WHERE tt.is_active = 1
    ORDER BY tt.pillar, tt.title
  `);
};

export const updateTaskTemplate = async (
  adminId: number,
  templateId: number,
  data: Partial<{
    title: string;
    description: string;
    duration: number;
    xp: number;
    difficulty: string;
    isActive: boolean;
  }>
) => {
  const db = await getDatabase();
  const fields = [];
  const values = [];

  if (data.title) {
    fields.push('title = ?');
    values.push(data.title);
  }
  if (data.description) {
    fields.push('description = ?');
    values.push(data.description);
  }
  if (data.duration) {
    fields.push('duration_minutes = ?');
    values.push(data.duration);
  }
  if (data.xp) {
    fields.push('xp_reward = ?');
    values.push(data.xp);
  }
  if (data.difficulty) {
    fields.push('difficulty = ?');
    values.push(data.difficulty);
  }
  if (data.isActive !== undefined) {
    fields.push('is_active = ?');
    values.push(data.isActive ? 1 : 0);
  }

  values.push(templateId);

  await db.runAsync(
    `UPDATE task_templates SET ${fields.join(', ')} WHERE id = ?`,
    values
  );

  await logAdminActivity(adminId, 'update_task_template', 'task_template', templateId);
};

export const deleteTaskTemplate = async (adminId: number, templateId: number) => {
  const db = await getDatabase();
  await db.runAsync('UPDATE task_templates SET is_active = 0 WHERE id = ?', [templateId]);
  await logAdminActivity(adminId, 'delete_task_template', 'task_template', templateId);
};

// ===== CONTENT MANAGEMENT =====

export const createContentItem = async (
  adminId: number,
  data: {
    type: string;
    pillar: string;
    title: string;
    content: string;
    orderIndex: number;
  }
) => {
  const db = await getDatabase();
  const result = await db.runAsync(
    `INSERT INTO content_items
     (type, pillar, title, content, order_index, created_by)
     VALUES (?, ?, ?, ?, ?, ?)`,
    [data.type, data.pillar, data.title, data.content, data.orderIndex, adminId]
  );

  await logAdminActivity(adminId, 'create_content', 'content_item', result.lastInsertRowId);
  return result.lastInsertRowId;
};

export const getAllContentItems = async (pillar?: string, type?: string) => {
  const db = await getDatabase();
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

  return await db.getAllAsync(query, params);
};

export const publishContentItem = async (adminId: number, contentId: number) => {
  const db = await getDatabase();
  await db.runAsync(
    `UPDATE content_items SET is_published = 1, published_at = ? WHERE id = ?`,
    [new Date().toISOString(), contentId]
  );
  await logAdminActivity(adminId, 'publish_content', 'content_item', contentId);
};

export const unpublishContentItem = async (adminId: number, contentId: number) => {
  const db = await getDatabase();
  await db.runAsync(
    `UPDATE content_items SET is_published = 0 WHERE id = ?`,
    [contentId]
  );
  await logAdminActivity(adminId, 'unpublish_content', 'content_item', contentId);
};

// ===== PUSH NOTIFICATIONS =====

export const createPushNotification = async (
  adminId: number,
  data: {
    targetUserId?: number;
    targetSegment?: string;
    title: string;
    body: string;
    data?: string;
    scheduledAt?: string;
  }
) => {
  const db = await getDatabase();
  const result = await db.runAsync(
    `INSERT INTO push_notifications
     (target_user_id, target_segment, title, body, data, scheduled_at, created_by)
     VALUES (?, ?, ?, ?, ?, ?, ?)`,
    [
      data.targetUserId || null,
      data.targetSegment || null,
      data.title,
      data.body,
      data.data || null,
      data.scheduledAt || null,
      adminId,
    ]
  );

  await logAdminActivity(adminId, 'create_notification', 'push_notification', result.lastInsertRowId);
  return result.lastInsertRowId;
};

export const getPendingNotifications = async () => {
  const db = await getDatabase();
  return await db.getAllAsync(`
    SELECT * FROM push_notifications
    WHERE status = 'pending'
    AND (scheduled_at IS NULL OR scheduled_at <= datetime('now'))
    ORDER BY created_at ASC
  `);
};

export const markNotificationAsSent = async (notificationId: number) => {
  const db = await getDatabase();
  await db.runAsync(
    `UPDATE push_notifications SET status = 'sent', sent_at = ? WHERE id = ?`,
    [new Date().toISOString(), notificationId]
  );
};

// ===== ANALYTICS =====

export const getAnalyticsSummary = async () => {
  const db = await getDatabase();

  const totalUsers = await db.getFirstAsync<{ count: number }>('SELECT COUNT(*) as count FROM users');
  const activeUsers = await db.getFirstAsync<{ count: number }>(`
    SELECT COUNT(*) as count FROM users
    WHERE id IN (SELECT DISTINCT user_id FROM user_activity WHERE created_at >= datetime('now', '-7 days'))
  `);
  const totalTasks = await db.getFirstAsync<{ count: number }>('SELECT COUNT(*) as count FROM daily_tasks');
  const completedTasks = await db.getFirstAsync<{ count: number }>('SELECT COUNT(*) as count FROM daily_tasks WHERE completed = 1');

  return {
    totalUsers: totalUsers?.count || 0,
    activeUsers: activeUsers?.count || 0,
    totalTasks: totalTasks?.count || 0,
    completedTasks: completedTasks?.count || 0,
    completionRate: totalTasks?.count ? ((completedTasks?.count || 0) / totalTasks.count) * 100 : 0,
  };
};

export const trackMetric = async (metricName: string, metricValue: number, metadata?: string) => {
  const db = await getDatabase();
  await db.runAsync(
    `INSERT INTO app_analytics (metric_name, metric_value, metric_date, metadata)
     VALUES (?, ?, date('now'), ?)`,
    [metricName, metricValue, metadata || null]
  );
};

// ===== USER FEEDBACK =====

export const getAllFeedback = async (status?: string) => {
  const db = await getDatabase();
  let query = `
    SELECT uf.*, u.email as user_email, u.name as user_name
    FROM user_feedback uf
    JOIN users u ON uf.user_id = u.id
  `;

  if (status) {
    query += ' WHERE uf.status = ?';
    return await db.getAllAsync(query + ' ORDER BY uf.created_at DESC', [status]);
  }

  return await db.getAllAsync(query + ' ORDER BY uf.created_at DESC');
};

export const respondToFeedback = async (
  adminId: number,
  feedbackId: number,
  response: string
) => {
  const db = await getDatabase();
  await db.runAsync(
    `UPDATE user_feedback
     SET admin_response = ?, responded_by = ?, responded_at = ?, status = 'responded'
     WHERE id = ?`,
    [response, adminId, new Date().toISOString(), feedbackId]
  );
  await logAdminActivity(adminId, 'respond_feedback', 'user_feedback', feedbackId);
};
