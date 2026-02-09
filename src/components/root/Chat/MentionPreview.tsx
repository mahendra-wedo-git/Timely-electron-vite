import { FC } from "react";
import { getFileURL } from "src/utils";

interface MentionPreviewProps {
  userId: string;
  memberDetails: any;
}

export const MentionPreview: FC<MentionPreviewProps> = ({
  userId,
  memberDetails,
}) => {
  const user = memberDetails?.[userId];
  console.log("useruseruseruser",user,memberDetails)

  if (!user) {
    return (
      <div className="p-3 bg-white rounded-lg shadow-lg border border-gray-200 min-w-[200px]">
        <div className="text-sm text-gray-500">User not found</div>
      </div>
    );
  }

  const fullName =
    user.first_name && user.last_name
      ? `${user.first_name} ${user.last_name}`
      : user.display_name || user.first_name || "Unknown User";

  const email = user.email || "";
  const role = user.role || "";

  return (
    <div className="p-2 bg-white rounded-lg shadow-lg border border-gray-200 min-w-[220px] max-w-[280px]">
      <div className="flex items-center gap-4">
        {/* Avatar */}
        <div className="flex-shrink-0">
          {user.avatar_url ? (
            <img
              src={getFileURL(user.avatar_url)}
              alt={fullName}
              className="w-10 h-10 rounded-full object-cover border-2 border-indigo-100"
            />
          ) : (
            <div className="w-10 h-10 rounded-full bg-indigo-100 flex items-center justify-center border-2 border-indigo-200">
              <span className="text-lg font-semibold text-indigo-600">
                {fullName[0]?.toUpperCase() || "?"}
              </span>
            </div>
          )}
        </div>

        {/* User Info */}
        <div className="flex-1 min-w-0">
          <div className="font-semibold text-gray-900 text-sm truncate">
            {fullName}
          </div>
          {/* {email && (
            <div className="text-xs text-gray-500 truncate mt-0.5">
              {email}
            </div>
          )} */}
          {/* {role && (
            <div className="inline-block mt-1.5 px-2 py-0.5 bg-indigo-50 text-indigo-700 text-xs font-medium rounded">
              {role}
            </div>
          )} */}
        </div>
      </div>
    </div>
  );
};