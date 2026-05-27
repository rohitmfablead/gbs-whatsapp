import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import API, { apiService } from "../../config/api";

// Fetch packages
export const fetchPackages = createAsyncThunk(
  "packages/fetchPackages",
  async (token, thunkAPI) => {
    try {
      const response = await apiService.get(API.ENDPOINTS.PACKAGES, {
        headers: { Authorization: `Bearer ${token}` },
      });
      return response?.data?.data || [];
    } catch (err) {
      console.error("Fetch Packages Error:", err.response || err);
      return thunkAPI.rejectWithValue(
        err.response?.data?.message || err.message || "Failed to fetch packages"
      );
    }
  }
);

// Fetch plan history
export const fetchPlan = createAsyncThunk(
  "packages/fetchPlan",
  async ({ token, id }, thunkAPI) => {
    try {
      const response = await apiService.get(`${API.ENDPOINTS.PLAN_HISTORY}/${id}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      return response?.data?.data || [];
    } catch (err) {
      console.error("Fetch Plan Error:", err.response || err);
      return thunkAPI.rejectWithValue(
        err.response?.data?.message || err.message || "Failed to fetch plan history"
      );
    }
  }
);


const packagesSlice = createSlice({
  name: "packages",
  initialState: {
    data: [],
    planData: [],
    loading: false,
    error: null,
  },
  reducers: {},
  extraReducers: (builder) => {
    builder
      // Packages
      .addCase(fetchPackages.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchPackages.fulfilled, (state, action) => {
        state.loading = false;
        state.data = action.payload;
      })
      .addCase(fetchPackages.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      // Plan history
      .addCase(fetchPlan.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchPlan.fulfilled, (state, action) => {
        state.loading = false;
        state.planData = action.payload; // ✅ now stores in planData
      })
      .addCase(fetchPlan.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      });
  },
});

export default packagesSlice.reducer;
