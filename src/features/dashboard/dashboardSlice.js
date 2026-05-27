// dashboardSlice.js
import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import API, { apiService } from "../../config/api";

// ---------------------- Async Thunk ---------------------- //
export const fetchDashboardData = createAsyncThunk(
  "dashboard/fetchData",
  async (token, thunkAPI) => {
    try {
      const res = await apiService.get(API.ENDPOINTS.DASHBOARD, {
        headers: { Authorization: `Bearer ${token}` },
      });

      return res.data.data; // ✅ already contains stats, messageAnalytics, activeCampaigns
    } catch (error) {
      return thunkAPI.rejectWithValue(error.response?.data || error.message);
    }
  }
);

// ---------------------- Slice ---------------------- //
const dashboardSlice = createSlice({
  name: "dashboard",
  initialState: {
    stats: {
      totalContacts: 0,
      activeTemplates: 0,
      latestTemplate:[],
      messagesSent: 0,
      deliveryRate: "0%",
    },
    messageAnalytics: {
      title: "",
      data: [],
    },
    activeCampaigns: {
      title: "",
      data: [],
    },
    loading: false,
    error: null,
  },
  reducers: {
    resetDashboard: (state) => {
      state.stats = { totalContacts: 0, activeTemplates: 0,latestTemplate:[], messagesSent: 0, deliveryRate: "0%" };
      state.messageAnalytics = { title: "", data: [] };
      state.activeCampaigns = { title: "", data: [] };
      state.loading = false;
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchDashboardData.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchDashboardData.fulfilled, (state, action) => {
        state.loading = false;
        state.stats = action.payload.stats;
        state.messageAnalytics = action.payload.messageAnalytics;
        state.activeCampaigns = action.payload.activeCampaigns;
       state.latestTemplate=action.payload.latestTemplate;
      })
      .addCase(fetchDashboardData.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload || "Failed to fetch dashboard data";
      });
  },
});

export const { resetDashboard } = dashboardSlice.actions;
export default dashboardSlice.reducer;
