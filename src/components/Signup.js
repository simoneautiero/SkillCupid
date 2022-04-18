import React, { useRef, useState } from "react";
import { Form, Button, Card, Alert } from "react-bootstrap";
import { useAuth } from "../contexts/AuthContext";
import { Link, useHistory } from "react-router-dom";

export default function Signup() {
  const emailRef = useRef();
  const passwordRef = useRef();
  const role = useRef();
  const passwordConfirmRef = useRef();
  const currentJob = useRef();
  const location = useRef();
  const phoneNum = useRef();
  const dateOfBirth = useRef();
  const fullName = useRef();

  const { signup } = useAuth();
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const history = useHistory();

  async function handleSubmit(e) {
    e.preventDefault();

    if (passwordRef.current.value !== passwordConfirmRef.current.value) {
      return setError("Passwords do not match");
    }

    var phoneno = /^(?:0|\+?44)(?:\d\s?){9,10}$/;
    if (!phoneNum.current.value.match(phoneno))
      return setError("Phone Number not valid");

    var tempDob = dateOfBirth.current.value;
    var birthDay = +new Date(tempDob);
    var age = ~~((Date.now() - birthDay) / 31557600000);

    if (age < 18) return setError("You must be over 18 to sign up");

    var emailreg =
      /^(([^<>()[\]\\.,;:\s@\"]+(\.[^<>()[\]\\.,;:\s@\"]+)*)|(\".+\"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;

    if (!emailRef.current.value.match(emailreg))
      return setError("You must use a valid email to sign up");

    if (!document.getElementById("terms").checked)
      return setError("You must read and accept our T&C to sign up");

    try {
      setError("");
      setLoading(true);
      await signup(
        emailRef.current.value,
        passwordRef.current.value,
        role.current.value,
        currentJob.current.value,
        location.current.value,
        phoneNum.current.value,
        dateOfBirth.current.value,
        fullName.current.value
      );
      history.push("/");
    } catch {
      setError("Failed to create an account");
    }

    setLoading(false);
  }

  return (
    <>
      <Card>
        <Card.Body>
          <h2 className="text-center mb-5">Sign Up</h2>
          {error && <Alert variant="danger">{error}</Alert>}
          <Form onSubmit={handleSubmit}>
            <Form.Group id="usertype">
              <Form.Label>I am a </Form.Label>
              <Form.Control as="select" ref={role}>
                <option value="jobseeker">Job Seeker</option>
                <option value="jobemployer">Job Employer</option>
              </Form.Control>
            </Form.Group>
            <Form.Group id="email">
              <Form.Label>Email</Form.Label>
              <Form.Control type="email" ref={emailRef} required />
            </Form.Group>
            <Form.Group id="fullname">
              <Form.Label>Full Name</Form.Label>
              <Form.Control type="text" ref={fullName} required />
            </Form.Group>
            <Form.Group id="currentjob">
              <Form.Label>Current Occupation</Form.Label>
              <Form.Control type="text" ref={currentJob} required />
            </Form.Group>
            <Form.Group id="location">
              <Form.Label>Location</Form.Label>
              <Form.Control type="text" ref={location} required />
            </Form.Group>
            <Form.Group id="phonenum">
              <Form.Label>Phone Number</Form.Label>
              <Form.Control type="number" ref={phoneNum} required />
            </Form.Group>
            <Form.Group id="dateofbirth">
              <Form.Label>Date of Birth</Form.Label>
              <Form.Control
                type="date"
                min="1924-01-01"
                max="2005-01-01"
                ref={dateOfBirth}
                required
              />
            </Form.Group>
            <Form.Group id="password">
              <Form.Label>Password</Form.Label>
              <Form.Control type="password" ref={passwordRef} required />
            </Form.Group>
            <Form.Group id="password-confirm">
              <Form.Label>Password Confirmation</Form.Label>
              <Form.Control type="password" ref={passwordConfirmRef} required />
            </Form.Group>

            <Form.Check
              type="checkbox"
              id="terms"
              label={
                <>
                  I have read the&nbsp;
                  <a href="/terms">Terms and Conditions</a>
                </>
              }
            />

            <br></br>

            <Button disabled={loading} className="w-100" type="submit">
              Sign Up
            </Button>
          </Form>

          <div className="w-100 text-center mt-2">
            Already have an account? <Link to="/login">Log In</Link>
          </div>
        </Card.Body>
      </Card>
    </>
  );
}
