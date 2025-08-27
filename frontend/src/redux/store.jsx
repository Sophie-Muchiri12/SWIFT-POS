import { configureStore } from "@reduxjs/toolkit";
import { persistStore, persistReducer } from "redux-persist";
import storage from "redux-persist/lib/storage";
import { combineReducers } from "redux";
import persistedAuthReducer from "./slices/authenticationSlice";
import itemsReducer from "./slices/itemSlice"

const persistConfig = {
  key: "root",
  storage,
  whitelist: ["auth"], 
};

// Combine reducers
const rootReducer = combineReducers({
    auth: persistedAuthReducer,
    items: itemsReducer,
});

// Persisted reducer
const persistedReducer = persistReducer(persistConfig, rootReducer);

// Configure store
const store = configureStore({
  reducer: persistedReducer,
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({
      serializableCheck: {
        ignoredActions: ["persist/PERSIST"], 
      },
    }),
});

// Create persistor
export const persistor = persistStore(store);
export default store;