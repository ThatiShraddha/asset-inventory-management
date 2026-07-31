/**
 * AssetFlow Enterprise — Backend API Server
 * Express + Prisma + JWT + RBAC
 *
 * Authentication: JWT Access Token (15m) + Refresh Token (7d) via HttpOnly cookies
 * Authorization:  Role-based middleware on every protected route
 * Database:       PostgreSQL via Prisma ORM
 */

const express = require('express');
const cors = require('cors');
const cookieParser = require('cookie-parser');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const { PrismaClient } = require('@prisma/client');

const app = express();
const prisma = new PrismaClient();
const port = process.env.PORT || 4000;

const JWT_SECRET = process.env.JWT_SECRET || process.env.JWT_ACCESS_SECRET || 'assetflow-dev-secret-2026';
const REFRESH_SECRET = process.env.REFRESH_SECRET || process.env.JWT_REFRESH_SECRET || 'assetflow-refresh-secret-2026';

// ─── Middleware ──────────────────────────────────────────────────
app.use(cors({
  origin: process.env.CORS_ORIGINS
    ? process.env.CORS_ORIGINS.split(',').map(o => o.trim())
    : ['http://localhost:3000', 'http://localhost:5173'],
  credentials: true
}));
app.use(express.json());
app.use(cookieParser());

// ─── Auth Helpers ────────────────────────────────────────────────
function setAuthCookies(res, accessToken, refreshToken) {
  const isProd = process.env.NODE_ENV === 'production';
  res.cookie('accessToken', accessToken, {
    httpOnly: true,
    secure: isProd,
    sameSite: 'lax',
    maxAge: 15 * 60 * 1000 // 15 minutes
  });
  res.cookie('refreshToken', refreshToken, {
    httpOnly: true,
    secure: isProd,
    sameSite: 'lax',
    maxAge: 7 * 24 * 60 * 60 * 1000 // 7 days
  });
}

function clearAuthCookies(res) {
  res.clearCookie('accessToken');
  res.clearCookie('refreshToken');
}

function getTokenFromRequest(req) {
  const authHeader = req.headers.authorization || '';
  if (authHeader.startsWith('Bearer ')) return authHeader.slice(7);
  return req.cookies?.accessToken || null;
}

// ─── Middleware: Authenticate ────────────────────────────────────
function authenticate(req, res, next) {
  const token = getTokenFromRequest(req);
  if (!token) return res.status(401).json({ message: 'Unauthorized: No token provided' });

  try {
    req.user = jwt.verify(token, JWT_SECRET);
    next();
  } catch {
    return res.status(401).json({ message: 'Unauthorized: Invalid or expired token' });
  }
}

// ─── Middleware: Authorize by Role ───────────────────────────────
function authorize(...roles) {
  return (req, res, next) => {
    if (!req.user) return res.status(401).json({ message: 'Unauthorized' });
    if (!roles.flat().includes(req.user.role)) {
      return res.status(403).json({ message: `Forbidden: Requires one of [${roles.flat().join(', ')}]` });
    }
    next();
  };
}

// ─── Audit Helper ────────────────────────────────────────────────
async function createAuditLog(actionType, details, actor, extra = {}) {
  return prisma.auditLog.create({
    data: {
      actorId: actor?.sub || null,
      actorName: actor?.name || 'System',
      actorEmail: actor?.email || 'system@enterprise.com',
      actionType,
      details,
      skuAffected: extra.skuAffected || null,
      quantityChanged: extra.quantityChanged ?? null
    }
  });
}

// ─────────────────────────────────────────────────────────────────
// ROUTES
// ─────────────────────────────────────────────────────────────────

// Health Check
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', service: 'AssetFlow Backend', timestamp: new Date().toISOString() });
});

// ─── Auth Routes ─────────────────────────────────────────────────

// POST /api/auth/login
app.post('/api/auth/login', async (req, res) => {
  try {
    const { email, password } = req.body || {};
    if (!email || !password) {
      return res.status(400).json({ message: 'Email and password are required' });
    }

    const user = await prisma.user.findUnique({
      where: { email: email.toLowerCase().trim() }
    });

    if (!user || !user.isActive) {
      return res.status(401).json({ message: 'Invalid credentials' });
    }

    const passwordValid = await bcrypt.compare(password, user.passwordHash);
    if (!passwordValid) {
      return res.status(401).json({ message: 'Invalid credentials' });
    }

    const payload = {
      sub: user.id,
      role: user.role,
      email: user.email,
      name: user.name,
      departmentId: user.departmentId
    };
    const accessToken = jwt.sign(payload, JWT_SECRET, { expiresIn: '15m' });
    const refreshToken = jwt.sign({ sub: user.id, type: 'refresh' }, REFRESH_SECRET, { expiresIn: '7d' });

    setAuthCookies(res, accessToken, refreshToken);
    await createAuditLog('LOGIN', `User ${user.name} signed in.`, payload);

    const { passwordHash: _, ...safeUser } = user;
    res.json({ user: safeUser, accessToken, refreshToken });
  } catch (err) {
    console.error('Login error:', err);
    res.status(500).json({ message: 'Internal server error' });
  }
});

// POST /api/auth/refresh
app.post('/api/auth/refresh', async (req, res) => {
  try {
    const refreshToken = req.cookies?.refreshToken || req.body?.refreshToken;
    if (!refreshToken) return res.status(401).json({ message: 'Missing refresh token' });

    const decoded = jwt.verify(refreshToken, REFRESH_SECRET);
    const user = await prisma.user.findUnique({ where: { id: decoded.sub } });
    if (!user || !user.isActive) return res.status(401).json({ message: 'Unknown or inactive user' });

    const payload = { sub: user.id, role: user.role, email: user.email, name: user.name, departmentId: user.departmentId };
    const newAccessToken = jwt.sign(payload, JWT_SECRET, { expiresIn: '15m' });
    setAuthCookies(res, newAccessToken, refreshToken);

    const { passwordHash: _, ...safeUser } = user;
    res.json({ user: safeUser, accessToken: newAccessToken });
  } catch {
    return res.status(401).json({ message: 'Invalid or expired refresh token' });
  }
});

// POST /api/auth/logout
app.post('/api/auth/logout', authenticate, async (req, res) => {
  await createAuditLog('LOGOUT', `User ${req.user.name} signed out.`, req.user);
  clearAuthCookies(res);
  res.json({ success: true });
});

