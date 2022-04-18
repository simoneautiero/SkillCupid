import React, { useEffect, useState } from "react";
import { Button, Card, Modal, Container, Row, Col } from "react-bootstrap";
import { Link, useHistory } from "react-router-dom";
import "firebase/firestore";
import firebase from "firebase/app";
import Loader from "react-spinners/PulseLoader";
import { CircularProgressbar } from "react-circular-progressbar";
import "react-circular-progressbar/dist/styles.css";

export default function MyJob(props) {
  const db = firebase.firestore();
  const [info, setInfo] = useState([]);
  const [candidates, setCandidates] = useState([]);

  const history = useHistory();

  const [show, setShow] = useState(false);

  const handleClose = () => setShow(false);
  const handleShow = () => setShow(true);

  const [timeElapsed, setTimeElapsed] = useState("false");

  var myjob_skills = [];
  var users_id = [];
  var matches = [];

  var score = 0;
  var maxscore = 0.1;

  var jobid = props.location.state;

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
      .collection("jobs_skills")
      .where("jobid", "==", jobid)
      .get()
      .then((querySnapshot) => {
        querySnapshot.forEach((element) => {
          var data = element.data();
          myjob_skills.push(data);

          if (data.preference === "Required") maxscore = maxscore + 1;
          else maxscore = maxscore + 0.5;
        });
      });

    console.log(myjob_skills);
    console.log("max score: " + maxscore);

    await db
      .collection("users")
      .get()
      .then((querySnapshot) => {
        querySnapshot.forEach((element) => {
          var user = element.data();
          users_id.push(user);
        });
      });

    for (var i = 0; i < users_id.length; i++) {
      score = 0;
      var spare_skills = 0;

      await db
        .collection("users_skills")
        .where("uid", "==", users_id[i].uid)
        .get()
        .then((querySnapshot) => {
          querySnapshot.forEach((element) => {
            if (
              myjob_skills.filter((e) => e.skill === element.data().skill)
                .length > 0
            ) {
              var skill_temp = myjob_skills.filter(
                (e) => e.skill === element.data().skill
              );
              var preference_temp = skill_temp[0].preference;
              var expertise_temp = skill_temp[0].expertise;

              var expertise_user = element.data().expertise;

              if (preference_temp === "Required") {
                var temp = expertise_user / expertise_temp;
                if (temp > 1) {
                  score = score + 1;
                } else {
                  score = score + temp;
                }
              } else if (preference_temp === "Preferred") {
                temp = (expertise_user * 0.5) / expertise_temp;

                if (temp > 0.5) {
                  score = score + 0.5;
                } else {
                  score = score + temp;
                }
              }
            } else {
              spare_skills = (element.data().expertise * 0.015) / 5;
            }
          });
        });

      if (spare_skills > 0.1) score = score + 0.1;
      else score = score + spare_skills;

      if (score > 0) {
        score = (score / maxscore) * 100;
        score = score.toFixed(1);

        var user_temp = { ...users_id[i], score: score };

        matches.push(user_temp);
        matches.sort((a, b) => b.score - a.score);
        matches.slice(0, 10);
      }

      console.log("user: " + users_id[i].uid + " has this score: " + score);
    }

    if (matches.length === 0) {
      setTimeElapsed("true");
    } else {
      setCandidates(matches);
    }
  };

  const checkMatches = () => {
    if (candidates.length > 0) {
      return candidates.map((matches) => (
        <Candidate
          seeker_id={matches.uid}
          score={matches.score}
          fullname={matches.fullname}
          jobid={jobid}
          currentjob={matches.currentjob}
          location={matches.location}
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
            <p>No match found... check later!</p>
          </center>
        );
      }
    }
  };

  const updateSkills = () => {
    history.push({
      pathname: "/update-skill-job",
      state: jobid,
    });
  };

  const updateJob = () => {
    history.push({
      pathname: "/update-job",
      state: jobid,
    });
  };

  const deleteJob = async (jobid) => {
    await db
      .collection("jobs")
      .where(firebase.firestore.FieldPath.documentId(), "==", jobid)
      .get()
      .then((querySnapshot) => {
        querySnapshot.docs[0].ref.delete();
      });

    alert("Job successfully deleted");
    history.push("/");
  };

  useEffect(() => {
    fetchData();
  }, []);

  return (
    <>
      <Card>
        <Card.Body>
          <center>
            <h2>Your Job</h2>
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
          <center>
            <Container>
              <Row>
                <Col>
                  {" "}
                  <Button onClick={() => updateSkills(jobid)}>
                    Update Skills
                  </Button>
                </Col>
                <Col>
                  {" "}
                  <Button onClick={() => updateJob(jobid)}>Update Job</Button>
                </Col>
                <Col>
                  {" "}
                  <Button variant="danger" onClick={handleShow}>
                    Delete Job
                  </Button>
                </Col>
              </Row>
            </Container>
          </center>

          <Modal show={show} onHide={handleClose}>
            <Modal.Header closeButton>
              <Modal.Title>Alert</Modal.Title>
            </Modal.Header>
            <Modal.Body>Are you sure you want to delete this job?</Modal.Body>
            <Modal.Footer>
              <Button variant="secondary" onClick={handleClose}>
                No
              </Button>
              <Button variant="primary" onClick={() => deleteJob(jobid)}>
                Yes
              </Button>
            </Modal.Footer>
          </Modal>

          <br></br>
          <center>
            <h2>Your Candidates</h2>
          </center>

          {checkMatches()}

          <div className="w-100 text-center mt-2">
            <Link to="/">Back</Link>
          </div>
        </Card.Body>
      </Card>
    </>
  );
}

const Frame = ({ cname, jobid, title, roletype, mode, location }) => {
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

  useEffect(() => {
    getSkills(jobid);
  }, []);

  return (
    <div className="job-container">
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

const Candidate = ({
  currentjob,
  fullname,
  location,
  jobid,
  seeker_id,
  score,
}) => {
  var history = useHistory();

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
        <CircularProgressbar value={score} text={`${score}%`} />
      </div>

      <div className="part1">
        <div className="company">
          <span className="cname">Your Candidate</span>
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
