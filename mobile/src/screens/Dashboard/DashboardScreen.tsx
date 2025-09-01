import React from 'react';
import { View, Text } from 'react-native';
import { useGoldPrice } from '@store/pricing/useGoldPrice';
import { formatCurrency } from '@utils/format';
import { useAuth } from '@store/auth/useAuth';

const DashboardScreen: React.FC = () => {
  const { data, isLoading } = useGoldPrice();
  const { user } = useAuth();

  return (
    <View style={{ flex: 1, padding: 20 }}>
      <Text style={{ fontSize: 22, fontWeight: '600', marginBottom: 12 }}>
        Selamat datang{user?.name ? `, ${user.name}` : ''}!
      </Text>
      <Text style={{ fontSize: 16, marginBottom: 8 }}>Harga Emas Terkini:</Text>
      {isLoading && <Text>Memuat...</Text>}
      {!isLoading && data && (
        <Text style={{ fontSize: 28, fontWeight: '700', color: '#C5972F' }}>
          {formatCurrency(data.pricePerGram)}
        </Text>
      )}
    </View>
  );
};

export default DashboardScreen;