// GET /api/auth/me
app.get('/api/auth/me', authenticate, async (req, res) => {
  const user = await prisma.user.findUnique({ where: { id: req.user.sub } });
  if (!user) return res.status(404).json({ message: 'User not found' });
  const { passwordHash: _, ...safeUser } = user;
  res.json({ user: safeUser });
});

// ─── Dashboard (aggregate) ───────────────────────────────────────

// GET /api/dashboard
app.get('/api/dashboard', authenticate, async (req, res) => {
  try {
    const [departments, categories, vendors, inventory, requisitions, auditLogs, notifications] =
      await Promise.all([
        prisma.department.findMany({ orderBy: { name: 'asc' } }),
        prisma.category.findMany({ orderBy: { name: 'asc' } }),
        prisma.vendor.findMany({ orderBy: { name: 'asc' } }),
        prisma.inventoryItem.findMany({ orderBy: { sku: 'asc' } }),
        prisma.requisition.findMany({ orderBy: { requestedAt: 'desc' } }),
        prisma.auditLog.findMany({ orderBy: { timestamp: 'desc' }, take: 100 }),
        prisma.notification.findMany({
          where: { userId: req.user.sub },
          orderBy: { createdAt: 'desc' }
        })
      ]);

    res.json({ departments, categories, vendors, inventory, requisitions, auditLogs, notifications });
  } catch (err) {
    console.error('Dashboard error:', err);
    res.status(500).json({ message: 'Failed to load dashboard data' });
  }
});

// ─── Inventory Routes ────────────────────────────────────────────

// GET /api/inventory
app.get('/api/inventory', authenticate, async (req, res) => {
  try {
    const items = await prisma.inventoryItem.findMany({ orderBy: { sku: 'asc' } });
    res.json(items);
  } catch (err) {
    res.status(500).json({ message: 'Failed to fetch inventory' });
  }
});

// POST /api/inventory — Create new item
app.post('/api/inventory',
  authenticate,
  authorize(['ADMIN', 'STORE_MANAGER']),
  async (req, res) => {
    try {
      const { sku, name, categoryId, vendorId, quantityInStock, reorderPoint, unitCost, locationCode } = req.body;
      if (!sku || !name) return res.status(400).json({ message: 'SKU and name are required' });

      const existing = await prisma.inventoryItem.findUnique({ where: { sku: sku.toUpperCase() } });
      if (existing) return res.status(409).json({ message: `SKU "${sku.toUpperCase()}" already exists` });

      const item = await prisma.inventoryItem.create({
        data: {
          sku: sku.toUpperCase(),
          name,
          categoryId,
          vendorId,
          quantityInStock: Number(quantityInStock) || 0,
          reorderPoint: Number(reorderPoint) || 5,
          unitCost: Number(unitCost) || 0,
          locationCode: locationCode || 'WH-UNASSIGNED',
          lastStockInDate: new Date().toISOString().split('T')[0]
        }
      });

      await createAuditLog('ITEM_CREATE', `Registered new inventory product SKU: ${item.sku} — ${item.name}.`, req.user);
      res.status(201).json(item);
    } catch (err) {
      console.error('Create item error:', err);
      res.status(500).json({ message: 'Failed to create inventory item' });
    }
  }
);

// POST /api/inventory/:id/stock — Stock-In delivery
app.post('/api/inventory/:id/stock',
  authenticate,
  authorize(['ADMIN', 'STORE_MANAGER']),
  async (req, res) => {
    try {
      const item = await prisma.inventoryItem.findUnique({ where: { id: req.params.id } });
      if (!item) return res.status(404).json({ message: 'Item not found' });

      const quantity = Number(req.body?.quantity || 0);
      if (quantity <= 0) return res.status(400).json({ message: 'Quantity must be positive' });

      const updated = await prisma.inventoryItem.update({
        where: { id: item.id },
        data: {
          quantityInStock: { increment: quantity },
          lastStockInDate: new Date().toISOString().split('T')[0],
          ...(req.body?.costOverride ? { unitCost: Number(req.body.costOverride) } : {})
        }
      });

      await createAuditLog(
        'STOCK_IN',
        `Added ${quantity} unit(s) to ${item.name} (SKU: ${item.sku}). New stock: ${updated.quantityInStock}.`,
        req.user,
        { skuAffected: item.sku, quantityChanged: quantity }
      );
      res.json(updated);
    } catch (err) {
      console.error('Stock-in error:', err);
      res.status(500).json({ message: 'Failed to process stock-in' });
    }
  }
);

// POST /api/inventory/:id/stock-point — Update reorder point and location
app.post('/api/inventory/:id/stock-point',
  authenticate,
  authorize(['ADMIN', 'STORE_MANAGER']),
  async (req, res) => {
    try {
      const item = await prisma.inventoryItem.findUnique({ where: { id: req.params.id } });
      if (!item) return res.status(404).json({ message: 'Item not found' });

      const updated = await prisma.inventoryItem.update({
        where: { id: item.id },
        data: {
          reorderPoint: req.body?.reorderPoint !== undefined ? Number(req.body.reorderPoint) : item.reorderPoint,
          locationCode: req.body?.locationCode || item.locationCode
        }
      });

      await createAuditLog(
        'STOCK_ADJUSTMENT',
        `Adjusted SKU ${item.sku}: reorder point ${item.reorderPoint}→${updated.reorderPoint}, location ${item.locationCode}→${updated.locationCode}.`,
        req.user
      );
      res.json(updated);
    } catch (err) {
      res.status(500).json({ message: 'Failed to update stock settings' });
    }
  }
);

// ─── Requisition Routes ──────────────────────────────────────────

// GET /api/requisitions
app.get('/api/requisitions', authenticate, async (req, res) => {
  try {
    // Employees only see their own requisitions
    const where = req.user.role === 'EMPLOYEE'
      ? { requesterId: req.user.sub }
      : {};
    const requisitions = await prisma.requisition.findMany({
      where,
      orderBy: { requestedAt: 'desc' }
    });
    res.json(requisitions);
  } catch (err) {
    res.status(500).json({ message: 'Failed to fetch requisitions' });
  }
});

