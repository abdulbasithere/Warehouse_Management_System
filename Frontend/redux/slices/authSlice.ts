import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';
import { User } from '../../types';

interface AuthState {
    user: User | null;
    loading: boolean;
    error: string | null;
}

const initialState: AuthState = {
    user: null, // This will be hydrated from persistence
    loading: false,
    error: null,
};

// Mapped from existing AuthContext.tsx verify logic
export const fetchCurrentUser = createAsyncThunk(
    'auth/fetchCurrentUser',
    async (_, { rejectWithValue }) => {
        try {
            const res = await fetch('http://localhost:5000/api/auth/me', { credentials: 'include' });
            if (!res.ok) throw new Error('Session expired');
            const data = await res.json();
            return {
                id: data.UserId,
                name: data.FullName,
                email: data.Email,
                role: data.userRole === 'admin' ? 'MASTER' : (data.userRole.toUpperCase() as any)
            } as User;
        } catch (e: any) {
            return rejectWithValue(e.message);
        }
    }
);

// Mapped from existing AuthContext.tsx login logic
export const loginUser = createAsyncThunk(
    'auth/loginUser',
    async ({ email, pass }: { email: string; pass: string }, { rejectWithValue }) => {
        try {
            const response = await fetch('http://localhost:5000/api/auth/login', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ Email: email, Password: pass }),
                credentials: 'include'
            });

            if (!response.ok) throw new Error('Invalid credentials');

            const data = await response.json();
            return {
                id: data.user.id,
                name: data.user.name,
                email: email,
                role: data.user.role === 'admin' ? 'MASTER' : (data.user.role.toUpperCase() as any)
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
            const response = await fetch('http://localhost:5000/api/auth/logout', {
                method: 'POST',
                credentials: 'include'
            });
            if (!response.ok) throw new Error('Logout failed');
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
            .addCase(fetchCurrentUser.fulfilled, (state, action: PayloadAction<User>) => {
                state.user = action.payload;
            })
            .addCase(fetchCurrentUser.rejected, (state) => {
                state.user = null;
            })
            .addCase(logoutUser.fulfilled, (state) => {
                state.user = null;
            });
    },
});

export const { logout } = authSlice.actions;
export default authSlice.reducer;
