import { ProfileClient } from "@/components/dashboard/profile-client";

export default function ProfilePage() {
    return (
        <div>
            <h1 className="text-3xl font-bold mb-2">User Profile</h1>
            <p className="text-muted-foreground mb-6">View and update your personal information.</p>
            <ProfileClient />
        </div>
    );
}
