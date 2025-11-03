# TaskFlow - System Architecture Document

**Version:** 1.0  
**Date:** November 3, 2025  
**Architect:** Bob  
**Project:** TaskFlow - AI-Powered Task Management SaaS  
**Tech Stack:** React, TypeScript, Shadcn-ui, Tailwind CSS, Supabase

---

## Executive Summary

TaskFlow is a modern, AI-powered task management platform built for remote teams. The architecture leverages Supabase as the backend-as-a-service, providing authentication, PostgreSQL database with Row-Level Security, real-time subscriptions, storage, and edge functions. The frontend uses React with TypeScript, Shadcn-ui components, and Tailwind CSS, deployed on Vercel's edge network.

**Key Architectural Decisions:**

1. **Supabase as BaaS**: Eliminates custom backend complexity, provides built-in auth, real-time, and PostgreSQL with RLS
2. **React Query for State Management**: Server state managed by React Query, client state by Zustand
3. **Optimistic UI Updates**: Immediate feedback with rollback on error
4. **Row-Level Security**: Multi-tenant data isolation at database level
5. **Edge Functions for AI**: Serverless compute for AI prioritization
6. **Progressive Web App**: Mobile-first with offline capabilities

---

## 1. Implementation Approach

### Core Technical Challenges

1. **Real-time Synchronization**: Ensuring task updates propagate instantly across all clients without conflicts
2. **AI Integration**: Implementing intelligent task prioritization efficiently
3. **Performance at Scale**: Maintaining sub-2-second page loads with thousands of tasks
4. **Data Security**: Implementing RLS policies for multi-tenant architecture
5. **Offline Capability**: Graceful degradation when network connectivity is limited

### Technology Stack Rationale

- **Frontend (React + TypeScript)**: Type safety, large ecosystem, excellent DX
- **UI (Shadcn-ui)**: Accessible, customizable components
- **Styling (Tailwind CSS)**: Rapid development, small bundle size
- **Backend (Supabase)**: PostgreSQL with ACID compliance, built-in auth, real-time, RLS
- **AI/ML**: OpenAI GPT-4 API for task prioritization
- **State Management**: React Query for server state, Zustand for client state
- **Deployment**: Vercel for frontend, Supabase cloud for backend

### Open Source Libraries

- **@tanstack/react-query**: Server state management and caching
- **@supabase/supabase-js**: Supabase client SDK
- **zustand**: Lightweight client state management
- **react-hook-form**: Form handling with validation
- **zod**: Schema validation
- **date-fns**: Date manipulation
- **recharts**: Data visualization
- **@radix-ui**: Accessible UI primitives (via Shadcn-ui)

---

## 2. Main User-UI Interaction Patterns

### Primary Interactions

1. **Task Creation Flow**
   - User clicks "Add Task" button or presses Cmd/Ctrl+K
   - Quick-add modal appears with title field focused
   - User enters task details (title, description, assignee, due date, priority)
   - Task appears immediately in appropriate view (optimistic update)
   - Real-time sync broadcasts to all team members

2. **Drag-and-Drop Task Management**
   - User drags task card between Kanban columns
   - Visual feedback shows valid drop zones
   - Task status updates on drop
   - Change propagates to all connected clients instantly
   - Undo option available for 5 seconds

3. **AI Priority Suggestion**
   - AI badge appears on tasks with suggested priorities
   - User clicks badge to see detailed reasoning
   - Modal shows factors: deadline proximity, dependencies, workload
   - User can accept (one click) or dismiss suggestion
   - System learns from user's decisions over time

4. **Real-time Collaboration**
   - User sees avatars of team members viewing same task
   - Typing indicators appear when someone is commenting
   - New comments appear instantly without refresh
   - @mentions trigger immediate notifications
   - Presence indicators show who's online

5. **Time Tracking**
   - User clicks "Start Timer" on task detail
   - Timer runs in background, visible in multiple locations
   - Browser tab title shows elapsed time
   - User clicks "Stop" to save time log
   - Idle detection prompts after 5 minutes of inactivity

---

## 3. System Architecture

### High-Level Architecture Diagram