// POST /api/requisitions — Submit a new requisition
app.post('/api/requisitions', authenticate, async (req, res) => {
  try {
    const { itemId, quantityRequested, justification, priority } = req.body || {};
    if (!itemId || !quantityRequested) {
      return res.status(400).json({ message: 'itemId and quantityRequested are required' });
    }

    const item = await prisma.inventoryItem.findUnique({ where: { id: itemId } });
    if (!item) return res.status(404).json({ message: 'Inventory item not found' });

    const user = await prisma.user.findUnique({ where: { id: req.user.sub } });
    if (!user) return res.status(404).json({ message: 'User not found' });

    const req_ = await prisma.requisition.create({
      data: {
        requesterId: user.id,
        requesterName: user.name,
        requesterEmail: user.email,
        requesterRole: user.role,
        departmentId: user.departmentId,
        itemId,
        quantityRequested: Number(quantityRequested),
        justification: justification || '',
        priority: priority || 'MEDIUM',
        status: 'PENDING'
      }
    });

    await createAuditLog(
      'REQUISITION_SUBMIT',
      `${user.name} submitted request for ${quantityRequested}x ${item.name} (SKU: ${item.sku}).`,
      req.user
    );

    // Create notification for admins
    const admins = await prisma.user.findMany({ where: { role: 'ADMIN' } });
    await prisma.notification.createMany({
      data: admins.map(admin => ({
        userId: admin.id,
        title: 'New Requisition Request',
        message: `${user.name} requested ${quantityRequested}x ${item.name}. Awaiting approval.`,
        type: 'INFO'
      }))
    });

    res.status(201).json(req_);
  } catch (err) {
    console.error('Submit requisition error:', err);
    res.status(500).json({ message: 'Failed to submit requisition' });
  }
});

// POST /api/requisitions/:id/approve
app.post('/api/requisitions/:id/approve',
  authenticate,
  authorize(['ADMIN']),
  async (req, res) => {
    try {
      const requ = await prisma.requisition.findUnique({ where: { id: req.params.id } });
      if (!requ) return res.status(404).json({ message: 'Requisition not found' });
      if (requ.status !== 'PENDING') return res.status(409).json({ message: 'Requisition is not pending' });

      const item = await prisma.inventoryItem.findUnique({ where: { id: requ.itemId } });
      if (!item) return res.status(404).json({ message: 'Inventory item not found' });

      if (item.quantityInStock < requ.quantityRequested) {
        return res.status(409).json({
          message: `Insufficient stock! Only ${item.quantityInStock} units available, requested ${requ.quantityRequested}.`
        });
      }

      const dept = await prisma.department.findUnique({ where: { id: requ.departmentId } });
      if (dept) {
        const cost = item.unitCost * requ.quantityRequested;
        const projectedSpend = dept.budgetConsumed + cost;
        if (projectedSpend > dept.budgetLimit) {
          return res.status(409).json({
            message: `Budget exceeded! ${dept.name} has $${(dept.budgetLimit - dept.budgetConsumed).toFixed(2)} remaining. This costs $${cost.toFixed(2)}.`
          });
        }
        // Deduct budget
        await prisma.department.update({
          where: { id: dept.id },
          data: { budgetConsumed: { increment: cost } }
        });
      }

      // Decrement stock
      await prisma.inventoryItem.update({
        where: { id: item.id },
        data: { quantityInStock: { decrement: requ.quantityRequested } }
      });

      // Update requisition
      const updated = await prisma.requisition.update({
        where: { id: requ.id },
        data: {
          status: 'APPROVED',
          approvedOrDeniedAt: new Date(),
          approverName: req.user.name
        }
      });

      await createAuditLog(
        'REQUISITION_APPROVE',
        `Approved requisition ${requ.id}. Disbursed ${requ.quantityRequested}x ${item.name} to ${requ.requesterName}.`,
        req.user,
        { skuAffected: item.sku, quantityChanged: -requ.quantityRequested }
      );

      // Notify requester
      await prisma.notification.create({
        data: {
          userId: requ.requesterId,
          title: 'Requisition Approved ✅',
          message: `Your request for ${requ.quantityRequested}x ${item.name} has been approved by ${req.user.name}.`,
          type: 'SUCCESS'
        }
      });

      res.json(updated);
    } catch (err) {
      console.error('Approve error:', err);
      res.status(500).json({ message: 'Failed to approve requisition' });
    }
  }
);

// POST /api/requisitions/:id/deny
app.post('/api/requisitions/:id/deny',
  authenticate,
  authorize(['ADMIN']),
  async (req, res) => {
    try {
      const requ = await prisma.requisition.findUnique({ where: { id: req.params.id } });
      if (!requ) return res.status(404).json({ message: 'Requisition not found' });
      if (requ.status !== 'PENDING') return res.status(409).json({ message: 'Requisition is not pending' });

      const item = await prisma.inventoryItem.findUnique({ where: { id: requ.itemId } });

      const updated = await prisma.requisition.update({
        where: { id: requ.id },
        data: {
          status: 'DENIED',
          approvedOrDeniedAt: new Date(),
          approverName: req.user.name,
          denialReason: req.body?.denialReason || 'Denied by approver'
        }
      });

      await createAuditLog(
        'REQUISITION_DENY',
        `Denied requisition ${requ.id} from ${requ.requesterName}. Reason: "${updated.denialReason}"`,
        req.user
      );

      // Notify requester
      await prisma.notification.create({
        data: {
          userId: requ.requesterId,
          title: 'Requisition Denied ❌',
          message: `Your request for ${requ.quantityRequested}x ${item?.name || 'item'} was denied. Reason: ${updated.denialReason}`,
          type: 'ERROR'
        }
      });

      res.json(updated);
    } catch (err) {
      res.status(500).json({ message: 'Failed to deny requisition' });
    }
  }
);

// POST /api/requisitions/:id/return
app.post('/api/requisitions/:id/return',
  authenticate,
  authorize(['ADMIN', 'STORE_MANAGER', 'EMPLOYEE']),
  async (req, res) => {
    try {
      const requ = await prisma.requisition.findUnique({ where: { id: req.params.id } });
      if (!requ) return res.status(404).json({ message: 'Requisition not found' });
      if (requ.status !== 'APPROVED') {
        return res.status(409).json({ message: 'Only approved disbursements can be returned' });
      }

      const item = await prisma.inventoryItem.findUnique({ where: { id: requ.itemId } });
      if (!item) return res.status(404).json({ message: 'Inventory item not found' });

      // Restore stock
      await prisma.inventoryItem.update({
        where: { id: item.id },
        data: { quantityInStock: { increment: requ.quantityRequested } }
      });

      const updated = await prisma.requisition.update({
        where: { id: requ.id },
        data: { status: 'RETURNED' }
      });

      await createAuditLog(
        'ITEM_RETURN',
        `Returned ${requ.quantityRequested}x ${item.name} (SKU: ${item.sku}). Stock restored to location ${item.locationCode}.`,
        req.user,
        { skuAffected: item.sku, quantityChanged: requ.quantityRequested }
      );

      res.json(updated);
    } catch (err) {
      res.status(500).json({ message: 'Failed to process return' });
    }
  }
);

