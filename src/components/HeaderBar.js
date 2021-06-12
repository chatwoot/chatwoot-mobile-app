import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { TopNavigation, TopNavigationAction, withStyles, Icon } from '@ui-kitten/components';

import CustomText from './Text';

const BackIcon = props => {
  return <Icon {...props} name="arrow-back-outline" height={24} width={24} />;
};
const CloseIcon = props => {
  return <Icon {...props} name="close-outline" height={32} width={32} />;
};

const MenuIcon = props => {
  return <Icon {...props} name="funnel-outline" />;
};

const MoreIcon = props => {
  return <Icon {...props} name="more-horizontal-outline" />;
};

const styles = theme => ({
  headerTitle: {
    marginVertical: 8,
    fontSize: theme['font-size-medium'],
    fontWeight: theme['font-semi-bold'],
  },
});

class HeaderBarComponent extends Component {
  renderLeftControl = () => {
    const { onBackPress, leftButtonIcon } = this.props;
    if (leftButtonIcon) {
      return <TopNavigationAction icon={CloseIcon} onPress={onBackPress} />;
    }
    return <TopNavigationAction icon={BackIcon} onPress={onBackPress} />;
  };

  renderRightControl = () => {
    const { buttonType, onRightPress } = this.props;
    return (
      <TopNavigationAction
        icon={buttonType === 'menu' ? MenuIcon : MoreIcon}
        onPress={onRightPress}
      />
    );
  };

  render() {
    const {
      title,
      showLeftButton,
      eva: { style },
      alignment,
      showRightButton,
    } = this.props;

    return (
      <TopNavigation
        title={evaProps => (
          <CustomText {...evaProps} style={style.headerTitle}>
            {title}
          </CustomText>
        )}
        alignment={alignment}
        titleStyle={style.headerTitle}
        {...(showLeftButton && { accessoryLeft: this.renderLeftControl })}
        {...(showRightButton && { accessoryRight: this.renderRightControl })}
      />
    );
  }
}

const propTypes = {
  eva: PropTypes.shape({
    style: PropTypes.object,
    theme: PropTypes.object,
  }).isRequired,
  onBackPress: PropTypes.func,
  onRightPress: PropTypes.func,
  title: PropTypes.string,
  showLeftButton: PropTypes.bool,
  showRightButton: PropTypes.bool,
  alignment: PropTypes.string,
  iconName: PropTypes.string,
  buttonType: PropTypes.string,
  leftButtonIcon: PropTypes.string,
};

const defaultProps = {
  alignment: 'center',
};

HeaderBarComponent.propTypes = propTypes;
HeaderBarComponent.defaultProps = defaultProps;

const HeaderBar = withStyles(HeaderBarComponent, styles);

export default React.memo(HeaderBar);
