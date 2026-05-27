import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import API, { apiService } from "../../config/api";

export const sendBulkMessage = createAsyncThunk(
  "bulkSend/send",
  async ({ token, groupData }, thunkAPI) => {
    try {
      const formData = new FormData();

      // Append campaign name and template ID
      formData.append("name", groupData.name);
      formData.append("templateId", groupData.templateId);

      // Append header variables
      if (groupData.headerVariables && groupData.headerVariables.length > 0) {
        groupData.headerVariables.forEach((value) => {
          formData.append("headervariables[]", value);
        });
      }

      // Append body variables
      if (groupData.bodyVariables && groupData.bodyVariables.length > 0) {
        groupData.bodyVariables.forEach((value) => {
          formData.append("variables[]", value);
        });
      }

      // Append button variables
      if (groupData.buttonVariables && groupData.buttonVariables.length > 0) {
        groupData.buttonVariables.forEach((value) => {
          formData.append("variables[]", value);
        });
      }

      // Append schedule time if it exists
      if (groupData.scheduleAt) {
        formData.append("scheduleAt", groupData.scheduleAt);
      }

      // Append contact IDs
      groupData.contactIds.forEach((contactId) => {
        formData.append("contacts[]", contactId);
      });

      // Send the request
      const res = await apiService.post(API.ENDPOINTS.bulk_send, formData, {
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "multipart/form-data",
        },
      });

      return res.data;
    } catch (err) {
      return thunkAPI.rejectWithValue(err.response?.data || err.message);
    }
  }
);

/**
 * ✅ Edit an existing scheduled campaign
 */
export const editScheduledCampaign = createAsyncThunk(
  "bulkSend/edit",
  async ({ token, id, groupData }, thunkAPI) => {
    try {
      const formData = new FormData();

      // Update only editable fields (optional handling)
      if (groupData.name) formData.append("name", groupData.name);
      if (groupData.templateId) formData.append("templateId", groupData.templateId);

      // Header variables
      if (groupData.headerVariables?.length > 0) {
        groupData.headerVariables.forEach((v) =>
          formData.append("headervariables[]", v)
        );
      }

      // Body variables
      if (groupData.bodyVariables?.length > 0) {
        groupData.bodyVariables.forEach((v) =>
          formData.append("variables[]", v)
        );
      }

      // Button variables
      if (groupData.buttonVariables?.length > 0) {
        groupData.buttonVariables.forEach((v) =>
          formData.append("variables[]", v)
        );
      }

      // Schedule time update
      if (groupData.scheduleAt) {
        formData.append("scheduleAt", groupData.scheduleAt);
      }

      // Contact IDs (optional update)
      if (groupData.contactIds?.length > 0) {
        groupData.contactIds.forEach((id) =>
          formData.append("contacts[]", id)
        );
      }

      // API call (PUT or PATCH based on your backend)
      const res = await apiService.post(
        `${API.ENDPOINTS.edit_scheduled}/${id}/update`,
        formData,
        {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "multipart/form-data",
          },
        }
      );

      return res.data;
    } catch (err) {
      return thunkAPI.rejectWithValue(err.response?.data || err.message);
    }
  }
);

const bulkSendSlice = createSlice({
  name: "bulkSend",
  initialState: {
    items: [],
    loading: false,
    error: null,
    lastSent: null,
    lastSent: null,
    lastEdited: null,
  },
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(sendBulkMessage.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(sendBulkMessage.fulfilled, (state, action) => {
        state.loading = false;
        state.lastSent = action.payload;
      })
      .addCase(sendBulkMessage.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })

      // ✏️ Edit scheduled campaign
      .addCase(editScheduledCampaign.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(editScheduledCampaign.fulfilled, (state, action) => {
        state.loading = false;
        state.lastEdited = action.payload;
      })
      .addCase(editScheduledCampaign.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      });
  },
});

export default bulkSendSlice.reducer;