// ─── Audit Log Routes ────────────────────────────────────────────

// GET /api/audit-logs
app.get('/api/audit-logs', authenticate, async (req, res) => {
  try {
    const logs = await prisma.auditLog.findMany({
      orderBy: { timestamp: 'desc' },
      take: 200
    });
    res.json(logs);
  } catch (err) {
    res.status(500).json({ message: 'Failed to fetch audit logs' });
  }
});

// ─── Notification Routes ─────────────────────────────────────────

// GET /api/notifications
app.get('/api/notifications', authenticate, async (req, res) => {
  try {
    const notifications = await prisma.notification.findMany({
      where: { userId: req.user.sub },
      orderBy: { createdAt: 'desc' },
      take: 50
    });
    res.json(notifications);
  } catch (err) {
    res.status(500).json({ message: 'Failed to fetch notifications' });
  }
});

// PATCH /api/notifications/:id/read
app.patch('/api/notifications/:id/read', authenticate, async (req, res) => {
  try {
    const updated = await prisma.notification.updateMany({
      where: { id: req.params.id, userId: req.user.sub },
      data: { isRead: true }
    });
    res.json({ success: true, count: updated.count });
  } catch (err) {
    res.status(500).json({ message: 'Failed to mark notification as read' });
  }
});

// PATCH /api/notifications/read-all
app.patch('/api/notifications/read-all', authenticate, async (req, res) => {
  try {
    await prisma.notification.updateMany({
      where: { userId: req.user.sub, isRead: false },
      data: { isRead: true }
    });
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ message: 'Failed to mark all notifications read' });
  }
});

// ─── Departments & Budgets ───────────────────────────────────────

// GET /api/departments
app.get('/api/departments', authenticate, async (req, res) => {
  try {
    const departments = await prisma.department.findMany({ orderBy: { name: 'asc' } });
    res.json(departments);
  } catch (err) {
    res.status(500).json({ message: 'Failed to fetch departments' });
  }
});

// PATCH /api/departments/:id/budget — Adjust budget limit
app.patch('/api/departments/:id/budget',
  authenticate,
  authorize(['ADMIN']),
  async (req, res) => {
    try {
      const dept = await prisma.department.findUnique({ where: { id: req.params.id } });
      if (!dept) return res.status(404).json({ message: 'Department not found' });

      const newLimit = Number(req.body?.budgetLimit);
      if (!newLimit || newLimit <= 0) return res.status(400).json({ message: 'Invalid budget limit' });

      const updated = await prisma.department.update({
        where: { id: dept.id },
        data: { budgetLimit: newLimit }
      });

      await createAuditLog(
        'BUDGET_ADJUSTMENT',
        `Adjusted ${dept.name} budget from $${dept.budgetLimit} to $${newLimit}.`,
        req.user
      );
      res.json(updated);
    } catch (err) {
      res.status(500).json({ message: 'Failed to update budget' });
    }
  }
);

// ─── Admin: Reset Database ───────────────────────────────────────

// POST /api/reset — Wipe and reseed (Admin only)
app.post('/api/reset',
  authenticate,
  authorize(['ADMIN']),
  async (req, res) => {
    try {
      // Wipe in dependency order
      await prisma.notification.deleteMany();
      await prisma.auditLog.deleteMany();
      await prisma.requisition.deleteMany();
      await prisma.inventoryItem.deleteMany();
      await prisma.category.deleteMany();
      await prisma.vendor.deleteMany();
      await prisma.user.deleteMany();
      await prisma.department.deleteMany();

      await createAuditLog('SYSTEM_RESET', 'Database wiped. Re-seed with: node prisma/seed.js', req.user);
      res.json({ success: true, message: 'Database cleared. Run seed script to restore demo data.' });
    } catch (err) {
      console.error('Reset error:', err);
      res.status(500).json({ message: 'Failed to reset database' });
    }
  }
);

// ─── Categories & Vendors ────────────────────────────────────────

// GET /api/categories
app.get('/api/categories', authenticate, async (req, res) => {
  const cats = await prisma.category.findMany({ orderBy: { name: 'asc' } });
  res.json(cats);
});

// POST /api/categories
app.post('/api/categories',
  authenticate,
  authorize(['ADMIN']),
  async (req, res) => {
    try {
      const { name, description } = req.body || {};
      if (!name) return res.status(400).json({ message: 'Category name is required' });
      const existing = await prisma.category.findUnique({ where: { name } });
      if (existing) return res.status(409).json({ message: `Category "${name}" already exists` });
      const cat = await prisma.category.create({ data: { name, description: description || '' } });
      await createAuditLog('CATEGORY_CREATE', `Created new category: "${name}".`, req.user);
      res.status(201).json(cat);
    } catch (err) {
      res.status(500).json({ message: 'Failed to create category' });
    }
  }
);

// GET /api/vendors
app.get('/api/vendors', authenticate, async (req, res) => {
  const vendors = await prisma.vendor.findMany({ orderBy: { name: 'asc' } });
  res.json(vendors);
});

// ─── Users (Admin) ───────────────────────────────────────────────

// GET /api/users — Admin only
app.get('/api/users',
  authenticate,
  authorize(['ADMIN', 'AUDITOR']),
  async (req, res) => {
    try {
      const users = await prisma.user.findMany({
        select: { id: true, name: true, email: true, role: true, departmentId: true, avatar: true, isActive: true, createdAt: true }
      });
      res.json(users);
    } catch (err) {
      res.status(500).json({ message: 'Failed to fetch users' });
    }
  }
);

// ─── Purchase Orders ─────────────────────────────────────────────
app.get('/api/purchase-orders', authenticate, async (req, res) => {
  try {
    const pos = await prisma.purchaseOrder.findMany({
      include: { vendor: true, createdBy: true, items: { include: { category: true } } },
      orderBy: { createdAt: 'desc' }
    });
    res.json(pos);
  } catch (err) {
    res.status(500).json({ message: 'Failed to fetch purchase orders' });
  }
});

