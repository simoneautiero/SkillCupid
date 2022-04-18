import React, { useRef, useEffect } from "react";
import { Form, Button, Card } from "react-bootstrap";
import { Link, useHistory } from "react-router-dom";
import "firebase/firestore";
import firebase from "firebase/app";
import { auth } from "../firebase";

export default function UpdateProfile() {
  const currentJob = useRef();
  const location = useRef();
  const phoneNum = useRef();
  const dateOfBirth = useRef();
  const fullName = useRef();

  const currentUser = auth.currentUser;
  const myuid = currentUser.uid;
  const db = firebase.firestore();

  const history = useHistory();

  async function handleSubmit(e) {
    e.preventDefault();

    var id;

    var phoneno = /^(?:0|\+?44)(?:\d\s?){9,10}$/;
    if (!phoneNum.current.value.match(phoneno))
      return alert("Phone Number not valid");

    var tempDob = dateOfBirth.current.value;
    var birthDay = +new Date(tempDob);
    var age = ~~((Date.now() - birthDay) / 31557600000);

    if (age < 18) return alert("You must be over 18 to use this app");

    await db
      .collection("users")
      .where("uid", "==", myuid)
      .get()
      .then((docs) => {
        docs.forEach((doc) => {
          id = doc.id;
        });
      })
      .catch((err) => console.log(err));

    await db.collection("users").doc(id).update({
      currentjob: currentJob.current.value,
      location: location.current.value,
      phonenum: phoneNum.current.value,
      dateofbirth: dateOfBirth.current.value,
      fullname: fullName.current.value,
    });

    alert("Profile successfully updated!");
    history.push("/");
  }

  async function initializeForm() {
    var data;

    await db
      .collection("users")
      .where("uid", "==", myuid)
      .get()
      .then((docs) => {
        docs.forEach((doc) => {
          data = doc.data();
        });
      })
      .catch((err) => console.log(err));

    currentJob.current.value = data.currentjob;
    location.current.value = data.location;
    phoneNum.current.value = data.phonenum;
    dateOfBirth.current.value = data.dateofbirth;
    fullName.current.value = data.fullname;
  }

  useEffect(() => {
    initializeForm();
  }, []);

  return (
    <>
      <Card>
        <Card.Body>
          <h2 className="text-center mb-5">Update Profile</h2>
          <Form onSubmit={handleSubmit}>
            <Form.Group id="currentjob">
              <Form.Label>Full Name</Form.Label>
              <Form.Control type="text" ref={fullName} />
            </Form.Group>

            <Form.Group id="currentjob">
              <Form.Label>Current Occupation</Form.Label>
              <Form.Control type="text" ref={currentJob} />
            </Form.Group>

            <Form.Group id="location">
              <Form.Label>Location</Form.Label>
              <Form.Control type="text" ref={location} />
            </Form.Group>

            <Form.Group id="phonenum">
              <Form.Label>Phone Number</Form.Label>
              <Form.Control type="number" ref={phoneNum} />
            </Form.Group>

            <Form.Group id="dateofbirth">
              <Form.Label>Date of Birth</Form.Label>
              <Form.Control type="date" ref={dateOfBirth} />
            </Form.Group>

            <Button className="w-100" type="submit">
              Update
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
