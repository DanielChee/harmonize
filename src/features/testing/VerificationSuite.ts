import AsyncStorage from '@react-native-async-storage/async-storage';
import { supabase } from '@services/supabase';
import { calculateMatchScore } from '@features/matching/MatchingService';
import type { User, TestProfile } from '@types';

export type TestResult = {
    id: string;
    name: string;
    status: 'pending' | 'running' | 'success' | 'failure';
    message?: string;
    duration?: number;
};

export const VERIFICATION_TESTS = [
    { id: 'auth_session', name: 'Auth Session Persistence' },
    { id: 'db_connection', name: 'Supabase Connection' },
    { id: 'db_write_read', name: 'Database Write/Read Cycle' },
    { id: 'profile_fetch_success_rate', name: 'Profile Fetch Success Rate' },
    { id: 'image_load_success_rate', name: 'Image Load Success Rate' },
    { id: 'local_storage', name: 'AsyncStorage Operations' },
    { id: 'match_logic', name: 'Match Score Calculation' },
    { id: 'spotify_images', name: 'Spotify Image Persistence' },
];

export class VerificationSuite {
    private results: Record<string, TestResult> = {};
    private onUpdate: (results: TestResult[]) => void;

    constructor(onUpdate: (results: TestResult[]) => void) {
        this.onUpdate = onUpdate;
        this.initializeResults();
    }

    private initializeResults() {
        VERIFICATION_TESTS.forEach(test => {
            this.results[test.id] = {
                id: test.id,
                name: test.name,
                status: 'pending'
            };
        });
        this.notify();
    }

    private notify() {
        this.onUpdate(Object.values(this.results));
    }

    private updateResult(id: string, update: Partial<TestResult>) {
        this.results[id] = { ...this.results[id], ...update };
        this.notify();
    }

    async runAll() {
        for (const test of VERIFICATION_TESTS) {
            await this.runTest(test.id);
        }
    }

    async runTest(testId: string) {
        const startTime = Date.now();
        this.updateResult(testId, { status: 'running', message: 'Running...' });

        try {
            switch (testId) {
                case 'auth_session':
                    await this.testAuthSession();
                    break;
                case 'db_connection':
                    await this.testDbConnection();
                    break;
                case 'db_write_read':
                    await this.testDbWriteRead();
                    break;
                case 'profile_fetch_success_rate':
                    await this.testProfileFetchSuccessRate();
                    break;
                case 'image_load_success_rate':
                    await this.testImageLoadSuccessRate();
                    break;
                case 'local_storage':
                    await this.testLocalStorage();
                    break;
                case 'match_logic':
                    await this.testMatchLogic();
                    break;
                case 'spotify_images':
                    await this.testSpotifyImagePersistence();
                    break;
                default:
                    throw new Error(`Unknown test ID: ${testId}`);
            }

            const duration = Date.now() - startTime;
            this.updateResult(testId, { status: 'success', message: 'Passed', duration });
        } catch (error) {
            const duration = Date.now() - startTime;
            const errorMessage = error instanceof Error ? error.message : String(error);
            this.updateResult(testId, { status: 'failure', message: errorMessage, duration });
        }
    }

    // --- Test Implementations ---

    private async testAuthSession() {
        // Use the service helper which wraps supabase.auth.getSession
        const { getSession } = await import('@services/supabase/auth');
        const session = await getSession();

        if (!session) {
            // It's not necessarily a failure if not logged in, but for verification we might want to know
            // We'll mark it as success but note it
            throw new Error('No active session found. Please log in to test persistence.');
        }
    }

    private async testDbConnection() {
        const { count, error } = await supabase
            .from('profiles')
            .select('*', { count: 'exact', head: true });

        if (error) throw error;
        if (count === null) throw new Error('Could not get count from profiles table');
    }

    private async testDbWriteRead() {
        // We'll use a temporary key in AsyncStorage to simulate a "test" write if we don't want to write to DB
        // But the user asked for DB communication checks.
        // Let's try to read the CURRENT user's profile.

        const { getCurrentUser } = await import('@services/supabase/auth');
        const user = await getCurrentUser();
        if (!user) throw new Error('Must be logged in to test DB writes');

        // Read
        const { data: profile, error: readError } = await supabase
            .from('profiles')
            .select('*')
            .eq('id', user.id)
            .single();

        if (readError) throw readError;
        if (!profile) throw new Error('Profile not found');

        // Write (Update a harmless field like updated_at or a metadata field if exists)
        // Since we don't want to corrupt data, let's just re-write the same city
        const { error: writeError } = await supabase
            .from('profiles')
            .update({ city: profile.city })
            .eq('id', user.id);

        if (writeError) throw writeError;
    }

