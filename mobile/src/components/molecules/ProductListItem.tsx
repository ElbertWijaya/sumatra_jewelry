import React from 'react';
import { View, Text, TouchableOpacity } from 'react-native';
import { Product } from '@types';
import { formatCurrency } from '@utils/format';

interface Props {
  product: Product;
  onPress?: (product: Product) => void;
}

const ProductListItem: React.FC<Props> = ({ product, onPress }) => {
  return (
    <TouchableOpacity
      onPress={() => onPress?.(product)}
      style={{
        backgroundColor: '#FFFFFF',
        borderRadius: 12,
        padding: 16,
        marginBottom: 12,
        borderWidth: 1,
        borderColor: '#EFEFEF',
      }}
    >
      <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginBottom: 6 }}>
        <Text style={{ fontSize: 16, fontWeight: '600' }}>{product.name}</Text>
        <Text style={{ fontSize: 14, color: '#646464' }}>{product.sku}</Text>
      </View>
      <Text style={{ fontSize: 18, fontWeight: '700', color: '#C5972F' }}>
        {formatCurrency(product.price)}
      </Text>
      {product.weightGr && (
        <Text style={{ marginTop: 4, fontSize: 12, color: '#646464' }}>
          Berat: {product.weightGr} gr
        </Text>
      )}
    </TouchableOpacity>
  );
};

export default ProductListItem;
