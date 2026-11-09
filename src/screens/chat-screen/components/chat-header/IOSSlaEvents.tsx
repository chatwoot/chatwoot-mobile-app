import { Text, View } from 'react-native';
import { format, fromUnixTime } from 'date-fns';
import { Icon } from '@/components-next';
import { SLAIcon } from '@/svg-icons';
import { tailwind } from '@/theme';
import { SLA_MISS_TYPES } from '@/constants';
import i18n from '@/i18n';
import type { SlaEventsProps } from './SlaEvents';

export const IOSSlaEvents = ({ slaEvents, statusText, isMissed }: SlaEventsProps) => {
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
