import React from "react";
import SignUp from "./SignUp";
import { Container } from "react-bootstrap";
import { AuthProvider } from "../contexts/AuthContext";
import { BrowserRouter as Router, Switch, Route } from "react-router-dom";
import Dashboard from "./Dashboard";
import Login from "./Login";
import PrivateRoute from "./PrivateRoute";
import ForgotPassword from "./ForgotPassword";
import UpdatePassword from "./UpdatePassword";
import AddJobAd from "./AddJobAd";
import AddSkills from "./AddSkills";
import AddSkillToJob from "./AddSkillToJob";
import MyJob from "./MyJob";
import UpdateProfile from "./UpdateProfile";
import UpdateSkillToJob from "./UpdateSkillToJob";
import UpdateJob from "./UpdateJob";
import MyMatch from "./MyMatch";
import MyCandidate from "./MyCandidate";
import Chat from "./Chat";
import Terms from "./Terms";
import ViewJob from "./ViewJob";

export default function App() {
  return (
    <Container
      className="d-flex align-items-center justify-content-center"
      style={{ color: "black", minHeight: "100vh" }}
    >
      <div className="w-100" style={{ maxWidth: "1200px" }}>
        <Router>
          <AuthProvider>
            <Switch>
              <PrivateRoute exact path="/" component={Dashboard} />
              <PrivateRoute
                path="/update-password"
                component={UpdatePassword}
              />
              <Route path="/signup" component={SignUp} />
              <Route path="/login" component={Login} />
              <Route path="/forgot-password" component={ForgotPassword} />
              <Route path="/add-job" component={AddJobAd} />
              <Route path="/add-job-skills" component={AddSkillToJob} />
              <Route path="/add-skills" component={AddSkills} />
              <Route path="/my-job" component={MyJob} />
              <Route path="/update-profile" component={UpdateProfile} />
              <Route path="/update-skill-job" component={UpdateSkillToJob} />
              <Route path="/update-job" component={UpdateJob} />
              <Route path="/my-match" component={MyMatch} />
              <Route path="/my-candidate" component={MyCandidate} />
              <Route path="/chat" component={Chat} />
              <Route path="/terms" component={Terms} />
              <Route path="/view-job" component={ViewJob} />
            </Switch>
          </AuthProvider>
        </Router>
      </div>
    </Container>
  );
}
