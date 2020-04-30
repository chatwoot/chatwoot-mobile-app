import moment from 'moment';

import i18n from '../i18n';

class DateHelper {
  constructor(date) {
    this.date = moment(date * 1000);
    this.today = moment();
    this.yesterday = moment().subtract(1, 'day');
  }

  format(dateFormat = 'MMM DD, YYYY') {
    if (moment(this.date).isSame(this.today, 'day')) {
      return i18n.t('CONVERSATION.TODAY');
    }
    if (moment(this.date).isSame(this.yesterday, 'day')) {
      return i18n.t('CONVERSATION.YESTERDAY');
    }
    return this.date.format(dateFormat);
  }
}

export default DateHelper;
