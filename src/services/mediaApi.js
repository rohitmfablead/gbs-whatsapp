import API, { apiService } from "../config/api";

// ✅ Create new media
export const addMedia = async (token, mediaData) => {
    const res = await apiService.post(API.ENDPOINTS.ADD_MEDIA, mediaData, {
        headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "multipart/form-data",
        },
    });
    return res.data;
};

// ✅ Get all media
export const getMedia = async (token) => {
    const res = await apiService.get(API.ENDPOINTS.GET_MEDIA, {
        headers: { Authorization: `Bearer ${token}` },
    });
    return res.data.data;
};

// ✅ Get media by ID
export const getMediaById = async (token, id) => {
    const res = await apiService.get(`${API.ENDPOINTS.GET_MEDIA}/${id}`, {
        headers: { Authorization: `Bearer ${token}` },
    });
    return res.data.media;
};

// ✅ Update media
export const updateMedia = async (token, id, mediaData) => {
    const res = await apiService.put(`${API.ENDPOINTS.UPDATE_MEDIA}/${id}`, mediaData, {
        headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "multipart/form-data",
        },
    });
    return res.data;
};

// ✅ Delete media
export const deleteMedia = async (token, id) => {
    const res = await apiService.delete(`${API.ENDPOINTS.DELETE_MEDIA}/${id}`, {
        headers: { Authorization: `Bearer ${token}` },
    });
    return res.data;
};
