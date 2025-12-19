import React, { FC, useState } from "react";
import { Search, X, Check } from "lucide-react";
import { useChatSocket } from "src/context/chatContext";
interface User {
  avatar: string;
  avatar_url: null;
  display_name: string;
  email: string;
  first_name: string;
  id: string;
  is_bot: false;
  last_login_medium: string;
  last_name: string;
}
interface CreateGroupModalProps {
  setIsOpen: React.Dispatch<React.SetStateAction<boolean>>;
  isOpen: boolean;
  users: User[];
  isAddMemberModal?: boolean
}
export const CreateGroupModal: FC<CreateGroupModalProps> = ({
  setIsOpen,
  isOpen,
  users,
  isAddMemberModal = false
}) => {
  //   const [isOpen, setIsOpen] = useState(true);
  const [groupName, setGroupName] = useState("");
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedMembers, setSelectedMembers] = useState<string[]>([]);
  const [isCreating, setIsCreating] = useState(false);
   const chatSocket = useChatSocket();
  //   const users: User[] = [
  //     {
  //       id: "1",
  //       name: "Timely Admin",
  //       email: "admin@timely.com",
  //       avatar: "A",
  //       avatarColor: "bg-indigo-600",
  //     },
  //     {
  //       id: "2",
  //       name: "Wedo Admin",
  //       email: "admin@wedowebapps.com",
  //       avatar: "A",
  //       avatarColor: "bg-indigo-600",
  //     },
  //     {
  //       id: "3",
  //       name: "Admin Timely",
  //       email: "admin.timely@yogmail.com",
  //       avatar: "",
  //       avatarColor: "bg-gray-400",
  //       avatarImage: "https://via.placeholder.com/40",
  //     },
  //     {
  //       id: "4",
  //       name: "Alex Sales",
  //       email: "alex2@mailinator.com",
  //       avatar: "A",
  //       avatarColor: "bg-indigo-600",
  //     },
  //     {
  //       id: "5",
  //       name: "Bhagy Detroja",
  //       email: "bhagy.wedowebapps@gmail.com",
  //       avatar: "B",
  //       avatarColor: "bg-indigo-700",
  //     },
  //     {
  //       id: "6",
  //       name: "Bhavesh Rajpurohit",
  //       email: "bhaveshr.wedowebapps@gmail.com",
  //       avatar: "B",
  //       avatarColor: "bg-indigo-700",
  //     },
  //     {
  //       id: "7",
  //       name: "Chirag Patel",
  //       email: "chirag@wedowebapps.com",
  //       avatar: "C",
  //       avatarColor: "bg-blue-600",
  //     },
  //     {
  //       id: "8",
  //       name: "Darshan Shah",
  //       email: "darshan@wedowebapps.com",
  //       avatar: "D",
  //       avatarColor: "bg-purple-600",
  //     },
  //   ];

  //   const filteredUsers = users.filter(
  //     (user) =>
  //       user.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
  //       user.email.toLowerCase().includes(searchQuery.toLowerCase())
  //   );
  const filteredUsers =
    users?.filter(
      (user: any) =>
        user?.member?.first_name
          .toLowerCase()
          .includes(searchQuery.toLowerCase()) ||
        user?.member?.last_name
          .toLowerCase()
          .includes(searchQuery.toLowerCase())
    ) || [];
//   console.log("usersusers", users);
//   console.log("filteredUsersfilteredUsers", filteredUsers);

  const toggleMemberSelection = (userId: string) => {
    setSelectedMembers((prev) =>
      prev.includes(userId)
        ? prev.filter((id) => id !== userId)
        : [...prev, userId]
    );
  };

