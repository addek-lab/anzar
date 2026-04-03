import { createClient } from '@/lib/supabase/server'
import Link from 'next/link'
import { Star, MessageSquare } from 'lucide-react'
import ReviewActions from '@/components/admin/ReviewActions'

const STATUS_TABS = [
  { key: 'pending', label: 'En attente' },
  { key: 'approved', label: 'Approuvés' },
  { key: 'rejected', label: 'Rejetés' },
]

function StarRating({ rating }: { rating: number }) {
  return (
    <div className="flex items-center gap-0.5">
      {[1, 2, 3, 4, 5].map(i => (
        <Star
          key={i}
          className={`w-3.5 h-3.5 ${i <= rating ? 'text-[#E8A838] fill-[#E8A838]' : 'text-gray-200 fill-gray-200'}`}
        />
      ))}
      <span className="text-xs font-semibold text-gray-600 ml-1">{rating}/5</span>
    </div>
  )
}

export default async function AdminReviewsPage({
  searchParams,
}: {
  searchParams: Promise<{ status?: string; page?: string }>
}) {
  const { status: statusParam, page: pageParam } = await searchParams
  const activeStatus = statusParam ?? 'pending'
  const page = parseInt(pageParam ?? '0', 10)
  const limit = 20

  const supabase = await createClient()

  const { data: reviews, count } = await supabase
    .from('reviews')
    .select(`
      id,
      rating,
      comment,
      status,
      created_at,
      reviewer:profiles!reviews_reviewer_id_fkey(full_name),
      reviewed:profiles!reviews_reviewed_id_fkey(full_name),
      job:jobs(id, status)
    `, { count: 'exact' })
    .eq('status', activeStatus)
    .order('created_at', { ascending: activeStatus === 'pending' })
    .range(page * limit, page * limit + limit - 1)

  const totalPages = Math.ceil((count ?? 0) / limit)

  return (
    <div className="space-y-6 max-w-4xl">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Modération des avis</h1>
        <p className="text-sm text-gray-500 mt-1">
          {count ?? 0} avis {activeStatus === 'pending' ? 'en attente' : activeStatus === 'approved' ? 'approuvés' : 'rejetés'}
        </p>
      </div>

      {/* Filter tabs */}
      <div className="border-b border-gray-200 flex gap-1">
        {STATUS_TABS.map(tab => (
          <Link
            key={tab.key}
            href={`/admin/reviews?status=${tab.key}`}
            className={`text-sm font-medium px-4 py-2.5 border-b-2 transition-colors ${
              activeStatus === tab.key
                ? 'border-[#1A6B4A] text-[#1A6B4A]'
                : 'border-transparent text-gray-500 hover:text-gray-700'
            }`}
          >
            {tab.label}
          </Link>
        ))}
      </div>

      {/* Reviews list */}
      {reviews && reviews.length > 0 ? (
        <div className="space-y-4">
          {reviews.map((review: any) => (
            <div key={review.id} className="bg-white rounded-2xl shadow-sm border border-gray-100 p-5">
              {/* Top row */}
              <div className="flex items-start justify-between gap-4 mb-3">
                <div>
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="text-sm font-semibold text-gray-900">
                      {review.reviewer?.full_name ?? 'Utilisateur inconnu'}
                    </span>
                    <span className="text-xs text-gray-400">à propos de</span>
                    <span className="text-sm font-semibold text-[#1A6B4A]">
                      {review.reviewed?.full_name ?? 'Artisan inconnu'}
                    </span>
                  </div>
                  <div className="flex items-center gap-3 mt-1.5">
                    <StarRating rating={review.rating} />
                    <span className="text-xs text-gray-400">
                      {new Date(review.created_at).toLocaleDateString('fr-MA', {
                        day: '2-digit', month: 'long', year: 'numeric'
                      })}
                    </span>
                  </div>
                </div>

                <div className="flex-shrink-0">
                  {review.status === 'pending' ? (
                    <span className="bg-amber-100 text-amber-700 text-xs font-semibold px-2.5 py-1 rounded-full">
                      En attente
                    </span>
                  ) : review.status === 'approved' ? (
                    <span className="bg-emerald-100 text-emerald-700 text-xs font-semibold px-2.5 py-1 rounded-full">
                      Approuvé
                    </span>
                  ) : (
                    <span className="bg-red-100 text-red-600 text-xs font-semibold px-2.5 py-1 rounded-full">
                      Rejeté
                    </span>
                  )}
                </div>
              </div>

              {/* Comment */}
              {review.comment ? (
                <div className="bg-gray-50 rounded-xl p-3 mb-4">
                  <div className="flex items-start gap-2">
                    <MessageSquare className="w-3.5 h-3.5 text-gray-400 mt-0.5 flex-shrink-0" />
                    <p className="text-sm text-gray-700 leading-relaxed">{review.comment}</p>
                  </div>
                </div>
              ) : (
                <p className="text-sm text-gray-400 italic mb-4">Aucun commentaire écrit</p>
              )}

              {/* Actions */}
              <ReviewActions reviewId={review.id} currentStatus={review.status} />
            </div>
          ))}
        </div>
      ) : (
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-12 text-center">
          <Star className="w-10 h-10 text-gray-200 mx-auto mb-3" />
          <p className="font-medium text-gray-500">Aucun avis {activeStatus === 'pending' ? 'en attente' : activeStatus === 'approved' ? 'approuvé' : 'rejeté'}</p>
          <p className="text-sm text-gray-400 mt-1">
            {activeStatus === 'pending' ? 'Tous les avis ont été traités.' : 'Aucun avis dans cette catégorie.'}
          </p>
        </div>
      )}

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex items-center justify-between">
          <p className="text-sm text-gray-500">
            Page {page + 1} sur {totalPages}
          </p>
          <div className="flex gap-2">
            {page > 0 && (
              <Link
                href={`/admin/reviews?status=${activeStatus}&page=${page - 1}`}
                className="px-4 py-2 text-sm font-medium text-gray-600 bg-white border border-gray-200 rounded-xl hover:bg-gray-50 transition"
              >
                ← Précédent
              </Link>
            )}
            {page < totalPages - 1 && (
              <Link
                href={`/admin/reviews?status=${activeStatus}&page=${page + 1}`}
                className="px-4 py-2 text-sm font-medium text-[#1A6B4A] bg-white border border-[#1A6B4A] rounded-xl hover:bg-[#1A6B4A]/5 transition"
              >
                Suivant →
              </Link>
            )}
          </div>
        </div>
      )}
    </div>
  )
}
