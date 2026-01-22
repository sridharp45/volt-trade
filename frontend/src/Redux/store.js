import { configureStore } from "@reduxjs/toolkit";
import { reducer } from "./Reducer";

export const store = configureStore({
    reducer,
    middleware: (getDefaultMiddleware) => getDefaultMiddleware({
        immutableCheck: false,
        serializableCheck: false,
    })
});

export default store;