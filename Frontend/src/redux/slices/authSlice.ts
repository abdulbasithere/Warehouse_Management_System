import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';
import { User } from '../../types';
import { apiFetch } from '../../api/baseFetcher';

interface AuthState {
    user: User | null;
    loading: boolean;
    isInitialized: boolean;
    error: string | null;
}

const initialState: AuthState = {
    user: null, // This will be hydrated from persistence
    loading: false,
    isInitialized: false,
    error: null,
};

// Mapped from existing AuthContext.tsx verify logic
export const fetchCurrentUser = createAsyncThunk(
    'auth/fetchCurrentUser',
    async (_, { rejectWithValue }) => {
        try {
            const data = await apiFetch('/auth/me');
            return {
                id: data.id || data.UserId || data.userId,
                fullName: data.fullName || data.name || data.FullName,
                email: data.email || data.Email,
                userRole: (data.userRole || data.role || 'picker').toLowerCase() as any,
                isActive: data.isActive !== false
            } as User;
        } catch (e: any) {
            return rejectWithValue(e.message);
        }
    }
);

// Mapped from existing AuthContext.tsx login logic
export const loginUser = createAsyncThunk(
    'auth/loginUser',
    async ({ identifier, password }: { identifier: string; password: string }, { rejectWithValue }) => {
        try {
            const isEmail = identifier.includes('@');
            const bodyPayload = isEmail 
                ? { email: identifier, password: password }
                : { userId: identifier, password: password };

            const data = await apiFetch('/auth/login', {
                method: 'POST',
                body: JSON.stringify(bodyPayload),
            });

            return {
                id: data.user.id || data.user.userId,
                fullName: data.user.fullName || data.user.name,
                email: data.user.email || (isEmail ? identifier : ''),
                userRole: (data.user.userRole || data.user.role || (data.user.roles && data.user.roles[0]) || 'picker').toLowerCase() as any,
                isActive: data.user.isActive !== false
            } as User;
        } catch (e: any) {
            return rejectWithValue(e.message);
        }
    }
);

export const logoutUser = createAsyncThunk(
    'auth/logoutUser',
    async (_, { rejectWithValue }) => {
        try {
            await apiFetch('/auth/logout', {
                method: 'POST',
            });
            return null;
        } catch (e: any) {
            return rejectWithValue(e.message);
        }
    }
);

const authSlice = createSlice({
    name: 'auth',
    initialState,
    reducers: {
        logout: (state) => {
            state.user = null;
            state.error = null;
        },
        updateUserProfile: (state, action: PayloadAction<{ fullName: string; email: string }>) => {
            if (state.user) {
                state.user.fullName = action.payload.fullName;
                state.user.email = action.payload.email;
            }
        }
    },
    extraReducers: (builder) => {
        builder
            .addCase(loginUser.pending, (state) => {
                state.loading = true;
                state.error = null;
            })
            .addCase(loginUser.fulfilled, (state, action: PayloadAction<User>) => {
                state.loading = false;
                state.user = action.payload;
            })
            .addCase(loginUser.rejected, (state, action) => {
                state.loading = false;
                state.error = action.payload as string;
            })
            .addCase(fetchCurrentUser.pending, (state) => {
                state.loading = true;
                state.error = null;
            })
            .addCase(fetchCurrentUser.fulfilled, (state, action: PayloadAction<User>) => {
                state.loading = false;
                state.isInitialized = true;
                state.user = action.payload;
            })
            .addCase(fetchCurrentUser.rejected, (state) => {
                state.loading = false;
                state.isInitialized = true;
                // Do NOT wipe state.user here automatically on network failure.
                // If the token is truly invalid, the API calls will fail with 401,
                // which should ideally trigger a global logout, but for persistence sake, we keep the user.
            })
            .addCase(logoutUser.fulfilled, (state) => {
                state.user = null;
            });
    },
});

export const { logout, updateUserProfile } = authSlice.actions;
export default authSlice.reducer;
