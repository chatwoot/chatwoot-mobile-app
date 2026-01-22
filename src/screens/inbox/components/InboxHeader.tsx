import React, { useCallback, useState } from 'react'; // Adicionado useCallback
import { Pressable } from 'react-native';
import Animated, { LinearTransition, useAnimatedStyle, withTiming } from 'react-native-reanimated'; // Adicionado LinearTransition, useAnimatedStyle, withTiming
import { BottomSheetModal, useBottomSheetSpringConfigs } from '@gorhom/bottom-sheet';

import { BottomSheetBackdrop, BottomSheetWrapper } from '@/components-next';

import { Icon } from '@/components-next/common/icon';
import { DoubleCheckIcon, InboxFilterIcon, SearchIcon, CloseIcon } from '@/svg-icons';
import { tailwind } from '@/theme';
import { InboxFilters } from './InboxFilters';
import i18n from '@/i18n';
import { useRefsContext } from '@/context';
import { SearchBar } from '@/components-next/common/search/SearchBar';
import { useAppDispatch, useAppSelector } from '@/hooks';
import { selectSearchText, setSearchText } from '@/store/notification/notificationFilterSlice';

type InboxHeaderProps = {
  markAllAsRead: () => void;
};

export const InboxHeader = (props: InboxHeaderProps) => {
  const { markAllAsRead } = props;
  const { inboxFiltersSheetRef } = useRefsContext();
  const dispatch = useAppDispatch();
  const currentSearchText = useAppSelector(selectSearchText);

  const [showSearchInput, setShowSearchInput] = useState(false);

  const handleToggleState = () => {
    inboxFiltersSheetRef.current?.present();
  };

  const handleSearchIconPress = useCallback(() => { // Usar useCallback
    setShowSearchInput(prev => {
      if (prev) {
        // Se estava mostrando e vai fechar, limpar o texto de busca
        dispatch(setSearchText(''));
      }
      return !prev;
    });
  }, [dispatch]);

  const handleClearSearchText = useCallback(() => { // Novo handler para limpar o texto
    dispatch(setSearchText(''));
  }, [dispatch]);

  const animationConfigs = useBottomSheetSpringConfigs({
    mass: 1,
    stiffness: 420,
    damping: 30,
  });

  // Estilo animado para o wrapper do SearchBar para expansão
  const searchBarWrapperAnimatedStyle = useAnimatedStyle(() => {
    return {
      flex: withTiming(showSearchInput ? 1 : 0.4, { duration: 250 }),
    };
  });

  return (
    <Animated.View layout={LinearTransition.springify().duration(250)} style={[tailwind.style('border-b-[1px] border-b-blackA-A3')]}>
      <Animated.View
        style={[
          tailwind.style('flex flex-row justify-between items-center px-4 pt-2 pb-[12px]'),
          showSearchInput ? tailwind.style('bg-gray-100') : tailwind.style('bg-white') // Fundo do header
        ]}
      >
        {showSearchInput ? (
          <SearchBar
            isActive={showSearchInput}
            value={currentSearchText}
            onChangeText={text => dispatch(setSearchText(text))}
            leftIcon={<CloseIcon />}
            onLeftIconPress={handleSearchIconPress}
            rightIcon={currentSearchText ? <CloseIcon /> : undefined} // Ícone X para limpar texto
            onRightIconPress={handleClearSearchText}
            wrapperStyle={tailwind.style('flex-1')}
            inputStyle={tailwind.style('bg-white')} // Cor de fundo do input
            placeholder={i18n.t('NOTIFICATION.SEARCH_PLACEHOLDER')} // Placeholder para busca
          />
        ) : (
          <>
            <Animated.View style={tailwind.style('flex-1')}>
              <Pressable hitSlop={16} onPress={markAllAsRead}>
                <Icon icon={<DoubleCheckIcon />} size={24} />
              </Pressable>
            </Animated.View>
            <Animated.View style={tailwind.style('flex-1')}>
              <Animated.Text
                style={tailwind.style(
                  'text-[17px] text-center leading-[17px] tracking-[0.32px] font-inter-medium-24 text-gray-950',
                )}>
                {i18n.t('NOTIFICATION.INBOX')}
              </Animated.Text>
            </Animated.View>
            <Animated.View style={tailwind.style('flex-1 items-end flex-row justify-end space-x-4 gap-4')}>
              <Pressable hitSlop={16} onPress={handleSearchIconPress}>
                <Icon icon={<SearchIcon />} size={24} />
              </Pressable>
              <Pressable onPress={handleToggleState} hitSlop={16}>
                <Icon icon={<InboxFilterIcon />} size={24} />
              </Pressable>
            </Animated.View>
          </>
        )}
      </Animated.View>
      <BottomSheetModal
        ref={inboxFiltersSheetRef}
        backdropComponent={BottomSheetBackdrop}
        handleIndicatorStyle={tailwind.style('overflow-hidden bg-blackA-A6 w-8 h-1 rounded-[11px]')}
        handleStyle={tailwind.style('p-0 h-4 pt-[5px]')}
        style={tailwind.style('rounded-[26px] overflow-hidden')}
        animationConfigs={animationConfigs}
        enablePanDownToClose
        snapPoints={[160]}>
        <BottomSheetWrapper>
          <InboxFilters />
        </BottomSheetWrapper>
      </BottomSheetModal>
    </Animated.View>
  );
};
