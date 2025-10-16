import { StyleSheet, View } from 'react-native';
import { useSharedValue } from 'react-native-reanimated';

import type { AnimatedCodeNumberProps } from './animated-code-number';
import { AnimatedCodeNumber } from './animated-code-number';

export type StatusType = 'inProgress' | 'correct' | 'wrong';

type VerificationCodeProps = {
  code: string[];
  maxLength?: number;
  isCodeWrong: boolean;
} & Pick<AnimatedCodeNumberProps, 'status'>;

export const VerificationCode: React.FC<VerificationCodeProps> = ({
  code,
  maxLength = 5,
  status,
  isCodeWrong,
}) => {
  const wrongStatus = useSharedValue<StatusType>('wrong');

  return (
    <View style={styles.container}>
      {new Array(maxLength).fill(0).map((_, index) => (
        <View key={index} style={styles.codeContainer}>
          <AnimatedCodeNumber
            code={code[index]}
            highlighted={index === code.length}
            status={isCodeWrong ? wrongStatus : status}
          />
        </View>
      ))}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    width: '100%',
    flexDirection: 'row',
  },
  codeContainer: {
    aspectRatio: 0.95,
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
});
