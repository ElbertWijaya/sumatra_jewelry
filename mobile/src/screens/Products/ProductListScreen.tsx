import React from 'react';
import { View, FlatList, RefreshControl, Text } from 'react-native';
import { useQuery } from '@tanstack/react-query';
import { getProducts } from '@api/products';
import ProductListItem from '@components/molecules/ProductListItem';
import { Product } from '@types';

const ProductListScreen: React.FC = () => {
  const { data, isLoading, refetch, isRefetching } = useQuery({
    queryKey: ['products'],
    queryFn: getProducts,
  });

  return (
    <View style={{ flex: 1 }}>
      <FlatList
        data={data || []}
        keyExtractor={(item) => item.id}
        refreshControl={
          <RefreshControl refreshing={isLoading || isRefetching} onRefresh={refetch} />
        }
        ListEmptyComponent={
          !isLoading ? (
            <Text style={{ textAlign: 'center', marginTop: 40 }}>Belum ada produk.</Text>
          ) : null
        }
        renderItem={({ item }) => <ProductListItem product={item as Product} />}
        contentContainerStyle={{ padding: 16 }}
      />
    </View>
  );
};

export default ProductListScreen;
