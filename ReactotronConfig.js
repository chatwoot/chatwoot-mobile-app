import Reactotron from 'reactotron-react-native';

const reactotron = Reactotron.useReactNative() // add all built-in react native plugins
  .connect(); //Don't forget about me!

export default reactotron;
