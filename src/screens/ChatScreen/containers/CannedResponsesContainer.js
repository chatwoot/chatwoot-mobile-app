import CannedResponses from '../components/CannedResponses';

import { connect } from 'react-redux';
import { selectors as CannedResponseSelectors } from '../../../reducer/cannedResponseSlice';

const mapStateToProps = (state, props) => ({
  cannedResponses: CannedResponseSelectors.getFilteredCannedResponses(state, props.searchKey),
});

export default connect(mapStateToProps, null)(CannedResponses);
