import { Routes, Route, Navigate } from "react-router-dom";
import "bootstrap/dist/css/bootstrap.min.css";

import "./App.css";
import "./styles/main.scss";
import {
  Login,
  SprintPlanning,
} from "./pages";
import { LoginSuccess } from "./pages/Login/success";
import { PrivateRoute } from "./components/PrivateRoute";
import { ToastContainer, Slide } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

function App() {
  return (
    <div className="App">
      <ToastContainer
        autoClose={1500}
        closeOnClick
        draggable
        transition={Slide}
        limit={1}
      />
      <div className="main-page-content">
        <Routes>
          <Route path="/" element={<Navigate to={"/sprintplanning"} />} />
          
          <Route path="/login" element={<Login />} />
          <Route path="/login/success" element={<LoginSuccess />} />
         
          <Route
            path="/sprintplanning"
            element={
              <PrivateRoute>
                <SprintPlanning />
              </PrivateRoute>
            }
          />
         
        </Routes>
      </div>
    </div>
  );
}

export default App;
