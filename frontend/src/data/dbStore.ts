/**
 * AssetFlow Enterprise — Frontend API Bridge
 *
 * This module replaces the old localStorage mock store with real
 * async API calls to the Express + Prisma backend.
 *
 * All functions return the same shapes as before so existing
 * component code doesn't need to change.
 */

import {
  Department, Category, Vendor, InventoryItem, RequisitionRequest, AuditLog, UserSession
} from '../types';

// ─── API Base URL ─────────────────────────────────────────────────
// In dev: Vite proxy forwards /api → http://localhost:4000
// In prod: set VITE_API_URL env var
const API_BASE = (import.meta as any).env?.VITE_API_URL || '/api';

// ─── Simulated Personas for Login Panel ──────────────────────────
export const SIMULATED_USERS: UserSession[] = [
  { id: 'user-alexander', name: 'Alexander Wright', email: 'a.wright@enterprise.com', role: 'ADMIN', departmentId: 'dept-ops', avatar: '👑' },
  { id: 'user-sarah',     name: 'Sarah Jenkins',    email: 's.jenkins@enterprise.com', role: 'ADMIN',       departmentId: 'dept-ops', avatar: '👩‍💼' },
  { id: 'user-elena',     name: 'Elena Rostova',    email: 'e.rostova@enterprise.com', role: 'STORE_MANAGER',departmentId: 'dept-it',  avatar: '📦' },
  { id: 'user-marcus',    name: 'Marcus Thorne',    email: 'm.thorne@enterprise.com',  role: 'EMPLOYEE',    departmentId: 'dept-rd',  avatar: '👨‍💻' },
  { id: 'user-diana',     name: 'Diana Prince',     email: 'd.prince@enterprise.com',  role: 'AUDITOR',     departmentId: 'dept-ops', avatar: '🕵️‍♀️' }
];

// ─── HTTP Helper ──────────────────────────────────────────────────
async function apiCall<T>(
  path: string,
  options: RequestInit = {}
): Promise<T> {
  const res = await fetch(`${API_BASE}${path}`, {
    headers: { 'Content-Type': 'application/json', ...options.headers },
    credentials: 'include',  // send cookies with every request
    ...options
  });

  if (!res.ok) {
    let errMsg = `API Error ${res.status}`;
    try {
      const body = await res.json();
      errMsg = body.message || errMsg;
    } catch { /* ignore JSON parse errors */ }
    throw new Error(errMsg);
  }

  return res.json() as Promise<T>;
}

// ─── Auth ─────────────────────────────────────────────────────────

/**
 * loginUser — calls POST /api/auth/login
 * Returns { success, user, error }
 */
export async function loginUser(
  email: string,
  password: string
): Promise<{ success: boolean; user?: UserSession; error?: string }> {
  try {
    const data = await apiCall<{ user: UserSession; accessToken: string }>('/auth/login', {
      method: 'POST',
      body: JSON.stringify({ email, password })
    });
    return { success: true, user: data.user };
  } catch (err: any) {
    return { success: false, error: err.message || 'Login failed' };
  }
}

/**
 * logoutUser — calls POST /api/auth/logout
 * Clears httpOnly cookies server-side
 */
export async function logoutUser(): Promise<void> {
  try {
    await apiCall('/auth/logout', { method: 'POST' });
  } catch { /* ignore logout errors */ }
}

/**
 * getCurrentUser — calls GET /api/auth/me
 * Returns the currently authenticated user (from cookie)
 */
export async function getCurrentUser(): Promise<UserSession | null> {
  try {
    const data = await apiCall<{ user: UserSession }>('/auth/me');
    return data.user;
  } catch {
    return null;
  }
}

// ─── Dashboard / State Sync ───────────────────────────────────────

export interface DBState {
  departments: Department[];
  categories: Category[];
  vendors: Vendor[];
  inventory: InventoryItem[];
  requisitions: RequisitionRequest[];
  auditLogs: AuditLog[];
  notifications: any[];
}

/**
 * syncFromBackend — GET /api/dashboard
 * Fetches complete application state from the backend.
 * Used to replace the old getDB() + localStorage approach.
 */
export async function syncFromBackend(): Promise<DBState> {
  try {
    return await apiCall<DBState>('/dashboard');
  } catch (err: any) {
    console.warn('syncFromBackend failed, returning empty state:', err.message);
    return {
      departments: [],
      categories: [],
      vendors: [],
      inventory: [],
      requisitions: [],
      auditLogs: [],
      notifications: []
    };
  }
}

/**
 * getDB — synchronous wrapper that returns empty state.
 * Kept for backwards compatibility — components should use syncFromBackend() instead.
 */
export function getDB(): DBState {
  return {
    departments: [],
    categories: [],
    vendors: [],
    inventory: [],
    requisitions: [],
    auditLogs: [],
    notifications: []
  };
}

