import React from 'react';
import { Text, Animated, View } from 'react-native';
import { format, fromUnixTime } from 'date-fns';
import { Icon } from '@/components-next';
import { SLAIcon } from '@/svg-icons';
import { IOS_DESIGN } from '@/utils';
import { tailwind } from '@/theme';
import { SLAEvent } from '@/types/common/SLA';
import { SLA_MISS_TYPES } from '@/constants';
import { SlaEvents as SlaEventItem } from './SLAEventItem';
import i18n from '@/i18n';

interface SlaEventsProps {
  slaEvents?: SLAEvent[];
  statusText: string;
  isMissed?: boolean;
}

// iOS: a status header with a tinted SLA icon, then the misses as a rounded list (type on the
// left, when on the right), like an iOS info sheet.
const IOSSlaEvents = ({ slaEvents, statusText, isMissed }: SlaEventsProps) => {
  const rows = [
    { type: SLA_MISS_TYPES.FRT, label: i18n.t('SLA.MISSES.FRT') },
    { type: SLA_MISS_TYPES.NRT, label: i18n.t('SLA.MISSES.NRT') },
    { type: SLA_MISS_TYPES.RT, label: i18n.t('SLA.MISSES.RT') },
  ].flatMap(({ type, label }) =>
    (slaEvents ?? [])
      .filter(event => event.eventType === type)
      .map(event => ({ id: event.id, label, createdAt: event.createdAt })),
  );
  return (
    <View style={tailwind.style('px-4 pt-2 pb-8')}>
      <View style={tailwind.style('items-center gap-2.5 pb-5')}>
        <View
          style={tailwind.style(
            'h-11 w-11 rounded-full items-center justify-center',
            isMissed ? 'bg-ruby-100' : 'bg-gray-100',
          )}>
          <Icon icon={<SLAIcon color={isMissed ? '#E13D45' : '#858585'} />} size={22} />
        </View>
        {statusText ? (
          <Text
            style={tailwind.style(
              'text-[17px] leading-[22px] font-inter-semibold-20 text-center',
              isMissed ? 'text-ruby-800' : 'text-gray-950',
            )}>
            {statusText}
          </Text>
        ) : null}
      </View>
      {rows.length > 0 ? (
        <>
          <Text
            style={tailwind.style(
              'px-4 pb-1.5 text-[13px] leading-[18px] font-inter-normal-20 text-gray-700',
            )}>
            {i18n.t('SLA.MISSES.TITLE')}
          </Text>
          <View style={tailwind.style('rounded-[13px] bg-gray-50 overflow-hidden')}>
            {rows.map((row, index) => (
              <View key={row.id} style={tailwind.style('pl-4')}>
                <View
                  style={tailwind.style(
                    'flex-row items-center justify-between gap-3 min-h-11 py-[11px] pr-4',
                    index < rows.length - 1 && 'border-b-[0.5px] border-b-blackA-A6',
                  )}>
                  <Text
                    numberOfLines={1}
                    style={tailwind.style(
                      'flex-shrink text-[17px] leading-[22px] font-inter-normal-20 text-gray-950',
                    )}>
                    {row.label}
                  </Text>
                  <Text
                    style={tailwind.style(
                      'text-[15px] leading-[20px] font-inter-normal-20 text-gray-700',
                    )}>
                    {format(fromUnixTime(row.createdAt), 'MMM d, h:mm a')}
                  </Text>
                </View>
              </View>
            ))}
          </View>
        </>
      ) : null}
    </View>
  );
};

export const SlaEvents = (props: SlaEventsProps) => {
  if (IOS_DESIGN) return <IOSSlaEvents {...props} />;
  const { slaEvents, statusText } = props;
  const frtMisses = slaEvents?.filter(slaEvent => slaEvent.eventType === SLA_MISS_TYPES.FRT);
  const nrtMisses = slaEvents?.filter(slaEvent => slaEvent.eventType === SLA_MISS_TYPES.NRT);
  const rtMisses = slaEvents?.filter(slaEvent => slaEvent.eventType === SLA_MISS_TYPES.RT);

  return (
    <Animated.View style={tailwind.style('py-6 px-6 gap-3')}>
      {statusText ? (
        <Text
          style={tailwind.style(
            'text-[17px]  text-gray-950 font-inter-medium-24 leading-[21px] tracking-[0.16px]',
          )}>
          {statusText}
        </Text>
      ) : null}

      {slaEvents?.length ? (
        <Text
          style={tailwind.style(
            'text-md  text-gray-900 font-inter-medium-24 leading-[21px] tracking-[0.16px]',
          )}>
          {i18n.t('SLA.MISSES.TITLE')}
        </Text>
      ) : null}

      {frtMisses && frtMisses.length > 0 && (
        <SlaEventItem label={i18n.t('SLA.MISSES.FRT')} items={frtMisses} />
      )}
      {nrtMisses && nrtMisses.length > 0 && (
        <SlaEventItem label={i18n.t('SLA.MISSES.NRT')} items={nrtMisses} />
      )}
      {rtMisses && rtMisses.length > 0 && (
        <SlaEventItem label={i18n.t('SLA.MISSES.RT')} items={rtMisses} />
      )}
    </Animated.View>
  );
};
