import "./App.css";
import {Routes, Route, BrowserRouter as Router, Navigate, } from "react-router-dom";
import store, { persistor } from "./redux/store";
import { Provider } from "react-redux";
import { PersistGate } from "redux-persist/integration/react";
import ProtectedRoute from "./components/ProtectedRoute";
import AutoLogout from "./components/AutoLogout";

import LandingPage from "./components/LandingPage";
import SalePage from "./components/SalePage";

function App() {
  return (
    <Provider store={store}>
      <PersistGate loading={null} persistor={persistor}>
        <Router>
          <AutoLogout />
          <Routes>
            <Route path="/" element={<LandingPage />} />
            <Route path="/landing-page" element={<LandingPage />} />
            <Route path="/sale-page" element={<ProtectedRoute><SalePage /></ProtectedRoute>}/>
          </Routes>
        </Router>
      </PersistGate>
    </Provider>
  );
}

export default App;
