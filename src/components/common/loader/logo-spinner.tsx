// assets

import LogoSpinnerLight from "/assets/loading.gif";
import { Image } from "react-bootstrap";

export const LogoSpinner = () => {
  return (
    <div className="flex items-center justify-center">
      <Image
        src={LogoSpinnerLight}
        alt="logo"
        className="size-16 sm:size-20 mr-2"
      />
    </div>
  );
};
