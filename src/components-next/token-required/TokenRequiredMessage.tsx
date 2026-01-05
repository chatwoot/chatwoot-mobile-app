import { useRefsContext } from '@/context/RefsContext';
import { tailwind } from '@/theme';
import { useNavigation } from '@react-navigation/native';
import React from 'react';
import { Pressable, Text, View } from 'react-native';
import Animated from 'react-native-reanimated';

export const TokenRequiredMessage = () => {
  const navigation = useNavigation();

  const handleConfigureToken = () => {
    // Navegar para configurações
    navigation.navigate('Settings' as never);
  };

  return (
    <Animated.View style={tailwind.style('flex-1 items-center justify-center px-6 bg-gray-50')}>
      <View style={tailwind.style('items-center max-w-md')}>
        <Text
          style={tailwind.style('text-2xl font-inter-semibold-20 text-gray-950 text-center mb-4')}
        >
          Configure um token
        </Text>
        <Text
          style={tailwind.style(
            'text-base text-gray-700 font-inter-420-20 leading-[21px] text-center mb-8',
          )}
        >
          Configure um token para poder espelhar os dados da sua conta no app.
        </Text>
        <Pressable
          onPress={handleConfigureToken}
          style={tailwind.style('bg-blue-600 px-6 py-3 rounded-lg active:bg-blue-700')}
        >
          <Text style={tailwind.style('text-white font-inter-medium-24 text-center')}>
            Configurar Token
          </Text>
        </Pressable>
      </View>
    </Animated.View>
  );
};
