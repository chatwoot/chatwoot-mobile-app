import React from 'react';
import { Pressable } from 'react-native';
import Animated from 'react-native-reanimated';
import { Icon } from '@/components-next';
import { CaretRight, MoveToInbox } from '@/svg-icons';
import { tailwind } from '@/theme';
import { useAppSelector } from '@/hooks';
import { selectInboxById } from '@/store/inbox/inboxSelectors';

type InboxPanelProps = {
  inboxId: number | undefined;
  onPress: () => void;
};

const InboxPanel = ({ inboxId, onPress }: InboxPanelProps) => {
  const inbox = useAppSelector(state => (inboxId ? selectInboxById(state, inboxId) : null));

  const inboxName = inbox ? inbox.name : 'Nenhuma caixa de entrada';
  const inboxActionText = 'Mover';

  return (
    <Pressable
      onPress={onPress}
      style={({ pressed }) => [
        tailwind.style(pressed ? 'bg-gray-100' : '', 'rounded-b-[13px]'),
      ]}>
      <Animated.View style={tailwind.style('flex-row items-center justify-between pl-3')}>
        <Icon icon={<MoveToInbox color="#6B7280" size={24} />} />
        <Animated.View
          style={tailwind.style(
            'flex-1 flex-row items-center justify-between py-[11px] ml-[10px]',
          )}>
          <Animated.View style={tailwind.style('flex-1')}>
            <Animated.Text
              style={tailwind.style(
                'text-base font-inter-420-20 leading-[22px] tracking-[0.16px] text-gray-950',
              )}>
              {inboxName}
            </Animated.Text>
            {inbox?.phoneNumber && (
              <Animated.Text
                style={tailwind.style(
                  'text-sm font-inter-normal-20 leading-[18px] text-gray-500 mt-0.5',
                )}>
                {inbox.phoneNumber}
              </Animated.Text>
            )}
          </Animated.View>
          <Animated.View style={tailwind.style('flex-row items-center pr-3')}>
            <Animated.Text
              style={tailwind.style(
                'text-base font-inter-normal-20 leading-[22px] tracking-[0.16px] text-gray-900',
              )}>
              {inboxActionText}
            </Animated.Text>
            <Icon icon={<CaretRight />} size={20} />
          </Animated.View>
        </Animated.View>
      </Animated.View>
    </Pressable>
  );
};

export default InboxPanel;

