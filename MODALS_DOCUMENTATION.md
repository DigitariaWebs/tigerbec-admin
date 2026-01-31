# Admin & User Management Modals

This document describes the new modal components added for managing admins and users.

## Components Created

### 1. Admin Details Modal
**Location:** `src/app/(dashboard)/admins/components/admin-details-modal.tsx`

Displays detailed information about an administrator including:
- Full name and email
- Admin ID
- Join date and last updated timestamp
- Role badge with dynamic coloring

**Usage:**
```tsx
<AdminDetailsModal
  adminId={selectedAdminId}
  open={detailsModalOpen}
  onOpenChange={setDetailsModalOpen}
/>
```

### 2. User Details Modal
**Location:** `src/app/(dashboard)/users/components/user-details-modal.tsx`

Displays comprehensive member information with tabs:
- **Details Tab:** Personal information (ID, email, phone, date of birth, member since)
- **Cars Tab:** List of all cars owned by the member with purchase/sale details

**Usage:**
```tsx
<UserDetailsModal
  userId={selectedUserId}
  open={detailsModalOpen}
  onOpenChange={setDetailsModalOpen}
/>
```

### 3. Reset Password Modal
**Location:** `src/components/reset-password-modal.tsx`

Allows admins to reset passwords for both admins and members with:
- Password strength validation (minimum 8 characters)
- Password confirmation matching
- Show/hide password toggle
- Visual feedback for password matching
- Uses PATCH method for API call

**Usage:**
```tsx
<ResetPasswordModal
  userId={selectedUserId}
  userName={selectedUserName}
  userType="admin" // or "member"
  open={resetPasswordModalOpen}
  onOpenChange={setResetPasswordModalOpen}
/>
```

**API Method:**
```typescript
adminApi.resetPassword(id, newPassword, userType)
```

### 4. Audit Logs Modal
**Location:** `src/components/audit-logs-modal.tsx`

Displays system audit logs with filtering capabilities:
- Filter by action (created, updated, deleted, etc.)
- Filter by entity type (admin, member, car)
- Filter by start date
- Color-coded action badges
- Expandable metadata view
- Actor and entity ID tracking

**Usage:**
```tsx
<AuditLogsModal
  open={auditLogsModalOpen}
  onOpenChange={setAuditLogsModalOpen}
  actorId={selectedAdminId} // optional
/>
```

## API Integration

### New API Method Added
**File:** `lib/api/admins.ts`

```typescript
async resetPassword(
  id: string, 
  newPassword: string,
  userType: 'admin' | 'member' = 'admin'
): Promise<{ message: string }>
```

- **Method:** PATCH
- **Endpoints:**
  - Admin: `/admin/profile/{id}/reset-password`
  - Member: `/admin/members/{id}/reset-password`
- **Body:** `{ new_password: string }`

### Existing API Methods Used
- `adminApi.getProfile(id)` - Get admin details
- `adminApi.getAuditLogs(params)` - Get audit logs with filters
- `membersApi.getById(id)` - Get member profile
- `membersApi.getStats(id)` - Get member statistics
- `membersApi.getCars(id)` - Get member's cars

## Integration Points

### Admins Page
**File:** `src/app/(dashboard)/admins/components/data-table.tsx`

Added modal triggers to:
- View icon button - Opens admin details modal
- "View Details" dropdown menu item - Opens admin details modal
- "View Audit Logs" dropdown menu item - Opens audit logs modal
- "Reset Password" dropdown menu item - Opens reset password modal

### Users Page
**File:** `src/app/(dashboard)/users/components/data-table.tsx`

Added modal triggers to:
- View icon button - Opens user details modal
- "View Details" dropdown menu item - Opens user details modal
- "Reset Password" dropdown menu item - Opens reset password modal

## Dynamic Color Implementation

All modals respect the current theme customizer settings and use:
- Dynamic primary colors from the theme
- Proper dark mode support
- Consistent badge coloring (red for admin, dynamic for members)
- Hover states and transitions

## Features

✅ Fully responsive design
✅ Loading states with skeletons
✅ Error handling with user-friendly messages
✅ TypeScript type safety
✅ React Query for data fetching and caching
✅ Sonner toast notifications for user feedback
✅ Form validation
✅ Accessibility features (ARIA labels, keyboard navigation)

## Dependencies

The modals use these UI components:
- Dialog
- Avatar
- Badge
- Button
- Input
- Label
- Tabs
- ScrollArea
- Select
- Skeleton
- Alert

All components are from the existing shadcn/ui library with proper theming support.
