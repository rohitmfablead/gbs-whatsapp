
// import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
// import * as contactService from "@/services/contactService";
// import API, { apiService } from "../../config/api";

// // 🔹 Thunks
// export const fetchContacts = createAsyncThunk(
//   "contacts/fetchAll",
//   async (token, thunkAPI) => {
//     try {
//       return await contactService.getContacts(token);
//     } catch (err) {
//       return thunkAPI.rejectWithValue(err.response?.data || err.message);
//     }
//   }
// );

// export const fetchContactById = createAsyncThunk(
//   "contacts/fetchById",
//   async ({ token, id }, thunkAPI) => {
//     try {
//       return await contactService.getContactById(token, id);
//     } catch (err) {
//       return thunkAPI.rejectWithValue(err.response?.data || err.message);
//     }
//   }
// );

// export const uploadContactsCSV = createAsyncThunk(
//   "contacts/uploadCSV",
//   async ({ token, formData }, thunkAPI) => {
//     try {
//       const res = await apiService.post(
//         API.ENDPOINTS.CSV_FILE_CONTACT,
//         formData,
//         {
//           headers: {
//             Authorization: `Bearer ${token}`,
//             "Content-Type": "multipart/form-data",
//           },
//         }
//       );
//       return res.data;
//     } catch (err) {
//       return thunkAPI.rejectWithValue(err.response?.data || err.message);
//     }
//   }
// );

// export const createContact = createAsyncThunk(
//   "contacts/create",
//   async ({ token, contactData }, thunkAPI) => {
//     try {
//       return await contactService.addContact(token, contactData);
//     } catch (err) {
//       return thunkAPI.rejectWithValue(err.response?.data || err.message);
//     }
//   }
// );

// export const editContact = createAsyncThunk(
//   "contacts/update",
//   async ({ token, contactId, contactData }) => {
//     const result = await contactService.updateContact(
//       token,
//       contactId,
//       contactData
//     );
//     return result;
//   }
// );

// export const removeContact = createAsyncThunk(
//   "contacts/delete",
//   async ({ token, id }, thunkAPI) => {
//     try {
//       await contactService.deleteContact(token, id);
//       return id;
//     } catch (err) {
//       return thunkAPI.rejectWithValue(err.response?.data || err.message);
//     }
//   }
// );

// export const removeContactFromGroup = createAsyncThunk(
//   "contacts/multipleDelete",
//   async ({ token, formData }, thunkAPI) => {
//     try {
//       const res = await apiService.post(
//         API.ENDPOINTS.REMOVE_MULTIPLE_CONTACT,
//         formData,
//         {
//           headers: {
//             Authorization: `Bearer ${token}`,
//             "Content-Type": "multipart/form-data",
//           },
//         }
//       );
//       return res.data;
//     } catch (err) {
//       return thunkAPI.rejectWithValue(err.response?.data || err.message);
//     }
//   }
// );

// export const deleteMultipleContacts = createAsyncThunk(
//   "contacts/deleteMultiple",
//   async ({ token, formData }, thunkAPI) => {
//     try {
//       const res = await apiService.post(
//         API.ENDPOINTS.DELETE_MULTIPLE_CONTACT,
//         formData,
//         {
//           headers: {
//             Authorization: `Bearer ${token}`,
//             "Content-Type": "multipart/form-data",
//           },
//         }
//       );
//       return res.data;
//     } catch (err) {
//       return thunkAPI.rejectWithValue(err.response?.data || err.message);
//     }
//   }
// );

// // 🔹 Slice
// const contactSlice = createSlice({
//   name: "contacts",
//   initialState: {
//     list: [],
//     selected: null,
//     loading: false,        // general loading
//     uploadingCSV: false,   // 🆕 CSV upload loader
//     error: null,
//   },
//   reducers: {},
//   extraReducers: (builder) => {
//     builder
//       // Fetch All
//       .addCase(fetchContacts.pending, (state) => {
//         state.loading = true;
//         state.error = null;
//       })
//       .addCase(fetchContacts.fulfilled, (state, action) => {
//         state.loading = false;
//         state.list = action.payload;
//       })
//       .addCase(fetchContacts.rejected, (state, action) => {
//         state.loading = false;
//         state.error = action.payload;
//       })

//       // Fetch By ID
//       .addCase(fetchContactById.pending, (state) => {
//         state.loading = true;
//       })
//       .addCase(fetchContactById.fulfilled, (state, action) => {
//         state.loading = false;
//         state.selected = action.payload;
//       })
//       .addCase(fetchContactById.rejected, (state, action) => {
//         state.loading = false;
//         state.error = action.payload;
//       })

//       // Create
//       .addCase(createContact.fulfilled, (state, action) => {
//         state.list.push(action.payload);
//       })

//       // Update
//       .addCase(editContact.fulfilled, (state, action) => {
//         const idx = state.list.findIndex((c) => c.id === action.payload.id);
//         if (idx !== -1) state.list[idx] = action.payload;
//       })

//       // Delete
//       .addCase(removeContact.fulfilled, (state, action) => {
//         state.list = state.list.filter((c) => c.id !== action.payload);
//       })

//       // Delete Multiple from Group
//       .addCase(removeContactFromGroup.fulfilled, (state, action) => {
//         const deletedIds =
//           action.payload.deleted_contact_ids || [action.payload.deleted_contact_id];
//         state.list = state.list.filter((c) => !deletedIds.includes(c.id));
//       })

