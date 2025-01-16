import axios, { AxiosInstance } from 'axios';

interface User {
  id: string | number;
  email: string;
  name: string;
  avatar_url: string;
  accounts?: Account[];
  account_id?: number | null;
}

interface Account {
  id: number;
  name: string;
}

interface AnalyticsProperties {
  [key: string]: string | number | boolean | undefined;
}

const BASE_URL = 'https://api.june.so/api/';

class AnalyticsHelper {
  private analyticsToken: string;
  private user: User;
  private isAnalyticsEnabled: boolean;
  private APIHelper: AxiosInstance;

  constructor() {
    this.analyticsToken = process.env.EXPO_PUBLIC_JUNE_SDK_KEY || '';
    this.user = {} as User;
    this.isAnalyticsEnabled = !!(!__DEV__ && this.analyticsToken);
    this.APIHelper = axios.create({
      baseURL: BASE_URL,
      headers: { Authorization: `Basic ${this.analyticsToken}` },
    });
  }

  private getCurrentAccount(): Account | undefined {
    const { accounts = [], account_id = null } = this.user;
    if (account_id && accounts.length) {
      const [currentAccount] = accounts.filter(account => account.id === account_id);
      return currentAccount;
    }
  }

  private identifyUser() {
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

  private identifyGroup() {
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

  identify(user: User): void {
    if (this.isAnalyticsEnabled) {
      this.user = user;
      this.identifyUser();
      this.identifyGroup();
    }
  }

  track(eventName: string, properties: AnalyticsProperties = {}): Promise<unknown> | void {
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