app.post('/api/purchase-orders', authenticate, authorize(['ADMIN']), async (req, res) => {
  try {
    const { vendorId, expectedDelivery, currency, taxRate, discountRate, shippingCost, remarks, items, status } = req.body || {};
    if (!vendorId || !items || !Array.isArray(items) || items.length === 0) {
      return res.status(400).json({ message: 'Vendor and items are required' });
    }
    const poNumber = 'PO-' + Math.floor(100000 + Math.random() * 900000);
    const po = await prisma.purchaseOrder.create({
      data: {
        poNumber,
        vendorId,
        expectedDelivery: expectedDelivery ? new Date(expectedDelivery) : null,
        currency: currency || 'USD',
        taxRate: Number(taxRate || 0),
        discountRate: Number(discountRate || 0),
        shippingCost: Number(shippingCost || 0),
        remarks,
        status: status || 'DRAFT',
        createdById: req.user.sub,
        items: {
          create: items.map(item => ({
            name: item.name,
            sku: item.sku || null,
            categoryId: item.categoryId,
            quantity: Number(item.quantity),
            unitCost: Number(item.unitCost)
          }))
        }
      },
      include: { items: true }
    });

    await createAuditLog('PO_CREATE', `Created Purchase Order ${poNumber} with status ${po.status}.`, req.user);
    res.status(201).json(po);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Failed to create purchase order' });
  }
});

app.patch('/api/purchase-orders/:id', authenticate, authorize(['ADMIN']), async (req, res) => {
  try {
    const { status, remarks, expectedDelivery } = req.body || {};
    const existing = await prisma.purchaseOrder.findUnique({ where: { id: req.params.id } });
    if (!existing) return res.status(404).json({ message: 'Purchase order not found' });

    const updateData = {};
    if (status) updateData.status = status;
    if (remarks !== undefined) updateData.remarks = remarks;
    if (expectedDelivery) updateData.expectedDelivery = new Date(expectedDelivery);

    if (status && status !== existing.status) {
      const history = existing.approvalHistory ? JSON.parse(existing.approvalHistory) : [];
      history.push({
        status,
        performedBy: req.user.name,
        timestamp: new Date().toISOString(),
        remarks: remarks || ''
      });
      updateData.approvalHistory = JSON.stringify(history);
    }

    const updated = await prisma.purchaseOrder.update({
      where: { id: req.params.id },
      data: updateData,
      include: { items: true }
    });

    await createAuditLog('PO_UPDATE', `Updated Purchase Order ${existing.poNumber} status to ${updated.status}.`, req.user);
    res.json(updated);
  } catch (err) {
    res.status(500).json({ message: 'Failed to update purchase order' });
  }
});

// ─── Goods Receipt Notes (GRN) ───────────────────────────────────
app.get('/api/goods-receipts', authenticate, async (req, res) => {
  try {
    const grns = await prisma.goodsReceiptNote.findMany({
      include: { purchaseOrder: true, vendor: true, receivedBy: true, items: true },
      orderBy: { createdAt: 'desc' }
    });
    res.json(grns);
  } catch (err) {
    res.status(500).json({ message: 'Failed to fetch GRNs' });
  }
});

app.post('/api/goods-receipts', authenticate, authorize(['ADMIN', 'STORE_MANAGER']), async (req, res) => {
  try {
    const { poId, warehouse, remarks, items } = req.body || {};
    if (!poId || !warehouse || !items || !Array.isArray(items) || items.length === 0) {
      return res.status(400).json({ message: 'poId, warehouse and items are required' });
    }

    const po = await prisma.purchaseOrder.findUnique({
      where: { id: poId },
      include: { items: true }
    });
    if (!po) return res.status(404).json({ message: 'Purchase Order not found' });

    const grnNumber = 'GRN-' + Math.floor(100000 + Math.random() * 900000);
    const grn = await prisma.goodsReceiptNote.create({
      data: {
        grnNumber,
        poId,
        vendorId: po.vendorId,
        warehouse,
        receivedById: req.user.sub,
        remarks,
        items: {
          create: items.map(item => ({
            sku: item.sku,
            acceptedQty: Number(item.acceptedQty || 0),
            rejectedQty: Number(item.rejectedQty || 0),
            unitCost: Number(item.unitCost)
          }))
        }
      },
      include: { items: true }
    });

    for (const grnItem of items) {
      const accepted = Number(grnItem.acceptedQty || 0);
      if (accepted <= 0) continue;

      let invItem = await prisma.inventoryItem.findUnique({ where: { sku: grnItem.sku } });
      let prevQty = 0;
      let newQty = accepted;

      if (invItem) {
        prevQty = invItem.quantityInStock;
        newQty = prevQty + accepted;
        await prisma.inventoryItem.update({
          where: { id: invItem.id },
          data: {
            quantityInStock: newQty,
            lastStockInDate: new Date().toISOString().split('T')[0]
          }
        });
      } else {
        const poItem = po.items.find(pi => pi.sku === grnItem.sku) || po.items[0];
        invItem = await prisma.inventoryItem.create({
          data: {
            sku: grnItem.sku.toUpperCase(),
            name: poItem ? poItem.name : 'Procured Item ' + grnItem.sku,
            categoryId: poItem ? poItem.categoryId : po.items[0].categoryId,
            vendorId: po.vendorId,
            quantityInStock: accepted,
            unitCost: grnItem.unitCost,
            lastStockInDate: new Date().toISOString().split('T')[0],
            locationCode: warehouse
          }
        });
      }

      await prisma.transactionLedger.create({
        data: {
          transactionId: 'TX-' + Math.floor(100000 + Math.random() * 900000),
          assetId: invItem.id,
          type: 'PURCHASE',
          previousQty: prevQty,
          newQty: newQty,
          performedById: req.user.sub,
          reason: `Procured via Purchase Order ${po.poNumber} and GRN ${grnNumber}`,
          referenceNumber: grnNumber
        }
      });
    }

    let allReceived = true;
    for (const poItem of po.items) {
      const matchingReceiptItems = await prisma.goodsReceiptNoteItem.findMany({
        where: {
          sku: poItem.sku,
          goodsReceipt: { poId: po.id }
        }
      });
      const totalRec = matchingReceiptItems.reduce((sum, ri) => sum + ri.acceptedQty, 0);
      await prisma.purchaseOrderItem.update({
        where: { id: poItem.id },
        data: { receivedQty: totalRec }
      });
      if (totalRec < poItem.quantity) {
        allReceived = false;
      }
    }

    const nextStatus = allReceived ? 'COMPLETED' : 'PARTIALLY_RECEIVED';
    await prisma.purchaseOrder.update({
      where: { id: po.id },
      data: { status: nextStatus }
    });

    await createAuditLog('GRN_CREATE', `Generated GRN ${grnNumber} for PO ${po.poNumber}. Stock automatically updated.`, req.user);
    res.status(201).json(grn);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Failed to create Goods Receipt Note' });
  }
});

