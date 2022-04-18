import React, { useState, useEffect } from "react";
import { Card } from "react-bootstrap";
import { Link } from "react-router-dom";
import "firebase/firestore";
import firebase from "firebase/app";

export default function ViewJob(props) {
  const db = firebase.firestore();
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [sector, setSector] = useState("");
  const [salary, setSalary] = useState("");
  const [location, setLocation] = useState("");
  const [company, setCompany] = useState("");
  const [mode, setMode] = useState("Face-to-face");
  const [roleType, setRoleType] = useState("Full-time");

  const jobid = props.location.jobid;

  const getJobInfo = async (e) => {
    await db
      .collection("jobs")
      .where(firebase.firestore.FieldPath.documentId(), "==", jobid)
      .get()
      .then((querySnapshot) => {
        querySnapshot.forEach((element) => {
          var data = element.data();
          setTitle(data.title);
          setDescription(data.desc);
          setSector(data.sector);
          setSalary(data.salary);
          setLocation(data.location);
          setCompany(data.company);
          setMode(data.mode);
          setRoleType(data.role);
        });
      });
  };

  useEffect(() => {
    getJobInfo(jobid);
  }, []);

  return (
    <>
      <Card>
        <Card.Body>
          <h2 className="text-center mb-4">View Job</h2>

          <h4>Job Title</h4>
          <p>{title}</p>

          <h4>Job Description</h4>
          <p>{description}</p>

          <h4>Company</h4>
          <p>{company}</p>

          <h4>Sector</h4>
          <p>{sector}</p>

          <h4>Role Type</h4>
          <p>{roleType}</p>

          <h4>Salary</h4>
          <p>{salary}</p>

          <h4>Location</h4>
          <p>{location}</p>

          <h4>Work mode</h4>
          <p>{mode}</p>

          <div className="w-100 text-center mt-2">
            <Link to="/">Back</Link>
          </div>
        </Card.Body>
      </Card>
    </>
  );
}
