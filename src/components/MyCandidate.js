import React, { useEffect, useState } from "react";
import { Card } from "react-bootstrap";
import { Link } from "react-router-dom";
import "firebase/firestore";
import firebase from "firebase/app";
import Chat from "./Chat";

export default function MyCandidate(props) {
  const db = firebase.firestore();
  const [info, setInfo] = useState([]);
  const [employer, setEmployer] = useState([]);

  var jobid = props.location.state;
  var seeker_id = props.location.uid;

  const fetchData = async () => {
    await db
      .collection("jobs")
      .where(firebase.firestore.FieldPath.documentId(), "==", jobid)
      .get()
      .then((querySnapshot) => {
        querySnapshot.forEach((element) => {
          var data = element.data();
          data.jobid = element.id;
          setInfo((arr) => [...arr, data]);
        });
      });

    await db
      .collection("users")
      .where("uid", "==", seeker_id)
      .get()
      .then((querySnapshot) => {
        querySnapshot.forEach((element) => {
          var el = element.data();
          setEmployer((arr) => [...arr, el]);
        });
      });
  };

  useEffect(() => {
    fetchData();
  }, []);

  return (
    <>
      <Card>
        <Card.Body>
          <center>
            <h2>Your Match</h2>
          </center>

          {info.map((data) => (
            <Frame
              title={data.title}
              desc={data.desc}
              sector={data.sector}
              keywords="vedrai"
              jobid={data.jobid}
            />
          ))}

          {employer.map((el) => (
            <Candidate
              companyname={el.currentjob}
              dateofbirth={el.dateofbirth}
            />
          ))}

          <Chat jobid={jobid} seeker_id={seeker_id} />

          <div className="w-100 text-center mt-2">
            <Link to="/">Back</Link>
          </div>
        </Card.Body>
      </Card>
    </>
  );
}

// Define how each display entry will be structured
const Frame = ({ title, desc, sector, keywords, jobid }) => {
  return (
    <div className="job-container">
      <div className="part1">
        <div className="company">
          <span className="cname">{title}</span>
        </div>

        <div className="position">{desc}</div>

        <div className="details">
          <span>{sector}</span>
        </div>

        <div className="part2">
          <span>{keywords}</span>
        </div>

        <div className="details">
          <span>{jobid}</span>
        </div>
      </div>
    </div>
  );
};

// Define how each display entry will be structured
const Candidate = ({ companyname, dateofbirth }) => {
  return (
    <div className="job-container">
      <div className="details">
        <span>{companyname}</span>
      </div>

      <div className="part2">
        <span>{dateofbirth}</span>
      </div>
    </div>
  );
};
