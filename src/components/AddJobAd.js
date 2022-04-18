import React, { useState } from "react";
import { Form, Button, Card } from "react-bootstrap";
import { Link, useHistory } from "react-router-dom";
import "firebase/firestore";
import firebase from "firebase/app";
import { auth } from "../firebase";

export default function AddJobAd() {
  const db = firebase.firestore();
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [sector, setSector] = useState("");
  const [salary, setSalary] = useState("");
  const [location, setLocation] = useState("");
  const [company, setCompany] = useState("");
  const [mode, setMode] = useState("Face-to-face");
  const [roleType, setRoleType] = useState("Full-time");

  const history = useHistory();

  const currentUser = auth.currentUser;
  const uid = currentUser.uid;

  const handleSubmit = async (e) => {
    e.preventDefault();
    await db
      .collection("jobs")
      .add({
        title: title,
        desc: description,
        sector: sector,
        salary: salary,
        location: location,
        company: company,
        mode: mode,
        role: roleType,
        uid: uid,
      })
      .then(function (docRef) {
        history.push({
          pathname: "/add-job-skills",
          state: docRef.id,
        });
      });

    setTitle("");
    setDescription("");
    setSector("");
    setSalary("");
    setLocation("");
    setCompany("");
    setMode("");
    setRoleType("");
  };

  return (
    <>
      <Card>
        <Card.Body>
          <h2 className="text-center mb-4">Add a Job</h2>

          <Form onSubmit={handleSubmit}>
            <Form.Group id="title">
              <Form.Label>Job Title</Form.Label>
              <Form.Control
                type="string"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                required
              />
            </Form.Group>
            <Form.Group
              className="mb-3"
              controlId="exampleForm.ControlTextarea1"
            >
              <Form.Label>Job Description</Form.Label>
              <Form.Control
                required
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                as="textarea"
                rows={6}
              />
            </Form.Group>
            <Form.Group id="company">
              <Form.Label>Company name</Form.Label>
              <Form.Control
                required
                value={company}
                onChange={(e) => setCompany(e.target.value)}
              />
            </Form.Group>
            <Form.Group id="sector">
              <Form.Label>Sector</Form.Label>
              <Form.Control
                required
                value={sector}
                onChange={(e) => setSector(e.target.value)}
              />
            </Form.Group>
            <Form.Group id="roletype">
              <Form.Label>Role Type</Form.Label>
              <Form.Control
                as="select"
                value={roleType}
                onChange={(e) => setRoleType(e.target.value)}
              >
                <option value="Full-time">Full-time</option>
                <option value="Part-time">Part-time</option>
                <option value="Other">Other</option>
              </Form.Control>
            </Form.Group>

            <Form.Group id="salary">
              <Form.Label>Salary</Form.Label>
              <Form.Control
                required
                type="number"
                min="0.00"
                max="100000.00"
                step="0.01"
                value={salary}
                onChange={(e) => setSalary(e.target.value)}
              />
            </Form.Group>

            <Form.Group id="location">
              <Form.Label>Location</Form.Label>
              <Form.Control
                required
                value={location}
                onChange={(e) => setLocation(e.target.value)}
              />
            </Form.Group>
            <Form.Group id="workmode">
              <Form.Label>Work mode</Form.Label>
              <Form.Control
                as="select"
                value={mode}
                onChange={(e) => setMode(e.target.value)}
              >
                <option value="Face-to-face">Face-to-face</option>
                <option value="Work from home">Work from home</option>
                <option value="Hybrid working">Hybrid working</option>
                <option value="Not specified">Not specified</option>
              </Form.Control>
            </Form.Group>
            <Button className="w-100" type="submit">
              Next
            </Button>
          </Form>
          <div className="w-100 text-center mt-2">
            <Link to="/">Back</Link>
          </div>
        </Card.Body>
      </Card>
    </>
  );
}