// ─── Asset Transfers ─────────────────────────────────────────────
app.get('/api/transfers', authenticate, async (req, res) => {
  try {
    const transfers = await prisma.assetTransfer.findMany({
      include: { asset: true, sender: true, receiver: true },
      orderBy: { requestedAt: 'desc' }
    });
    res.json(transfers);
  } catch (err) {
    res.status(500).json({ message: 'Failed to fetch asset transfers' });
  }
});

app.post('/api/transfers', authenticate, async (req, res) => {
  try {
    const { assetId, receiverId, remarks } = req.body || {};
    if (!assetId || !receiverId) return res.status(400).json({ message: 'assetId and receiverId are required' });

    const transferNumber = 'TRF-' + Math.floor(100000 + Math.random() * 900000);
    const transfer = await prisma.assetTransfer.create({
      data: {
        transferNumber,
        assetId,
        senderId: req.user.sub,
        receiverId,
        remarks,
        status: 'PENDING'
      }
    });

    await createAuditLog('TRANSFER_REQUEST', `Submitted transfer request ${transferNumber} for asset ID ${assetId}.`, req.user);
    res.status(201).json(transfer);
  } catch (err) {
    res.status(500).json({ message: 'Failed to submit asset transfer request' });
  }
});

app.patch('/api/transfers/:id', authenticate, authorize(['ADMIN', 'STORE_MANAGER']), async (req, res) => {
  try {
    const { status, remarks } = req.body || {};
    const transfer = await prisma.assetTransfer.findUnique({
      where: { id: req.params.id },
      include: { asset: true }
    });
    if (!transfer) return res.status(404).json({ message: 'Transfer not found' });

    const updated = await prisma.assetTransfer.update({
      where: { id: req.params.id },
      data: {
        status,
        remarks: remarks || transfer.remarks,
        managerId: req.user.role === 'ADMIN' ? req.user.sub : transfer.managerId,
        storeManagerId: req.user.role === 'STORE_MANAGER' ? req.user.sub : transfer.storeManagerId
      }
    });

    if (status === 'CONFIRMED' || status === 'APPROVED') {
      await prisma.transactionLedger.create({
        data: {
          transactionId: 'TX-' + Math.floor(100000 + Math.random() * 900000),
          assetId: transfer.assetId,
          type: 'TRANSFER',
          previousQty: transfer.asset.quantityInStock,
          newQty: transfer.asset.quantityInStock,
          performedById: req.user.sub,
          reason: `Asset transferred from sender (ID ${transfer.senderId}) to receiver (ID ${transfer.receiverId})`,
          referenceNumber: transfer.transferNumber
        }
      });
    }

    await createAuditLog('TRANSFER_UPDATE', `Updated transfer ${transfer.transferNumber} status to ${status}.`, req.user);
    res.json(updated);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Failed to update asset transfer' });
  }
});

// ─── Asset Returns ───────────────────────────────────────────────
app.get('/api/returns', authenticate, async (req, res) => {
  try {
    const returns = await prisma.assetReturn.findMany({
      include: { asset: true, returnedBy: true },
      orderBy: { returnedAt: 'desc' }
    });
    res.json(returns);
  } catch (err) {
    res.status(500).json({ message: 'Failed to fetch asset returns' });
  }
});

app.post('/api/returns', authenticate, async (req, res) => {
  try {
    const { assetId, remarks } = req.body || {};
    if (!assetId) return res.status(400).json({ message: 'assetId is required' });

    const returnNumber = 'RTN-' + Math.floor(100000 + Math.random() * 900000);
    const rtn = await prisma.assetReturn.create({
      data: {
        returnNumber,
        assetId,
        returnedById: req.user.sub,
        remarks,
        status: 'PENDING'
      }
    });

    await createAuditLog('RETURN_REQUEST', `Submitted asset return request ${returnNumber}.`, req.user);
    res.status(201).json(rtn);
  } catch (err) {
    res.status(500).json({ message: 'Failed to submit asset return request' });
  }
});

app.patch('/api/returns/:id', authenticate, authorize(['ADMIN', 'STORE_MANAGER']), async (req, res) => {
  try {
    const { status, condition, remarks } = req.body || {};
    const rtn = await prisma.assetReturn.findUnique({
      where: { id: req.params.id },
      include: { asset: true }
    });
    if (!rtn) return res.status(404).json({ message: 'Return request not found' });

    const updated = await prisma.assetReturn.update({
      where: { id: req.params.id },
      data: {
        status,
        condition: condition || rtn.condition,
        remarks: remarks || rtn.remarks,
        inspectedById: req.user.sub
      }
    });

    if (status === 'COMPLETED') {
      const prevQty = rtn.asset.quantityInStock;
      const newQty = prevQty + 1;

      await prisma.inventoryItem.update({
        where: { id: rtn.assetId },
        data: { quantityInStock: newQty }
      });

      await prisma.transactionLedger.create({
        data: {
          transactionId: 'TX-' + Math.floor(100000 + Math.random() * 900000),
          assetId: rtn.assetId,
          type: 'RETURN',
          previousQty: prevQty,
          newQty: newQty,
          performedById: req.user.sub,
          reason: `Asset return completed. Condition: ${condition || 'GOOD'}`,
          referenceNumber: rtn.returnNumber
        }
      });
    }

    await createAuditLog('RETURN_UPDATE', `Updated asset return ${rtn.returnNumber} to status ${status}.`, req.user);
    res.json(updated);
  } catch (err) {
    res.status(500).json({ message: 'Failed to complete asset return' });
  }
});

