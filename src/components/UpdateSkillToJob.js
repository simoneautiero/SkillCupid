import { useEffect, useRef, useState } from "react";
import React from "react";
import { FaStar, FaProductHunt } from "react-icons/fa";
import { AiFillTrademarkCircle } from "react-icons/ai";
import { Button, Card } from "react-bootstrap";
import Form from "react-bootstrap/Form";
import { Link, useHistory } from "react-router-dom";
import "firebase/auth";
import "firebase/firestore";
import firebase from "firebase/app";

const colors = {
  orange: "#FFBA5A",
  grey: "#a9a9a9",
};

export default function UpdateSkillToJob(props) {
  const [currentValue, setCurrentValue] = useState(0);
  const [hoverValue, setHoverValue] = useState(undefined);
  const stars = Array(5).fill(0);
  const skill = useRef();
  const [info, setInfo] = useState([]);
  const db = firebase.firestore();
  const jobid = props.location.state;
  const [type, setType] = useState("Required");

  const history = useHistory();

  const saveSkill = async () => {
    var myskill = skill.current.value.toUpperCase().trim();

    if (!info.find((e) => e.skill === myskill)) {
      if (currentValue > 0 && myskill !== "") {
        await db.collection("jobs_skills").add({
          skill: myskill,
          expertise: currentValue,
          preference: type,
          jobid: jobid,
        });
        fetchSkills();
        skill.current.value = "";
        setCurrentValue(0);
      } else {
        //alert no expertise input
        alert("Your skill and expertise cannot be empty");
        skill.current.value = "";
        setCurrentValue(0);
      }
    } else {
      //alert skill already in use
      alert("Keyword already in use");
      skill.current.value = "";
      setCurrentValue(0);
    }
  };

  const fetchSkills = async () => {
    setInfo([]);
    await db
      .collection("jobs_skills")
      .where("jobid", "==", jobid)
      .get()
      .then((querySnapshot) => {
        querySnapshot.forEach((element) => {
          var data = element.data();
          setInfo((arr) => [...arr, data]);
        });
      });
  };

  const handleClick = (value) => {
    setCurrentValue(value);
  };

  const handleMouseOver = (newHoverValue) => {
    setHoverValue(newHoverValue);
  };

  const handleMouseLeave = () => {
    setHoverValue(undefined);
  };

  const removeKeyword = async (skill) => {
    var docid = firebase.firestore.FieldPath.documentId();
    console.log("my doc id: " + docid);
    await db
      .collection("jobs_skills")
      .where("jobid", "==", jobid)
      .where("skill", "==", skill)
      .get()
      .then((querySnapshot) => {
        querySnapshot.forEach(function (doc) {
          doc.ref.delete();
        });
      });
    setInfo([]);
    fetchSkills();
    console.log(skill + "deleted");
  };

  useEffect(() => {
    fetchSkills();
  }, []);

  return (
    <>
      <Card>
        <Card.Body>
          <div style={styles.container}>
            <h2> Update Skills </h2>

            <br></br>
            <br></br>

            <div style={styles.stars}>
              <h4>Expertise: </h4>
              {stars.map((_, index) => {
                return (
                  <FaStar
                    key={index}
                    size={24}
                    onClick={() => handleClick(index + 1)}
                    onMouseOver={() => handleMouseOver(index + 1)}
                    onMouseLeave={handleMouseLeave}
                    color={
                      (hoverValue || currentValue) > index
                        ? colors.orange
                        : colors.grey
                    }
                    style={{
                      marginRight: 10,
                      cursor: "pointer",
                    }}
                  />
                );
              })}
            </div>
            <textarea //to be replaced with Form Control
              type="text"
              ref={skill}
              placeholder="Insert your skill"
              style={styles.textarea}
            />

            <Form.Group controlId="formBasicSelect">
              <Form.Control
                as="select"
                value={type}
                style={styles.select}
                onChange={(e) => {
                  console.log("e.target.value", e.target.value);
                  setType(e.target.value);
                }}
              >
                <option value="Required">Required</option>
                <option value="Preferred">Preferred</option>
              </Form.Control>
            </Form.Group>

            <Button style={styles.button} onClick={() => saveSkill()}>
              Add
            </Button>

            <h4>My Skills</h4>
            {info.map((data) => (
              <div>
                <p>
                  <Button
                    variant="danger"
                    size="sm"
                    onClick={() => removeKeyword(data.skill)}
                  >
                    x
                  </Button>{" "}
                  {data.skill}
                  {stars.map((_, index) => {
                    return (
                      <FaStar
                        key={index}
                        size={20}
                        color={
                          data.expertise > index ? colors.orange : colors.grey
                        }
                        style={{
                          marginRight: 10,
                          cursor: "pointer",
                        }}
                      />
                    );
                  })}
                  {data.preference === "Required" ? (
                    <AiFillTrademarkCircle />
                  ) : (
                    <FaProductHunt />
                  )}
                </p>
              </div>
            ))}
          </div>

          <div className="w-100 text-center mt-2">
            <Link
              onClick={() =>
                history.push({
                  pathname: "/",
                })
              }
            >
              Back
            </Link>
          </div>
        </Card.Body>
      </Card>
    </>
  );
}

const styles = {
  container: {
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
  },
  stars: {
    display: "flex",
    flexDirection: "row",
  },
  textarea: {
    border: "1px solid #a9a9a9",
    borderRadius: 5,
    padding: 10,
    margin: "20px 0",
    minHeight: 100,
    width: 300,
  },
  select: {
    border: "1px solid #a9a9a9",
    borderRadius: 5,
    padding: 10,
    margin: "20px",
    width: 300,
  },
  button: {
    border: "1px solid #a9a9a9",
    borderRadius: 5,
    width: 300,
    padding: 10,
  },
};
