export type Locale = 'en' | 'fa'
export type Theme = 'light' | 'dark'

export type ContactStatus = 'lead' | 'customer' | 'partner' | 'churned'

export type DealStage =
  | 'lead'
  | 'qualified'
  | 'proposal'
  | 'negotiation'
  | 'won'
  | 'lost'

export type TaskPriority = 'low' | 'medium' | 'high'

export type ActivityKind = 'call' | 'email' | 'meeting' | 'note' | 'deal'

export interface Company {
  id: string
  name: string
  industry: string
  website: string
  city: string
  employees: number
  annualRevenue: number
}

export interface Contact {
  id: string
  name: string
  email: string
  phone: string
  role: string
  companyId: string
  status: ContactStatus
  owner: string
  tags: string[]
  notes: string
  createdAt: string
}

export interface Deal {
  id: string
  title: string
  companyId: string
  contactId: string
  value: number
  stage: DealStage
  probability: number
  closeDate: string
  owner: string
}

export interface Task {
  id: string
  title: string
  dueDate: string
  priority: TaskPriority
  done: boolean
  owner: string
}

export interface Activity {
  id: string
  kind: ActivityKind
  /** Translation key so the feed can be rendered in both languages. */
  message: string
  /** Values interpolated into the message key. */
  params: Record<string, string>
  at: string
  actor: string
}

export type TranslateParams = Record<string, string | number>
