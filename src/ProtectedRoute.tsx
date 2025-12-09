// // ProtectedRoute.jsx
// // import PropTypes from "prop-types";
// import { Navigate } from "react-router-dom";
// // import AuthService from "./services/auth";

//  const ProtectedRoute = ({ children }) => {
//   // const isAuthenticated = new AuthService().isAuthenticated();
//   const isAuthenticated = localStorage.getItem('userEmail') !== null;

//   if (!isAuthenticated) {
//     return <Navigate to="/login" replace />;
//   }

//   return children;
// };
// // ProtectedRoute.propTypes = {
// //   children: PropTypes.node.isRequired,
// // };

// export default ProtectedRoute;


// ProtectedRoute.jsx
import { Navigate } from "react-router-dom";

import React from "react";

const ProtectedRoute = ({ children }: { children: React.ReactNode }) => {
  const isAuthenticated = localStorage.getItem('userEmail') !== null;

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  return children;
};

export default ProtectedRoute;
