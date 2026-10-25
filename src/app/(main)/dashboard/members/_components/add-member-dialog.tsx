"use client";

import { useState } from "react";

import { useRouter } from "next/navigation";

import { UserPlusIcon } from "lucide-react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Field, FieldDescription, FieldGroup, FieldLabel } from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Spinner } from "@/components/ui/spinner";
import { apiPost } from "@/lib/api/client";
import { ApiError, errorMessage } from "@/lib/api/errors";
import type { MembershipRow, Role } from "@/lib/api/types";

const ASSIGNABLE: { value: Exclude<Role, "OWNER">; label: string }[] = [
  { value: "ADMIN", label: "Admin" },
  { value: "DEVELOPER", label: "Developer" },
  { value: "MEMBER", label: "Member" },
  { value: "READ_ONLY", label: "Read only" },
];

export function AddMemberDialog({ organizationId }: { organizationId: string }) {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [pending, setPending] = useState(false);
  const [email, setEmail] = useState("");
  const [role, setRole] = useState<Exclude<Role, "OWNER">>("MEMBER");

  const submit = async (event: React.FormEvent) => {
    event.preventDefault();
    setPending(true);
    try {
      await apiPost<MembershipRow>(`/organizations/${organizationId}/members/`, { email: email.trim(), role });
      toast.success("Member added.");
      setOpen(false);
      setEmail("");
      setRole("MEMBER");
      router.refresh();
    } catch (error) {
      if (error instanceof ApiError && error.code === "validation_error") {
        toast.error(error.fieldErrors.email?.[0] ?? error.message);
      } else {
        toast.error(errorMessage(error));
      }
    } finally {
      setPending(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button size="sm">
          <UserPlusIcon className="size-4" />
          Add member
        </Button>
      </DialogTrigger>
      <DialogContent>
        <form onSubmit={submit} className="flex flex-col gap-4">
          <DialogHeader>
            <DialogTitle>Add a member</DialogTitle>
            <DialogDescription>
              The person must already have an account. They get access as soon as you confirm.
            </DialogDescription>
          </DialogHeader>

          <FieldGroup className="gap-4">
            <Field className="gap-1.5">
              <FieldLabel htmlFor="member-email">Email</FieldLabel>
              <Input
                id="member-email"
                type="email"
                value={email}
                onChange={(event) => setEmail(event.target.value)}
                placeholder="teammate@company.com"
                autoFocus
                required
              />
            </Field>

            <Field className="gap-1.5">
              <FieldLabel htmlFor="member-role">Role</FieldLabel>
              <Select value={role} onValueChange={(value) => setRole(value as Exclude<Role, "OWNER">)}>
                <SelectTrigger id="member-role" className="w-full">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {ASSIGNABLE.map((option) => (
                    <SelectItem key={option.value} value={option.value}>
                      {option.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <FieldDescription>Roles map to capabilities; the API enforces them on every request.</FieldDescription>
            </Field>
          </FieldGroup>

          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => setOpen(false)} disabled={pending}>
              Cancel
            </Button>
            <Button type="submit" disabled={pending || !email.trim()}>
              {pending ? <Spinner className="size-4" /> : null}
              Add member
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
