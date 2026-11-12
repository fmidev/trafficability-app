import AppContainer from "./AppContainer/AppContainer";

// The basemap tiles are requested directly by BaseLayer, so no WMTS
// GetCapabilities round trip is needed before the map can be drawn.
function App() {
  return <AppContainer />;
}

export default App;