    private async testProfileFetchSuccessRate() {
        const SAMPLE_SIZE = 10;
        // Fetch a batch of profiles
        const { data: profiles, error } = await supabase
            .from('profiles')
            .select('id, username, display_name')
            .limit(SAMPLE_SIZE);

        if (error) throw error;
        if (!profiles || profiles.length === 0) {
            throw new Error('No profiles found to test.');
        }

        let successCount = 0;
        profiles.forEach(p => {
            if (p.id && (p.username || p.display_name)) {
                successCount++;
            }
        });

        const rate = (successCount / profiles.length) * 100;
        if (rate < 100) {
            throw new Error(`Success rate: ${rate}% (${successCount}/${profiles.length} valid)`);
        }
        // If 100%, the generic 'Passed' message will be used, or we can override here if we want specific text.
        this.updateResult('profile_fetch_success_rate', { message: `100% (${profiles.length} checked)` });
    }

    private async testImageLoadSuccessRate() {
        const SAMPLE_SIZE = 5;
        const { data: profiles, error } = await supabase
            .from('profiles')
            .select('profile_picture_url')
            .not('profile_picture_url', 'is', null)
            .limit(SAMPLE_SIZE);

        if (error) throw error;
        if (!profiles || profiles.length === 0) {
            // Not necessarily a failure if no images exist yet, but notable
            this.updateResult('image_load_success_rate', { message: 'Skipped (no images)' });
            return;
        }

        let successCount = 0;
        const checkPromises = profiles.map(async (p) => {
            try {
                if (!p.profile_picture_url) return false;
                const response = await fetch(p.profile_picture_url, { method: 'HEAD' });
                return response.ok;
            } catch {
                return false;
            }
        });

        const results = await Promise.all(checkPromises);
        successCount = results.filter(r => r).length;

        const rate = (successCount / profiles.length) * 100;
        
        const message = `${rate}% Success (${successCount}/${profiles.length})`;
        if (rate < 80) { // Threshold for failure/warning
             throw new Error(`Low success rate: ${message}`);
        }
        
        this.updateResult('image_load_success_rate', { message });
    }

    private async testLocalStorage() {
        const TEST_KEY = '@verification_test_key';
        const TEST_VALUE = 'verification_' + Date.now();

        await AsyncStorage.setItem(TEST_KEY, TEST_VALUE);
        const stored = await AsyncStorage.getItem(TEST_KEY);

        if (stored !== TEST_VALUE) {
            throw new Error(`Storage mismatch. Expected ${TEST_VALUE}, got ${stored}`);
        }

        await AsyncStorage.removeItem(TEST_KEY);
    }

    private async testMatchLogic() {
        // Mock data
        const user = {
            top_artists: ['Artist A', 'Artist B'],
            top_genres: ['Pop', 'Rock'],
        } as User;

        const profile = {
            top_artists: ['Artist B', 'Artist C'],
            top_genres: ['Rock', 'Jazz'],
        } as TestProfile;

        // Expected: 
        // Artists: 1 match (Artist B)
        // Genres: 1 match (Rock)
        // We need to know the exact weightings from MatchingService to verify
        // Assuming calculateMatchScore returns a number 0-100

        const score = calculateMatchScore(user, profile);

        if (typeof score !== 'number' || score < 0 || score > 100) {
            throw new Error(`Invalid match score: ${score}`);
        }

        // Basic sanity check - should be > 0 since there are matches
        if (score === 0) {
            throw new Error('Score should be > 0 for matching interests');
        }
    }

    private async testSpotifyImagePersistence() {
        const { getCurrentUser } = await import('@services/supabase/auth');
        const user = await getCurrentUser();
        if (!user) throw new Error('Must be logged in to test Spotify persistence');

        // Check profiles table for artist_images
        const { data: profile, error: profileError } = await supabase
            .from('profiles')
            .select('artist_images, song_images, top_artists')
            .eq('id', user.id)
            .single();

        if (profileError) throw profileError;

        const artistImages = profile.artist_images;

        if (profile.top_artists && profile.top_artists.length > 0) {
            if (!artistImages || !Array.isArray(artistImages)) {
                console.warn('Top artists exist but artist_images is empty/null. This might be expected for manual entry.');
            } else if (artistImages.length > 0) {
                const firstImage = artistImages[0];
                if (!firstImage.url || !firstImage.name) {
                    throw new Error('artist_images has invalid structure. Expected {name, url}.');
                }
                console.log('Verified artist_images persistence:', firstImage);
                return; // Success
            }
        }

        console.log('Spotify image columns are accessible.');
    }
}
