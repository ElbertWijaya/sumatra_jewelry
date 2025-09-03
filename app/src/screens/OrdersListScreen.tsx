import React from 'react';
import { View, Text, FlatList, RefreshControl } from 'react-native';
import { useQuery } from '@tanstack/react-query';
import { api } from '../api/client';
import { useAuth } from '../context/AuthContext';

export const OrdersListScreen: React.FC = () => {
  const { token } = useAuth();
  const { data, error, isLoading, refetch, isRefetching } = useQuery({
    queryKey: ['orders'],
    queryFn: () => api.orders.list(token || ''),
    enabled: !!token,
  });
  return (
    <View style={{ flex: 1, padding: 16 }}>
      {error && <Text style={{ color: 'red' }}>{String((error as any).message)}</Text>}
      <FlatList
        data={data || []}
        keyExtractor={(item: any) => String(item.id)}
        refreshControl={<RefreshControl refreshing={isRefetching || isLoading} onRefresh={refetch} />}
        renderItem={({ item }) => (
          <View style={{ padding: 12, borderBottomWidth: 1, borderBottomColor: '#eee' }}>
            <Text style={{ fontWeight: '600' }}>{item.code || '(pending code)'}</Text>
            <Text>{item.customerName} • {item.jenis} • {item.status}</Text>
          </View>
        )}
      />
    </View>
  );
};
