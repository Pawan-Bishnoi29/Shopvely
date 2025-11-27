import axios from "axios";

const API = axios.create({
  baseURL: "http://localhost:8000/api",
});

// Attach token automatically
API.interceptors.request.use((config) => {
  const token = localStorage.getItem("access");
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

export default API;

// ✅ WISHLIST FUNCTIONS
export const getWishlist = async () => {
  const response = await API.get("/products/wishlist/");
  return response.data;
};

export const addToWishlist = async (productId) => {
  const response = await API.post("/products/wishlist/", {
    product_id: productId,
  });
  return response.data;
};

export const removeFromWishlist = async (productId) => {
  const response = await API.delete("/products/wishlist/", {
    data: { product_id: productId },
  });
  return response.data;
};

// ✅ ADDRESS FUNCTIONS
export const getAddresses = async () => {
  const response = await API.get("/addresses/");
  return response.data;
};

export const createAddress = async (payload) => {
  const response = await API.post("/addresses/", payload);
  return response.data;
};

export const deleteAddress = async (id) => {
  const response = await API.delete(`/addresses/${id}/`);
  return response.data;
};

export const setDefaultAddress = async (id) => {
  const response = await API.post(`/addresses/${id}/set-default/`);
  return response.data;
};

// ✅ CHECKOUT FUNCTION (cart -> order)
export const checkoutCart = async (addressId) => {
  const response = await API.post("/cart/checkout/", {
    address_id: addressId,
  });
  return response.data;
};

// ✅ CART SUMMARY FUNCTION (for Navbar count)
export const getCartSummary = async () => {
  const response = await API.get("/cart/");
  const items = response.data.items || [];
  return {
    raw: response.data,
    count: items.length,
  };
};

// ✅ PASSWORD CHANGE FUNCTION
export const changePassword = async (payload) => {
  // payload: { old_password, new_password }
  const response = await API.post("/users/change-password/", payload);
  return response.data;
};
