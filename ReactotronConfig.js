import Reactotron from 'reactotron-react-native';
import { reactotronRedux } from 'reactotron-redux';

const reactotron = Reactotron.useReactNative() // add all built-in react native plugins
  .use(reactotronRedux())
  .connect(); //Don't forget about me!

export default reactotron;
