import { prisma } from "@/lib/prisma";
import { getSession } from "@/lib/session";
import { InviteUserForm } from "./InviteUserForm";
import { UserActions } from "./UserActions";

export default async function AdminUsersPage() {
  const session = await getSession();
  const users = await prisma.user.findMany({
    select: { id: true, name: true, email: true, role: true, status: true, xp: true },
    orderBy: { createdAt: "asc" },
  });

  return (
    <div>
      <h1 className="text-2xl font-extrabold text-gray-800 mb-6">User Management</h1>

      <div className="bg-white rounded-2xl border-2 border-gray-100 shadow p-5 mb-5">
        <h2 className="text-sm font-bold text-gray-500 mb-3">Invite User</h2>
        <InviteUserForm />
      </div>

      <div className="bg-white rounded-2xl border-2 border-gray-100 shadow p-5">
        <h2 className="text-sm font-bold text-gray-500 mb-3">All Users ({users.length})</h2>
        <div className="overflow-x-auto">
          <table className="w-full text-sm" data-testid="users-table">
            <thead>
              <tr className="text-xs text-gray-400 border-b">
                <th className="text-left pb-2">Name</th>
                <th className="text-left pb-2">Email</th>
                <th className="text-center pb-2">Status</th>
                <th className="text-right pb-2">XP</th>
                <th className="text-right pb-2">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {users.map((u) => (
                <tr key={u.id} data-testid={`user-row-${u.id}`}>
                  <td className="py-2 text-gray-700 font-semibold">
                    {u.name}
                    {u.id === session?.userId && <span className="ml-2 text-xs text-violet-400">(you)</span>}
                  </td>
                  <td className="py-2 text-gray-400 text-xs">{u.email}</td>
                  <td className="py-2 text-center">
                    <span
                      data-testid={`user-status-${u.id}`}
                      className={`text-xs font-bold px-2 py-0.5 rounded-full ${
                        u.status === "ACTIVE" ? "bg-green-100 text-green-700" : "bg-red-100 text-red-600"
                      }`}
                    >
                      {u.status}
                    </span>
                  </td>
                  <td className="py-2 text-right text-yellow-600 font-semibold">{u.xp}</td>
                  <td className="py-2 text-right">
                    <UserActions
                      userId={u.id}
                      role={u.role}
                      status={u.status}
                      isSelf={u.id === session?.userId}
                    />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
