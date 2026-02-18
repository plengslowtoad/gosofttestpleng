import { createSlice } from '@reduxjs/toolkit'

export const initialState = {
  currentlyEdited: null,
  items: [],
};

export const componentsSlice = createSlice({
  name: 'components',
  initialState,
  reducers: {
    addComponent: (state, action) => {
      const newComponent = {
        id: action.payload.id,
        layout: action.payload.layout,
        values: {},
      };
      state.items.push(newComponent);
      state.currentlyEdited = newComponent;
    },
    updateComponent: (state, action) => {
      const { id, data } = action.payload;
      const item = state.items.find(item => item.id === id);
      if (item) {
        item.values = data.values;
      }
      state.currentlyEdited = null;
    },
    removeComponent: (state, action) => {
      const { id } = action.payload;
      state.items = state.items.filter(item => item.id !== id);
      state.currentlyEdited = null;
    },
    setEditedComponent: (state, action) => {
      state.currentlyEdited = action.payload.component;
    },
  },
})

export const componentsActions = componentsSlice.actions
export const componentsReducer = componentsSlice.reducer