//   console.log("toggleMemberSelection", selectedMembers);

  const handleCreateGroup = () => {
    if (!groupName.trim()) {
      alert("Please enter a group name");
      return;
    }

    if (selectedMembers.length === 0) {
      alert("Please select at least one member");
      return;
    }

    setIsCreating(true);
    const addGroup = {
      type: "group",
      intend: "create",
      name: groupName,
      members: selectedMembers,
    };
    // const addMembers = {
    //   type: "group",
    //   group_id: "groupId",
    //   intent: "add_member",
    //   members: selectedMembers,
    // };
    // if (isAddMemberModal) {
    //   chatSocket.send(addMembers);
    // } else {
      chatSocket.send(addGroup);
    // }
    // Simulate API call
    setTimeout(() => {
      console.log("Creating group:", {
        name: groupName,
        members: selectedMembers,
      });
      setIsCreating(false);
      setIsOpen(false);
    }, 1000);
  };

  const handleDiscard = () => {
    setIsOpen(false);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-2xl shadow-xl w-full max-w-md">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <div>
            <h2 className="text-xl font-semibold text-gray-900">
              Create Group
            </h2>
            <p className="text-sm text-gray-500 mt-1">
              Add group details below to create a new group.
            </p>
          </div>
          <button
            onClick={handleDiscard}
            className="text-gray-400 hover:text-gray-600 transition"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Form Content */}
        <div className="p-6 space-y-4">
          {/* Group Name Field */}
          <div>
            <input
              type="text"
              placeholder="Group Name *"
              value={groupName}
              onChange={(e) => setGroupName(e.target.value)}
              className="w-full px-4 py-2.5 bg-white border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent placeholder-gray-400"
            />
          </div>

          {/* Search Members */}
          <div>
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
              <input
                type="text"
                placeholder="Search members"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-4 py-2.5 bg-white border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent placeholder-gray-400"
              />
            </div>
            <p className="text-xs text-gray-500 mt-2">
              You can add multiple members later as well.
            </p>
          </div>

          {/* Member List */}
          <div className="max-h-64 overflow-y-auto border border-gray-200 rounded-lg">
            {filteredUsers.length > 0 ? (
              <div className="divide-y divide-gray-100">
                {filteredUsers.map((userList: any) => {
                  const user = userList.member;
                  const isSelected = selectedMembers.includes(user.id);

                  return (
                    <button
                      key={user.id}
                      onClick={() => toggleMemberSelection(user.id)}
                      className="w-full flex items-center justify-between p-3 hover:bg-gray-50 transition text-left"
                    >
                      <div className="flex items-center flex-1 min-w-0">
                        {/* {user.avatarImage ? (
                          <img
                            src={user.avatarImage}
                            alt={user.name}
                            className="w-10 h-10 rounded-full flex-shrink-0"
                          />
                        ) : ( */}
                        <div
                          className={`w-10 h-10 rounded-full  bg-indigo-600 flex items-center justify-center text-white font-semibold text-sm flex-shrink-0`}
                        >
                          {user?.display_name?.charAt(0)}
                        </div>
                        {/* )} */}
                        <div className="ml-3 min-w-0 flex-1">
                          <h3 className="text-sm font-medium text-gray-900 truncate">
                            {user.first_name && user.first_name} {user.last_name && user.last_name}
                          </h3>
                          <p className="text-xs text-gray-500 truncate">
                            {user.email}
                          </p>
                        </div>
                      </div>
                      {isSelected && (
                        <Check className="h-5 w-5 text-indigo-600 flex-shrink-0 ml-2" />
                      )}
                    </button>
                  );
                })}
              </div>
            ) : (
              <div className="p-8 text-center">
                <p className="text-sm text-gray-500">No members found</p>
              </div>
            )}
          </div>

          {/* Selected Count */}
          {selectedMembers.length > 0 && (
            <p className="text-xs text-gray-600">
              {selectedMembers.length}{" "}
              {selectedMembers.length === 1 ? "member" : "members"} selected
            </p>
          )}
        </div>

        {/* Footer Buttons */}
        <div className="flex items-center justify-end gap-3 p-6 bg-gray-50 border-t border-gray-200 rounded-b-2xl">
          <button
            onClick={handleDiscard}
            disabled={isCreating}
            className="px-4 py-2 text-sm font-medium text-gray-700 hover:text-gray-900 focus:outline-none disabled:opacity-50"
          >
            Discard
          </button>
          <button
            onClick={handleCreateGroup}
            disabled={isCreating || !groupName.trim()}
            className="px-5 py-2 bg-indigo-600 text-white text-sm font-medium rounded-lg hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 transition disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isCreating ? "Creating..." : "Create Group"}
          </button>
        </div>
      </div>
    </div>
  );
};