//       // Delete Multiple Contacts
//       .addCase(deleteMultipleContacts.fulfilled, (state, action) => {
//         const deletedIds =
//           action.payload.deleted_contact_ids || [action.payload.deleted_contact_id];
//         state.list = state.list.filter((c) => !deletedIds.includes(c.id));
//       })

//       // Upload CSV
//       .addCase(uploadContactsCSV.pending, (state) => {
//         state.uploadingCSV = true;
//         state.error = null;
//       })
//       .addCase(uploadContactsCSV.fulfilled, (state, action) => {
//         state.uploadingCSV = false;
//         if (Array.isArray(action.payload.data)) {
//           state.list = [...state.list, ...action.payload.data];
//         }
//       })
//       .addCase(uploadContactsCSV.rejected, (state, action) => {
//         state.uploadingCSV = false;
//         state.error = action.payload;
//       });
//   },
// });

// export default contactSlice.reducer;



import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import * as contactService from "@/services/contactService";
import API, { apiService } from "../../config/api";

// 🔹 Thunks
export const fetchContacts = createAsyncThunk(
  "contacts/fetchAll",
  async (token, thunkAPI) => {
    try {
      return await contactService.getContacts(token);
    } catch (err) {
      return thunkAPI.rejectWithValue(err.response?.data || err.message);
    }
  }
);

export const fetchContactById = createAsyncThunk(
  "contacts/fetchById",
  async ({ token, id }, thunkAPI) => {
    try {
      return await contactService.getContactById(token, id);
    } catch (err) {
      return thunkAPI.rejectWithValue(err.response?.data || err.message);
    }
  }
);

export const uploadContactsCSV = createAsyncThunk(
  "contacts/uploadCSV",
  async ({ token, formData }, thunkAPI) => {
    try {
      const res = await apiService.post(
        API.ENDPOINTS.CSV_FILE_CONTACT,
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

export const createContact = createAsyncThunk(
  "contacts/create",
  async ({ token, contactData }, thunkAPI) => {
    try {
      return await contactService.addContact(token, contactData);
    } catch (err) {
      return thunkAPI.rejectWithValue(err.response?.data || err.message);
    }
  }
);

export const editContact = createAsyncThunk(
  "contacts/update",
  async ({ token, contactId, contactData }) => {
    const result = await contactService.updateContact(
      token,
      contactId,
      contactData
    );
    return result;
  }
);

export const removeContact = createAsyncThunk(
  "contacts/delete",
  async ({ token, id }, thunkAPI) => {
    try {
      await contactService.deleteContact(token, id);
      return id;
    } catch (err) {
      return thunkAPI.rejectWithValue(err.response?.data || err.message);
    }
  }
);

export const removeContactFromGroup = createAsyncThunk(
  "contacts/multipleDelete",
  async ({ token, formData }, thunkAPI) => {
    try {
      const res = await apiService.post(
        API.ENDPOINTS.REMOVE_MULTIPLE_CONTACT,
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
export const deleteMultipleContacts = createAsyncThunk(
  "contacts/deleteMultiple",
  async ({ token, formData }, thunkAPI) => {
    try {
      const res = await apiService.post(
        API.ENDPOINTS.DELETE_MULTIPLE_CONTACT,
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
// 🔹 Slice
const contactSlice = createSlice({
  name: "contacts",
  initialState: {
    list: [],
    selected: null,
    loading: false,        // general loading
    uploadingCSV: false,   // 🆕 CSV upload loader
    error: null,
  },
  reducers: {},
  extraReducers: (builder) => {
    builder
      // Fetch All
      .addCase(fetchContacts.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchContacts.fulfilled, (state, action) => {
        state.loading = false;
        state.list = action.payload;
      })
      .addCase(fetchContacts.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })

      // Fetch By ID
      .addCase(fetchContactById.pending, (state) => {
        state.loading = true;
      })
      .addCase(fetchContactById.fulfilled, (state, action) => {
        state.loading = false;
        state.selected = action.payload;
      })
      .addCase(fetchContactById.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })

      // Create
      .addCase(createContact.fulfilled, (state, action) => {
        state.list.push(action.payload);
      })

      // Update
      .addCase(editContact.fulfilled, (state, action) => {
        const idx = state.list.findIndex((c) => c.id === action.payload.id);
        if (idx !== -1) state.list[idx] = action.payload;
      })

      // Delete Multiple from Group
      .addCase(removeContact.fulfilled, (state, action) => {
        state.list = state.list.filter((c) => c.id !== action.payload);
      })
      .addCase(removeContactFromGroup.fulfilled, (state, action) => {
        const deletedIds =
          action.payload.deleted_contact_ids || [action.payload.deleted_contact_id];
        state.list = state.list.filter((c) => !deletedIds.includes(c.id));
      })

      // Delete Multiple Contacts
      .addCase(deleteMultipleContacts.fulfilled, (state, action) => {
        const deletedIds =
          action.payload.deleted_contact_ids || [action.payload.deleted_contact_id];
        state.list = state.list.filter((c) => !deletedIds.includes(c.id));
      })

      // Upload CSV
      .addCase(uploadContactsCSV.pending, (state) => {
        state.uploadingCSV = true;    // 🟢 now using uploadingCSV
        state.error = null;
      })
      .addCase(uploadContactsCSV.fulfilled, (state, action) => {
        state.uploadingCSV = false;
        if (Array.isArray(action.payload.data)) {
          state.list = [...state.list, ...action.payload.data];
        }
      })
      .addCase(uploadContactsCSV.rejected, (state, action) => {
        state.uploadingCSV = false;
        state.error = action.payload;
      });
  },
});

export default contactSlice.reducer;