```
┌─────────────────────────────────────────────────────────────────┐
│                         Client Layer                             │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐          │
│  │ Web Browser  │  │ Mobile PWA   │  │ Tablet PWA   │          │
│  └──────┬───────┘  └──────┬───────┘  └──────┬───────┘          │
│         │                  │                  │                   │
│         └──────────────────┴──────────────────┘                  │
│                            │                                      │
└────────────────────────────┼──────────────────────────────────────┘
                             │ HTTPS/WSS
                             │
┌────────────────────────────┼──────────────────────────────────────┐
│                    Vercel Edge Network                            │
│  ┌──────────────────────────────────────────────────────────┐   │
│  │              React Application (SSR/SSG)                  │   │
│  │  - Shadcn-ui Components                                   │   │
│  │  - Tailwind CSS                                           │   │
│  │  - React Query (Server State)                             │   │
│  │  - Zustand (Client State)                                 │   │
│  └──────────────────────────────────────────────────────────┘   │
└────────────────────────────┼──────────────────────────────────────┘
                             │ Supabase Client SDK
                             │
┌────────────────────────────┼──────────────────────────────────────┐
│                      Supabase Platform                            │
│  ┌─────────────────┐  ┌─────────────────┐  ┌─────────────────┐ │
│  │   Auth Service  │  │  Realtime API   │  │  Storage API    │ │
│  │   (JWT/OAuth)   │  │  (WebSockets)   │  │  (Files/Images) │ │
│  └────────┬────────┘  └────────┬────────┘  └────────┬────────┘ │
│           │                     │                     │           │
│  ┌────────┴─────────────────────┴─────────────────────┴────────┐│
│  │              PostgreSQL Database (with RLS)                  ││
│  │  - Users, Teams, Projects, Tasks, Comments, Time Logs       ││
│  │  - Row-Level Security Policies                              ││
│  │  - Triggers & Functions                                     ││
│  └──────────────────────────────────────────────────────────────┘│
│  ┌──────────────────────────────────────────────────────────┐   │
│  │                    Edge Functions                         │   │
│  │  - AI Prioritization Logic                                │   │
│  │  - Webhook Handlers                                       │   │
│  │  - Background Jobs                                        │   │
│  └──────────────────────────────────────────────────────────┘   │
└────────────────────────────┼──────────────────────────────────────┘
                             │ External APIs
                             │
┌────────────────────────────┼──────────────────────────────────────┐
│                    External Services                              │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐          │
│  │  OpenAI API  │  │ Email Service│  │    Stripe    │          │
│  │ (AI Priority)│  │ (SendGrid)   │  │  (Payments)  │          │
│  └──────────────┘  └──────────────┘  └──────────────┘          │
└───────────────────────────────────────────────────────────────────┘
```

### Component Architecture

```
App
├── Router
│   ├── AuthLayout
│   │   ├── LoginPage
│   │   │   └── LoginForm
│   │   ├── SignupPage
│   │   │   └── SignupForm
│   │   └── ResetPasswordPage
│   │       └── PasswordResetForm
│   └── MainLayout
│       ├── Sidebar
│       │   ├── ProjectList
│       │   └── NavLinks
│       ├── TopNav
│       │   ├── SearchBar
│       │   ├── NotificationBell
│       │   └── UserMenu
│       ├── DashboardPage
│       │   ├── TasksSummaryWidget
│       │   ├── UpcomingDeadlinesWidget
│       │   ├── TimeTrackingWidget
│       │   └── AIRecommendationsWidget
│       ├── TasksPage
│       │   ├── TaskFilters
│       │   ├── ViewSelector
│       │   ├── KanbanBoard
│       │   │   └── KanbanColumn
│       │   │       └── TaskCard
│       │   │           ├── AIPriorityBadge
│       │   │           ├── AssigneeAvatar
│       │   │           └── DueDateBadge
│       │   ├── TaskList
│       │   └── CalendarView
│       ├── TaskDetailModal
│       │   ├── TaskHeader
│       │   ├── TaskDescription
│       │   ├── CommentsSection
│       │   ├── TimeTrackingSection
│       │   └── ActivityFeed
│       ├── ProjectsPage
│       └── AnalyticsPage
```

