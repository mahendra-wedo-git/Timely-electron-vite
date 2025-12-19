import { IChatGroupLog, IUserLite } from "src/types";
import { UserRoundPen, LogOut, UserRoundPlus, UserRoundMinus } from "lucide-react";
import { selectMemberMap } from "src/redux/memberRootSlice";
import { useAppSelector } from "src/redux/hooks";
import { getMemberName } from "src/utils";
// import { useMember } from "@/hooks/store";
// import { getMemberName } from "@/helpers/chat.helper";

export type GroupActionType = "added" | "removed" | "edit" | "left";

const actionIcons: Record<GroupActionType, JSX.Element> = {
  added: <UserRoundPlus size={18} />,
  removed: <UserRoundMinus size={18} />,
  edit: <UserRoundPen size={18} />,
  left: <LogOut size={18} />,
};

interface Props {
  log: IChatGroupLog;
}

export function GroupActivityItem({ log }: Props) {
  // const { getUserDetails } = useMember();
  
  const memberDetails = useAppSelector(selectMemberMap);


  const actor = memberDetails[(log.removed_by || log.user || "")];
  const target = memberDetails[(log.user || "")];

  const actorName = actor ? getMemberName(actor as IUserLite) : "Someone";
  const targetName = target ? getMemberName(target as IUserLite) : "Someone";

  const messages: Record<GroupActionType, string> = {
    added: `${actorName} added ${targetName} to the chat.`,
    removed: `${actorName} removed ${targetName} from the chat.`,
    left: `${actorName} left the group.`,
    edit: `${actorName} changed the group details.`,
  };

  return (
    <div className="flex items-center gap-3 py-1 pl-[8px] text-sm text-custom-text-400">
      <div className="text-custom-text-400">{actionIcons[log.action as GroupActionType]}</div>

      {/* inject bold text safely */}
      <span>{messages[log.action as GroupActionType]}</span>
    </div>
  );
}
