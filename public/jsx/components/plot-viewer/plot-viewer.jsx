import _ from 'lodash';
import React from 'react';
import {connect} from 'react-redux';
import UnsafeHTML from './unsafe-html.jsx';
import './plot-viewer.less';
import htmlSplash from './html-flat.svg';
import errorSplash from './document-error-flat.svg';

/**
 * We only need plots
 * @param {object} state
 * @returns {object}
 */
function mapStateToProps(state) {
  return _.pick(state, ['plots']);
}

/**
 *
 * @param {function} dispatch
 * @returns {object}
 */
function mapDispatchToProps(dispatch) {
  return {
    onDelete: () => dispatch({type: 'REMOVE_ACTIVE_PLOT'}),
    onNext: () => dispatch({type: 'FOCUS_NEXT_PLOT'}),
    onPrev: () => dispatch({type: 'FOCUS_PREV_PLOT'}),
    onSave: () => dispatch({type: 'SAVE_ACTIVE_PLOT'}),
    onOpen: () => dispatch({type: 'OPEN_ACTIVE_PLOT'}),
    onItemClick: (id) => dispatch({type: 'FOCUS_PLOT', id})
  };
}


export default connect(mapStateToProps, mapDispatchToProps)(React.createClass({
  displayName: 'PlotViewer',
  propTypes: {
    onDelete: React.PropTypes.func,
    onNext: React.PropTypes.func,
    onPrev: React.PropTypes.func,
    onSave: React.PropTypes.func,
    onOpen: React.PropTypes.func,
    onItemClick: React.PropTypes.func,
    plots: React.PropTypes.array
  },
  getDefaultProps: function () {
    return {
      onDelete: _.noop,
      onNext: _.noop,
      onPrev: _.noop,
      onSave: _.noop,
      onShow: _.noop
    };
  },
  render: function () {
    const props = this.props,
      focusedPlot = _.find(props.plots, {hasFocus: true}),
      itemStyle = {
        background: 'no-repeat center/50% url(js/html-flat.0fd55f20df93a34d6638c154745c3c3f.svg)'
      };

    function getActivePlotComponent(plot) {
      let plotComponent,
        data = plot && plot.data;

      if (data) {
        if (data['image/png']) {
          plotComponent = <div><img src={data['image/png']}/></div>;
        } else if (data['image/svg']) {
          plotComponent = <div><img src={data['image/svg']}/></div>;
        } else if (data['text/html']) {
          let frameId = 'frame-' + plot.id;

          plotComponent = <UnsafeHTML id={frameId} src={data['text/html']} />;
        } else {
          plotComponent = <div className="suggestion">{'Plot must be png, svg, html or javascript.'}</div>;
        }
      } else if (props.plots && props.plots.length > 0) {
        plotComponent = <div className="suggestion">{'Select a plot.'}</div>;
      } else {
        plotComponent = <div className="suggestion">{'Create a plot.'}</div>;
      }

      return plotComponent;
    }

    return (
      <section className="plot-viewer">
        <header>
          <a className="label label-primary" onClick={props.onPrev} title="Previous Plot">
            <span className="fa fa-undo"/>
          </a>
          <a className="label label-primary" onClick={props.onNext} title="Next Plot">
            <span className="fa fa-repeat"/>
          </a>
          <a className="label label-primary" onClick={props.onOpen} title="Zoom In">
            <span className="fa fa-arrows-alt"/>
          </a>
          <a className="label label-primary" onClick={props.onSave} title="Export Plot">
            <span className="fa fa-floppy-o"/>
          </a>
          <a className="label label-primary" onClick={props.onDelete} title="Delete Plot">
            <span className="fa fa-trash-o"/>
          </a>
        </header>

        {getActivePlotComponent(focusedPlot)}

        <nav className="plot-viewer-minimap">
          {props.plots.map((plot) => {
            let itemStyle,
              data = plot && plot.data,
              className = [
                'item',
                plot.hasFocus ? 'active' : ''
              ];

            if (data) {
              if (data['image/png']) {
                itemStyle = { backgroundImage: 'url(' + data['image/png'] + ')' };
              } else if (data['image/svg']) {
                itemStyle = { backgroundImage: 'url(' + data['image/svg'] + ')' };
              } else if (data['text/html']) {
                className.push('splash');
                itemStyle = { backgroundImage: 'url(' + htmlSplash + ')' };
              } else {
                className.push('splash');
                itemStyle = { backgroundImage: 'url(' + errorSplash + ')' };
              }
            }

            className = className.join(' ');

            return <div className={className} key={plot.id} onClick={_.partial(props.onItemClick, plot.id)} style={itemStyle}></div>;
          })}
        </nav>
      </section>
    );
  }
}));