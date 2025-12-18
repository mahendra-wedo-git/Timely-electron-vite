import {
  createContext,
  useContext,
  useCallback,
  useState,
  ReactNode,
  FC,
} from "react";
import { useParams } from "react-router-dom";
import { WorkspaceService } from "src/services/workspace.service";
import { IWorkspaceMember } from "src/types";
import { EUserPermissions } from "src/utils";

export interface IWorkspaceMembership {
  id: string;
  member: IWorkspaceMember["member"];
  role: EUserPermissions;
  is_client: boolean;
}

interface IWorkspaceMemberContextState {
  workspaceMemberMap: Record<string, Record<string, IWorkspaceMembership>>;
  isLoading: boolean;
  error: any;

  fetchWorkspaceMember: (workspaceSlug: string) => Promise<IWorkspaceMember[]>;
  getWorkspaceMemberDetails: (
    userId: string
  ) => IWorkspaceMembership | null;
  
}


export interface WorkspaceMemberProviderProps {
  children: ReactNode;
}

const WorkspaceMemberContext = createContext<
  IWorkspaceMemberContextState | undefined
>(undefined);

const workspaceService = new WorkspaceService();
export const WorkspaceMemberProvider: FC<WorkspaceMemberProviderProps> = ({
  children,
}) => {
  const { workspace: workspaceSlug } = useParams();

  const [workspaceMemberMap, setWorkspaceMemberMap] = useState<
    Record<string, Record<string, IWorkspaceMembership>>
  >({});
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<any>(null);

  const fetchWorkspaceMember = useCallback(
    async (slug: string): Promise<IWorkspaceMember[]> => {
      console.log("fetchMembers api call");
      setIsLoading(true);
      setError(null);
      try {
        const members = await workspaceService.fetchWorkspaceMembers(slug);

        setWorkspaceMemberMap((prev) => ({
          ...prev,
          [slug]: members.reduce(
            (acc, m) => {
              acc[m.member.id] = {
                id: m.id,
                member: m.member,
                role: m.role,
                is_client: m.is_client,
              };
              return acc;
            },
            {} as Record<string, IWorkspaceMembership>
          ),
        }));

        return members;
      } catch (err) {
        setError(err);
        throw err;
      } finally {
        setIsLoading(false);
      }
    },
    []
  );

  //   const getWorkspaceMemberDetails = useCallback(
  //     (userId: string): IWorkspaceMember | null => {
  //         console.log("getWorkspaceMemberDetails", userId);
  //       if (!workspaceSlug) return null;

  //       const workspaceMember = workspaceMemberMap?.[workspaceSlug]?.[userId];
  //       if (!workspaceMember) return null;

  //       return {
  //         id: workspaceMember.id,
  //         role: workspaceMember.role as any,
  //         member: workspaceMember.member,
  //         is_client: workspaceMember.is_client,
  //       };
  //     },
  //     [workspaceSlug, workspaceMemberMap]
  //   );

  const getWorkspaceMemberDetails = useCallback(
    (userId: string): IWorkspaceMembership | null => {
      if (!workspaceSlug) return null;
      return workspaceMemberMap?.[workspaceSlug]?.[userId] ?? null;
    },
    [workspaceSlug, workspaceMemberMap]
  );

  return (
    <WorkspaceMemberContext.Provider
      value={{
        workspaceMemberMap,
        isLoading,
        error,
        fetchWorkspaceMember,
        getWorkspaceMemberDetails,
      }}
    >
      {children}
    </WorkspaceMemberContext.Provider>
  );
};

export const useWorkspaceMembers = () => {
  const ctx = useContext(WorkspaceMemberContext);
  if (!ctx) {
    throw new Error(
      "useWorkspaceMembers must be used inside <WorkspaceMemberProvider>"
    );
  }
  return ctx;
};
