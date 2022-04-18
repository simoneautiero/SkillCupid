import React, { useEffect, useState } from "react";
import { useHistory } from "react-router-dom";
import "firebase/firestore";
import firebase from "firebase/app";
import "../index.js";
import Loader from "react-spinners/PulseLoader";

export default function Employer() {
  const db = firebase.firestore();

  const [info, setInfo] = useState([]);

  const [timeElapsed, setTimeElapsed] = useState("false");

  const fetchData = async () => {
    const check_uid = firebase.auth().currentUser.uid;

    await db
      .collection("jobs")
      .where("uid", "==", check_uid)
      .get()
      .then((querySnapshot) => {
        querySnapshot.forEach((element) => {
          var data = element.data();
          data.jobid = element.id;
          setInfo((arr) => [...arr, data]);
        });
      });

    if (info.length === 0) {
      setTimeElapsed("true");
    }
  };

  const checkMatches = () => {
    if (info.length > 0) {
      return info.map((data) => (
        <Frame
          cname={data.company}
          title={data.title}
          desc={data.desc}
          sector={data.sector}
          jobid={data.jobid}
          roletype={data.role}
          mode={data.mode}
          location={data.location}
        />
      ));
    } else {
      if (timeElapsed === "false") {
        return (
          <center>
            <Loader />
          </center>
        );
      } else if (timeElapsed === "true") {
        return (
          <center>
            <p>No job found...</p>
          </center>
        );
      }
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  return (
    <div>
      <center>
        <br></br>
        <br></br>
        <h2>Your Jobs</h2>
      </center>

      {checkMatches()}
    </div>
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
      pathname: "/my-job",
      state: jobid,
    });
  };

  useEffect(() => {
    getSkills(jobid);
  }, []);

  return (
    <div onClick={() => routeChange(jobid, score)} className="job-container">
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
        {temp.slice(0, 4).map((data) => (
          <span>{data}</span>
        ))}
      </div>
    </div>
  );
};
