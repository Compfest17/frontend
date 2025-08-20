'use client';

import { useEffect, useRef } from 'react';
import { supabase } from '@/lib/supabase-auth';

export function useRealtimeReports({ userProvince, onNewReport, onReportUpdate }) {
  const channelRef = useRef(null);

  useEffect(() => {
    if (!userProvince) return;

    const channelName = `reports-${userProvince.toLowerCase().replace(/\s+/g, '-')}`;
    
    channelRef.current = supabase
      .channel(channelName)
      .on('postgres_changes', {
        event: 'INSERT',
        schema: 'public',
        table: 'forums',
        filter: `address.ilike.%${userProvince}%`
      }, (payload) => {
        console.log('New report in province:', payload);
        onNewReport && onNewReport(payload.new);
      })
      .on('postgres_changes', {
        event: 'UPDATE',
        schema: 'public',
        table: 'forums',
        filter: `address.ilike.%${userProvince}%`
      }, (payload) => {
        console.log('Report updated in province:', payload);
        onReportUpdate && onReportUpdate(payload.new, payload.old);
      })
      .subscribe((status) => {
        console.log(`Realtime subscription status for ${channelName}:`, status);
      });

    return () => {
      if (channelRef.current) {
        supabase.removeChannel(channelRef.current);
        channelRef.current = null;
      }
    };
  }, [userProvince, onNewReport, onReportUpdate]);

  return {
    isConnected: channelRef.current?.state === 'joined'
  };
}

export function useRealtimeNotifications({ userId, onNotification }) {
  const channelRef = useRef(null);

  useEffect(() => {
    if (!userId) return;

    channelRef.current = supabase
      .channel(`notifications-${userId}`)
      .on('postgres_changes', {
        event: 'INSERT',
        schema: 'public',
        table: 'notifications',
        filter: `user_id=eq.${userId}`
      }, (payload) => {
        console.log('New notification:', payload);
        onNotification && onNotification(payload.new);
      })
      .subscribe();

    return () => {
      if (channelRef.current) {
        supabase.removeChannel(channelRef.current);
        channelRef.current = null;
      }
    };
  }, [userId, onNotification]);

  return {
    isConnected: channelRef.current?.state === 'joined'
  };
}

