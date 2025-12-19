import React, { FC, useState } from "react";
import {
  Search,
  X,
  UserPlus,
  LogOut,
  Users,
  XCircle,
  AlertCircle,
} from "lucide-react";
import { useAppSelector } from "src/redux/hooks";
import { useParams } from "react-router-dom";
import { getGroup } from "src/redux/chatSlice";
import { IChatGroup,  IUserLite } from "src/types";
import { useChatSocket } from "src/context/chatContext";
import { useUser } from "src/context";
import { selectMemberMap } from "src/redux/memberRootSlice";
import { CreateGroupModal } from "../CreateGroup/CreateGroup";

interface Member {
  id: string;
  name: string;
  avatar: string;
  avatarColor: string;
  isYou?: boolean;
}

interface GroupMembersModalProps {
  isOpen: boolean;
  setIsOpen: React.Dispatch<React.SetStateAction<boolean>>;
  chatId: string;
  setSelectedChat: (chat: IChatGroup) => void;
}

export const GroupMembersModal: FC<GroupMembersModalProps> = ({
  isOpen,
  setIsOpen,
  chatId,
  setSelectedChat,
}) => {
  const { workspace: workspaceSlug } = useParams();
  const [selectedMember, setSelectedMember] = useState<IUserLite | null>(null);
  const memberDetails = useAppSelector(selectMemberMap);
  // const groupDetails = workspaceSlug ? useAppSelector((state) => selectChatGroupLogDetails(state, workspaceSlug, chatId)) : null;
  const groupDetails: IChatGroup | null = workspaceSlug
  ? useAppSelector((state) => getGroup(state, chatId))
  : null;
  console.log("groupDetails",groupDetails)
  const { data: currentUser } = useUser();
  const isCurrentUser = selectedMember?.id === currentUser?.id;
  //   const [isOpen, setIsOpen] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [showAddPeople, setShowAddPeople] = useState(false);
  const [showLeaveConfirm, setShowLeaveConfirm] = useState(false);
  const chatSocketService = useChatSocket();
  const members: Member[] = [
    {
      id: "1",
      name: "Mahendra Parmar",
      avatar: "M",
      avatarColor: "bg-indigo-600",
    },
    {
      id: "2",
      name: "Parmar Niraj",
      avatar: "P",
      avatarColor: "bg-purple-600",
    },
    { id: "3", name: "Alex Sales", avatar: "A", avatarColor: "bg-blue-600" },
    {
      id: "4",
      name: "Niraj Parmar",
      avatar: "N",
      avatarColor: "bg-indigo-700",
    },
    { id: "5", name: "Test Client01", avatar: "C", avatarColor: "bg-teal-600" },
    {
      id: "6",
      name: "Mahendra Parmar",
      avatar: "M",
      avatarColor: "bg-gray-400",
      isYou: true,
    },
  ];

  const filteredMembers = members.filter((member) =>
    member.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleClose = () => {
    setIsOpen(false);
  };

  const handleAddPeople = () => {
    setShowAddPeople(true);
  };

  const handleLeave = () => {
    setShowLeaveConfirm(true);
  };

  const confirmLeave = async () => {
    try {
      chatSocketService?.send({
        type: "group",
        intent: "remove_member",
        group_id: chatId,
        member: selectedMember?.id,
      });
      setShowLeaveConfirm(false);
      setIsOpen(false);
      setSelectedMember(null);
      isCurrentUser && setSelectedChat(undefined);
    } catch (error) {}
  };

  if (!isOpen || !groupDetails) return null;

  // Leave Confirmation Modal
  if (showLeaveConfirm) {
    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
        <div className="bg-white rounded-2xl shadow-xl w-full max-w-md">
          <div className="p-6">
            <div className="flex items-center justify-center w-12 h-12 rounded-full bg-red-100 mx-auto mb-4">
              {isCurrentUser ? (
                <LogOut className="h-6 w-6 text-red-600" />
              ) : (
                <AlertCircle className="h-6 w-6 text-red-600" />
              )}
            </div>
            <h2 className="text-xl font-semibold text-gray-900 text-center mb-2">
              {isCurrentUser ? "Leave Group?" : "Remove Member?"}
            </h2>
            {isCurrentUser ? (
              <p className="text-sm text-gray-600 text-center mb-6">
                Are you sure you want to leave{" "}
                {groupDetails?.group_name || "this group"}? You will lose access
                to the group and its messages. This action cannot be undone.
              </p>
            ) : (
              <p className="text-sm text-gray-600 text-center mb-6">
                Are you sure you want to remove member{" "}
                {selectedMember?.email || ""}? from this group? They will lose
                access to the group and its messages. This action cannot be
                undone.
              </p>
            )}
            <div className="flex gap-3">
              <button
                onClick={() => setShowLeaveConfirm(false)}
                className="flex-1 px-4 py-2.5 text-sm font-medium text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 focus:outline-none transition"
              >
                Cancel
              </button>
              <button
                onClick={confirmLeave}
                className="flex-1 px-4 py-2.5 text-sm font-medium text-white bg-red-600 rounded-lg hover:bg-red-700 focus:outline-none transition"
              >
               {isCurrentUser ? "Leave Group" : "Remove"} 
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  
  if (showAddPeople) {
    return (
      <CreateGroupModal
        isOpen={showAddPeople}
        setIsOpen={setShowAddPeople}
        users={memberDetails}
        groupDetails={groupDetails}
        isAddMemberModal
      />
    );
  }

  // Main People List Modal
  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-2xl shadow-xl w-full max-w-md">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 rounded-full bg-indigo-600 flex items-center justify-center">
              <Users className="h-5 w-5 text-white" />
            </div>
            <div>
              <h2 className="text-lg font-semibold text-gray-900">
                {groupDetails?.group_name}
              </h2>
              <p className="text-sm text-gray-500">
                People ({groupDetails?.members.length})
              </p>
            </div>
          </div>
          <button
            onClick={handleClose}
            className="text-gray-400 hover:text-gray-600 transition"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Search */}
        <div className="p-4 border-b border-gray-200">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
            <input
              type="text"
              placeholder="Search"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2 bg-gray-50 border-0 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
            />
          </div>
        </div>

        {/* Members List */}
        <div className="max-h-96 overflow-y-auto">
          {filteredMembers?.length > 0 || groupDetails.members.length > 0 ? (
            <div>
              {groupDetails.members.map((member: string) => {
                const availableMember =
                  memberDetails?.[member] || memberDetails;
                return (
                  <div
                    key={availableMember.id}
                    className="flex items-center p-4 hover:bg-gray-50 transition"
                  >
                    {/* <div
                      className={`w-10 h-10 rounded-full ${availableMember.avatarColor} flex items-center justify-center text-white font-semibold text-sm flex-shrink-0`}
                    >
                      {availableMember.first_name.charAt(0) + availableMember.last_name.charAt(0)}
                    </div> */}
                    <div className="w-10 h-10 rounded-full bg-indigo-600 flex items-center justify-center text-white font-semibold">
                      {availableMember.first_name.charAt(0)}
                    </div>
                    <div className="ml-3 flex-1">
                      <h3 className="text-sm font-medium text-gray-900">
                        {availableMember?.first_name}{" "}
                        {availableMember?.last_name}
                        {/* {availableMember.isYou && (
                          <span className="ml-2 text-gray-500">(You)</span>
                        )} */}
                      </h3>
                      <p className="text-xs text-gray-500 truncate">
                        {availableMember.email}
                      </p>
                    </div>

                    <XCircle
                      className="h-5 w-5 text-gray-400 hover:text-gray-600 transition cursor-pointer"
                      // onClick={() => handleRemoveMember(availableMember.id)}
                      onClick={() => {
                        setSelectedMember(availableMember);
                        setShowLeaveConfirm(true);
                      }}
                    />
                  </div>
                );
              })}
            </div>
          ) : (
            <div className="p-8 text-center">
              <p className="text-sm text-gray-500">No members found</p>
            </div>
          )}
        </div>

        {/* Actions */}
        <div className="border-t border-gray-200">
          <button
            onClick={handleAddPeople}
            className="w-full flex items-center px-6 py-4 text-sm font-medium text-gray-700 hover:bg-gray-50 transition"
          >
            <UserPlus className="h-5 w-5 mr-3 text-gray-500" />
            Add people
          </button>
          <button
            onClick={() => {
              setSelectedMember(currentUser as IUserLite);
              handleLeave();
            }}
            className="w-full flex items-center px-6 py-4 text-sm font-medium text-red-600 hover:bg-red-50 transition rounded-b-2xl"
          >
            <LogOut className="h-5 w-5 mr-3" />
            Leave
          </button>
        </div>
      </div>
    </div>
  );
};

