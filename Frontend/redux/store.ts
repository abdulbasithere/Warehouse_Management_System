import { configureStore } from '@reduxjs/toolkit';
import { persistStore, persistReducer, FLUSH, REHYDRATE, PAUSE, PERSIST, PURGE, REGISTER } from 'redux-persist';
import localforage from 'localforage';
import rootReducer from './rootReducer';

// Configure localforage to use IndexedDB
localforage.config({
    name: 'WMS_App',
    storeName: 'wms_state',
    driver: localforage.INDEXEDDB
});

const persistConfig = {
    key: 'root',
    storage: localforage,
    whitelist: ['auth', 'theme'], // Only persist these slices
};

const persistedReducer = persistReducer(persistConfig, rootReducer);

export const store = configureStore({
    reducer: persistedReducer,
    middleware: (getDefaultMiddleware) =>
        getDefaultMiddleware({
            serializableCheck: {
                ignoredActions: [FLUSH, REHYDRATE, PAUSE, PERSIST, PURGE, REGISTER],
            },
        }),
});

export const persistor = persistStore(store);

export type AppDispatch = typeof store.dispatch;
export type RootState = ReturnType<typeof store.getState>;
