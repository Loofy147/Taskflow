import { InviteMemberForm } from "@/components/teams/InviteMemberForm";

export function TeamPage() {
  return (
    <div className="grid gap-4">
      <div>
        <h1 className="text-3xl font-bold">Team</h1>
        <p className="text-muted-foreground">Manage your team members and settings.</p>
      </div>
      <div className="grid gap-4 md:grid-cols-2">
        <div>
          <h2 className="text-xl font-bold">Invite Member</h2>
          <InviteMemberForm />
        </div>
        <div>
          <h2 className="text-xl font-bold">Team Members</h2>
          {/* I'll implement the team members list in a later step. */}
        </div>
      </div>
    </div>
  );
}
