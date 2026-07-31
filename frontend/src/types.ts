export type Role = 'ADMIN' | 'STORE_MANAGER' | 'EMPLOYEE' | 'AUDITOR';

export type Permission =
  // Users management
  | 'users.create'
  | 'users.read'
  | 'users.update'
  | 'users.delete'
  | 'users.deactivate'
  | 'users.assign_roles'
  | 'users.reset_password'
  
  // Roles and system permissions
  | 'roles.manage'
  | 'permissions.manage'
  
  // Departments management
  | 'departments.create'
  | 'departments.read'
  | 'departments.update'
  | 'departments.delete'
  
  // Categories management
  | 'categories.create'
  | 'categories.read'
  | 'categories.update'
  | 'categories.delete'
  
  // Assets catalog
  | 'assets.create'
  | 'assets.read'
  | 'assets.update'
  | 'assets.delete'
  | 'assets.barcode'
  | 'assets.qr'
  | 'assets.import'
  | 'assets.export'
  
  // Inventory Transactions
  | 'transactions.create'
  | 'transactions.read'
  | 'transactions.adjust'
  
  // Requisition Requests
  | 'requests.create'
  | 'requests.read'
  | 'requests.update'
  | 'requests.delete'
  | 'requests.approve'
  | 'requests.reject'
  | 'requests.issue'
  
  // Issue Slips
  | 'issue_slips.read'
  | 'issue_slips.download'
  
  // Maintenance & Warranty
  | 'maintenance.create'
  | 'maintenance.read'
  | 'maintenance.update'
  | 'warranty.read'
  | 'warranty.update'
  
  // Reports
  | 'reports.read_all'
  | 'reports.read_operational'
  | 'reports.read_inventory'
  | 'reports.export_all'
  | 'reports.export_operational'
  | 'reports.export_inventory'
  
  // Notifications
  | 'notifications.read'
  | 'notifications.send'
  
  // Audit Logs
  | 'audit_logs.read'
  | 'audit_logs.delete'
  | 'audit_logs.export'
  
  // Profile & Settings
  | 'profile.update'
  | 'settings.manage'
  | 'settings.system_config'
  | 'settings.email_templates'
  | 'settings.reset_db';

export const ROLE_PERMISSIONS: Record<Role, Permission[]> = {
  ADMIN: [
    'users.create', 'users.read', 'users.update', 'users.delete', 'users.deactivate', 'users.assign_roles', 'users.reset_password',
    'roles.manage', 'permissions.manage',
    'departments.create', 'departments.read', 'departments.update', 'departments.delete',
    'categories.create', 'categories.read', 'categories.update', 'categories.delete',
    'assets.create', 'assets.read', 'assets.update', 'assets.delete', 'assets.barcode', 'assets.qr', 'assets.import', 'assets.export',
    'transactions.create', 'transactions.read', 'transactions.adjust',
    'requests.create', 'requests.read', 'requests.update', 'requests.delete', 'requests.approve', 'requests.reject', 'requests.issue',
    'issue_slips.read', 'issue_slips.download',
    'maintenance.create', 'maintenance.read', 'maintenance.update',
    'warranty.read', 'warranty.update',
    'reports.read_all', 'reports.read_operational', 'reports.read_inventory', 'reports.export_all', 'reports.export_operational', 'reports.export_inventory',
    'notifications.read', 'notifications.send',
    'audit_logs.read', 'audit_logs.delete', 'audit_logs.export',
    'profile.update', 'settings.manage', 'settings.system_config', 'settings.email_templates', 'settings.reset_db'
  ],
  STORE_MANAGER: [
    'assets.read', 'assets.barcode', 'assets.qr',
    'transactions.create', 'transactions.read', 'transactions.adjust',
    'requests.read', 'requests.issue',
    'issue_slips.read', 'issue_slips.download',
    'maintenance.create', 'maintenance.read', 'maintenance.update',
    'warranty.read', 'warranty.update',
    'reports.read_inventory', 'reports.export_inventory',
    'notifications.read',
    'profile.update'
  ],
  EMPLOYEE: [
    'assets.read',
    'requests.create', 'requests.read', 'requests.update',
    'issue_slips.read', 'issue_slips.download',
    'notifications.read',
    'profile.update'
  ],
  AUDITOR: [
    'users.read',
    'departments.read',
    'categories.read',
    'assets.read',
    'transactions.read',
    'requests.read',
    'issue_slips.read',
    'maintenance.read',
    'warranty.read',
    'reports.read_all', 'reports.export_all',
    'audit_logs.read', 'audit_logs.export',
    'notifications.read',
    'profile.update'
  ]
};

export function hasPermission(role: Role, permission: Permission): boolean {
  const permissions = ROLE_PERMISSIONS[role];
  return permissions ? permissions.includes(permission) : false;
}

export interface Department {
  id: string;
  name: string;
  budgetLimit: number;
  budgetConsumed: number;
}

export interface Category {
  id: string;
  name: string;
  description: string;
}

export interface Vendor {
  id: string;
  name: string;
  contactEmail: string;
  phone: string;
}

export interface InventoryItem {
  id: string;
  sku: string;
  name: string;
  categoryId: string;
  vendorId: string;
  quantityInStock: number;
  reorderPoint: number;
  unitCost: number;
  lastStockInDate: string;
  locationCode: string; // e.g. WH-A1-S3
}

export interface RequisitionRequest {
  id: string;
  requesterName: string;
  requesterEmail: string;
  requesterRole: Role;
  departmentId: string;
  itemId: string;
  quantityRequested: number;
  justification: string;
  status: 'PENDING' | 'APPROVED' | 'DENIED' | 'RETURNED';
  requestedAt: string;
  approvedOrDeniedAt?: string;
  approverName?: string;
  denialReason?: string;
  priority?: 'LOW' | 'MEDIUM' | 'HIGH' | 'URGENT';
}

export interface AuditLog {
  id: string;
  timestamp: string;
  actorName: string;
  actorEmail: string;
  actionType: string; // e.g., 'STOCK_IN', 'STOCK_ADJUSTMENT', 'REQUISITION_SUBMIT', 'REQUISITION_APPROVE', 'REQUISITION_DENY', 'ITEM_RETURN'
  details: string;
  skuAffected?: string;
  quantityChanged?: number;
}

export interface UserSession {
  id: string;
  name: string;
  email: string;
  role: Role;
  departmentId: string;
  avatar: string;
}