---

## 4. Database Schema & Data Structures

### Entity Relationship Diagram

```
users (1) ──< (M) team_members (M) >── (1) teams
  │                                        │
  │                                        │
  └──< (M) tasks                    projects (M) ──┘
         │                                │
         │                                │
         ├──< (M) comments                │
         ├──< (M) time_logs               │
         ├──< (M) task_dependencies       │
         └──< (M) notifications           │
```

### Complete SQL Schema

```sql
-- Enable extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pg_trgm";

-- ============================================
-- USERS TABLE
-- ============================================
CREATE TABLE public.users (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email TEXT UNIQUE NOT NULL,
  full_name TEXT NOT NULL,
  avatar_url TEXT,
  role TEXT NOT NULL DEFAULT 'member' CHECK (role IN ('admin', 'manager', 'member')),
  preferences JSONB DEFAULT '{}'::jsonb,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_users_email ON public.users(email);

-- ============================================
-- TEAMS TABLE
-- ============================================
CREATE TABLE public.teams (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT NOT NULL,
  owner_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  plan TEXT NOT NULL DEFAULT 'free' CHECK (plan IN ('free', 'pro', 'enterprise')),
  settings JSONB DEFAULT '{}'::jsonb,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_teams_owner_id ON public.teams(owner_id);

-- ============================================
-- TEAM MEMBERS
-- ============================================
CREATE TABLE public.team_members (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  team_id UUID NOT NULL REFERENCES public.teams(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  role TEXT NOT NULL DEFAULT 'member' CHECK (role IN ('admin', 'manager', 'member')),
  joined_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(team_id, user_id)
);

CREATE INDEX idx_team_members_team_id ON public.team_members(team_id);
CREATE INDEX idx_team_members_user_id ON public.team_members(user_id);

-- ============================================
-- PROJECTS TABLE
-- ============================================
CREATE TABLE public.projects (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  team_id UUID NOT NULL REFERENCES public.teams(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  description TEXT,
  color TEXT DEFAULT '#3B82F6',
  icon TEXT,
  archived BOOLEAN DEFAULT FALSE,
  settings JSONB DEFAULT '{}'::jsonb,
  created_by UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_projects_team_id ON public.projects(team_id);
CREATE INDEX idx_projects_archived ON public.projects(archived);

-- ============================================
-- TASKS TABLE
-- ============================================
CREATE TABLE public.tasks (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  project_id UUID NOT NULL REFERENCES public.projects(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  description TEXT,
  assignee_id UUID REFERENCES public.users(id) ON DELETE SET NULL,
  status TEXT NOT NULL DEFAULT 'todo' CHECK (status IN ('todo', 'in_progress', 'done')),
  priority TEXT NOT NULL DEFAULT 'medium' CHECK (priority IN ('low', 'medium', 'high', 'urgent')),
  ai_suggested_priority TEXT CHECK (ai_suggested_priority IN ('low', 'medium', 'high', 'urgent')),
  ai_confidence NUMERIC(3,2),
  due_date TIMESTAMPTZ,
  tags TEXT[] DEFAULT '{}',
  position INTEGER,
  archived BOOLEAN DEFAULT FALSE,
  created_by UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  
  fts TSVECTOR GENERATED ALWAYS AS (
    setweight(to_tsvector('english', coalesce(title, '')), 'A') ||
    setweight(to_tsvector('english', coalesce(description, '')), 'B')
  ) STORED
);

CREATE INDEX idx_tasks_project_id ON public.tasks(project_id);
CREATE INDEX idx_tasks_assignee_id ON public.tasks(assignee_id);
CREATE INDEX idx_tasks_status ON public.tasks(status);
CREATE INDEX idx_tasks_priority ON public.tasks(priority);
CREATE INDEX idx_tasks_due_date ON public.tasks(due_date);
CREATE INDEX idx_tasks_fts ON public.tasks USING GIN(fts);

-- ============================================
-- TASK DEPENDENCIES
-- ============================================
CREATE TABLE public.task_dependencies (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  task_id UUID NOT NULL REFERENCES public.tasks(id) ON DELETE CASCADE,
  depends_on_task_id UUID NOT NULL REFERENCES public.tasks(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(task_id, depends_on_task_id),
  CHECK (task_id != depends_on_task_id)
);

CREATE INDEX idx_task_dependencies_task_id ON public.task_dependencies(task_id);
CREATE INDEX idx_task_dependencies_depends_on ON public.task_dependencies(depends_on_task_id);

-- ============================================
-- COMMENTS TABLE
-- ============================================
CREATE TABLE public.comments (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  task_id UUID NOT NULL REFERENCES public.tasks(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  content TEXT NOT NULL,
  mentions UUID[] DEFAULT '{}',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_comments_task_id ON public.comments(task_id);
CREATE INDEX idx_comments_user_id ON public.comments(user_id);
CREATE INDEX idx_comments_created_at ON public.comments(created_at DESC);

-- ============================================
-- TIME LOGS TABLE
-- ============================================
CREATE TABLE public.time_logs (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  task_id UUID NOT NULL REFERENCES public.tasks(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  start_time TIMESTAMPTZ NOT NULL,
  end_time TIMESTAMPTZ,
  duration_seconds INTEGER,
  description TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_time_logs_task_id ON public.time_logs(task_id);
CREATE INDEX idx_time_logs_user_id ON public.time_logs(user_id);
CREATE INDEX idx_time_logs_start_time ON public.time_logs(start_time DESC);

-- ============================================
-- NOTIFICATIONS TABLE
-- ============================================
CREATE TABLE public.notifications (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  type TEXT NOT NULL CHECK (type IN (
    'task_assigned', 'task_due_soon', 'task_overdue', 'mention',
    'comment', 'status_changed', 'project_invitation', 'team_member_joined'
  )),
  title TEXT NOT NULL,
  content TEXT NOT NULL,
  link TEXT,
  read BOOLEAN DEFAULT FALSE,
  metadata JSONB DEFAULT '{}'::jsonb,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_notifications_user_id ON public.notifications(user_id);
CREATE INDEX idx_notifications_read ON public.notifications(read);
CREATE INDEX idx_notifications_created_at ON public.notifications(created_at DESC);

-- ============================================
-- ACTIVITY LOGS TABLE
-- ============================================
CREATE TABLE public.activity_logs (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  team_id UUID NOT NULL REFERENCES public.teams(id) ON DELETE CASCADE,
  action TEXT NOT NULL,
  entity_type TEXT NOT NULL,
  entity_id UUID NOT NULL,
  metadata JSONB DEFAULT '{}'::jsonb,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_activity_logs_user_id ON public.activity_logs(user_id);
CREATE INDEX idx_activity_logs_team_id ON public.activity_logs(team_id);
CREATE INDEX idx_activity_logs_entity ON public.activity_logs(entity_type, entity_id);
CREATE INDEX idx_activity_logs_created_at ON public.activity_logs(created_at DESC);

-- ============================================
-- SUBSCRIPTIONS TABLE
-- ============================================
CREATE TABLE public.subscriptions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  team_id UUID NOT NULL REFERENCES public.teams(id) ON DELETE CASCADE,
  stripe_customer_id TEXT UNIQUE,
  stripe_subscription_id TEXT UNIQUE,
  plan TEXT NOT NULL CHECK (plan IN ('free', 'pro', 'enterprise')),
  status TEXT NOT NULL CHECK (status IN ('active', 'canceled', 'past_due', 'trialing')),
  current_period_start TIMESTAMPTZ,
  current_period_end TIMESTAMPTZ,
  cancel_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_subscriptions_team_id ON public.subscriptions(team_id);
CREATE INDEX idx_subscriptions_stripe_customer ON public.subscriptions(stripe_customer_id);

-- ============================================
-- TRIGGERS
-- ============================================

-- Update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_users_updated_at BEFORE UPDATE ON public.users
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_teams_updated_at BEFORE UPDATE ON public.teams
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_projects_updated_at BEFORE UPDATE ON public.projects
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_tasks_updated_at BEFORE UPDATE ON public.tasks
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Create notification on task assignment
CREATE OR REPLACE FUNCTION create_task_assignment_notification()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.assignee_id IS NOT NULL AND (OLD.assignee_id IS NULL OR OLD.assignee_id != NEW.assignee_id) THEN
    INSERT INTO public.notifications (user_id, type, title, content, link, metadata)
    VALUES (
      NEW.assignee_id,
      'task_assigned',
      'New task assigned',
      'You have been assigned to: ' || NEW.title,
      '/tasks/' || NEW.id,
      jsonb_build_object('task_id', NEW.id, 'task_title', NEW.title)
    );
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER task_assignment_notification
AFTER INSERT OR UPDATE ON public.tasks
FOR EACH ROW EXECUTE FUNCTION create_task_assignment_notification();

-- Calculate time log duration
CREATE OR REPLACE FUNCTION calculate_time_log_duration()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.end_time IS NOT NULL THEN
    NEW.duration_seconds := EXTRACT(EPOCH FROM (NEW.end_time - NEW.start_time))::INTEGER;
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER time_log_duration
BEFORE INSERT OR UPDATE ON public.time_logs
FOR EACH ROW EXECUTE FUNCTION calculate_time_log_duration();
```

