import React, { useState } from 'react';
import type { Profile } from '../../types/database';
import { actions } from 'astro:actions';
import { Search, MoreHorizontal, UserX, Shield } from 'lucide-react';

interface UserTableProps {
    initialUsers: Profile[];
}

export default function UserTable({ initialUsers }: UserTableProps) {
    const [users, setUsers] = useState<Profile[]>(initialUsers);
    const [searchTerm, setSearchTerm] = useState('');
    const [loadingId, setLoadingId] = useState<string | null>(null);

    const filteredUsers = users.filter(user =>
    (user.full_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        user.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        user.username?.toLowerCase().includes(searchTerm.toLowerCase()))
    );

    const handleRoleUpdate = async (userId: string, newRole: string) => {
        if (!confirm(`Are you sure you want to change this user's role to ${newRole}?`)) return;
        setLoadingId(userId);
        const { data, error } = await actions.adminUpdateUserRole({ user_id: userId, role: newRole as any });
        if (error) {
            alert(error.message);
        } else {
            setUsers(users.map(u => u.id === userId ? { ...u, role: newRole } as any : u));
        }
        setLoadingId(null);
    };

    const handleDelete = async (userId: string) => {
        if (!confirm("Are you sure you want to delete this user? This action cannot be undone.")) return;
        setLoadingId(userId);
        const { error } = await actions.adminDeleteUser({ user_id: userId });
        if (error) {
            alert(error.message);
        } else {
            setUsers(users.filter(u => u.id !== userId));
        }
        setLoadingId(null);
    };

    return (
        <div className="bg-card border border-border rounded-xl overflow-hidden">
            <div className="p-4 border-b border-border">
                <div className="relative max-w-sm">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" size={18} />
                    <input
                        type="text"
                        placeholder="Search users..."
                        className="w-full pl-10 pr-4 py-2 bg-background border border-input rounded-lg text-sm"
                        value={searchTerm}
                        onChange={e => setSearchTerm(e.target.value)}
                    />
                </div>
            </div>

            <div className="overflow-x-auto">
                <table className="w-full text-sm text-left">
                    <thead className="bg-muted/50 text-muted-foreground font-medium">
                        <tr>
                            <th className="px-6 py-3">User</th>
                            <th className="px-6 py-3">Role</th>
                            <th className="px-6 py-3">Email</th>
                            <th className="px-6 py-3 text-right">Actions</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-border">
                        {filteredUsers.map(user => (
                            <tr key={user.id} className="hover:bg-muted/30 transition-colors">
                                <td className="px-6 py-4">
                                    <div className="flex items-center gap-3">
                                        <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center text-primary font-bold">
                                            {user.avatar_url ? (
                                                <img src={user.avatar_url} className="w-full h-full rounded-full object-cover" />
                                            ) : (
                                                user.full_name?.charAt(0) || user.email.charAt(0)
                                            )}
                                        </div>
                                        <div>
                                            <div className="font-medium text-foreground">{user.full_name || 'No Name'}</div>
                                            <div className="text-xs text-muted-foreground">{user.username ? `@${user.username}` : ''}</div>
                                        </div>
                                    </div>
                                </td>
                                <td className="px-6 py-4">
                                    <select
                                        className={`bg-transparent font-medium rounded outline-none cursor-pointer ${user.role === 'admin' ? 'text-red-500' :
                                                user.role === 'artist' ? 'text-purple-500' :
                                                    user.role === 'studio_owner' ? 'text-blue-500' :
                                                        'text-foreground'
                                            }`}
                                        value={user.role}
                                        onChange={(e) => handleRoleUpdate(user.id, e.target.value)}
                                        disabled={loadingId === user.id}
                                    >
                                        <option value="user">User</option>
                                        <option value="artist">Artist</option>
                                        <option value="studio_owner">Studio</option>
                                        <option value="admin">Admin</option>
                                    </select>
                                </td>
                                <td className="px-6 py-4 text-muted-foreground">{user.email}</td>
                                <td className="px-6 py-4 text-right">
                                    <button
                                        onClick={() => handleDelete(user.id)}
                                        disabled={loadingId === user.id}
                                        className="text-muted-foreground hover:text-destructive transition-colors p-2"
                                        title="Delete User"
                                    >
                                        <UserX size={18} />
                                    </button>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    );
}
