import React from 'react';
import PropTypes from 'prop-types';
import classNames from 'classnames';
import { useDispatch } from 'react-redux';

import { uuid } from '../../utils/uuid';
import { componentsActions } from '../../store/components';
import { AvailableComponents } from '../Components';

import './components-picker.css'

export const ComponentsPicker = ({ lockedPicker }) => {
  const dispatch = useDispatch();
  const onComponentClick = layout => dispatch(componentsActions.addComponent({id: uuid(), layout}));

  return (
    <div className="components-picker">
      {AvailableComponents.map(component => (
        <div
          className={classNames('components-picker__component', {
            'components-picker__component--disabled': lockedPicker,
          })}
          key={component.layout}
          onClick={() => !lockedPicker && onComponentClick(component.layout)}
        >
          <span className="components-picker__component-label">
            {component.label}
          </span>
        </div>
      ))}
    </div>
  );
}

ComponentsPicker.propTypes = {
  lockedPicker: PropTypes.bool.isRequired,
};
