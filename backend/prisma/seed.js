/**
 * AssetFlow Enterprise — Prisma Database Seed Script
 * Seeds the database with demo personas, departments, categories,
 * vendors, inventory items, requisitions, and audit logs.
 *
 * Run with: node prisma/seed.js
 */

const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Seeding AssetFlow Enterprise database...\n');

  // ─── 1. DEPARTMENTS ───────────────────────────────────────────
  console.log('Creating departments...');
  const deptRd = await prisma.department.upsert({
    where: { name: 'R&D Mobile Systems' },
    update: {},
    create: { name: 'R&D Mobile Systems', budgetLimit: 50000, budgetConsumed: 12400 }
  });
  const deptIt = await prisma.department.upsert({
    where: { name: 'IT Operations & Cloud' },
    update: {},
    create: { name: 'IT Operations & Cloud', budgetLimit: 35000, budgetConsumed: 8500 }
  });
  const deptOps = await prisma.department.upsert({
    where: { name: 'Corporate Admin & Operations' },
    update: {},
    create: { name: 'Corporate Admin & Operations', budgetLimit: 20000, budgetConsumed: 4200 }
  });
  console.log('  ✓ 3 departments created');

  // ─── 2. USERS ─────────────────────────────────────────────────
  console.log('Creating users...');
  const passwordHash = await bcrypt.hash('secret-passkey', 10);

  const userAlexander = await prisma.user.upsert({
    where: { email: 'a.wright@enterprise.com' },
    update: {},
    create: {
      name: 'Alexander Wright',
      email: 'a.wright@enterprise.com',
      passwordHash,
      role: 'ADMIN',
      departmentId: deptOps.id,
      avatar: '👑'
    }
  });
  const userSarah = await prisma.user.upsert({
    where: { email: 's.jenkins@enterprise.com' },
    update: {},
    create: {
      name: 'Sarah Jenkins',
      email: 's.jenkins@enterprise.com',
      passwordHash,
      role: 'ADMIN',
      departmentId: deptOps.id,
      avatar: '👩‍💼'
    }
  });
  const userElena = await prisma.user.upsert({
    where: { email: 'e.rostova@enterprise.com' },
    update: {},
    create: {
      name: 'Elena Rostova',
      email: 'e.rostova@enterprise.com',
      passwordHash,
      role: 'STORE_MANAGER',
      departmentId: deptIt.id,
      avatar: '📦'
    }
  });
  const userMarcus = await prisma.user.upsert({
    where: { email: 'm.thorne@enterprise.com' },
    update: {},
    create: {
      name: 'Marcus Thorne',
      email: 'm.thorne@enterprise.com',
      passwordHash,
      role: 'EMPLOYEE',
      departmentId: deptRd.id,
      avatar: '👨‍💻'
    }
  });
  const userDiana = await prisma.user.upsert({
    where: { email: 'd.prince@enterprise.com' },
    update: {},
    create: {
      name: 'Diana Prince',
      email: 'd.prince@enterprise.com',
      passwordHash,
      role: 'AUDITOR',
      departmentId: deptOps.id,
      avatar: '🕵️‍♀️'
    }
  });
  console.log('  ✓ 5 users created');

  // ─── 3. CATEGORIES ─────────────────────────────────────────────
  console.log('Creating categories...');
  const catPeriph = await prisma.category.upsert({
    where: { name: 'Computer Peripherals' },
    update: {},
    create: { name: 'Computer Peripherals', description: 'Keyboards, mice, adapters, docks, monitors' }
  });
  const catTest = await prisma.category.upsert({
    where: { name: 'Testing Hardware' },
    update: {},
    create: { name: 'Testing Hardware', description: 'Android/iOS tablets, devkits, thermal cameras' }
  });
  const catNet = await prisma.category.upsert({
    where: { name: 'Network Equipment' },
    update: {},
    create: { name: 'Network Equipment', description: 'Cables, routers, switches, adapters' }
  });
  const catFurniture = await prisma.category.upsert({
    where: { name: 'Ergonomic Furniture' },
    update: {},
    create: { name: 'Ergonomic Furniture', description: 'Standing desks, task chairs, footrests' }
  });
  console.log('  ✓ 4 categories created');

  // ─── 4. VENDORS ────────────────────────────────────────────────
  console.log('Creating vendors...');
  const vendApex = await prisma.vendor.upsert({
    where: { name: 'Apex Hardware Corp' },
    update: {},
    create: { name: 'Apex Hardware Corp', contactEmail: 'sales@apexhardware.com', phone: '+1-800-555-0192' }
  });
  const vendSilicon = await prisma.vendor.upsert({
    where: { name: 'Silicon Distributors' },
    update: {},
    create: { name: 'Silicon Distributors', contactEmail: 'orders@silicondist.net', phone: '+1-888-555-0248' }
  });
  const vendGlobal = await prisma.vendor.upsert({
    where: { name: 'Global Network Ltd' },
    update: {},
    create: { name: 'Global Network Ltd', contactEmail: 'support@globalnet.com', phone: '+1-877-555-0371' }
  });
  console.log('  ✓ 3 vendors created');

  // ─── 5. INVENTORY ITEMS ────────────────────────────────────────
  console.log('Creating inventory items...');
  const itemKbd = await prisma.inventoryItem.upsert({
    where: { sku: 'KB-MECH-90' },
    update: {},
    create: {
      sku: 'KB-MECH-90',
      name: 'Ultra Ergonomic Mechanical Keyboard',
      categoryId: catPeriph.id,
      vendorId: vendApex.id,
      quantityInStock: 24,
      reorderPoint: 10,
      unitCost: 120,
      lastStockInDate: '2026-07-10',
      locationCode: 'WH-A1-S3'
    }
  });
  const itemHub = await prisma.inventoryItem.upsert({
    where: { sku: 'AD-USBC-05' },
    update: {},
    create: {
      sku: 'AD-USBC-05',
      name: 'USB-C Multi-port adapter Hub (8-in-1)',
      categoryId: catPeriph.id,
      vendorId: vendSilicon.id,
      quantityInStock: 3,
      reorderPoint: 8,
      unitCost: 45,
      lastStockInDate: '2026-06-15',
      locationCode: 'WH-B2-S1'
    }
  });
  const itemCable = await prisma.inventoryItem.upsert({
    where: { sku: 'CB-CAT6-10' },
    update: {},
    create: {
      sku: 'CB-CAT6-10',
      name: 'Ethernet Cat6 Patch Cable 10m (Teal)',
      categoryId: catNet.id,
      vendorId: vendGlobal.id,
      quantityInStock: 150,
      reorderPoint: 20,
      unitCost: 12,
      lastStockInDate: '2026-07-14',
      locationCode: 'WH-D4-S2'
    }
  });
  const itemMonitor = await prisma.inventoryItem.upsert({
    where: { sku: 'MN-UW34-01' },
    update: {},
    create: {
      sku: 'MN-UW34-01',
      name: 'UltraWide 34" Curved Design Monitor',
      categoryId: catPeriph.id,
      vendorId: vendSilicon.id,
      quantityInStock: 0,
      reorderPoint: 2,
      unitCost: 450,
      lastStockInDate: '2026-05-01',
      locationCode: 'WH-C1-S5'
    }
  });
  const itemTablet = await prisma.inventoryItem.upsert({
    where: { sku: 'TB-ANDR-10' },
    update: {},
    create: {
      sku: 'TB-ANDR-10',
      name: 'Enterprise 10" Android Testing Tablet',
      categoryId: catTest.id,
      vendorId: vendApex.id,
      quantityInStock: 8,
      reorderPoint: 3,
      unitCost: 299,
      lastStockInDate: '2026-07-16',
      locationCode: 'WH-F1-S1'
    }
  });
  console.log('  ✓ 5 inventory items created');

  // ─── 6. REQUISITIONS ──────────────────────────────────────────
  console.log('Creating sample requisitions...');
  const req1 = await prisma.requisition.upsert({
    where: { id: 'req-seed-001' },
    update: {},
    create: {
      id: 'req-seed-001',
      requesterId: userMarcus.id,
      requesterName: 'Marcus Thorne',
      requesterEmail: 'm.thorne@enterprise.com',
      requesterRole: 'EMPLOYEE',
      departmentId: deptRd.id,
      itemId: itemHub.id,
      quantityRequested: 2,
      justification: 'Critical USB-C adaptors for mobile R&D field testing operations next week.',
      status: 'APPROVED',
      approvedOrDeniedAt: new Date('2026-07-15T11:45:00Z'),
      approverName: 'Elena Rostova',
      requestedAt: new Date('2026-07-15T09:30:00Z')
    }
  });
  const req2 = await prisma.requisition.upsert({
    where: { id: 'req-seed-002' },
    update: {},
    create: {
      id: 'req-seed-002',
      requesterId: userMarcus.id,
      requesterName: 'Marcus Thorne',
      requesterEmail: 'm.thorne@enterprise.com',
      requesterRole: 'EMPLOYEE',
      departmentId: deptRd.id,
      itemId: itemMonitor.id,
      quantityRequested: 1,
      justification: 'Secondary design viewport for system schematic visual modeling.',
      status: 'PENDING',
      requestedAt: new Date('2026-07-17T08:15:00Z')
    }
  });
  console.log('  ✓ 2 requisitions created');

  // ─── 7. AUDIT LOGS ────────────────────────────────────────────
  console.log('Creating audit logs...');
  await prisma.auditLog.createMany({
    skipDuplicates: true,
    data: [
      {
        id: 'log-seed-init',
        timestamp: new Date('2026-07-15T08:00:00Z'),
        actorId: null,
        actorName: 'System Bootstrap',
        actorEmail: 'system@enterprise.com',
        actionType: 'SYSTEM_INIT',
        details: 'Primary database inventory tables successfully seeded with default assets.'
      },
      {
        id: 'log-seed-stock',
        timestamp: new Date('2026-07-15T10:00:00Z'),
        actorId: userSarah.id,
        actorName: 'Sarah Jenkins',
        actorEmail: 's.jenkins@enterprise.com',
        actionType: 'STOCK_IN',
        details: 'Inbound vendor shipment cataloged. Added 10 units to Mechanical Keyboard (KB-MECH-90).',
        skuAffected: 'KB-MECH-90',
        quantityChanged: 10
      },
      {
        id: 'log-seed-req1',
        timestamp: new Date('2026-07-15T11:45:00Z'),
        actorId: userElena.id,
        actorName: 'Elena Rostova',
        actorEmail: 'e.rostova@enterprise.com',
        actionType: 'REQUISITION_APPROVE',
        details: 'Approved requisition ID: req-seed-001. 2x USB-C adapter Hubs allocated to Marcus Thorne.',
        skuAffected: 'AD-USBC-05',
        quantityChanged: -2
      }
    ]
  });
  console.log('  ✓ 3 audit logs created');

  // ─── 8. NOTIFICATIONS ─────────────────────────────────────────
  console.log('Creating notifications...');
  await prisma.notification.createMany({
    skipDuplicates: false,
    data: [
      {
        userId: userMarcus.id,
        title: 'Requisition Approved',
        message: 'Your request for 2x USB-C Hub has been approved by Elena Rostova.',
        type: 'SUCCESS',
        isRead: false
      },
      {
        userId: userElena.id,
        title: 'Low Stock Alert',
        message: 'USB-C Multi-port adapter Hub (AD-USBC-05) is below reorder point (3 < 8).',
        type: 'WARNING',
        isRead: false
      }
    ]
  });
  console.log('  ✓ 2 notifications created');

  // ─── 9. PURCHASE ORDERS & GRN SEEDS ────────────────────────────
  console.log('Creating sample purchase orders & receipt notes...');
  const po1 = await prisma.purchaseOrder.upsert({
    where: { poNumber: 'PO-SEED-001' },
    update: {},
    create: {
      poNumber: 'PO-SEED-001',
      vendorId: vendApex.id,
      status: 'COMPLETED',
      createdById: userAlexander.id,
      purchaseDate: new Date('2026-07-12T10:00:00Z'),
      remarks: 'Initial stock fulfillment order.',
      items: {
        create: [
          {
            name: 'Ultra Ergonomic Mechanical Keyboard',
            sku: 'KB-MECH-90',
            categoryId: catPeriph.id,
            quantity: 5,
            receivedQty: 5,
            unitCost: 120.0
          }
        ]
      }
    }
  });

  const grn1 = await prisma.goodsReceiptNote.upsert({
    where: { grnNumber: 'GRN-SEED-001' },
    update: {},
    create: {
      grnNumber: 'GRN-SEED-001',
      poId: po1.id,
      vendorId: vendApex.id,
      warehouse: 'WH-A1-S3',
      receivedById: userAlexander.id,
      receivedDate: new Date('2026-07-14T14:30:00Z'),
      remarks: 'Fulfillment inspected. Quantity matching.',
      items: {
        create: [
          {
            sku: 'KB-MECH-90',
            acceptedQty: 5,
            rejectedQty: 0,
            unitCost: 120.0
          }
        ]
      }
    }
  });

  // Transaction Ledger Entry
  await prisma.transactionLedger.upsert({
    where: { transactionId: 'TX-SEED-001' },
    update: {},
    create: {
      transactionId: 'TX-SEED-001',
      assetId: itemKbd.id,
      type: 'PURCHASE',
      previousQty: 19,
      newQty: 24,
      performedById: userAlexander.id,
      reason: 'Inbound PO delivery fulfillment stock-in.',
      referenceNumber: 'GRN-SEED-001',
      timestamp: new Date('2026-07-14T14:30:00Z')
    }
  });

  // System Document Footprints
  await prisma.systemDocument.upsert({
    where: { documentNumber: 'PO-SEED-001' },
    update: {},
    create: {
      documentNumber: 'PO-SEED-001',
      type: 'PURCHASE_ORDER',
      referenceId: po1.id,
      qrCodeData: `doc-uri://PO-SEED-001/${po1.id}`,
      digitalSignature: 'sha256-po-seed-001-verification-hash-placeholder-trail'
    }
  });

  await prisma.systemDocument.upsert({
    where: { documentNumber: 'GRN-SEED-001' },
    update: {},
    create: {
      documentNumber: 'GRN-SEED-001',
      type: 'GRN',
      referenceId: grn1.id,
      qrCodeData: `doc-uri://GRN-SEED-001/${grn1.id}`,
      digitalSignature: 'sha256-grn-seed-001-verification-hash-placeholder-trail'
    }
  });
  console.log('  ✓ Purchase Orders & GRNs seeded');

  console.log('\n✅ Database seeded successfully!');
  console.log('\n📋 Demo Credentials (all use password: secret-passkey)');
  console.log('  👑 Super Admin  : a.wright@enterprise.com');
  console.log('  👩‍💼 Admin        : s.jenkins@enterprise.com');
  console.log('  📦 Store Manager: e.rostova@enterprise.com');
  console.log('  👨‍💻 Employee     : m.thorne@enterprise.com');
  console.log('  🕵️  Auditor      : d.prince@enterprise.com');
}

main()
  .catch((e) => {
    console.error('❌ Seed error:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
