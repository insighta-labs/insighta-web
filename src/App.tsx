import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { Login } from "./pages/Login";
import { Callback } from "./pages/Callback";
import { Dashboard } from "./pages/Dashboard";
import { Profiles } from "./pages/Profiles";
import { ProfileDetail } from "./pages/ProfileDetail";
import { Search } from "./pages/Search";
import { Account } from "./pages/Account";
import { RequireAuth } from "./components/RequireAuth";
import { Layout } from "./components/Layout";
import "./styles/global.css";


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
