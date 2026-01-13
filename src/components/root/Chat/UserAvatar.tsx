import { FC } from "react";
import { getFileURL } from "src/utils";

export const UserAvatar: FC<{ userDetail: any; msg: any }> = ({ userDetail, msg }) => {
  if (userDetail?.avatar_url) {
    return (
      <img
        src={getFileURL(userDetail.avatar_url)}
        className="w-8 h-8 rounded-full flex-shrink-0"
        alt={
          userDetail?.first_name && userDetail?.last_name
            ? `${userDetail.first_name} ${userDetail.last_name}`
            : userDetail?.display_name
        }
      />
    );
  }

  const initials =
    userDetail?.first_name && userDetail?.last_name
      ? userDetail.first_name.charAt(0) + userDetail.last_name.charAt(0)
      : userDetail?.display_name?.charAt(0) || "U";

  return (
    <div className="w-8 h-8 rounded-full bg-indigo-600 flex items-center justify-center text-white text-xs flex-shrink-0">
      {initials.toUpperCase()}
    </div>
  );
};