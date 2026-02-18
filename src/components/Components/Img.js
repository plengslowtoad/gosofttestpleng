import React from 'react';
import PropTypes from 'prop-types';

export const Img = ({ values }) => (
  <img alt={values.alt} src={values.src} />
);

Img.propTypes = {
  values: PropTypes.shape({
    alt: PropTypes.string,
    src: PropTypes.string,
  }).isRequired,
};
