# AssetFlow — Simple Explainer & Demo Guide 🚀

If you need to explain this application to a client, manager, or teammate, this guide is for you! It explains **what the app does**, **who uses it**, and **how to demo every single feature step-by-step** in plain, simple English.

---

## 💡 How to Explain this App (The Elevator Pitch)

> **"AssetFlow is a smart, central hub for managing company equipment (like laptops, monitors, and chairs). Instead of using messy spreadsheets, employees can request gear, managers can approve or deny requests based on real-time budgets, and stock managers can keep track of inventory and returns—all in one secure place."**

---

## 👥 The 5 Roles (Who is Who?)

The system has **5 different roles**. 
*💡 Tip: On the login page, you can just click any persona card to log in automatically without typing passwords!*

| Role | Persona Name | Email | What they do in simple terms |
| :--- | :--- | :--- | :--- |
| **👨‍💻 Employee** | Marcus Thorne | `m.thorne@enterprise.com` | **The Requester:** Browses available items and submits requests for equipment they need. |
| **👩‍💼 Admin** | Sarah Jenkins | `s.jenkins@enterprise.com` | **The Decider:** Approves or denies requests, manages budgets, and oversees departments. |
| **📦 Store Manager** | Elena Rostova | `e.rostova@enterprise.com` | **The Stock-Keeper:** Updates stock levels, registers returned items, and manages inventory. |
| **🕵️ Auditor** | Diana Prince | `d.prince@enterprise.com` | **The Observer:** Reads audit logs and reports to make sure everything is compliant and honest. |
| **👑 Super Admin** | Alex Wright | `a.wright@enterprise.com` | **The Owner:** Has full access to everything, plus a system reset switch. |

*🔑 All demo accounts use the same password: `secret-passkey` (or just click the persona cards to auto-login!)*

---

## 🛠️ Step-by-Step Demo Workflows (How to Test)

Here is how you can demonstrate the key workflows of the app. Follow these step-by-step scripts.

### 🟢 Test 1: The "Happy Path" (Submit Request ➡️ Approve)
*Goal: Show how an employee requests a laptop and an admin approves it, updating stock levels and budget automatically.*

1. **Log in as the Employee:**
   - Select **Marcus Thorne** (Employee) on the login screen.
   - Go to the **Dashboard** or **Requisitions** page.
   - Click **"New Requisition"** or use the request form on the dashboard.
   - Select **"M3 Macbook Pro 16\""** (or any item).
   - Enter Quantity = `1`.
   - Type a justification, e.g., *"Need a faster laptop for development."*
   - Click **Submit**. You will see a success message.
2. **Log in as the Admin to Approve:**
   - Log out, then select **Sarah Jenkins** (Admin) on the login screen.
   - You will see a new **Notification** bell alert for Marcus's request.
   - Go to the **Requisitions** page. Under the **Pending** tab, find Marcus's request.
   - Click the green **Approve** button.
3. **See the Results:**
   - Look at the **Inventory** page: The quantity in stock for that MacBook has decreased by 1.
   - Look at the **Departments** page: The Engineering department's consumed budget has increased by the cost of the laptop.
   - Go to **Audit Logs** page: You will see a new permanent log entry showing that Sarah approved Marcus's request.

---

### 🔴 Test 2: The "Deny Path" (Submit Request ➡️ Deny)
*Goal: Show how an admin denies a request with a reason.*

1. **Log in as the Employee:**
   - Select **Marcus Thorne** (Employee) on the login screen.
   - Submit a new requisition for a **"Herman Miller Aeron Chair"** with the reason: *"My current chair is squeaky."*
2. **Log in as the Admin to Deny:**
   - Log out, then select **Sarah Jenkins** (Admin) on the login screen.
   - Go to the **Requisitions** page, and find Marcus's pending request.
   - Click the red **Deny** button.
   - A box will ask for a denial reason. Type: *"Current budget does not support office furniture upgrades this month."* and submit.
3. **See the Results:**
   - The request is moved to the **Denied** tab.
   - No stock is deducted, and no budget is consumed.
   - Log back in as **Marcus Thorne** (Employee): You will see a notification alert saying your request was denied with the reason you typed.

---

### 🔄 Test 3: Returning an Asset (Process Return)
*Goal: Show what happens when an employee returns an item back to the warehouse.*

1. **Log in as the Store Manager (or Admin):**
   - Select **Elena Rostova** (Store Manager) on the login screen.
   - Go to the **Requisitions** page.
   - Click on the **Approved** tab to see items currently out with employees.
   - Find Marcus's approved request for the MacBook Pro.
   - Click the **Process Return** button.
2. **See the Results:**
   - The request status changes to **Returned**.
   - Go to the **Inventory** page: The quantity in stock for that MacBook has increased by 1 (back to the warehouse).
   - Go to the **Audit Logs**: A log entry is added stating that the asset was returned.

---

### 📦 Test 4: Stock-In Delivery (Adding New Stock)
*Goal: Show how the warehouse registers a new shipment of products.*

1. **Log in as the Store Manager (or Admin):**
   - Select **Elena Rostova** (Store Manager) on the login screen.
   - Go to the **Inventory** page.
   - Select any item (e.g., *"Logitech MX Master 3S"* mouse).
   - Click the **Stock-In Delivery** button.
   - Enter the number of new items received (e.g., `10`) and click **Confirm**.
2. **See the Results:**
   - The stock count immediately increases by 10.
   - A new entry is recorded in the **Audit Logs** showing that Elena stocked in 10 items.

---

### 🕵️ Test 5: Auditor Compliance Review
*Goal: Show how an independent observer checks for honesty and security.*

1. **Log in as the Auditor:**
   - Select **Diana Prince** (Auditor) on the login screen.
   - Go to the **Audit Logs** page. Notice that Diana cannot edit or delete anything; she can only read and search.
   - Search for *"Approve"* or *"Stock"* to inspect actions.
   - Go to the **Reports** page to view or download compliance summaries.

---

## ⭐ Advanced Features to Mention
When showing off the app, don't forget to highlight:
* **🛡️ Budget Safeguard:** If an Admin tries to approve a request that costs more than the department's remaining budget, the app will block the approval and show a warning!
* **⌨️ Command Palette:** Press `Ctrl + K` (or `Cmd + K` on Mac) anywhere to open a fast-search bar to search items, navigate tabs, or switch personas instantly.
* **📊 Visual Charts:** The Analytics tab shows gorgeous charts representing which departments use the most budget, and what categories of inventory are in high demand.
