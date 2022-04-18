import React, { useEffect, useState } from "react";
import { Card, Image, Button } from "react-bootstrap";
import { Link } from "react-router-dom";
import "firebase/firestore";
import firebase from "firebase/app";
import { auth } from "../firebase";
import { useHistory } from "react-router-dom";
import avatar from "../avatar.jpg";

import { CircularProgressbar } from "react-circular-progressbar";
import "react-circular-progressbar/dist/styles.css";

export default function MyMatch(props) {
  const db = firebase.firestore();
  const [info, setInfo] = useState([]);
  const [employer, setEmployer] = useState([]);

  const currentUser = auth.currentUser;
  var seeker_id = currentUser.uid;
  var jobid = props.location.state;
  var score = props.location.score;

  const fetchData = async () => {
    var employer_id;

    await db
      .collection("jobs")
      .where(firebase.firestore.FieldPath.documentId(), "==", jobid)
      .get()
      .then((querySnapshot) => {
        querySnapshot.forEach((element) => {
          var data = element.data();
          data.jobid = element.id;
          employer_id = data.uid;
          setInfo((arr) => [...arr, data]);
        });
      });

    await db
      .collection("users")
      .where("uid", "==", employer_id)
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
              cname={data.company}
              title={data.title}
              desc={data.desc}
              sector={data.sector}
              score={score}
              jobid={data.jobid}
              roletype={data.role}
              mode={data.mode}
              location={data.location}
            />
          ))}

          {employer.map((el) => (
            <Candidate
              currentjob={el.currentjob}
              fullname={el.fullname}
              location={el.location}
              uid={el.uid}
              jobid={jobid}
              seeker_id={seeker_id}
            />
          ))}

          <div className="w-100 text-center mt-2">
            <Link to="/">Back</Link>
          </div>
        </Card.Body>
      </Card>
    </>
  );
}

const Frame = ({ cname, jobid, title, roletype, mode, location, score }) => {
  const history = useHistory();
  const db = firebase.firestore();

  const [temp, setTemp] = useState([]);

  const getSkills = async (jobid) => {
    await db
      .collection("jobs_skills")
      .where("jobid", "==", jobid)
      .get()
      .then((querySnapshot) => {
        querySnapshot.forEach((element) => {
          setTemp((arr) => [...arr, element.data().skill]);
        });
      });
  };

  const routeChange = (jobid) => {
    history.push({
      pathname: "/view-job",
      jobid: jobid,
    });
  };

  useEffect(() => {
    getSkills(jobid);
  }, []);

  return (
    <div className="job-container" onClick={() => routeChange(jobid)}>
      <div class="logo">
        <CircularProgressbar value={score} text={`${score}%`} />
      </div>

      <div className="part1">
        <div className="company">
          <span className="cname">{cname}</span>
        </div>

        <div className="position">{title}</div>

        <div className="details">
          <span>{roletype}</span>
          <span>&nbsp;•&nbsp;</span>
          <span>{mode}</span>
          <span>&nbsp;•&nbsp;</span>
          <span>{location}</span>
        </div>
      </div>

      <div className="part2">
        {temp.map((data) => (
          <span>{data}</span>
        ))}
      </div>
    </div>
  );
};

const Candidate = ({
  currentjob,
  fullname,
  location,
  uid,
  jobid,
  seeker_id,
}) => {
  const [image, setImage] = useState();
  var storageRef = firebase.storage().ref();
  var history = useHistory();

  const getPic = async (uid) => {
    storageRef
      .child(uid)
      .getDownloadURL()
      .then((url) => {
        var img = document.getElementById("profile");
        img.setAttribute("src", url);
      })
      .catch((error) => {
        var img = document.getElementById("profile");
        img.setAttribute("src", avatar);
      });
  };

  useEffect(() => {
    getPic(uid);
  }, []);

  const routeChange = (jobid, seeker_id) => {
    history.push({
      pathname: "/chat",
      jobid: jobid,
      seeker_id: seeker_id,
    });
  };

  return (
    <div className="job-container">
      <div class="logo">
        <Image
          style={{ maxHeight: 90, maxWidth: 100 }}
          value={image}
          id="profile"
          thumbnail
        />
      </div>

      <div className="part1">
        <div className="company">
          <span className="cname">Your Next Employer</span>
        </div>

        <div className="position">{fullname}</div>

        <div className="details">
          <span>{currentjob}</span>
          <span>&nbsp;•&nbsp;</span>
          <span>{location}</span>
        </div>
      </div>

      <div className="part2">
        <Button onClick={() => routeChange(jobid, seeker_id)}>Chat now</Button>
      </div>
    </div>
  );
};
