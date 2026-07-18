export interface LikeableSketch {
  id: number
  likes: number
}

// Module-level so every caller shares the same reactive state (one localStorage key)
const likedIds = useLocalStorage<number[]>('ecran-gallery-likes', [])

export function useSketchLikes() {
  function isLiked(id: number) {
    return likedIds.value.includes(id)
  }

  /** Toggles the like with an optimistic update, reconciles with the server. Returns the new liked state. */
  async function toggleLike(sketch: LikeableSketch) {
    const nowLiked = !isLiked(sketch.id)

    // Optimistic update
    sketch.likes = Math.max(0, sketch.likes + (nowLiked ? 1 : -1))
    likedIds.value = nowLiked
      ? [...likedIds.value, sketch.id]
      : likedIds.value.filter(i => i !== sketch.id)

    try {
      const res = await $fetch<{ likes: number }>(`/api/sketches/${sketch.id}/like`, {
        method: 'POST',
        body: { liked: nowLiked },
      })
      sketch.likes = res.likes
    }
    catch {
      // Rollback on failure
      sketch.likes = Math.max(0, sketch.likes + (nowLiked ? -1 : 1))
      likedIds.value = nowLiked
        ? likedIds.value.filter(i => i !== sketch.id)
        : [...likedIds.value, sketch.id]
    }

    return nowLiked
  }

  /** Like only (never unlike) — used by the double-click gesture. */
  async function like(sketch: LikeableSketch) {
    if (isLiked(sketch.id)) return true
    return toggleLike(sketch)
  }

  return { isLiked, toggleLike, like }
}
