import type { User, TestProfile } from '@types';

/**
 * Calculate a compatibility score between a user and a test profile
 * based on music preferences (genres and artists).
 * 
 * @param user The current user
 * @param profile The test profile to match against
 * @returns A score between 0 and 100
 */
export function calculateMatchScore(user: User, profile: TestProfile): number {
    if (!user.top_genres || !user.top_artists || !profile.top_genres || !profile.top_artists) {
        return 0;
    }

    // 1. Genre Overlap (60% of score)
    const userGenres = user.top_genres.map(g => g.toLowerCase());
    const profileGenres = profile.top_genres.map(g => g.toLowerCase());

    // Find shared genres
    const sharedGenres = userGenres.filter(g => profileGenres.includes(g));

    // Calculate Jaccard index for genres
    const uniqueGenres = new Set([...userGenres, ...profileGenres]);
    const genreScore = uniqueGenres.size > 0
        ? (sharedGenres.length / uniqueGenres.size) * 100
        : 0;

    // 2. Artist Overlap (40% of score)
    const userArtists = user.top_artists.map(a => a.toLowerCase());
    const profileArtists = profile.top_artists.map(a => a.toLowerCase());

    const sharedArtists = userArtists.filter(a => profileArtists.includes(a));

    // Artist matches are rarer, so we give high points for even a few matches
    // 1 match = 50%, 2+ matches = 100% of the artist component
    const artistScore = sharedArtists.length > 0
        ? Math.min(sharedArtists.length * 50, 100)
        : 0;

    // Weighted total
    const totalScore = (genreScore * 0.6) + (artistScore * 0.4);

    return Math.round(totalScore);
}

/**
 * Get shared interests for display
 */
export function getSharedInterests(user: User, profile: TestProfile): { genres: string[], artists: string[] } {
    if (!user.top_genres || !user.top_artists || !profile.top_genres || !profile.top_artists) {
        return { genres: [], artists: [] };
    }

    const userGenresLower = user.top_genres.map(g => g.toLowerCase());
    const userArtistsLower = user.top_artists.map(a => a.toLowerCase());

    const sharedGenres = profile.top_genres.filter(g => userGenresLower.includes(g.toLowerCase()));
    const sharedArtists = profile.top_artists.filter(a => userArtistsLower.includes(a.toLowerCase()));

    return {
        genres: sharedGenres,
        artists: sharedArtists
    };
}
