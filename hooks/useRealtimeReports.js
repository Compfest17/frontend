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

export function useRealtimeForumStatus({ onStatusChange }) {
  const channelRef = useRef(null);

  useEffect(() => {
    const channelName = 'forum-status-changes';
    
    channelRef.current = supabase
      .channel(channelName)
      .on('postgres_changes', {
        event: 'UPDATE',
        schema: 'public',
        table: 'forums'
      }, (payload) => {
        console.log('Forum status changed:', payload);
        if (payload.old.status !== payload.new.status) {
          console.log('Status changed from', payload.old.status, 'to', payload.new.status);
          onStatusChange && onStatusChange(payload.new, payload.old);
        }
      })
      .subscribe((status) => {
        console.log(`Forum status realtime subscription status:`, status);
      });

    return () => {
      if (channelRef.current) {
        supabase.removeChannel(channelRef.current);
        channelRef.current = null;
      }
    };
  }, [onStatusChange]);

  return {
    isConnected: channelRef.current?.state === 'joined'
  };
}

export function useRealtimeNotifications({ userId, onNotification }) {
  const channelRef = useRef(null);

  useEffect(() => {
    if (!userId) return;

    const channelName = `notifications-${userId}`;
    
    channelRef.current = supabase
      .channel(channelName)
      .on('postgres_changes', {
        event: 'INSERT',
        schema: 'public',
        table: 'notifications',
        filter: `user_id=eq.${userId}`
      }, (payload) => {
        console.log('New notification received:', payload);
        onNotification && onNotification(payload.new);
      })
      .subscribe((status) => {
        console.log(`Notifications realtime subscription status:`, status);
      });

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

