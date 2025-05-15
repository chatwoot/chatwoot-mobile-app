import React from 'react';
import { View, Text, TouchableOpacity } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { tailwind } from '@/theme';

const CommunityHomeScreen = () => {
  const navigation = useNavigation();

  const handleOpenCommunity = () => {
    navigation.navigate('Community' as never);
  };

  return (
    <View style={tailwind.style('flex-1 justify-center items-center p-4')}>
      <Text style={tailwind.style('text-2xl font-bold mb-4')}>BuddyHelp Community</Text>
      <Text style={tailwind.style('text-base text-center mb-6')}>
        Connect with fellow users, share experiences, and find support in our community space.
      </Text>
      <TouchableOpacity
        style={tailwind.style('bg-blue-500 rounded-lg px-6 py-3')}
        onPress={handleOpenCommunity}>
        <Text style={tailwind.style('text-white font-semibold text-base')}>Open Community</Text>
      </TouchableOpacity>
    </View>
  );
};

export default CommunityHomeScreen;
