import * as Yup from "yup";

export const loginSchema = Yup.object({
  email: Yup.string()
    .required("Email is a required field")
    .email("Enter a valid email"),
  password: Yup.string()
    .required("Password is a required field")
    .min(6, "Password must be at least 6 characters")
    .max(50, "Password must be less than or equal to 50 characters")
    // .matches(/[a-z]/, "Password must contain at least 1 lower case letter")
    // .matches(/[A-Z]/, "Password must contain at least 1 upper case letter")
    .matches(/[0-9]/, "Password must contain at least 1 number")
    .matches(
      /[^a-zA-Z0-9]/,
      "Password must contain at least 1 special character"
    ),
});