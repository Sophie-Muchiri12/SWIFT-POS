import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import axios from "axios";
import { persistReducer } from "redux-persist";
import storage from "redux-persist/lib/storage";
import BASE_URL from "../../utils/config";

// Fetch all items (Authenticated users only)
export const fetchItems = createAsyncThunk(
  "items/fetchItems",
  async ({ token }, { rejectWithValue }) => {
    try {
      if (!token) throw new Error("User not authenticated.");

      const response = await axios.get(`${BASE_URL}/v1/items/`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data || "Failed to fetch items.");
    }
  }
);

// Execute a sale (Authenticated users only)
export const executeSale = createAsyncThunk(
  "sales/executeSale",
  async ({ saleData, token }, { rejectWithValue }) => {
    try {
      if (!token) throw new Error("User not authenticated.");

      const response = await axios.post(`${BASE_URL}/v1/sales/`, saleData, {
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      });

      return response.data;  
    } catch (error) {
      return rejectWithValue(error.response?.data || "Failed to execute sale.");
    }
  }
);

// Update sales stock after a sale (Authenticated users only)
export const updateSales = createAsyncThunk(
  "itemsUpdate/updateSales",
  async ({ saleData, token }, { rejectWithValue }) => {
    try {
      if (!token) throw new Error("User not authenticated.");

      console.log("Sending data:", saleData); 

      const response = await axios.post(
        `${BASE_URL}/v1/update-sales/`,
        saleData,
        {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        }
      );

      return response.data;
    } catch (error) {
      console.error("Update sales error:", error.response?.data); 
      return rejectWithValue(error.response?.data || "Failed to update sales.");
    }
  }
);

// Persist config for Redux state
const persistConfig = {
  key: "items",
  storage,
  whitelist: ["items"],
};

// Initial state
const initialState = {
  items: [],
  sales: [], 
  itemsUpdate: [], 
  isLoading: false,
  error: null,
};

const itemsSlice = createSlice({
  name: "items",
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(fetchItems.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(fetchItems.fulfilled, (state, action) => {
        state.isLoading = false;
        state.items = action.payload;
      })
      .addCase(fetchItems.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload;
      })
      .addCase(executeSale.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(executeSale.fulfilled, (state, action) => {
        state.isLoading = false;
        state.sales = action.payload; 
      })
      .addCase(executeSale.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload;
      })
      .addCase(updateSales.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(updateSales.fulfilled, (state, action) => {
        state.isLoading = false;
        state.itemsUpdate = action.payload; 
      })
      .addCase(updateSales.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload;
      });
  },
});
const persistedItemsReducer = persistReducer(persistConfig, itemsSlice.reducer);

export default persistedItemsReducer;
