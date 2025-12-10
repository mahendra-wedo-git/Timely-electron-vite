import { useAppContext } from "../context/appContext";
import { TimelyLogin } from "./Login";
import { TimelyRegister } from "./Register";
import { TimelyResetPassword } from "./ResetPassword";

export const AuthWrapper = () => {
  const { isCurrentAuthTab } = useAppContext();

  if (isCurrentAuthTab === "REGISTER") {
    return <TimelyRegister  />;
  } else if (isCurrentAuthTab === "LOGIN") {
    return <TimelyLogin />;
  } else if (isCurrentAuthTab === "FORGOT_PASSWORD") {
    return <TimelyResetPassword />;
  }

  return <></>;
};
