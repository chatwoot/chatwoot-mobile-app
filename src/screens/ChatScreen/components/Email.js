import React from 'react';
import PropTypes from 'prop-types';
import { Dimensions, useWindowDimensions } from 'react-native';
import { WebView } from 'react-native-webview';
import TableRenderer, { tableModel } from '@native-html/table-plugin';
import HTML, { HTMLContentModel, HTMLElementModel } from 'react-native-render-html';
const imagesMaxWidth = Dimensions.get('window').width;
// import { sanitize } from './EmailParser';
// import { sanitize } from 'lettersanitizer';
// import { extract } from 'letterparser';
const htmlProps = {
  WebView,
  renderers: {
    table: TableRenderer,
  },
  renderersProps: {
    table: {
      computeContainerHeight() {
        return null;
      },
    },
  },
  customHTMLElementModels: {
    table: tableModel,
    center: HTMLElementModel.fromCustomModel({
      tagName: 'center',
      contentModel: HTMLContentModel.block,
    }),
    font: HTMLElementModel.fromCustomModel({
      tagName: 'font',
      contentModel: HTMLContentModel.mixed,
    }),
    'o:p': HTMLElementModel.fromCustomModel({
      tagName: 'o:p',
      contentModel: HTMLContentModel.mixed,
    }),
  },
  baseStyle: {
    flex: 1,
    color: '#3c4858',
    fontSize: 14,
  },
  contentWidth: 200,
  enableExperimentalMarginCollapsing: true,
  imagesMaxWidth: { imagesMaxWidth },
};

const propTypes = {
  emailContent: PropTypes.string,
};

const Email = ({ emailContent }) => {
  // const sanitizedHtml = sanitize(emailContent, '', {
  // rewriteExternalResources,
  // rewriteExternalLinks,
  // allowedSchemas,
  // preserveCssPriority
  // });

  // const sanitizedHtml = sanitize(emailContent, '', {});
  // console.log('emailContent', emailContent);

  const { width } = useWindowDimensions();

  return <HTML source={{ html: emailContent || '' }} {...htmlProps} contentWidth={width} />;
};

Email.propTypes = propTypes;

export default React.memo(Email);
