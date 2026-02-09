import React from "react";
import { IUserLite } from "src/types";
import { UserAvatar } from "./UserAvatar";

interface TypingIndicatorProps {
  typingMember: IUserLite;
}


export const TypingIndicator: React.FC<TypingIndicatorProps> = ({ typingMember }) => (
    <div className="relative flex gap-2 mb-2 justify-start">
      <div className="flex-shrink-0 w-7">
        <UserAvatar
          userDetail={typingMember}
          msg={null}
        />
      </div>
      <div className="flex flex-col w-fit">
        <div className="flex items-center">
          <span className="text-sm font-medium text-custom-text-300">
            {typingMember?.first_name && typingMember?.last_name
              ? `${typingMember.first_name} ${typingMember.last_name}`
              : typingMember?.display_name}
          </span>
        </div>
        <div className="relative self-start">
          <div className="flex gap-1 mt-1 p-4 w-fit text-sm rounded-xl shadow-sm break-words bg-custom-background-90 text-custom-text-100 rounded-tl-none">
            <span className="w-1.5 h-1.5 rounded-full animate-bounce bg-blue-500 delay-0"/>
            <span className="w-1.5 h-1.5 rounded-full animate-bounce bg-blue-400 delay-150"/>
            <span className="w-1.5 h-1.5 rounded-full animate-bounce bg-blue-300 delay-300"/>
          </div>
        </div>
      </div>
    </div>
  );
