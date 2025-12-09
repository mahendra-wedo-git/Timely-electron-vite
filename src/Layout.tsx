// import { Fragment } from "react";
// import { Outlet } from "react-router-dom";
// import Sidebar from "./components/Sidebar";
// // import { ToastContainer } from "react-toastify";

// const Layout = () => {
//   const isLogin = localStorage.getItem("userEmail");
//   console.log("isLoginisLogin",isLogin)
//   return (
//     <Fragment>
//       <div className="main">
//          {isLogin && <Sidebar />}
//         <div className={`main-content ${isMenuOpen ? `` : `collapsed`}`}>
//           {/* <ToastContainer /> */}
//           <Outlet />
//         </div>
//       </div>
//     </Fragment>
//   );
// };

// export default Layout;


// Layout.jsx
import { Fragment } from "react";
import { Outlet } from "react-router-dom";
import Sidebar from "./components/Sidebar";

const Layout = () => {
  const isLogin = localStorage.getItem("userEmail");

  return (
    <Fragment>
      <div className="main">
        {isLogin && <Sidebar />}

        <div className={`main-content`}>
          <Outlet />
        </div>
      </div>
    </Fragment>
  );
};

export default Layout;

