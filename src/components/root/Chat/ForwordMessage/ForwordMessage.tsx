import React, { FC, useState } from "react";
import { Search, X, Check } from "lucide-react";
import { useAppSelector } from "src/redux/hooks";
import { selectAllGroups } from "src/redux/chatSlice";
import { useChatSocket } from "src/context/chatContext";

interface User {
  id: string;
  name: string;
  email: string;
  avatar: string;
  avatarColor: string;
  avatarImage?: string;
}

interface ForwardMessageModalProps {
  selectedMassage?: any;
  isOpen: boolean;
  onClose?: () => void;
  setIsOpen: React.Dispatch<React.SetStateAction<boolean>>;
}
export const ForwardMessageModal: FC<ForwardMessageModalProps> = ({
  selectedMassage,
  isOpen,
  onClose,
  setIsOpen,
}) => {
  const originalMessage = {
    sender: "Mahendra Parmar",
    content: "hello",
    timestamp: "Nov 26, 2025 4:23 PM",
  };
  //   const [isOpen, setIsOpen] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedMembers, setSelectedMembers] = useState<string[]>([]);
  const chatSocketService = useChatSocket();
//   console.log("selectedMembersselectedMembers", selectedMembers);
  const [note, setNote] = useState("");
  const [isForwarding, setIsForwarding] = useState(false);
  const WorkspaceMember = useAppSelector(selectAllGroups);
  const users: User[] = [
    {
      id: "1",
      name: "Admin Timely",
      email: "admin.timely@yogmail.com",
      avatar: "",
      avatarColor: "bg-gray-400",
      avatarImage: "https://via.placeholder.com/40",
    },
    {
      id: "2",
      name: "Vyom Patel",
      email: "vyom.wedowebapps@gmail.com",
      avatar: "",
      avatarColor: "bg-gray-400",
      avatarImage: "https://via.placeholder.com/40/333333",
    },
    {
      id: "3",
      name: "Niraj Parmar",
      email: "niraj.wedowebapps@gmail.com",
      avatar: "N",
      avatarColor: "bg-indigo-600",
    },
    {
      id: "4",
      name: "Timely Admin",
      email: "admin@timely.com",
      avatar: "A",
      avatarColor: "bg-indigo-600",
    },
    {
      id: "5",
      name: "Bhagy Detroja",
      email: "bhagy.wedowebapps@gmail.com",
      avatar: "B",
      avatarColor: "bg-indigo-700",
    },
    {
      id: "6",
      name: "Bhavesh Rajpurohit",
      email: "bhaveshr.wedowebapps@gmail.com",
      avatar: "B",
      avatarColor: "bg-indigo-700",
    },
    {
      id: "7",
      name: "Chirag Patel",
      email: "chirag@wedowebapps.com",
      avatar: "C",
      avatarColor: "bg-blue-600",
    },
  ];

  const filteredUsers = WorkspaceMember.filter((user) =>
    user.group_name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const toggleMemberSelection = (userId: string) => {
    setSelectedMembers((prev) =>
      prev.includes(userId)
        ? prev.filter((id) => id !== userId)
        : [...prev, userId]
    );
  };

  const handleForward = () => {
    if (selectedMembers.length === 0) {
      alert("Please select at least one member to forward the message");
      return;
    }

    setIsForwarding(true);
    const forwardMessage = {
      type: "message",
      intent: "create",
      content: note,
      is_forwarded: true,
      forward_members: selectedMembers,
      forwarded_from: selectedMassage.id,
    };
    chatSocketService.send(forwardMessage);
    // Simulate API call
    setTimeout(() => {
      console.log("Forwarding message to:", {
        recipients: selectedMembers,
        note: note,
        originalMessage: originalMessage,
      });
      setIsForwarding(false);
      setIsOpen(false);
    }, 1000);
  };

  const handleCancel = () => {
    setIsOpen(false);
  };

  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50"
      onClick={handleCancel}
    >
      <div
        className="bg-white rounded-2xl shadow-xl w-full max-w-md"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between pt-4 px-6">
          <div>
            <h3 className="text-lg text-gray-900">Forward this message</h3>
            <p className="text-xs text-gray-400 mt-1">
              You can forward to any chat or channel.
            </p>
          </div>
          {/* <button
            onClick={handleCancel}
            className="text-gray-400 hover:text-gray-600 transition"
          >
            <X className="h-5 w-5" />
          </button> */}
        </div>

        {/* Content */}
        <div className=" space-y-4 px-6 py-3">
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
          </div>

          {/* Member List */}
          <div className="max-h-48 overflow-y-auto border border-gray-200 rounded-lg">
            {filteredUsers.length > 0 ? (
              <div className="divide-y divide-gray-100">
                {filteredUsers.map((user) => {
                  const isSelected = selectedMembers.includes(user.id);

                  return (
                    <button
                      key={user.id}
                      onClick={() => toggleMemberSelection(user.id)}
                      className="w-full flex items-center justify-between p-3 hover:bg-gray-50 transition text-left"
                    >
                      <div className="flex items-center flex-1 min-w-0">
                        <div className="w-8 h-8 rounded-full bg-indigo-600 flex items-center justify-center text-white text-xs font-semibold flex-shrink-0">
                          {user.group_name.charAt(0).toUpperCase()}
                        </div>
                        <div className="ml-3 min-w-0 flex-1">
                          <h3 className="text-xs font-medium text-gray-900 truncate">
                            {user.group_name}
                          </h3>
                          <p className="text-xs text-gray-500 truncate">
                            {user.name || "No email"}
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
              <div className="p-6 text-center">
                <p className="text-xs text-gray-500">No members found</p>
              </div>
            )}
          </div>

          {/* Selected Count */}
          {selectedMembers.length > 0 && (
            <p className="text-xs text-gray-600">
              {selectedMembers.length}{" "}
              {selectedMembers.length === 1 ? "recipient" : "recipients"}{" "}
              selected
            </p>
          )}

          {/* Message Preview Section */}
          <div>
            <label className="block text-xs font-medium text-gray-700 mb-2">
              Message preview
            </label>

            {/* Add Note Field */}
            <textarea
              placeholder="Add a note (optional)"
              value={note}
              onChange={(e) => setNote(e.target.value)}
              rows={2}
              className="w-full px-4 py-2.5 bg-white border border-gray-300 rounded-lg text-xs focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent placeholder-gray-400 resize-none mb-3"
            />

            {/* Original Message Preview */}
            <div className="border-l-4 border-gray-300 bg-gray-50 rounded-lg p-4">
              <div className="flex items-start space-x-3">
                <div className="w-6 h-6 rounded-full bg-indigo-600 flex items-center justify-center text-white text-xs font-semibold flex-shrink-0">
                  M
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center space-x-2 mb-1">
                    <span className="text-xs font-semibold text-gray-900">
                      {originalMessage.sender}
                    </span>
                    <span className="text-xs text-gray-500">
                      {originalMessage.timestamp}
                    </span>
                  </div>
                  <p className="text-xs text-gray-700">
                    {selectedMassage?.content && selectedMassage?.content.length > 80
                      ? `${selectedMassage?.content.slice(0, 80)}...`
                      : selectedMassage?.content}
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Footer Buttons */}
        <div className="flex items-center justify-end gap-3 p-6 bg-gray-50 border-t border-gray-200 rounded-b-2xl">
          <button
            onClick={handleCancel}
            disabled={isForwarding}
            className="px-4 py-2 text-xs font-medium text-gray-700 hover:text-gray-900 focus:outline-none disabled:opacity-50"
          >
            Cancel
          </button>
          <button
            onClick={handleForward}
            disabled={isForwarding || selectedMembers.length === 0}
            className="px-5 py-2 bg-indigo-600 text-white text-xs font-medium rounded-lg hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 transition disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isForwarding ? "Forwarding..." : "Forward"}
          </button>
        </div>
      </div>
    </div>
  );
};
