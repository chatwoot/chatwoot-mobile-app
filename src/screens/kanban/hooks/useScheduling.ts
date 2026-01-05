import { DateTimePickerAndroid, type DateTimePickerEvent } from '@react-native-community/datetimepicker';
import { useCallback, useState } from 'react';
import { Platform } from 'react-native';

interface UseSchedulingResult {
  isScheduled: boolean;
  schedulingType: 'deadline' | 'schedule';
  deadlineDate: string;
  scheduledDateTime: string;
  deadlineDateValue: Date;
  scheduleDateValue: Date;
  showDeadlinePicker: boolean;
  showSchedulePicker: boolean;
  setIsScheduled: (value: boolean) => void;
  setSchedulingType: (type: 'deadline' | 'schedule') => void;
  setDeadlineDate: (date: string) => void;
  setScheduledDateTime: (dateTime: string) => void;
  setShowDeadlinePicker: (show: boolean) => void;
  setShowSchedulePicker: (show: boolean) => void;
  handleDeadlineDateChange: (event: DateTimePickerEvent, selectedDate?: Date) => void;
  handleScheduleDateChange: (event: DateTimePickerEvent, selectedDate?: Date) => void;
  openDeadlinePickerAndroid: () => void;
  openSchedulePickerAndroid: () => void;
  formatDateBR: (date: Date) => string;
  formatDateTimeISO: (date: Date) => string;
  setDeadlineDateFromISO: (isoDate: string) => void;
  setScheduledDateFromISO: (isoDate: string) => void;
}

export function useScheduling(): UseSchedulingResult {
  const [isScheduled, setIsScheduled] = useState(false);
  const [schedulingType, setSchedulingType] = useState<'deadline' | 'schedule'>('deadline');
  const [deadlineDate, setDeadlineDate] = useState('');
  const [scheduledDateTime, setScheduledDateTime] = useState('');
  const [deadlineDateValue, setDeadlineDateValue] = useState(new Date());
  const [scheduleDateValue, setScheduleDateValue] = useState(new Date());
  const [showDeadlinePicker, setShowDeadlinePicker] = useState(false);
  const [showSchedulePicker, setShowSchedulePicker] = useState(false);

  const formatDateBR = useCallback((date: Date) => {
    const day = String(date.getDate()).padStart(2, '0');
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const year = date.getFullYear();
    return `${day}/${month}/${year}`;
  }, []);

  const formatDateTimeISO = useCallback((date: Date) => {
    return date.toISOString().slice(0, 16);
  }, []);

  const handleDeadlineDateChange = useCallback(
    (event: DateTimePickerEvent, selectedDate?: Date) => {
      if (Platform.OS !== 'ios') return;
      if (event.type !== 'dismissed' && selectedDate) {
        setDeadlineDateValue(selectedDate);
        setDeadlineDate(formatDateBR(selectedDate));
      }
    },
    [formatDateBR],
  );

  const handleScheduleDateChange = useCallback(
    (event: DateTimePickerEvent, selectedDate?: Date) => {
      if (Platform.OS !== 'ios') return;
      if (event.type !== 'dismissed' && selectedDate) {
        setScheduleDateValue(selectedDate);
        setScheduledDateTime(formatDateTimeISO(selectedDate));
      }
    },
    [formatDateTimeISO],
  );

  const openDeadlinePickerAndroid = useCallback(() => {
    DateTimePickerAndroid.open({
      value: deadlineDateValue,
      mode: 'date',
      minimumDate: new Date(),
      onChange: (event, date) => {
        if (event.type === 'dismissed' || !date) return;
        setDeadlineDateValue(date);
        setDeadlineDate(formatDateBR(date));
      },
    });
  }, [deadlineDateValue, formatDateBR]);

  const openSchedulePickerAndroid = useCallback(() => {
    DateTimePickerAndroid.open({
      value: scheduleDateValue,
      mode: 'date',
      minimumDate: new Date(),
      onChange: (event, date) => {
        if (event.type === 'dismissed' || !date) return;
        DateTimePickerAndroid.open({
          value: date,
          mode: 'time',
          is24Hour: true,
          onChange: (timeEvent, timeDate) => {
            if (timeEvent.type === 'dismissed' || !timeDate) return;
            const finalDate = new Date(date);
            finalDate.setHours(timeDate.getHours(), timeDate.getMinutes(), 0, 0);
            setScheduleDateValue(finalDate);
            setScheduledDateTime(formatDateTimeISO(finalDate));
          },
        });
      },
    });
  }, [scheduleDateValue, formatDateTimeISO]);

  const setDeadlineDateFromISO = useCallback((isoDate: string) => {
    try {
      if (!isoDate) return;
      const date = new Date(isoDate);
      if (!isNaN(date.getTime())) {
        setDeadlineDateValue(date);
        setDeadlineDate(formatDateBR(date));
        setIsScheduled(true);
        setSchedulingType('deadline');
      }
    } catch (e) {
      // ignore invalid dates
    }
  }, [formatDateBR]);

  const setScheduledDateFromISO = useCallback((isoDate: string) => {
    try {
      if (!isoDate) return;
      const date = new Date(isoDate);
      if (!isNaN(date.getTime())) {
        setScheduleDateValue(date);
        setScheduledDateTime(formatDateTimeISO(date));
        setIsScheduled(true);
        setSchedulingType('schedule');
      }
    } catch (e) {
      // ignore
    }
  }, [formatDateTimeISO]);

  return {
    isScheduled,
    schedulingType,
    deadlineDate,
    scheduledDateTime,
    deadlineDateValue,
    scheduleDateValue,
    showDeadlinePicker,
    showSchedulePicker,
    setIsScheduled,
    setSchedulingType,
    setDeadlineDate,
    setScheduledDateTime,
    setShowDeadlinePicker,
    setShowSchedulePicker,
    handleDeadlineDateChange,
    handleScheduleDateChange,
    openDeadlinePickerAndroid,
    openSchedulePickerAndroid,
    formatDateBR,
    formatDateTimeISO,
    setDeadlineDateFromISO,
    setScheduledDateFromISO,
  };
}
