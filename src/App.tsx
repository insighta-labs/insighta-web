import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { Login } from "./pages/Login";
import { Callback } from "./pages/Callback";
import { RequireAuth } from "./components/RequireAuth";
import { Layout } from "./components/Layout";
import "./styles/global.css";

// Page placeholders — implemented in next components
const Dashboard = () => (
  <div className="page">
    <h2 className="page-title">Dashboard</h2>
  </div>
);
const Profiles = () => (
  <div className="page">
    <h2 className="page-title">Profiles</h2>
  </div>
);
const ProfileDetail = () => (
  <div className="page">
    <h2 className="page-title">Profile</h2>
  </div>
);
const Search = () => (
  <div className="page">
    <h2 className="page-title">Search</h2>
  </div>
);
const Account = () => (
  <div className="page">
    <h2 className="page-title">Account</h2>
  </div>
);

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/login" element={<Login />} />
        <Route path="/callback" element={<Callback />} />
        <Route
          path="/*"
          element={
            <RequireAuth>
              <Layout>
                <Routes>
                  <Route path="/dashboard" element={<Dashboard />} />
                  <Route path="/profiles" element={<Profiles />} />
                  <Route path="/profiles/:id" element={<ProfileDetail />} />
                  <Route path="/search" element={<Search />} />
                  <Route path="/account" element={<Account />} />
                  <Route
                    path="*"
                    element={<Navigate to="/dashboard" replace />}
                  />
                </Routes>
              </Layout>
            </RequireAuth>
          }
        />
      </Routes>
    </BrowserRouter>
  );
}