### Row-Level Security Policies

```sql
-- Enable RLS on all tables
ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.teams ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.team_members ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.projects ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.tasks ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.comments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.time_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.notifications ENABLE ROW LEVEL SECURITY;

-- Users can view their own profile
CREATE POLICY "Users can view own profile"
ON public.users FOR SELECT
USING (auth.uid() = id);

-- Users can view team member profiles
CREATE POLICY "Users can view team member profiles"
ON public.users FOR SELECT
USING (
  EXISTS (
    SELECT 1 FROM public.team_members tm1
    JOIN public.team_members tm2 ON tm1.team_id = tm2.team_id
    WHERE tm1.user_id = auth.uid() AND tm2.user_id = users.id
  )
);

-- Users can view teams they belong to
CREATE POLICY "Users can view own teams"
ON public.teams FOR SELECT
USING (
  EXISTS (
    SELECT 1 FROM public.team_members
    WHERE team_id = teams.id AND user_id = auth.uid()
  )
);

-- Users can view projects in their teams
CREATE POLICY "Users can view team projects"
ON public.projects FOR SELECT
USING (
  EXISTS (
    SELECT 1 FROM public.team_members
    WHERE team_id = projects.team_id AND user_id = auth.uid()
  )
);

-- Users can view tasks in accessible projects
CREATE POLICY "Users can view accessible tasks"
ON public.tasks FOR SELECT
USING (
  EXISTS (
    SELECT 1 FROM public.projects p
    JOIN public.team_members tm ON p.team_id = tm.team_id
    WHERE p.id = tasks.project_id AND tm.user_id = auth.uid()
  )
);

-- Users can create tasks in accessible projects
CREATE POLICY "Users can create tasks"
ON public.tasks FOR INSERT
WITH CHECK (
  EXISTS (
    SELECT 1 FROM public.projects p
    JOIN public.team_members tm ON p.team_id = tm.team_id
    WHERE p.id = tasks.project_id AND tm.user_id = auth.uid()
  )
);

-- Users can update tasks they created or are assigned to
CREATE POLICY "Users can update own tasks"
ON public.tasks FOR UPDATE
USING (
  created_by = auth.uid() OR
  assignee_id = auth.uid() OR
  EXISTS (
    SELECT 1 FROM public.projects p
    JOIN public.team_members tm ON p.team_id = tm.team_id
    WHERE p.id = tasks.project_id 
      AND tm.user_id = auth.uid() 
      AND tm.role IN ('admin', 'manager')
  )
);

-- Users can only view their own notifications
CREATE POLICY "Users can view own notifications"
ON public.notifications FOR SELECT
USING (user_id = auth.uid());
```

