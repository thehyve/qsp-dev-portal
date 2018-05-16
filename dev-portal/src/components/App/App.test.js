import App from "./index";

test('renders without crashing', () => {
  const testRenderer = renderer.create(
      <App />
  );
});
