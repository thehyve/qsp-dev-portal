// Footer.test.js

import React from 'react';
import renderer from 'react-test-renderer';
import Footer from "./index";

test('should render Footer without any problem', () => {
  const testRenderer = renderer.create(
      <Footer />
  );
  expect(testRenderer).toMatchSnapshot();
});

