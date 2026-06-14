export function formatCurrency(amount: number) {
  return new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', maximumFractionDigits: 0 }).format(amount)
}

export function formatDate(date: Date | string | null | undefined) {
  if (!date) return '—'
  return new Date(date).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })
}

export function daysUntil(date: Date | string | null | undefined): number | null {
  if (!date) return null
  const diff = new Date(date).getTime() - Date.now()
  return Math.ceil(diff / (1000 * 60 * 60 * 24))
}

export function generateAssetTag(): string {
  const year = new Date().getFullYear().toString().slice(2)
  const rand = Math.random().toString(36).substring(2, 6).toUpperCase()
  return `IT-${year}-${rand}`
}

export const STATUS_COLORS: Record<string, string> = {
  AVAILABLE:   'bg-emerald-500/10 text-emerald-400 ring-1 ring-emerald-500/20',
  ASSIGNED:    'bg-blue-500/10 text-blue-400 ring-1 ring-blue-500/20',
  MAINTENANCE: 'bg-amber-500/10 text-amber-400 ring-1 ring-amber-500/20',
  RETIRED:     'bg-zinc-500/10 text-zinc-400 ring-1 ring-zinc-500/20',
  LOST:        'bg-red-500/10 text-red-400 ring-1 ring-red-500/20',
}

export const LIFECYCLE_COLORS: Record<string, string> = {
  PROCUREMENT: 'bg-purple-500/10 text-purple-400',
  ACTIVE:      'bg-emerald-500/10 text-emerald-400',
  MAINTENANCE: 'bg-amber-500/10 text-amber-400',
  DISPOSAL:    'bg-orange-500/10 text-orange-400',
  RETIRED:     'bg-zinc-500/10 text-zinc-400',
}

export const ROLE_COLORS: Record<string, string> = {
  ADMIN:   'bg-rose-500/10 text-rose-400 ring-1 ring-rose-500/20',
  MANAGER: 'bg-violet-500/10 text-violet-400 ring-1 ring-violet-500/20',
  VIEWER:  'bg-zinc-500/10 text-zinc-400 ring-1 ring-zinc-500/20',
}

export const ASSET_TYPES = ['LAPTOP','DESKTOP','PHONE','TABLET','MONITOR','KEYBOARD','MOUSE','PRINTER','SERVER','NETWORKING','SOFTWARE','OTHER']
export const ACCESSORY_TYPES = ASSET_TYPES.filter(type => !['LAPTOP','PHONE','TABLET','MONITOR'].includes(type))
export function isAccessoryType(type?: string | null) {
  return !!type && !['LAPTOP','PHONE','TABLET','MONITOR'].includes(type)
}
export const ASSET_STATUSES = ['AVAILABLE','ASSIGNED','MAINTENANCE','RETIRED','LOST']
export const LIFECYCLE_STAGES = ['PROCUREMENT','ACTIVE','MAINTENANCE','DISPOSAL','RETIRED']
