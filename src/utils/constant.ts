export const accountMenuList: {
  menu: string;
  path: string;
}[] = [
  { menu: "Personal Center", path: "account-information" },
  { menu: "Address Book", path: "address-book" },
  { menu: "My Orders", path: "order-history" },
];

export const localStorageKeys = {
  AUTH_TOKEN: "auth_token",
  CURRENT_CURRENCY: "current_currency",
  USER_EMAIL: "userEmail",
};

export const cookieStorageKey = {
  AUTH_TOKEN: "auth_token",
};

export type Tab = "login" | "register";

export const tabList: { label: string; value: Tab }[] = [
  {
    label: "LOGIN",
    value: "login",
  },
  {
    label: "REGISTER",
    value: "register",
  },
];
export const GenderOption = [
  {
    label: "Male",
    value: 1,
  },
  {
    label: "Female",
    value: 2,
  },
];


// JS-Error-Status-Codes
export const statusCode: Record<number, string> = {
  400: "Cart not create !!!",
  401: "Invalid Credentials !!!",
  404: "This product is not available",
  409: "Requested quantity not available",
  413: "File size exceeds 5 MB limit.",
  415: "File is not allowed",
  500: "Something went wrong",
  503: "Something went wrong. Please try again.",
};
