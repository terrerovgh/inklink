import React, { useState } from 'react';
import type { Booking } from '../../types/database';
import { actions } from 'astro:actions';
import { Search, XCircle, Eye } from 'lucide-react';

interface BookingTableProps {
    initialBookings: any[]; // Using any to accommodate joined data (artist, client, dossier)
}

export default function BookingTable({ initialBookings }: BookingTableProps) {
    const [bookings, setBookings] = useState(initialBookings);
    const [searchTerm, setSearchTerm] = useState('');
    const [loadingId, setLoadingId] = useState<string | null>(null);

    const filteredBookings = bookings.filter(booking =>
    (booking.client?.full_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        booking.artist?.full_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        booking.dossier?.title?.toLowerCase().includes(searchTerm.toLowerCase()))
    );

    const handleCancel = async (bookingId: string) => {
        if (!confirm("Are you sure you want to forcibly cancel this booking?")) return;
        setLoadingId(bookingId);
        const { error } = await actions.adminCancelBooking({ booking_id: bookingId });
        if (error) {
            alert(error.message);
        } else {
            setBookings(bookings.map(b => b.id === bookingId ? { ...b, status: 'cancelled' } : b));
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
                        placeholder="Search bookings..."
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
                            <th className="px-6 py-3">Project</th>
                            <th className="px-6 py-3">Client</th>
                            <th className="px-6 py-3">Artist</th>
                            <th className="px-6 py-3">Status</th>
                            <th className="px-6 py-3 text-right">Actions</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-border">
                        {filteredBookings.map(booking => (
                            <tr key={booking.id} className="hover:bg-muted/30 transition-colors">
                                <td className="px-6 py-4 font-medium text-foreground">
                                    {booking.dossier?.title || 'Unknown Project'}
                                </td>
                                <td className="px-6 py-4 text-muted-foreground">
                                    {booking.client?.full_name}
                                </td>
                                <td className="px-6 py-4 text-muted-foreground">
                                    {booking.artist?.full_name || 'Unassigned'}
                                </td>
                                <td className="px-6 py-4">
                                    <span className={`px-2 py-1 rounded-full text-xs font-bold ${booking.status === 'completed' ? 'bg-green-500/10 text-green-500' :
                                            booking.status === 'cancelled' ? 'bg-red-500/10 text-red-500' :
                                                booking.status === 'pending' || booking.status === 'inquiry' ? 'bg-yellow-500/10 text-yellow-500' :
                                                    'bg-blue-500/10 text-blue-500'
                                        }`}>
                                        {booking.status}
                                    </span>
                                </td>
                                <td className="px-6 py-4 text-right">
                                    {booking.status !== 'cancelled' && booking.status !== 'completed' && (
                                        <button
                                            onClick={() => handleCancel(booking.id)}
                                            disabled={loadingId === booking.id}
                                            className="text-xs font-bold px-3 py-1 rounded bg-muted text-muted-foreground hover:bg-destructive/10 hover:text-destructive transition-colors"
                                        >
                                            Cancel
                                        </button>
                                    )}
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    );
}