---

## 5. Program Call Flow

### Task Creation Sequence

```
User                    UI Component           Service Layer          Supabase              Real-time
  │                          │                      │                     │                     │
  │ Click "Add Task"         │                      │                     │                     │
  ├─────────────────────────>│                      │                     │                     │
  │                          │                      │                     │                     │
  │                          │ Open Modal           │                     │                     │
  │                          │ (TaskForm)           │                     │                     │
  │                          │                      │                     │                     │
  │ Fill form & submit       │                      │                     │                     │
  ├─────────────────────────>│                      │                     │                     │
  │                          │                      │                     │                     │
  │                          │ Validate with Zod    │                     │                     │
  │                          │                      │                     │                     │
  │                          │ useCreateTask()      │                     │                     │
  │                          ├─────────────────────>│                     │                     │
  │                          │                      │                     │                     │
  │                          │                      │ Optimistic Update   │                     │
  │                          │                      │ (add to cache)      │                     │
  │                          │                      │                     │                     │
  │                          │                      │ taskService         │                     │
  │                          │                      │ .createTask()       │                     │
  │                          │                      ├────────────────────>│                     │
  │                          │                      │                     │                     │
  │                          │                      │                     │ INSERT INTO tasks   │
  │                          │                      │                     │ (RLS check)         │
  │                          │                      │                     │                     │
  │                          │                      │                     │ Trigger:            │
  │                          │                      │                     │ - activity_log      │
  │                          │                      │                     │ - notification      │
  │                          │                      │                     │                     │
  │                          │                      │                     │ Broadcast change    │
  │                          │                      │                     ├────────────────────>│
  │                          │                      │                     │                     │
  │                          │                      │ Return new task     │                     │
  │                          │                      │<────────────────────┤                     │
  │                          │                      │                     │                     │
  │                          │ onSuccess:           │                     │                     │
  │                          │ - invalidate queries │                     │                     │
  │                          │ - show toast         │                     │                     │
  │                          │ - close modal        │                     │                     │
  │                          │                      │                     │                     │
  │ See new task in UI       │                      │                     │                     │
  │<─────────────────────────┤                      │                     │                     │
  │                          │                      │                     │                     │
  │                          │                      │                     │ Real-time update    │
  │                          │                      │                     │ to other clients    │
  │                          │<─────────────────────┴─────────────────────┴─────────────────────┤
  │                          │                      │                     │                     │
  │ All clients see update   │                      │                     │                     │
  │<─────────────────────────┤                      │                     │                     │
```

