import React, { useEffect, useRef } from 'react';
import { useQuery } from '@tanstack/react-query';
import { useAuth } from '@lib/context/AuthContext';
import { api } from '@lib/api/client';
import { notifyAssignment } from './index';

export const AssignmentWatcher: React.FC = () => {
  const { token, user } = useAuth();
  const tasksQuery = useQuery<any[]>({
    queryKey: ['tasks','assignments','watcher'],
    queryFn: () => api.tasks.list(token || '') as Promise<any[]>,
    enabled: !!token,
    refetchInterval: 6000,
    staleTime: 0,
  });

  const seenAssignedRef = useRef<Map<number, string | null>>(new Map());
  const readyRef = useRef(false);

  useEffect(() => {
    if (!user?.id) return;
    const tasks = Array.isArray(tasksQuery.data) ? tasksQuery.data : [];
    const map = seenAssignedRef.current;
    const isFirst = !readyRef.current;
    for (const t of tasks) {
      const id = Number(t.id);
      const currentAssignee: string | null = (t.assignedTo?.id as string) || null;
      const prevAssignee = map.get(id) ?? null;
      const isNowMine = currentAssignee === user.id;
      const wasMine = prevAssignee === user.id;
      if (!isFirst && isNowMine && !wasMine) {
        const orderId = t.order?.id || t.orderId;
        notifyAssignment({ taskId: id, orderId, title: 'Tugas baru untuk Anda', body: `Anda ditugaskan pada Order #${orderId ?? id}` });
      }
      map.set(id, currentAssignee);
    }
    readyRef.current = true;
  }, [tasksQuery.data, user?.id]);

  return null;
};
