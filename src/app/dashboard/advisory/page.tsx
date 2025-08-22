import { AdvisoryClient } from "@/components/dashboard/advisory-client";

export default function AdvisoryPage() {
    return (
        <div>
            <h1 className="text-3xl font-bold mb-2">Investment Advisory</h1>
            <p className="text-muted-foreground mb-8">Get personalized advice on how to improve your spending habits and reach your goals.</p>
            <AdvisoryClient />
        </div>
    );
}
