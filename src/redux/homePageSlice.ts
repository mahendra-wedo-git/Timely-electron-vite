import { createSlice } from "@reduxjs/toolkit";

interface HomeState {
  homeBanner: any;
}

const initialState: HomeState = {
  homeBanner: {
    banner_content: [],
    __typename: "",
  },
};

const homePageSlice = createSlice({
  name: "homepage",
  initialState,
  reducers: {
    setHomePage: (state, action) => {
      return {
        ...state,
        homeBanner: {
          ...action.payload,
        },
      };
    },
  },
});

export const { setHomePage } = homePageSlice.actions;
export default homePageSlice.reducer;