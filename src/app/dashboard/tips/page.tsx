import { getFinanceTips } from "@/app/actions";
import { FinanceTipsClient } from "@/components/dashboard/finance-tips-client";

export const dynamic = 'force-dynamic'

export default async function TipsPage() {
    const initialTipsResult = await getFinanceTips();
    const initialTips = initialTipsResult.success ? initialTipsResult.data : [];

    return (
        <div>
            <h1 className="text-3xl font-bold mb-2">AI-Powered Finance Tips</h1>
            <p className="text-muted-foreground mb-8">Get smart, personalized advice to improve your financial health.</p>
            <FinanceTipsClient initialTips={initialTips || []} />
        </div>
    );
}
