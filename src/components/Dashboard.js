import React, { useEffect, useState } from "react";
import { Card, Button, Alert, Image } from "react-bootstrap";
import { useAuth } from "../contexts/AuthContext";
import { Link, useHistory } from "react-router-dom";
import "firebase/firestore";
import firebase from "firebase/app";
import SeekerMatch from "./SeekerMatch";
import EmployerMatch from "./EmployerMatch";
import { FaPen } from "react-icons/fa";
import avatar from "../avatar.jpg";
import Loader from "react-spinners/RingLoader";

export default function Dashboard() {
  const [error, setError] = useState("");
  const { currentUser, logout } = useAuth();
  const history = useHistory();

  const uid = currentUser.uid;

  const [tempRole, setTempRole] = useState("");
  const [status, setStatus] = useState("");

  const [matchProcess, setMatchProcess] = useState();

  const [image, setImage] = useState();
  var storageRef = firebase.storage().ref();

  const handleImageChange = (e) => {
    if (e.target.files[0]) {
      setImage(e.target.files[0]);
    }

    const preview = document.getElementById("profile");
    const file = document.querySelector("input[type=file]").files[0];
    const reader = new FileReader();

    reader.addEventListener(
      "load",
      function () {
        // convert image file to base64 string
        preview.src = reader.result;
      },
      false
    );

    if (file) {
      reader.readAsDataURL(file);
    }

    //saving image
    var ref = storageRef.child(uid);

    ref.put(file).then((snapshot) => {
      console.log("Uploaded a blob or file!");
    });
  };

  async function handleLogout() {
    setError("");
    try {
      await logout();
      history.push("/login");
    } catch {
      setError("Failed to log out");
    }
  }

  useEffect(() => {
    getRole();
  }, []);

  const getRole = () => {
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

    var temp;

    const getFromFirebase = firebase.firestore().collection("users");
    getFromFirebase.onSnapshot((querySnapShot) => {
      const saveFirebaseTodos = [];
      querySnapShot.forEach((doc) => {
        saveFirebaseTodos.push(doc.data().role);
        temp = doc.data().role;
        const title = doc.data().uid;

        if (temp === "jobseeker" && uid === title) {
          setMatchProcess(<SeekerMatch />);
          setStatus(false);
          setTempRole("Job Seeker");
        } else if (temp === "jobemployer" && uid === title) {
          setMatchProcess(<EmployerMatch />);
          setStatus(true);
          setTempRole("Employer");
        }
      });
    });
  };

  return (
    <>
      <Card>
        <Card.Body>
          <h2 className="text-center mb-4">Profile</h2>
          <center>
            <div class="image-upload">
              <Image
                style={{ maxHeight: 175, maxWidth: 225 }}
                value={image}
                id="profile"
                thumbnail
              />

              <label style={{ bottomMargin: 0 }} for="myfile">
                <FaPen />{" "}
              </label>
              <input
                type="file"
                onChange={handleImageChange}
                id="myfile"
                accept=".jpg,.jpeg,.png"
                style={{ display: "none" }}
              ></input>
            </div>
          </center>
          {error && <Alert variant="danger">{error}</Alert>}
          <strong>Email:</strong> {currentUser.email}
          <br></br>
          <strong>User Role:</strong> {tempRole}
          <Link to="/update-password" className="btn btn-primary w-100 mt-3">
            Change Password
          </Link>
          <Link
            to="/add-skills"
            className="btn btn-primary w-100 mt-3"
            style={{ display: status ? "none" : "block" }}
          >
            Update Keywords
          </Link>
          <Link to="/update-profile" className="btn btn-primary w-100 mt-3">
            Update Profile
          </Link>
          <Link
            to="/add-job"
            className="btn btn-primary w-100 mt-3"
            style={{ display: status ? "block" : "none" }}
          >
            Add Job
          </Link>
          {matchProcess}
          <div className="w-100 text-center mt-2">
            <Button variant="link" onClick={handleLogout}>
              Log Out
            </Button>
          </div>
        </Card.Body>
      </Card>
    </>
  );
}
