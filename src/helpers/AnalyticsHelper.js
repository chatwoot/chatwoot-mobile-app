import Config from 'react-native-config';
import axios from 'axios';

const BASE_URL = 'https://api.june.so/api/';

class AnalyticsHelper {
  constructor(resource, options = {}) {
    this.analyticsToken = Config.JUNE_SDK_KEY;
    this.user = {};
    this.isAnalyticsEnabled = !!(!__DEV__ && this.analyticsToken);
    this.APIHelper = axios.create({
      baseURL: BASE_URL,
      headers: { Authorization: `Basic ${this.analyticsToken}` },
    });
  }

  getCurrentAccount() {
    if (this.user) {
      const { accounts, account_id: accountId } = this.user;
      const [currentAccount] = accounts.filter(account => account.id === accountId);
      return currentAccount;
    }
  }

  identifyUser() {
    return this.APIHelper.post('identify', {
      userId: this.user.id,
      traits: {
        email: this.user.email,
        name: this.user.name,
        avatar: this.user.avatar_url,
      },
      timestamp: new Date(),
    });
  }

  identifyGroup() {
    const currentAccount = this.getCurrentAccount();
    if (currentAccount) {
      return this.APIHelper.post('group', {
        userId: this.user.id,
        groupId: currentAccount.id,
        traits: {
          name: currentAccount.name,
        },
        timestamp: new Date(),
      });
    }
  }

  identify(user) {
    if (this.isAnalyticsEnabled) {
      this.user = user;
      this.identifyUser();
      this.identifyGroup();
    }
  }

  track(eventName, properties = {}) {
    if (this.isAnalyticsEnabled) {
      const currentAccount = this.getCurrentAccount();
      return this.APIHelper.post('track', {
        userId: this.user.id,
        event: `Mobile: ${eventName}`,
        properties,
        timestamp: new Date(),
        context: {
          groupId: currentAccount ? currentAccount.id : '',
        },
      });
    }
  }
}

export default new AnalyticsHelper();