// ─── Inventory Operations ─────────────────────────────────────────

/**
 * createNewItem — POST /api/inventory
 */
export async function createNewItem(
  itemData: Omit<InventoryItem, 'id' | 'lastStockInDate'>,
  _actor: UserSession
): Promise<{ success: boolean; error?: string }> {
  try {
    await apiCall<InventoryItem>('/inventory', {
      method: 'POST',
      body: JSON.stringify(itemData)
    });
    return { success: true };
  } catch (err: any) {
    return { success: false, error: err.message };
  }
}

/**
 * postStockIn — POST /api/inventory/:id/stock
 */
export async function postStockIn(
  itemId: string,
  quantity: number,
  _actor: UserSession,
  costOverride?: number
): Promise<{ success: boolean; error?: string }> {
  try {
    await apiCall<InventoryItem>(`/inventory/${itemId}/stock`, {
      method: 'POST',
      body: JSON.stringify({ quantity, ...(costOverride ? { costOverride } : {}) })
    });
    return { success: true };
  } catch (err: any) {
    return { success: false, error: err.message };
  }
}

/**
 * adjustStockPoint — POST /api/inventory/:id/stock-point
 */
export async function adjustStockPoint(
  itemId: string,
  reorderPoint: number,
  locationCode: string,
  _actor: UserSession
): Promise<{ success: boolean; error?: string }> {
  try {
    await apiCall<InventoryItem>(`/inventory/${itemId}/stock-point`, {
      method: 'POST',
      body: JSON.stringify({ reorderPoint, locationCode })
    });
    return { success: true };
  } catch (err: any) {
    return { success: false, error: err.message };
  }
}

/**
 * createNewCategory — POST /api/categories
 */
export async function createNewCategory(
  name: string,
  description: string,
  _actor: UserSession
): Promise<{ success: boolean; error?: string }> {
  try {
    await apiCall('/categories', {
      method: 'POST',
      body: JSON.stringify({ name, description })
    });
    return { success: true };
  } catch (err: any) {
    return { success: false, error: err.message };
  }
}

// ─── Requisition Operations ───────────────────────────────────────

/**
 * submitRequisition — POST /api/requisitions
 */
export async function submitRequisition(
  itemId: string,
  quantity: number,
  justification: string,
  _actor: UserSession
): Promise<{ success: boolean; error?: string }> {
  try {
    await apiCall<RequisitionRequest>('/requisitions', {
      method: 'POST',
      body: JSON.stringify({ itemId, quantityRequested: quantity, justification })
    });
    return { success: true };
  } catch (err: any) {
    return { success: false, error: err.message };
  }
}

/**
 * processApproval — POST /api/requisitions/:id/approve or /deny
 */
export async function processApproval(
  reqId: string,
  action: 'APPROVE' | 'DENY',
  _approver: UserSession,
  denialReason?: string
): Promise<{ success: boolean; error?: string }> {
  try {
    const endpoint = action === 'APPROVE'
      ? `/requisitions/${reqId}/approve`
      : `/requisitions/${reqId}/deny`;
    await apiCall<RequisitionRequest>(endpoint, {
      method: 'POST',
      body: JSON.stringify({ denialReason })
    });
    return { success: true };
  } catch (err: any) {
    return { success: false, error: err.message };
  }
}

/**
 * registerReturn — POST /api/requisitions/:id/return
 */
export async function registerReturn(
  reqId: string,
  _actor: UserSession
): Promise<{ success: boolean; error?: string }> {
  try {
    await apiCall<RequisitionRequest>(`/requisitions/${reqId}/return`, {
      method: 'POST'
    });
    return { success: true };
  } catch (err: any) {
    return { success: false, error: err.message };
  }
}

// ─── Budget Operations ────────────────────────────────────────────

/**
 * adjustDepartmentBudget — PATCH /api/departments/:id/budget
 */
export async function adjustDepartmentBudget(
  deptId: string,
  newLimit: number,
  _actor: UserSession
): Promise<{ success: boolean; error?: string }> {
  try {
    await apiCall<Department>(`/departments/${deptId}/budget`, {
      method: 'PATCH',
      body: JSON.stringify({ budgetLimit: newLimit })
    });
    return { success: true };
  } catch (err: any) {
    return { success: false, error: err.message };
  }
}

// ─── Admin Operations ─────────────────────────────────────────────

/**
 * resetToDefault — POST /api/reset (Super Admin only)
 * Wipes the database. Re-seed with `node prisma/seed.js`
 */
export async function resetToDefault(): Promise<DBState> {
  try {
    await apiCall('/reset', { method: 'POST' });
  } catch (err: any) {
    console.error('Reset failed:', err.message);
  }
  return getDB();
}

/**
 * saveDB — No-op in the API-backed version.
 * Kept for backwards compatibility.
 */
export function saveDB(_data: DBState): void {
  // Mutations now go through individual API calls above
}
