import PropTypes from 'prop-types';
import React from 'react';


/**
 * The page layout component
 */
const End = ({ title, stylesheet, header, main, footer, script, _relativeURL, _ID }) => (

script != undefined
				? ( <script src={ _relativeURL( `/assets/js/${ script }.js`, _ID ) } /> )
				: null
);

End.propTypes = {

};

End.defaultProps = {};

export default End;