// ─── Stock Adjustments ───────────────────────────────────────────
app.get('/api/adjustments', authenticate, authorize(['ADMIN', 'AUDITOR']), async (req, res) => {
  try {
    const adjustments = await prisma.stockAdjustment.findMany({
      include: { asset: true, adjustedBy: true },
      orderBy: { createdAt: 'desc' }
    });
    res.json(adjustments);
  } catch (err) {
    res.status(500).json({ message: 'Failed to fetch adjustments' });
  }
});

app.post('/api/adjustments', authenticate, authorize(['ADMIN', 'STORE_MANAGER']), async (req, res) => {
  try {
    const { assetId, previousQty, newQty, reason, remarks } = req.body || {};
    if (!assetId || previousQty === undefined || newQty === undefined || !reason) {
      return res.status(400).json({ message: 'assetId, previousQty, newQty and reason are required' });
    }

    const adjustmentNumber = 'ADJ-' + Math.floor(100000 + Math.random() * 900000);
    const adjustment = await prisma.stockAdjustment.create({
      data: {
        adjustmentNumber,
        assetId,
        previousQty: Number(previousQty),
        newQty: Number(newQty),
        reason,
        remarks,
        adjustedById: req.user.sub,
        status: 'PENDING'
      }
    });

    await createAuditLog('ADJUSTMENT_REQUEST', `Submitted stock adjustment request ${adjustmentNumber}.`, req.user);
    res.status(201).json(adjustment);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Failed to submit stock adjustment' });
  }
});

app.patch('/api/adjustments/:id', authenticate, authorize(['ADMIN']), async (req, res) => {
  try {
    const { status, remarks } = req.body || {};
    const adj = await prisma.stockAdjustment.findUnique({
      where: { id: req.params.id },
      include: { asset: true }
    });
    if (!adj) return res.status(404).json({ message: 'Adjustment not found' });

    const updated = await prisma.stockAdjustment.update({
      where: { id: req.params.id },
      data: {
        status,
        remarks: remarks || adj.remarks,
        approvedById: req.user.sub
      }
    });

    if (status === 'APPROVED') {
      await prisma.inventoryItem.update({
        where: { id: adj.assetId },
        data: { quantityInStock: adj.newQty }
      });

      await prisma.transactionLedger.create({
        data: {
          transactionId: 'TX-' + Math.floor(100000 + Math.random() * 900000),
          assetId: adj.assetId,
          type: 'ADJUSTMENT',
          previousQty: adj.previousQty,
          newQty: adj.newQty,
          performedById: req.user.sub,
          reason: `Stock adjustment approved. Reason: ${adj.reason}`,
          referenceNumber: adj.adjustmentNumber
        }
      });
    }

    await createAuditLog('ADJUSTMENT_UPDATE', `Updated stock adjustment ${adj.adjustmentNumber} status to ${status}.`, req.user);
    res.json(updated);
  } catch (err) {
    res.status(500).json({ message: 'Failed to approve stock adjustment' });
  }
});

// ─── Maintenance Records ─────────────────────────────────────────
app.get('/api/maintenance', authenticate, async (req, res) => {
  try {
    const maintenance = await prisma.maintenanceRecord.findMany({
      include: { asset: true, vendor: true },
      orderBy: { scheduledDate: 'asc' }
    });
    res.json(maintenance);
  } catch (err) {
    res.status(500).json({ message: 'Failed to fetch maintenance records' });
  }
});

app.post('/api/maintenance', authenticate, authorize(['ADMIN', 'STORE_MANAGER']), async (req, res) => {
  try {
    const { assetId, vendorId, issue, priority, estimatedCost, scheduledDate, remarks } = req.body || {};
    if (!assetId || !issue || !scheduledDate) {
      return res.status(400).json({ message: 'assetId, issue and scheduledDate are required' });
    }

    const recordId = 'MNT-' + Math.floor(100000 + Math.random() * 900000);
    const mnt = await prisma.maintenanceRecord.create({
      data: {
        recordId,
        assetId,
        vendorId,
        issue,
        priority: priority || 'MEDIUM',
        estimatedCost: Number(estimatedCost || 0),
        scheduledDate: new Date(scheduledDate),
        remarks,
        status: 'SCHEDULED'
      }
    });

    await createAuditLog('MAINTENANCE_SCHEDULE', `Scheduled maintenance workorder ${recordId}.`, req.user);
    res.status(201).json(mnt);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Failed to schedule maintenance' });
  }
});

app.patch('/api/maintenance/:id', authenticate, authorize(['ADMIN', 'STORE_MANAGER']), async (req, res) => {
  try {
    const { status, actualCost, completedDate, engineer, remarks } = req.body || {};
    const mnt = await prisma.maintenanceRecord.findUnique({ where: { id: req.params.id }, include: { asset: true } });
    if (!mnt) return res.status(404).json({ message: 'Record not found' });

    const updated = await prisma.maintenanceRecord.update({
      where: { id: req.params.id },
      data: {
        status,
        actualCost: actualCost !== undefined ? Number(actualCost) : mnt.actualCost,
        completedDate: completedDate ? new Date(completedDate) : mnt.completedDate,
        engineer: engineer || mnt.engineer,
        remarks: remarks || mnt.remarks
      }
    });

    if (status === 'COMPLETED') {
      await prisma.transactionLedger.create({
        data: {
          transactionId: 'TX-' + Math.floor(100000 + Math.random() * 900000),
          assetId: mnt.assetId,
          type: 'MAINTENANCE',
          previousQty: mnt.asset.quantityInStock,
          newQty: mnt.asset.quantityInStock,
          performedById: req.user.sub,
          reason: `Asset maintenance completed. Engineering: ${engineer || 'Staff'}`,
          referenceNumber: mnt.recordId
        }
      });
    }

    await createAuditLog('MAINTENANCE_UPDATE', `Updated maintenance record ${mnt.recordId} status to ${status}.`, req.user);
    res.json(updated);
  } catch (err) {
    res.status(500).json({ message: 'Failed to update maintenance record' });
  }
});

// ─── Warranty & AMC Management ───────────────────────────────────
app.get('/api/warranties', authenticate, async (req, res) => {
  try {
    const warranties = await prisma.warrantyAMC.findMany({
      include: { asset: true, vendor: true },
      orderBy: { endDate: 'asc' }
    });
    res.json(warranties);
  } catch (err) {
    res.status(500).json({ message: 'Failed to fetch warranties' });
  }
});

