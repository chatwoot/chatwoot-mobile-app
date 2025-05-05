import Reactotron from 'reactotron-react-native';
// Don't remove this import, this is used by reactotron-redux only in dev mode
import { reactotronRedux } from 'reactotron-redux';


// For viewing the state you need to select State tab on the side, 
// press CMD + N and press enter. This will create a new subscription to your app state. 
// Once you reload the app the entire state will show up along with actions in timeline.
const reactotron = Reactotron.useReactNative() // add all built-in react native plugins
  .use(reactotronRedux())
  .connect(); //Don't forget about me!

export default reactotron;