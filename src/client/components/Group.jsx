import React from 'react';

export default function Group(props) {
  const place = props.place || 'default';
  const borderColor = props.place === 'bedroom' ? '#1a9cf3' : (props.place === 'lounge' ? '#bba220' : '#25a84a');
  return props.children.map((item, key) => React.cloneElement(item, { key, place, borderColor }));
}