### AI Priority Suggestion Flow

```
System Scheduler        Edge Function          OpenAI API           Database
  │                          │                      │                     │
  │ Cron: every 4 hours      │                      │                     │
  ├─────────────────────────>│                      │                     │
  │                          │                      │                     │
  │                          │ Fetch pending tasks  │                     │
  │                          ├─────────────────────────────────────────>│
  │                          │                      │                     │
  │                          │ Get task context     │                     │
  │                          │ (dependencies,       │                     │
  │                          │  workload, history)  │                     │
  │                          │<─────────────────────────────────────────┤
  │                          │                      │                     │
  │                          │ Build AI prompt      │                     │
  │                          │                      │                     │
  │                          │ Call GPT-4 API       │                     │
  │                          ├─────────────────────>│                     │
  │                          │                      │                     │
  │                          │                      │ Analyze factors:    │
  │                          │                      │ - Deadline (30%)    │
  │                          │                      │ - Dependencies(25%) │
  │                          │                      │ - Workload (20%)    │
  │                          │                      │ - History (15%)     │
  │                          │                      │ - Age (10%)         │
  │                          │                      │                     │
  │                          │ Return suggestion    │                     │
  │                          │<─────────────────────┤                     │
  │                          │                      │                     │
  │                          │ Update task with     │                     │
  │                          │ ai_suggested_priority│                     │
  │                          ├─────────────────────────────────────────>│
  │                          │                      │                     │
  │                          │                      │                     │ UPDATE tasks
  │                          │                      │                     │ SET ai_suggested...
  │                          │                      │                     │
  │                          │ Success              │                     │
  │<─────────────────────────┤                      │                     │
```

### Authentication Flow

