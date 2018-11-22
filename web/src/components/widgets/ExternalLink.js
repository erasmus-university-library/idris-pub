import React from 'react';

export default class ExternalLink extends React.Component {
  render(){
    const {to, children, ...rest} = this.props;
    return (<a href={to} target="_blank" rel="noopener noreferrer" {...rest}>{children}</a>);
  }
}
