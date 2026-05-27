import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { AlertTriangle } from "lucide-react";
import { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { getProfile } from "../features/auth/authSlice";

interface SubscriptionGuardProps {
    children: React.ReactNode;
}

export default function SubscriptionGuard({ children }: SubscriptionGuardProps) {
    const dispatch = useDispatch();
    const { profile } = useSelector((state: any) => state.auth);
    const token = localStorage.getItem("token");
    const [checked, setChecked] = useState(false);

    // Fetch profile if token exists
    useEffect(() => {
        if (token) {
            dispatch(getProfile(token))
                .finally(() => setChecked(true));
        } else {
            setChecked(true);
        }
    }, [dispatch, token]);

    // Only show dialog if there is no package or status === 0
    const showDialog = profile?.activePackage === null || profile?.activePackage?.status === 0;

    // While checking/loading, render children
    if (!checked) return <>{children}</>;

    return (
        <>
            {children}

            {showDialog && (
                <Dialog open={true} onOpenChange={() => {}}>
                    <DialogContent className="sm:max-w-md bg-gradient-to-br from-red-50 to-white border-red-200 [&>button]:hidden">
                        <DialogHeader className="flex flex-col items-center gap-2">
                            <div className="p-4 rounded-full bg-red-100 text-red-600">
                                <AlertTriangle className="h-16 w-16" />
                            </div>
                            <DialogTitle className="text-red-600 font-bold text-center">
                                Subscription Expired
                            </DialogTitle>
                        </DialogHeader>

                        <div className="mt-4 space-y-3 text-center">
                            <p className="text-sm text-gray-600">
                                Your subscription has expired. Please renew to continue accessing all features.
                            </p>
                            <p className="text-xs text-gray-500 italic">
                                Contact support if you need assistance.
                            </p>
                        </div>
                    </DialogContent>
                </Dialog>
            )}
        </>
    );
}
