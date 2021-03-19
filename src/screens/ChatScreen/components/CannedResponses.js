import React from 'react';
import { View, FlatList, TouchableOpacity } from 'react-native';
import { withStyles } from '@ui-kitten/components';
import PropTypes from 'prop-types';
import CustomText from '../../../components/Text';

const styles = (theme) => ({
  mainView: {
    backgroundColor: 'white',
    borderRadius: 4,
    paddingHorizontal: 8,
    maxHeight: 200,
    borderTopColor: theme['color-border'],
    borderTopWidth: 1,
  },
  itemView: {
    flex: 1,
    flexDirection: 'row',
    paddingVertical: 8,
    paddingHorizontal: 2,
  },
  lastItemView: {
    borderBottomWidth: 1,
    borderBottomColor: theme['color-border'],
  },
  shortCode: {
    color: theme['color-primary-default'],
    fontWeight: theme['font-bold'],
  },
  content: {
    color: theme['color-primary-default'],
  },
});

const CannedResponseComponent = ({
  shortCode,
  content,
  lastItem,
  onCannedReponseSelect,
  eva: { theme, style },
}) => (
  <TouchableOpacity
    style={[style.itemView, !lastItem && style.lastItemView]}
    onPress={() => onCannedReponseSelect(content)}>
    <CustomText style={style.shortCode}>{shortCode} - </CustomText>
    <CustomText style={style.content}>{content}</CustomText>
  </TouchableOpacity>
);

CannedResponseComponent.propTypes = {
  shortCode: PropTypes.string.isRequired,
  content: PropTypes.string.isRequired,
  lastItem: PropTypes.bool,
  eva: PropTypes.shape({
    theme: PropTypes.object,
    style: PropTypes.object,
  }).isRequired,
  onCannedReponseSelect: PropTypes.func.isRequired,
};

const CannedResponse = withStyles(CannedResponseComponent, styles);

const propTypes = {
  eva: PropTypes.shape({
    theme: PropTypes.object,
    style: PropTypes.object,
  }).isRequired,
  cannedResponses: PropTypes.array.isRequired,
  onCannedReponseSelect: PropTypes.func.isRequired,
};

const CannedResponses = ({ eva: { theme, style }, cannedResponses, onCannedReponseSelect }) => {
  return (
    <View style={style.mainView}>
      <FlatList
        data={cannedResponses}
        renderItem={({ item, index }) => (
          <CannedResponse
            shortCode={item.short_code}
            content={item.content}
            lastItem={cannedResponses.length - 1 === index}
            onCannedReponseSelect={onCannedReponseSelect}
          />
        )}
        keyExtractor={(item) => item.id}
      />
    </View>
  );
};

CannedResponses.propTypes = propTypes;

const CannedResponsesItem = withStyles(CannedResponses, styles);
export default CannedResponsesItem;
