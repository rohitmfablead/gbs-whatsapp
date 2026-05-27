import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import API, { apiService } from "../../config/api";

// ✅ Thunk to fetch reports
export const fetchReports = createAsyncThunk(
  "reports/fetchReports",
  async ({ token, filters }, thunkAPI) => {
    try {
      const response = await apiService.get(API.ENDPOINTS.REPORTS, {
        headers: { Authorization: `Bearer ${token}` },
        params: filters, // Pass filters as query parameters
      });

      // Ensure correct structure: response.data.data is expected
      return response.data || [];
    } catch (err) {
      console.error("Fetch Reports Error:", err);
      return thunkAPI.rejectWithValue(
        err.response?.data?.message || err.message || "Failed to fetch reports"
      );
    }
  }
);

export const getReportById = createAsyncThunk(
  "reports/getReportById",
  async ({ token, id }, thunkAPI) => {
    try {
      const response = await apiService.get(`${API.ENDPOINTS.REPORTS}`, {
        headers: { Authorization: `Bearer ${token}` },
        params: { bulk_id: id },
      });

      return response.data; // ✅ this JSON you shared
    } catch (err) {
      console.error("Error fetching report:", err);
      return thunkAPI.rejectWithValue(err.response?.data || err.message);
    }
  }
);



export const fetchRcapenight = createAsyncThunk(
  "reports/fetchRcapenight", // 👈 unique typePrefix (fixed)
  async ({ token, filters }, thunkAPI) => {
    try {
      const response = await apiService.get(API.ENDPOINTS.campaigns, {
        headers: { Authorization: `Bearer ${token}` },
        params: filters, // ✅ includes status + page
      });
      return response.data || [];
    } catch (err) {
      return thunkAPI.rejectWithValue(
        err.response?.data?.message || err.message || "Failed to fetch campaigns"
      );
    }
  }
);

// ✅ Edit Scheduled Campaign (send JSON)
export const editScheduledCampaign = createAsyncThunk(
  "reports/editScheduledCampaign",
  async ({ token, id, payload }, thunkAPI) => {
    try {
      const response = await apiService.post(
        `${API.ENDPOINTS.edit_scheduled}/${id}/update`,
        payload,
        {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        }
      );
      return response.data;
    } catch (err) {
      return thunkAPI.rejectWithValue(
        err.response?.data?.message || err.message || "Failed to edit campaign"
      );
    }
  }
);


// ✅ Delete Scheduled Campaign
export const deleteScheduledCampaign = createAsyncThunk(
  "reports/deleteScheduledCampaign",
  async ({ token, id }, thunkAPI) => {
    try {
      const formData = new FormData();
      formData.append("id", id);

      const response = await apiService.delete(
        `${API.ENDPOINTS.delete_scheduled}/${id}`,
        formData,
        {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "multipart/form-data",
          },
        }
      );
      return response.data;
    } catch (err) {
      return thunkAPI.rejectWithValue(
        err.response?.data?.message || err.message || "Failed to delete campaign"
      );
    }
  }
);


const reportsSlice = createSlice({
  name: "reports",
  initialState: {
    data: [],
    loading: false,
    error: null,
  },
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(fetchReports.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchReports.fulfilled, (state, action) => {
        state.loading = false;
        state.data = action.payload;
      })
      .addCase(fetchReports.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })

      // ✅ getReportById handlers
      .addCase(getReportById.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(getReportById.fulfilled, (state, action) => {
        state.loading = false;
        state.data = action.payload;
      })
      .addCase(getReportById.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })

      // ✅ fetchRcapenight handlers (no conflict)
      .addCase(fetchRcapenight.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchRcapenight.fulfilled, (state, action) => {
        state.loading = false;
        state.data = action.payload;
      })
      .addCase(fetchRcapenight.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })

      // ✅ editScheduledCampaign handlers
      .addCase(editScheduledCampaign.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(editScheduledCampaign.fulfilled, (state, action) => {
        state.loading = false;
        // Optionally update state.data if needed
      })
      .addCase(editScheduledCampaign.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })

      // ✅ deleteScheduledCampaign handlers
      .addCase(deleteScheduledCampaign.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(deleteScheduledCampaign.fulfilled, (state, action) => {
        state.loading = false;
        // Optionally update state.data if needed
      })
      .addCase(deleteScheduledCampaign.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      });
  },
});

export default reportsSlice.reducer;
