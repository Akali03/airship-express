"use server";

import { supabase } from "../../../../lib/services/client/supabase";
import { cookies, headers } from "next/headers";
import { sanitizeBarcode } from "../../../../components/global/sanitize";
import { isRateLimited } from "../../../../components/global/rateLimit";

const generateTrackingNumber = () => {
    const date = new Date();
    const dateStr = date.getFullYear() +
        String(date.getMonth() + 1).padStart(2, '0') +
        String(date.getDate()).padStart(2, '0');
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
    let randomStr = '';
    for (let i = 0; i < 5; i++) {
        randomStr += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    return `TRK-${dateStr}-${randomStr}`;
};

export async function scanBarcode(barcodeValue: string, scannedBy?: string) {
    try {

        const headersList = await headers();
        const ip = headersList.get('x-forwarded-for')?.split(',')[0]?.trim() || 'unknown';

        if (isRateLimited(`${ip}:scan_barcode`)) {
            return {
                success: false,
                error: 'Too many requests. Please wait.',
                status: 429,
            };
        }

        const sanitized = sanitizeBarcode(barcodeValue);

        if (!sanitized || sanitized.length < 2 || sanitized.length > 100) {
            return {
                success: false,
                error: 'Invalid barcode',
                status: 400,
            };
        }

        let finalScannedBy = scannedBy?.trim() || null;
        if (!finalScannedBy) {
            try {
                const cookieStore = await cookies();
                const token = cookieStore.get('session_token')?.value || cookieStore.get('sc_session_token')?.value;
                if (token) {
                    const { data } = await supabase
                        .from('sessions')
                        .select('user_id')
                        .eq('session_token', token)
                        .maybeSingle();
                    if (data?.user_id) {
                        finalScannedBy = data.user_id;
                    }
                }
            } catch {
                // Ignore cookie resolution failure
            }
        }

        // Parallelize all checks concurrently to eliminate network waterfall latency
        const [
            { data: existingInQueue },
            { data: existingInParcels },
            { data: mockParcel }
        ] = await Promise.all([
            supabase
                .from('receiving_queue')
                .select('barcode, status')
                .eq('barcode', sanitized)
                .maybeSingle(),
            supabase
                .from('parcels')
                .select('barcode, status, created_at')
                .eq('barcode', sanitized)
                .maybeSingle(),
            supabase
                .from('mock_third_party_parcels')
                .select('*')
                .eq('barcode', sanitized)
                .maybeSingle(),
        ]);

        if (existingInQueue) {
            return {
                success: false,
                error: `Duplicate in queue (Status: ${existingInQueue.status})`,
                status: 409,
                data: { existsIn: 'queue', status: existingInQueue.status }
            };
        }

        if (existingInParcels) {
            const receivedDate = new Date(existingInParcels.created_at).toLocaleDateString();
            return {
                success: false,
                error: `Already received on ${receivedDate}`,
                status: 409,
                data: {
                    existsIn: 'parcels',
                    status: existingInParcels.status,
                    receivedAt: existingInParcels.created_at
                }
            };
        }

        if (!mockParcel) {
            return {
                success: false,
                error: `Barcode rejected: No registered parcel record found in the database.`,
                status: 404,
                data: { existsIn: 'none', reason: 'not_found' }
            };
        }

        const missingFields: string[] = [];
        if (!mockParcel.courier && !mockParcel.courier_id) missingFields.push('courier');
        if (!mockParcel.sender_name?.trim()) missingFields.push('sender');
        if (!mockParcel.customer_name?.trim()) missingFields.push('customer');
        if (!mockParcel.destination?.trim()) missingFields.push('destination');
        if (!mockParcel.region?.trim()) missingFields.push('region');

        if (missingFields.length > 0) {
            return {
                success: false,
                error: `Barcode rejected: Incomplete parcel details (missing ${missingFields.join(', ')}).`,
                status: 422,
                data: { existsIn: 'none', reason: 'incomplete_information', missingFields }
            };
        }

        const trackingNumber = generateTrackingNumber();

        const insertData: any = {
            barcode: sanitized,
            tracking_number: trackingNumber,
            status: 'pending',
            scanned_by: finalScannedBy || null,
            scanned_at: new Date().toISOString(),
            sender_name: mockParcel.sender_name.trim(),
            customer_name: mockParcel.customer_name.trim(),
            customer_number: mockParcel.customer_number?.trim() || null,
            destination: mockParcel.destination.trim(),
            courier: mockParcel.courier?.trim() || null,
            courier_id: mockParcel.courier_id || null,
            region: mockParcel.region.trim(),
            city: mockParcel.city?.trim() || null,
        };

        const { data: insertResult, error: insertError } = await supabase
            .from('receiving_queue')
            .insert([insertData])
            .select();

        if (insertError) {
            if (insertError.code === '23505') {
                const newTrackingNumber = generateTrackingNumber();
                const newInsertData = { ...insertData, tracking_number: newTrackingNumber };

                const { data: retryData, error: retryError } = await supabase
                    .from('receiving_queue')
                    .insert([newInsertData])
                    .select();

                if (retryError) {
                    return {
                        success: false,
                        error: 'Failed to add parcel after retry',
                        status: 500,
                    };
                }

                return {
                    success: true,
                    data: {
                        trackingNumber: newTrackingNumber,
                        mockParcel: mockParcel || null
                    },
                    status: 201,
                };
            }

            return {
                success: false,
                error: `Database error: ${insertError.message}`,
                status: 500,
            };
        }

        return {
            success: true,
            data: {
                trackingNumber,
                mockParcel: mockParcel || null
            },
            status: 201,
        };
    } catch (error) {
        return {
            success: false,
            error: error instanceof Error ? error.message : 'Internal server error',
            status: 500,
        };
    }
}