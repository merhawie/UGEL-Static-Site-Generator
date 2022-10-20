import PropTypes from 'prop-types';
import React from 'react';

import { Head, End } from './general';

/**
 * The page layout component
 */
const Page = ({ title, stylesheet, header, main, footer, script, _relativeURL, _ID }) => (
	<html>
	<Head 
		title={title}
		stylesheet={stylesheet}
		_relativeURL={_relativeURL}
		_ID={_ID} />
	<body>
		<div className="top">
			<header role="banner">
				{ header }
			</header>

			<main>
				{ main }
			</main>
		</div>

		<footer>
			{ footer }
		</footer>

		<End />
	</body>
	</html>
);

Page.propTypes = {
/**
	 * title: Homepage
	 */
	title: PropTypes.string.isRequired,

	/**
	 * main: (partials)(5)
	 */
	main: PropTypes.node.isRequired,

	/**
	 * footer: (partials)(2)
	 */
	footer: PropTypes.node.isRequired,
};

Page.defaultProps = {};

export default Page;
