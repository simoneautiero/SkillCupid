import React, { useEffect, useState } from "react";
import { useHistory } from "react-router-dom";
import "firebase/firestore";
import firebase from "firebase/app";
import "../index.js";
import Loader from "react-spinners/PulseLoader";

import { CircularProgressbar } from "react-circular-progressbar";
import "react-circular-progressbar/dist/styles.css";

export default function SeekerMatch() {
  const db = firebase.firestore();

  const [info, setInfo] = useState([]);
  var tempinfo = [];

  var score = 0;
  var skills = [];
  var alljobs = [];

  var matches = [];
  var jobid;

  var usedSkills = [];

  const [timeElapsed, setTimeElapsed] = useState("false");

  const fetchData = async () => {
    const check_uid = firebase.auth().currentUser.uid;

    await db
      .collection("users_skills")
      .get()
      .then((querySnapshot) => {
        querySnapshot.forEach((element) => {
          if (check_uid === element.data().uid) {
            var data = element.data();
            skills.push(data);
          }
        });
      });

    await db
      .collection("jobs")
      .get()
      .then((querySnapshot) => {
        querySnapshot.forEach((element) => {
          jobid = element.id;
          alljobs.push(jobid);
        });
      });

    for (var i = 0; i < alljobs.length; i++) {
      await db
        .collection("jobs_skills")
        .where("jobid", "==", alljobs[i])
        .get()
        .then((querySnapshot) => {
          score = 0;
          var max_score = 0.1;
          var thisjob;
          var spare_skills = 0;
          usedSkills = [];
          var validMatch = "false";

          console.log("testing this jobid : " + alljobs[i]);

          querySnapshot.forEach((element) => {
            thisjob = element.data().jobid;

            if (element.data().preference === "Required") {
              max_score = max_score + 1;
              if (skills.find((e) => e.skill === element.data().skill)) {
                console.log("skill: " + element.data().skill + " matched");
                var myskill = skills.filter(
                  (e) => e.skill === element.data().skill
                );
                var user_exp = myskill[0].expertise;
                var job_exp = element.data().expertise;

                validMatch = "true";

                console.log(
                  "calculating jobskill: " +
                    element.data().skill +
                    " user_exp: " +
                    user_exp +
                    " job_exp: " +
                    job_exp
                );

                if (user_exp <= job_exp) score = score + user_exp / job_exp;
                else score = score + 1;

                usedSkills.push(element.data().skill);
              } else {
                console.log(
                  "skill: " + element.data().skill + " did not match"
                );
              }
            } else if (element.data().preference === "Preferred") {
              max_score = max_score + 0.5;
              if (skills.find((e) => e.skill === element.data().skill)) {
                console.log("skill: " + element.data().skill + " matched");
                myskill = skills.filter(
                  (e) => e.skill === element.data().skill
                );
                user_exp = myskill[0].expertise;
                job_exp = element.data().expertise;
                validMatch = "true";
                console.log(
                  "calculating jobskill: " +
                    element.data().skill +
                    " user_exp: " +
                    user_exp +
                    " job_exp: " +
                    job_exp
                );

                if (user_exp <= job_exp)
                  score = score + (user_exp * 0.5) / job_exp;
                else score = score + 0.5;

                usedSkills.push(element.data().skill);
              } else {
                console.log(
                  "skill: " + element.data().skill + " did not match"
                );
              }
            }
          });

          if (validMatch === "true") {
            for (var j = 0; j < skills.length; j++) {
              if (!usedSkills.includes(skills[j].skill))
                spare_skills = (skills[j].expertise * 0.015) / 5;
            }

            if (spare_skills > 0.1) score = score + 0.1;
            else score = score + spare_skills;
          }

          console.log("is match valid: " + validMatch);
          console.log("score of this match: " + score);
          console.log("max score of " + alljobs[i] + " is: " + max_score);

          if (score > 0) {
            const record_match = {
              jobid: thisjob,
              score: score,
              max_score: max_score,
            };
            matches.push(record_match);
            matches.sort((a, b) => b.score - a.score);
            matches.slice(0, 10);
          }
        });
    }
    console.log(matches);

    if (matches.length === 0) {
      setTimeElapsed("true");
    } else {
      getMatches();
    }
  };

  const getMatches = async () => {
    var temp_array = matches.map((o) => o.jobid);
    await db
      .collection("jobs")
      .get()
      .then((querySnapshot) => {
        querySnapshot.forEach((element) => {
          if (temp_array.includes(element.id)) {
            var data = element.data();
            data.jobid = element.id;
            data.score = getScore(data.jobid);
            tempinfo = tempinfo.concat(data);
          }
        });
      });

    tempinfo.sort((a, b) => b.score - a.score);
    setInfo(tempinfo);
  };

  const getScore = (jobid) => {
    for (var i = 0; i < matches.length; i++) {
      if (jobid === matches[i].jobid) {
        var final_score = (matches[i].score / matches[i].max_score) * 100;
        return final_score.toFixed(1);
      }
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
          score={data.score}
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
            <p>No match found...</p>
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
        <h2>Your Matches</h2>
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
      pathname: "/my-match",
      state: jobid,
      score: score,
    });
  };

  useEffect(() => {
    getSkills(jobid);
  }, []);

  return (
    <div onClick={() => routeChange(jobid, score)} className="job-container">
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
        {temp.slice(0, 4).map((data) => (
          <span>{data}</span>
        ))}
      </div>
    </div>
  );
};
