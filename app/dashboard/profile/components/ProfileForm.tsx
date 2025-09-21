// components/profile/ProfileForm.tsx
"use client";

import { useActionState } from "react";
import { updateProfile, type ProfileState } from "@/lib/profile-actions";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Save } from "lucide-react";

type InitialProfile = {
  full_name?: string | null;
  first_name?: string | null;
  last_name?: string | null;
  bio?: string | null;
  email?: string | null;
};

export default function ProfileForm({ initial }: { initial: InitialProfile }) {
  const [state, formAction, pending] = useActionState<ProfileState, FormData>(
    updateProfile,
    {}
  );

  return (
    <form action={formAction} className="space-y-4">
      {state.success && (
        <div className="rounded-md border border-green-500/30 bg-green-500/10 p-3 text-sm text-green-600">
          Profile saved!
        </div>
      )}
      {state.error && (
        <div className="rounded-md border border-red-500/30 bg-red-500/10 p-3 text-sm text-red-600">
          {state.error}
        </div>
      )}

      <div className="space-y-2">
        <Label htmlFor="fullName">Full Name</Label>
        <Input
          id="fullName"
          name="fullName"
          defaultValue={initial.full_name ?? ""}
          placeholder="Enter your full name"
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="email">Email Address</Label>
        <Input
          id="email"
          type="email"
          defaultValue={initial.email ?? ""}
          disabled
          className="bg-muted"
        />
        <p className="text-xs text-muted-foreground">
          Email cannot be changed. Contact support if you need to update your
          email.
        </p>
      </div>

      <div className="space-y-2">
        <Label htmlFor="bio">Bio</Label>
        <Textarea
          id="bio"
          name="bio"
          defaultValue={initial.bio ?? ""}
          placeholder="Tell us about yourself and your investment goals..."
          rows={4}
        />
      </div>

      <Button
        type="submit"
        className="bg-accent hover:bg-accent/90 text-accent-foreground"
        disabled={pending}
      >
        <Save className="mr-2 h-4 w-4" />
        {pending ? "Saving..." : "Save Changes"}
      </Button>
    </form>
  );
}
