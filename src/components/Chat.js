import React, { useEffect, useState } from "react";
import { Button, Card, Form, Alert } from "react-bootstrap";
import { Link } from "react-router-dom";
import "firebase/firestore";
import firebase from "firebase/app";
import { auth } from "../firebase";

export default function Chat(props) {
  const db = firebase.firestore();
  const [message, setMessage] = useState();
  const [info, setInfo] = useState([]);
  const [error, setError] = useState("No message has been sent yet");

  const currentUser = auth.currentUser;
  const uid = currentUser.uid;

  var jobid = props.location.jobid;
  var seeker_id = props.location.seeker_id;
  var chatid = jobid + seeker_id;

  const sendMessage = async () => {
    setMessage(message);

    if (message) {
      await db.collection("messages").doc("messages").collection(chatid).add({
        uid: uid,
        message: message,
        created: firebase.firestore.FieldValue.serverTimestamp(),
      });

      setMessage("");
    } else {
      alert("Please type a message!");
    }
  };

  const getMessages = async () => {
    setInfo([]);

    await db
      .collection("messages")
      .doc("messages")
      .collection(chatid)
      .orderBy("created", "asc")
      .get()
      .then((querySnapshot) => {
        querySnapshot.forEach((element) => {
          if (!querySnapshot.metadata.hasPendingWrites) {
            var data = element.data();
            setInfo((arr) => [...arr, data]);
          }
        });
      });

    var scrollChat = document.getElementById("mychat");
    scrollChat.scrollTop = scrollChat.scrollHeight;
  };

  const getTimestamp = (timestamp) => {
    timestamp = timestamp.toDate();
    var hours = timestamp.getHours().toString();
    var mins = timestamp.getMinutes().toString();
    var formattedTime = hours + ":" + mins;
    return formattedTime;
  };

  const checkNewMessages = () => {
    const doc = db.collection("messages").doc("messages").collection(chatid);

    const observer = doc.onSnapshot(
      (docSnapshot) => {
        getMessages();
      },
      (err) => {
        console.log(`Encountered error: ${err}`);
      }
    );
  };

  useEffect(() => {
    checkNewMessages();
  }, []);

  return (
    <>
      <Card>
        <Card.Body>
          <center>
            <h2>Your Chat</h2>
          </center>

          {info.length === 0 ? <Alert variant="warning">{error}</Alert> : false}
          <Card>
            <div id="mychat" class="mychat">
              {info.map((data) => (
                <p>
                  {data.uid === uid ? (
                    <div class="message-orange">
                      <p class="message-content">{data.message}</p>
                      <div class="message-timestamp-right">
                        {getTimestamp(data.created)}
                      </div>
                    </div>
                  ) : (
                    <div class="message-blue">
                      <p class="message-content">{data.message}</p>
                      <div class="message-timestamp-left">
                        {getTimestamp(data.created)}
                      </div>
                    </div>
                  )}
                </p>
              ))}
            </div>
          </Card>

          <Form>
            <Form.Group id="message">
              <Form.Control
                type="string"
                value={message}
                placeholder="Your message..."
                onChange={(e) => setMessage(e.target.value)}
              />
            </Form.Group>

            <Button className="w-100" onClick={() => sendMessage()}>
              Send
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
