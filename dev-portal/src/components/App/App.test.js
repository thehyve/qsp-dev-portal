import React from 'react';
import App from "./index";
import renderer from "react-test-renderer";

test('renders without crashing', () => {
  const testRenderer = renderer.create(
      <App />
  );
});
