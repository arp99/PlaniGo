import { configureStore } from "@reduxjs/toolkit";
import sprintReducer from "./features/SprintPlanning/SprintPlanningSlice"

export const Store = configureStore({
  reducer: {
    sprintPlanning: sprintReducer,
  },
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({
      serializableCheck: false,
    }),
});