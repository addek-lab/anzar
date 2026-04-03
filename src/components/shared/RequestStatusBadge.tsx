'use client'

import { useTranslations } from 'next-intl'
import type { RequestStatus } from '@/types'

const statusColors: Record<RequestStatus, string> = {
  open: 'bg-yellow-100 text-yellow-700',
  matched: 'bg-green-100 text-green-700',
  in_progress: 'bg-blue-100 text-blue-700',
  completed: 'bg-gray-100 text-gray-600',
  expired: 'bg-red-100 text-red-600',
  cancelled: 'bg-gray-100 text-gray-500',
}

export default function RequestStatusBadge({ status }: { status: RequestStatus }) {
  const t = useTranslations('customer.requestStatus')
  return (
    <span className={`text-xs font-medium px-2.5 py-1 rounded-full ${statusColors[status]}`}>
      {t(status)}
    </span>
  )
}
