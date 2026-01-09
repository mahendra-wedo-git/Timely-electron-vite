import { useEffect, useRef } from "react";

export interface QuickActionItem {
  id: string;
  label: string;
  icon?: React.ReactNode;
  onClick: () => void;
  variant?: "default" | "danger";
  dividerAbove?: boolean;
}

interface QuickActionsMenuProps {
  actions: QuickActionItem[];
  onClose: () => void;
  position: { top: number; right: number };
  minWidth?: number;
}

export const QuickActionsMenu = ({
  actions,
  onClose,
  position,
  minWidth = 160,
}: QuickActionsMenuProps) => {
  const menuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        onClose();
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () =>
      document.removeEventListener("mousedown", handleClickOutside);
  }, [onClose]);

  return (
    <div
      ref={menuRef}
      className="absolute z-50 bg-white rounded-lg shadow-lg border border-gray-200 py-1"
      style={{
        top: position.top,
        right: position.right,
        minWidth,
      }}
    >
      {actions.map((action) => (
        <div key={action.id}>
          {action.dividerAbove && (
            <div className="border-t border-gray-200 my-1" />
          )}

          <button
            onClick={() => {
              action.onClick();
              onClose();
            }}
            className={`w-full px-4 py-2 text-left text-xs flex items-center gap-3
              ${
                action.variant === "danger"
                  ? "text-red-600 hover:bg-red-50"
                  : "text-gray-700 hover:bg-gray-100"
              }
            `}
          >
            {action.icon}
            {action.label}
          </button>
        </div>
      ))}
    </div>
  );
};
