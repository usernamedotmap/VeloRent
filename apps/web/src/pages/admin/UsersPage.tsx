import PageHeader from "@/components/common/PageHeader";
import ResponsiveTable from "@/components/common/ResponsiveTable";
import { Badge } from "@/components/ui/badge";
import { useUsers } from "@/hooks/useAdmin";
import { getInitials } from "@/lib/utils";
import { User } from "@/types/user.types";
import { useState } from "react";

const badgeStyles: Record<string, string> = {
    admin: "bg-red-500/15 text-red-600 border-red-200",
    operator: "bg-amber-500/15 text-amber-600 border-amber-200",
    customer: "bg-blue-500/15 text-blue-600 border-blue-200",
    verified: "bg-emerald-500/15 text-emerald-600 border-emerald-200",
    pending: "bg-slate-500/15 text-slate-600 border-slate-200",
}

const AdminUsersPage = () => {
    const [page, setPage] = useState(1);
    const { data, isLoading } = useUsers({ page, limit: 20 });

    const users = data?.data ?? [];
    const pagination = data?.meta;

    return (
        <div className="p-8 space-y-6">
            <PageHeader
                title="Users"
                description={`${pagination?.total ?? 0} registered users`}
            />

            <div className="bg-[hsl(var(--card))] rounded-2xl border border-[hsl(var(--border))] overflow-hidden">
                <ResponsiveTable
                    keyField="id"
                    isLoading={isLoading}
                    data={users}
                    emptyText="No users found"
                    colums={[
                        {
                            key: 'user',
                            label: 'User',
                            render: (user: User) => (
                                <div className="flex items-center gap-3">
                                    <div className="w-8 h-8 shrink-0 rounded-full bg-[hsl(var(--primary)/0.15)] text-[hsl(var(--primary))] flex items-center justify-center text-xs font-bold">
                                        {getInitials(user.firstName, user.lastName)}
                                    </div>
                                </div>
                            )
                        },
                        {
                            key: 'email',
                            label: 'Email',
                            render: (user: User) => (
                                <span className="text-[hsl(var(--muted-foreground))]">
                                    {user.email}
                                </span>
                            ),
                            mobileHide: true
                        },
                        {
                            key: 'phone',
                            label: 'Phone',
                            render: (user: User) => (
                                <span className="text-[hsl(var(--muted-foreground))]">
                                    {user.phone || '-'}
                                </span>
                            ),
                            mobileHide: true
                        },
                        {
                            key: 'role',
                            label: 'Role',
                            render: (user: User) => (
                                <Badge
                                    variant="outline"
                                    className={`${badgeStyles[user.role] || badgeStyles.customer} capitalize`}>
                                    {user.role}
                                </Badge>
                            )
                        },
                        {
                            key: 'isVerified',
                            label: 'Verified',
                            render: (user: User) => (
                                <Badge
                                variant="outline"
                                className={user.isVerified ? badgeStyles.verified : badgeStyles.pending}
                                >
                                    {user.isVerified ? 'Verified' : 'Pending'}
                                </Badge>
                            )
                        }
                    ]}
                />
            </div>
        </div>
    );


}

export default AdminUsersPage;