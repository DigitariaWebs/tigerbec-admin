# Admin Frontend - API Organization

## 📁 New Modular API Structure

The API client has been reorganized into separate, focused modules for better maintainability and code organization.

### Structure

```
lib/api/
├── base.ts           # Base API client with shared functionality
├── admins.ts         # Admin operations (signup, signin, list, CRUD, audit logs)
├── members.ts        # Member operations (list, stats, cars)
├── analytics.ts      # Analytics endpoints (KPIs, profit data, age bands)
├── auth.ts           # Authentication operations
├── reports.ts        # Report downloads
└── index.ts          # Unified exports for backward compatibility
```

### Types

All TypeScript interfaces are centralized in:
```
src/types/index.ts    # Admin, Profile, Car, MemberKPIs, GlobalKPIs, etc.
```

## 🚀 Usage

### Option 1: Import Specific API Modules (Recommended)

```typescript
import { adminApi } from '@/lib/api/admins'
import { membersApi } from '@/lib/api/members'
import { analyticsApi } from '@/lib/api/analytics'

// Use the API
const admins = await adminApi.list()
const members = await membersApi.getAll()
const kpis = await analyticsApi.getGlobalKPIs()
```

### Option 2: Import from Index (Backward Compatible)

```typescript
import { api } from '@/lib/api'

// All methods available through unified api object
const admins = await api.getAllAdmins()
const members = await api.getAllMembers()
const kpis = await api.getGlobalKPIs()
```

## 📝 Admin API Endpoints

### Authentication
- `adminApi.signup({ email, password, full_name })` - POST /admin/signup (public)
- `adminApi.signin({ email, password })` - POST /admin/signin (public)
- `adminApi.signout()` - Clear local storage

### Admin Management
- `adminApi.list()` - GET /admin/list - Get all admins
- `adminApi.getProfile(id)` - GET /admin/profile/:id - Get admin by ID
- `adminApi.updateProfile(id, data)` - PUT /admin/profile/:id - Update admin
- `adminApi.deleteProfile(id)` - DELETE /admin/profile/:id - Delete admin

### Audit Logs
- `adminApi.getAuditLogs(params?)` - GET /admin/audit-logs - Get audit logs with filters

Example with filters:
```typescript
const logs = await adminApi.getAuditLogs({
  action: 'member_created',
  entity_type: 'member',
  start_date: '2024-01-01'
})
```

## 🎯 Implementation Examples

### Admin Page Component

```typescript
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query"
import { adminApi } from "@/lib/api/admins"
import { Admin } from "@/types"

export default function AdminsPage() {
  const queryClient = useQueryClient()
  
  // Fetch admins
  const { data: admins = [], isLoading } = useQuery<Admin[]>({
    queryKey: ['admins'],
    queryFn: () => adminApi.list(),
  })
  
  // Delete mutation
  const deleteMutation = useMutation({
    mutationFn: (id: string) => adminApi.deleteProfile(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admins'] })
      toast.success('Admin deleted successfully')
    },
  })
  
  return <div>{/* Your UI */}</div>
}
```

## 🔧 Setup Requirements

### Dependencies
- `@tanstack/react-query` - For data fetching and caching
- `sonner` - For toast notifications

### Providers Setup
In your root layout (`src/app/layout.tsx`):

```typescript
import { QueryProvider } from "@/components/query-provider"
import { Toaster } from "@/components/ui/sonner"

export default function RootLayout({ children }) {
  return (
    <html>
      <body>
        <QueryProvider>
          {children}
          <Toaster />
        </QueryProvider>
      </body>
    </html>
  )
}
```

## 🔐 Authentication Flow

The API client automatically:
1. Retrieves the `admin_token` from localStorage
2. Adds it to the `Authorization` header as `Bearer <token>`
3. On signin success, stores the token and admin user data
4. On signout, clears all stored data

## 📊 Admin Page Features

The `/admins` page now includes:

✅ Real-time data fetching from backend API  
✅ CRUD operations (Create, Read, Update, Delete)  
✅ Optimistic UI updates with React Query  
✅ Toast notifications for user feedback  
✅ Loading states and error handling  
✅ Audit log access  
✅ Search and filtering  
✅ Responsive data table  

## 🎨 Benefits of New Structure

1. **Separation of Concerns** - Each API module handles one domain
2. **Easier Maintenance** - Changes to admin endpoints only affect admins.ts
3. **Better Type Safety** - Strongly typed with TypeScript interfaces
4. **Reusability** - Base client shared across all modules
5. **Discoverability** - Clear file names make endpoints easy to find
6. **Testability** - Each module can be tested independently

## 🔄 Migrating Existing Code

If you have existing imports from the old `lib/api.ts`:

**Before:**
```typescript
import { api } from '@/lib/api'
const result = await api.adminSignIn({ email, password })
```

**After (Recommended):**
```typescript
import { adminApi } from '@/lib/api/admins'
const result = await adminApi.signin({ email, password })
```

**Or (Backward Compatible):**
```typescript
import { api } from '@/lib/api'
const result = await api.adminSignIn({ email, password })
```

The old `lib/api.ts` file can be kept for backward compatibility or gradually migrated.
