import React from 'react';
import { Pressable, Text, Animated, View } from 'react-native';

import { TickIcon } from '@/svg-icons';
import { tailwind } from '@/theme';
import { useThemedStyles } from '@/hooks';
import { useHaptic } from '@/utils';
import { Icon } from '@/components-next/common/icon';
import { Account } from '@/types';

type AccountCellProps = {
  item: Account;
  index: number;
  currentAccountId: number | undefined;
  changeAccount: (accountId: number) => void;
  isLastItem: boolean;
};

const AccountCell = ({
  item,
  index,
  currentAccountId,
  changeAccount,
  isLastItem,
}: AccountCellProps) => {
  const themedTailwind = useThemedStyles();
  const hapticSelection = useHaptic();

  const handlePress = () => {
    hapticSelection?.();
    changeAccount(item.id);
  };

  const isSelected = item.id === currentAccountId;

  return (
    <Pressable onPress={handlePress}>
      <Animated.View style={themedTailwind.style('flex flex-row items-center')}>
        <Animated.View
          style={themedTailwind.style(
            'flex-1 ml-3 flex-row justify-between py-[11px] pr-3',
            !isLastItem && 'border-b-[1px] border-blackA-A3',
          )}
        >
          <View>
            <Text
              style={themedTailwind.style(
                'text-base capitalize text-gray-950 font-inter-420-20 leading-[21px] tracking-[0.16px]',
              )}
            >
              {item.name}
            </Text>
            <Text
              style={themedTailwind.style(
                'text-sm text-gray-900 font-inter-420-20 leading-[18px] tracking-[0.16px] capitalize',
              )}
            >
              {item.role}
            </Text>
          </View>
          {isSelected && <Icon icon={<TickIcon />} size={20} />}
        </Animated.View>
      </Animated.View>
    </Pressable>
  );
};

export const SwitchAccount = ({
  currentAccountId,
  changeAccount,
  accounts,
}: {
  currentAccountId: number | undefined;
  changeAccount: (accountId: number) => void;
  accounts: Account[];
}) => {
  const themedTailwind = useThemedStyles();
  return (
    <Animated.View style={themedTailwind.style('py-1 pl-3')}>
      {accounts.map((item, index) => (
        <AccountCell
          key={item.name}
          item={item}
          index={index}
          currentAccountId={currentAccountId}
          changeAccount={changeAccount}
          isLastItem={index === accounts.length - 1}
        />
      ))}
    </Animated.View>
  );
};
