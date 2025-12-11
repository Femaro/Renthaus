import { useState, useEffect } from 'react'
import { collection, query, where, getDocs, QueryConstraint } from 'firebase/firestore'
import { db } from '@/lib/firebase/config'
import { Product } from '@/lib/firebase/types'

export function useProducts(constraints: QueryConstraint[] = []) {
  const [products, setProducts] = useState<(Product & { id: string })[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<Error | null>(null)

  useEffect(() => {
    loadProducts()
  }, [])

  const loadProducts = async () => {
    try {
      let q = query(collection(db, 'products'), ...constraints)
      const snapshot = await getDocs(q)
      setProducts(snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() } as Product & { id: string })))
      setError(null)
    } catch (err) {
      setError(err as Error)
    } finally {
      setLoading(false)
    }
  }

  return { products, loading, error, refetch: loadProducts }
}

