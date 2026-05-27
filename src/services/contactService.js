import API, { apiService } from "../config/api";


// ✅ Create new contact
export const addContact = async (token, contactData) => {
  const res = await apiService.post(API.ENDPOINTS.ADD_CONTACT, contactData, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });
  return res.data;
};

// ✅ Get all contacts
export const getContacts = async (token) => {
  const res = await apiService.get(API.ENDPOINTS.GET_CONTACT, {
    headers: { Authorization: `Bearer ${token}` },
  });
  return res.data.data;
};

// ✅ Get contact by ID
export const getContactById = async (token, id) => {
  const res = await apiService.get(`${API.ENDPOINTS.getContacts}/${id}`, {
    headers: { Authorization: `Bearer ${token}` },
  });
  return res.data.contact;
};

// ✅ Update contact
export const updateContact = async (token, id, contactData) => {
  console.log("idiiii", id)
  const res = await apiService.put(`${API.ENDPOINTS.UPDATE_CONTACT}/${id}`, contactData, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });
  return res.data;
};

// ✅ Delete contact
export const deleteContact = async (token, id) => {
  const res = await apiService.delete(`${API.ENDPOINTS.DELETE_CONTACT}/${id}`, {
    headers: { Authorization: `Bearer ${token}` },
  });
  return res.data;
};
