import React, { Component } from 'react';
import { Table } from '@jpmorganchase/perspective';
import { ServerRespond } from './DataStreamer';
import { DataManipulator } from './DataManipulator';
import './Graph.css';

interface IProps {
  data: ServerRespond[];
}

interface PerspectiveViewerElement extends HTMLElement {
  load: (table: Table) => void;
}
// If I were working in a JSX file or with React, 
// I would implement hooks and convert these components to functional components 
// rather than class components.
// I'm interested to learn more about how this would be implemented with TypeScript..?
class Graph extends Component<IProps, {}> {
  table: Table | undefined;

  render() {
    return React.createElement('perspective-viewer');
  }

  componentDidMount() {
    // Get element from the DOM.
    // Some of the code assigned to the elem variable is throwing off my linter.
    // I would like to learn more about why this is...
    const elem = (document.getElementsByTagName(
      'perspective-viewer'
    )[0] as unknown) as PerspectiveViewerElement;

    // I work mostly in Ruby on Rails, so it was helpful to see this variable called schema.
    // It helped me visualize more of what the backend data looks like.
    const schema = {
      price_abc: 'float',
      price_def: 'float',
      ratio: 'float',
      timestamp: 'date',
      upper_bound: 'float',
      lower_bound: 'float',
      trigger_alert: 'float',
    };

    if (window.perspective && window.perspective.worker()) {
      this.table = window.perspective.worker().table(schema);
    }
    if (this.table) {
      // Load the `table` in the `<perspective-viewer>` DOM reference.
      // I am curious if there is a more DRY way to implement the DOM elem...?
      elem.load(this.table);
      elem.setAttribute('view', 'y_line');
      elem.setAttribute(
        'columns',
        '["ratio", "lower_bound", "upper_bound", "trigger_alert" ]'
      );
      // Helpful to see JSON.stringify implemented here, as I implemented it in the Phase 2 project.
      // This wasn't explicitly recommended, but after reading the perspective docs, it seemed like a good call for handling the aggregates object.
      elem.setAttribute(
        'aggregates',
        JSON.stringify({
          price_abc: 'avg',
          price_def: 'avg',
          ratio: 'avg',
          timestamp: 'distinct count',
          upper_bound: 'avg',
          lower_bound: 'avg',
          trigger_alert: 'avg',
        })
      );
    }
  }

  componentDidUpdate() {
    if (this.table) {
      this.table.update([DataManipulator.generateRow(this.props.data)]);
    }
  }
}

export default Graph;
