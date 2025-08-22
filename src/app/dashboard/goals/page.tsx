
import { SavingsGoalsClient } from "@/components/dashboard/savings-goals-client";

export default function GoalsPage() {
    return (
        <div>
            <h1 className="text-3xl font-bold mb-2">Savings Goals</h1>
            <p className="text-muted-foreground mb-8">Set, track, and get advice on your financial goals to stay motivated.</p>
            <SavingsGoalsClient />
        </div>
    );
}