app.post('/api/warranties', authenticate, authorize(['ADMIN']), async (req, res) => {
  try {
    const { assetId, startDate, endDate, vendorId, coverage, amcProvider, amcCost, remarks } = req.body || {};
    if (!assetId || !startDate || !endDate || !vendorId || !coverage) {
      return res.status(400).json({ message: 'assetId, startDate, endDate, vendorId and coverage are required' });
    }

    const warranty = await prisma.warrantyAMC.upsert({
      where: { assetId },
      update: {
        startDate: new Date(startDate),
        endDate: new Date(endDate),
        vendorId,
        coverage,
        amcProvider,
        amcCost: Number(amcCost || 0),
        remarks
      },
      create: {
        assetId,
        startDate: new Date(startDate),
        endDate: new Date(endDate),
        vendorId,
        coverage,
        amcProvider,
        amcCost: Number(amcCost || 0),
        remarks
      }
    });

    await createAuditLog('WARRANTY_UPDATE', `Updated warranty/AMC details for asset ID ${assetId}.`, req.user);
    res.status(201).json(warranty);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Failed to update warranty info' });
  }
});

// ─── Inventory Transaction Ledger ───────────────────────────────
app.get('/api/ledger', authenticate, async (req, res) => {
  try {
    const ledger = await prisma.transactionLedger.findMany({
      include: { asset: true, performedBy: true },
      orderBy: { timestamp: 'desc' }
    });
    res.json(ledger);
  } catch (err) {
    res.status(500).json({ message: 'Failed to fetch transaction ledger' });
  }
});

// ─── Asset Disposals ──────────────────────────────────────────────
app.get('/api/disposals', authenticate, async (req, res) => {
  try {
    const disposals = await prisma.assetDisposal.findMany({
      include: { asset: true, disposedBy: true },
      orderBy: { createdAt: 'desc' }
    });
    res.json(disposals);
  } catch (err) {
    res.status(500).json({ message: 'Failed to fetch disposals' });
  }
});

app.post('/api/disposals', authenticate, authorize(['ADMIN', 'STORE_MANAGER']), async (req, res) => {
  try {
    const { assetId, reason, disposedQty, remarks } = req.body || {};
    if (!assetId || !reason || !disposedQty) {
      return res.status(400).json({ message: 'assetId, reason and disposedQty are required' });
    }

    const disposalNumber = 'DSP-' + Math.floor(100000 + Math.random() * 900000);
    const disposal = await prisma.assetDisposal.create({
      data: {
        disposalNumber,
        assetId,
        reason,
        disposedQty: Number(disposedQty),
        remarks,
        disposedById: req.user.sub,
        status: 'PENDING'
      }
    });

    await createAuditLog('DISPOSAL_REQUEST', `Submitted asset disposal request ${disposalNumber}.`, req.user);
    res.status(201).json(disposal);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Failed to submit disposal request' });
  }
});

app.patch('/api/disposals/:id', authenticate, authorize(['ADMIN']), async (req, res) => {
  try {
    const { status, remarks } = req.body || {};
    const disp = await prisma.assetDisposal.findUnique({
      where: { id: req.params.id },
      include: { asset: true }
    });
    if (!disp) return res.status(404).json({ message: 'Disposal request not found' });

    const updated = await prisma.assetDisposal.update({
      where: { id: req.params.id },
      data: {
        status,
        remarks: remarks || disp.remarks,
        approvedById: req.user.sub,
        certificateUrl: status === 'APPROVED' ? `CERT-${disp.disposalNumber}` : null
      }
    });

    if (status === 'APPROVED') {
      const prevQty = disp.asset.quantityInStock;
      const newQty = Math.max(0, prevQty - disp.disposedQty);

      await prisma.inventoryItem.update({
        where: { id: disp.assetId },
        data: { quantityInStock: newQty }
      });

      await prisma.transactionLedger.create({
        data: {
          transactionId: 'TX-' + Math.floor(100000 + Math.random() * 900000),
          assetId: disp.assetId,
          type: 'DISPOSAL',
          previousQty: prevQty,
          newQty: newQty,
          performedById: req.user.sub,
          reason: `Asset disposal completed. Reason: ${disp.reason}`,
          referenceNumber: disp.disposalNumber
        }
      });
    }

    await createAuditLog('DISPOSAL_UPDATE', `Updated disposal request ${disp.disposalNumber} status to ${status}.`, req.user);
    res.json(updated);
  } catch (err) {
    res.status(500).json({ message: 'Failed to update asset disposal' });
  }
});

// ─── System Documents Footer Registry ────────────────────────────
app.get('/api/documents', authenticate, async (req, res) => {
  try {
    const docs = await prisma.systemDocument.findMany({ orderBy: { createdAt: 'desc' } });
    res.json(docs);
  } catch (err) {
    res.status(500).json({ message: 'Failed to fetch system documents' });
  }
});

app.get('/api/documents/:number', authenticate, async (req, res) => {
  try {
    const doc = await prisma.systemDocument.findUnique({ where: { documentNumber: req.params.number } });
    if (!doc) return res.status(404).json({ message: 'Document registry footprint not found' });
    res.json(doc);
  } catch (err) {
    res.status(500).json({ message: 'Failed to fetch document' });
  }
});

app.post('/api/documents', authenticate, async (req, res) => {
  try {
    const { documentNumber, type, referenceId, qrCodeData, digitalSignature } = req.body || {};
    if (!documentNumber || !type || !referenceId) {
      return res.status(400).json({ message: 'documentNumber, type and referenceId are required' });
    }

    const doc = await prisma.systemDocument.upsert({
      where: { documentNumber },
      update: {
        version: { increment: 1 }
      },
      create: {
        documentNumber,
        type,
        referenceId,
        qrCodeData: qrCodeData || `doc-uri://${documentNumber}`,
        digitalSignature: digitalSignature || `sha256-footprint://${Math.random().toString(36).slice(2)}`
      }
    });
    res.status(201).json(doc);
  } catch (err) {
    res.status(500).json({ message: 'Failed to register document version' });
  }
});

// ─── Start Server ────────────────────────────────────────────────
app.listen(port, '0.0.0.0', () => {
  console.log(`\n🚀 AssetFlow Backend running on port ${port}`);
  console.log(`   Health: http://localhost:${port}/api/health`);
  console.log(`   Environment: ${process.env.NODE_ENV || 'development'}\n`);
});

module.exports = app;
