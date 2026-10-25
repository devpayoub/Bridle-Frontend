"use client";

import { useState } from "react";

import { useRouter } from "next/navigation";

import { Trash2Icon } from "lucide-react";
import { toast } from "sonner";

import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { apiDelete, apiPatch } from "@/lib/api/client";
import { errorMessage } from "@/lib/api/errors";
import type { MembershipRow, Role } from "@/lib/api/types";
import { formatDate } from "@/lib/format";

const ROLE_LABELS: Record<Role, string> = {
  OWNER: "Owner",
  ADMIN: "Admin",
  DEVELOPER: "Developer",
  MEMBER: "Member",
  READ_ONLY: "Read only",
};

const ASSIGNABLE: Role[] = ["ADMIN", "DEVELOPER", "MEMBER", "READ_ONLY"];

export function MembersTable({
  members,
  organizationId,
  canWrite,
  actorRole,
  currentUserId,
}: {
  members: MembershipRow[];
  organizationId: string;
  canWrite: boolean;
  actorRole: Role;
  currentUserId: string;
}) {
  const router = useRouter();
  const [busyId, setBusyId] = useState<string | null>(null);

  const isOwnerActor = actorRole === "OWNER";

  const changeRole = async (member: MembershipRow, role: Role) => {
    setBusyId(member.user_id);
    try {
      await apiPatch(`/organizations/${organizationId}/members/${member.user_id}/`, { role });
      toast.success("Role updated.");
      router.refresh();
    } catch (error) {
      toast.error(errorMessage(error));
    } finally {
      setBusyId(null);
    }
  };

  const remove = async (member: MembershipRow) => {
    setBusyId(member.user_id);
    try {
      await apiDelete(`/organizations/${organizationId}/members/${member.user_id}/`);
      toast.success("Member removed.");
      router.refresh();
    } catch (error) {
      toast.error(errorMessage(error));
    } finally {
      setBusyId(null);
    }
  };

  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead className="pl-4">Member</TableHead>
          <TableHead>Role</TableHead>
          <TableHead>Joined</TableHead>
          {canWrite ? <TableHead className="pr-4 text-right">Actions</TableHead> : null}
        </TableRow>
      </TableHeader>
      <TableBody>
        {members.map((member) => {
          const isSelf = member.user_id === currentUserId;
          const isOwnerRow = member.role === "OWNER";
          const locked = !canWrite || busyId === member.user_id || (isOwnerRow && !isOwnerActor);

          return (
            <TableRow key={member.id}>
              <TableCell className="pl-4">
                <div className="flex flex-col gap-0.5">
                  <span className="flex items-center gap-2 font-medium">
                    {member.full_name || member.email}
                    {isSelf ? (
                      <Badge variant="secondary" className="font-normal">
                        You
                      </Badge>
                    ) : null}
                  </span>
                  <span className="text-muted-foreground text-xs">{member.email}</span>
                </div>
              </TableCell>
              <TableCell>
                {canWrite && !isOwnerRow ? (
                  <Select
                    value={member.role}
                    onValueChange={(value) => changeRole(member, value as Role)}
                    disabled={busyId === member.user_id}
                  >
                    <SelectTrigger size="sm" aria-label={`Role for ${member.email}`}>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {ASSIGNABLE.map((role) => (
                        <SelectItem key={role} value={role}>
                          {ROLE_LABELS[role]}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                ) : (
                  <Badge variant="outline" className="font-normal">
                    {ROLE_LABELS[member.role]}
                  </Badge>
                )}
              </TableCell>
              <TableCell className="text-muted-foreground text-sm tabular-nums">
                {formatDate(member.created_at)}
              </TableCell>
              {canWrite ? (
                <TableCell className="pr-4 text-right">
                  {!isOwnerRow ? (
                    <AlertDialog>
                      <AlertDialogTrigger asChild>
                        <Button
                          variant="ghost"
                          size="icon-sm"
                          aria-label={`Remove ${member.email}`}
                          className="text-muted-foreground hover:text-destructive"
                          disabled={locked}
                        >
                          <Trash2Icon className="size-4" />
                        </Button>
                      </AlertDialogTrigger>
                      <AlertDialogContent>
                        <AlertDialogHeader>
                          <AlertDialogTitle>Remove this member?</AlertDialogTitle>
                          <AlertDialogDescription>
                            {member.email} loses access to this workspace immediately. Their account stays intact.
                          </AlertDialogDescription>
                        </AlertDialogHeader>
                        <AlertDialogFooter>
                          <AlertDialogCancel>Cancel</AlertDialogCancel>
                          <AlertDialogAction onClick={() => remove(member)}>Remove</AlertDialogAction>
                        </AlertDialogFooter>
                      </AlertDialogContent>
                    </AlertDialog>
                  ) : (
                    <span className="text-muted-foreground text-xs">Transfer ownership first</span>
                  )}
                </TableCell>
              ) : null}
            </TableRow>
          );
        })}
      </TableBody>
    </Table>
  );
}