```
User                    Frontend               Supabase Auth         Database
  │                          │                      │                     │
  │ Enter credentials        │                      │                     │
  ├─────────────────────────>│                      │                     │
  │                          │                      │                     │
  │                          │ authService          │                     │
  │                          │ .signIn()            │                     │
  │                          ├─────────────────────>│                     │
  │                          │                      │                     │
  │                          │                      │ Verify credentials  │
  │                          │                      │                     │
  │                          │                      │ Generate JWT token  │
  │                          │                      │ (24h expiration)    │
  │                          │                      │                     │
  │                          │ Return session       │                     │
  │                          │ + JWT token          │                     │
  │                          │<─────────────────────┤                     │
  │                          │                      │                     │
  │                          │ Store in authStore   │                     │
  │                          │ (Zustand + persist)  │                     │
  │                          │                      │                     │
  │                          │ Fetch user profile   │                     │
  │                          ├─────────────────────────────────────────>│
  │                          │                      │                     │
  │                          │                      │                     │ SELECT * FROM users
  │                          │                      │                     │ WHERE id = ...
  │                          │                      │                     │ (RLS check)
  │                          │                      │                     │
  │                          │ Return user data     │                     │
  │                          │<─────────────────────────────────────────┤
  │                          │                      │                     │
  │ Redirect to dashboard    │                      │                     │
  │<─────────────────────────┤                      │                     │
  │                          │                      │                     │
  │ All API requests         │                      │                     │
  │ include JWT in header    │                      │                     │
  ├─────────────────────────>│                      │                     │
  │                          ├─────────────────────>│                     │
  │                          │                      │                     │
  │                          │                      │ Validate JWT        │
  │                          │                      │ Check expiration    │
  │                          │                      │                     │
  │                          │                      │ Auto-refresh if     │
  │                          │                      │ < 1 hour remaining  │
```

---

## 6. UI Navigation Flow

```
state "Home/Dashboard" as Home {
  [*] --> Home
  Home : View task summary
  Home : View upcoming deadlines
  Home : View AI recommendations
}

state "My Tasks" as MyTasks
state "Projects" as Projects {
  state "Project Detail" as ProjectDetail {
    state "Kanban View" as Kanban
    state "List View" as List
    state "Calendar View" as Calendar
  }
}
state "Team" as Team
state "Analytics" as Analytics
state "Settings" as Settings {
  state "Profile" as Profile
  state "Notifications" as NotifSettings
  state "Billing" as Billing
}

Home --> MyTasks : view my tasks
Home --> Projects : view projects
Home --> Team : view team
Home --> Analytics : view analytics
Home --> Settings : open settings

MyTasks --> Home : back to home
MyTasks --> Projects : switch to project

Projects --> Home : back to home
Projects --> ProjectDetail : select project

ProjectDetail --> Kanban : [default view]
ProjectDetail --> List : switch view
ProjectDetail --> Calendar : switch view
Kanban --> List : switch view
List --> Calendar : switch view
Calendar --> Kanban : switch view

ProjectDetail --> Projects : back to projects

Team --> Home : back to home
Analytics --> Home : back to home

Settings --> Profile : [default]
Settings --> NotifSettings : notifications tab
Settings --> Billing : billing tab
Profile --> NotifSettings : next tab
NotifSettings --> Billing : next tab
Billing --> Profile : back to profile

Settings --> Home : close settings
```

**Navigation Depth:** Maximum 3 levels (Home → Projects → Project Detail → Task Detail Modal)

**High-Frequency Functions Surfaced:**
- Quick add task (Cmd/Ctrl+K from anywhere)
- Global search (top nav, always visible)
- Notifications (top nav, always visible)
- View switcher (Kanban/List/Calendar in one click)

**Clear Way Back:**
- Breadcrumbs on every page
- Back button in modals
- Sidebar always shows current location
- Escape key closes modals/overlays

---

## 7. Anything UNCLEAR

### Technical Uncertainties

1. **AI Prioritization Behavior**
   - Should AI automatically apply priorities or always require user confirmation?
   - **Recommendation**: Start with manual confirmation, add auto-apply as opt-in feature later
   - How to handle conflicting priorities across multiple projects?
   - **Recommendation**: AI analyzes per-project first, then cross-project if user has multiple active projects