// Add People Modal Component
function AddPeopleModal({ onClose }: { onClose: () => void }) {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedUsers, setSelectedUsers] = useState<string[]>([]);
  const [isAdding, setIsAdding] = useState(false);

  const availableUsers = [
    {
      id: "7",
      name: "Bhagy Detroja",
      email: "bhagy.wedowebapps@gmail.com",
      avatar: "B",
      avatarColor: "bg-indigo-700",
    },
    {
      id: "8",
      name: "Bhavesh Rajpurohit",
      email: "bhaveshr.wedowebapps@gmail.com",
      avatar: "B",
      avatarColor: "bg-indigo-700",
    },
    {
      id: "9",
      name: "Chirag Patel",
      email: "chirag@wedowebapps.com",
      avatar: "C",
      avatarColor: "bg-blue-600",
    },
    {
      id: "10",
      name: "Darshan Shah",
      email: "darshan@wedowebapps.com",
      avatar: "D",
      avatarColor: "bg-purple-600",
    },
  ];

  const filteredUsers = availableUsers.filter(
    (user) =>
      user.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      user.email.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleAddUsers = () => {
    if (selectedUsers.length === 0) {
      alert("Please select at least one person to add");
      return;
    }

    setIsAdding(true);
    setTimeout(() => {
      setIsAdding(false);
      onClose();
    }, 1000);
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-2xl shadow-xl w-full max-w-md">
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <div>
            <h2 className="text-xl font-semibold text-gray-900">Add People</h2>
            <p className="text-sm text-gray-500 mt-1">
              Add members to electron testing group
            </p>
          </div>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 transition"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        <div className="p-6 space-y-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
            <input
              type="text"
              placeholder="Search members"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 bg-white border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
            />
          </div>

          <div className="max-h-64 overflow-y-auto border border-gray-200 rounded-lg">
            {filteredUsers.map((user) => (
              <label
                key={user.id}
                className="flex items-center p-3 hover:bg-gray-50 cursor-pointer"
              >
                <input
                  type="checkbox"
                  checked={selectedUsers.includes(user.id)}
                  onChange={(e) => {
                    if (e.target.checked) {
                      setSelectedUsers([...selectedUsers, user.id]);
                    } else {
                      setSelectedUsers(
                        selectedUsers.filter((id) => id !== user.id)
                      );
                    }
                  }}
                  className="w-4 h-4 text-indigo-600 rounded focus:ring-indigo-500"
                />
                <div
                  className={`w-10 h-10 rounded-full ${user.avatarColor} flex items-center justify-center text-white font-semibold text-sm ml-3`}
                >
                  {user.avatar}
                </div>
                <div className="ml-3">
                  <h3 className="text-sm font-medium text-gray-900">
                    {user.name}
                  </h3>
                  <p className="text-xs text-gray-500">{user.email}</p>
                </div>
              </label>
            ))}
          </div>

          {selectedUsers.length > 0 && (
            <p className="text-xs text-gray-600">
              {selectedUsers.length}{" "}
              {selectedUsers.length === 1 ? "person" : "people"} selected
            </p>
          )}
        </div>

        <div className="flex items-center justify-end gap-3 p-6 bg-gray-50 border-t border-gray-200 rounded-b-2xl">
          <button
            onClick={onClose}
            disabled={isAdding}
            className="px-4 py-2 text-sm font-medium text-gray-700 hover:text-gray-900 disabled:opacity-50"
          >
            Cancel
          </button>
          <button
            onClick={handleAddUsers}
            disabled={isAdding || selectedUsers.length === 0}
            className="px-5 py-2 bg-indigo-600 text-white text-sm font-medium rounded-lg hover:bg-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isAdding ? "Adding..." : "Add People"}
          </button>
        </div>
      </div>
    </div>
  );
}