2. **Time Tracking Across Devices**
   - Should timer continue running if user closes browser?
   - **Recommendation**: Store active timer in database, sync across devices, show warning on close
   - How to handle simultaneous timers on multiple devices?
   - **Recommendation**: Only allow one active timer per user, stop previous if new one starts

3. **Real-time Performance at Scale**
   - What's the maximum number of concurrent WebSocket connections per project?
   - **Recommendation**: Start with 100 concurrent users per project, implement connection pooling if needed
   - How to handle real-time updates for very large teams (100+ members)?
   - **Recommendation**: Implement selective subscriptions (only subscribe to active project/tasks)

4. **Offline Capability**
   - Should we implement full offline mode with sync or just graceful degradation?
   - **Recommendation**: Phase 1 - graceful degradation with cached data, Phase 2 - full offline with sync queue

5. **Data Retention**
   - How long should we keep deleted tasks before permanent deletion?
   - **Recommendation**: 30 days in "trash", then permanent delete (with admin override for recovery)
   - Should Free tier users have access to full task history?
   - **Recommendation**: Free tier: 30 days history, Pro: unlimited, clearly communicated in pricing

### Business/Product Clarifications Needed

1. **Free Tier Limitations**
   - Is 100 tasks limit per team or per user?
   - **Recommendation**: Per team (more intuitive for collaboration)
   - Should archived tasks count toward the limit?
   - **Recommendation**: No, only active tasks count

2. **AI Feature Access**
   - Should Free tier get limited AI suggestions (e.g., 10 per month)?
   - **Recommendation**: No AI for Free tier (clear differentiator for Pro upgrade)

3. **Mobile Strategy**
   - PWA first or native apps?
   - **Recommendation**: PWA for MVP, native apps in Year 2 if traction is good

4. **Integration Priority**
   - Which integrations are must-have for launch?
   - **Recommendation**: Slack (highest demand), Google Calendar (productivity), GitHub (dev teams)

### Security Clarifications

1. **Data Export for Free Users**
   - Should Free tier users be able to export all their data?
   - **Recommendation**: Yes (GDPR compliance), but limit format to CSV only (Pro gets PDF, Excel)

2. **Team Member Removal**
   - What happens to tasks assigned to removed team members?
   - **Recommendation**: Reassign to team admin, notify in activity log

3. **SSO/SAML Timeline**
   - Is Enterprise SSO required for MVP or can it wait?
   - **Recommendation**: Not required for MVP, add in Phase 2 (Months 7-9) when targeting Enterprise

---

## Summary

This architecture document provides a comprehensive blueprint for building TaskFlow as a scalable, secure, and performant task management platform. Key highlights:

**Strengths:**
- ✅ Leverages Supabase for rapid development without sacrificing scalability
- ✅ Row-Level Security ensures multi-tenant data isolation
- ✅ Real-time features provide collaborative experience
- ✅ AI integration adds unique value proposition
- ✅ Type-safe architecture reduces bugs
- ✅ Optimistic UI updates provide instant feedback
- ✅ Clear separation of concerns (features, components, services)

**Implementation Priorities:**
1. **MVP (Months 1-3)**: Core task management, auth, real-time, basic UI
2. **Launch (Months 4-6)**: AI prioritization, time tracking, analytics, billing
3. **Post-Launch (Months 7-12)**: Advanced features, integrations, mobile optimization

**Next Steps:**
1. Set up development environment (Supabase project, Vercel project)
2. Initialize React project with TypeScript and Tailwind
3. Implement database schema and RLS policies
4. Build authentication flow
5. Create core task management features
6. Integrate AI prioritization
7. Implement real-time subscriptions
8. Add time tracking and analytics
9. Integrate Stripe for billing
10. Deploy to production

**Success Metrics:**
- Page load time: < 2 seconds
- Real-time latency: < 1 second
- Database query time: < 100ms (p95)
- Uptime: 99.9%
- User satisfaction: NPS > 50

This architecture is designed to scale from MVP to 50,000+ users while maintaining performance and security standards.
. ..