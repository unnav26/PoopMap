import React, { useState, useEffect, useCallback } from "react";
import { GoogleMap, LoadScript, Marker } from "@react-google-maps/api";
import { addDoc, collection, getDocs, doc, setDoc } from "firebase/firestore";
import { db } from "./firebase";
import Login from "./Login";

const containerStyle = {
  width: "100vw",
  height: "100vh",
};

const center = {
  lat: 1.3521,
  lng: 103.8198,
};

const App = () => {
  const [poopLocations, setPoopLocations] = useState([]);
  const [user, setUser] = useState(null);
  const [friendEmail, setFriendEmail] = useState("");
  const [friends, setFriends] = useState([]);

  const fetchPoopLocations = useCallback(async () => {
    const querySnapshot = await getDocs(collection(db, "poop_locations"));
    const allLocations = querySnapshot.docs.map((doc) => doc.data());
    const filteredLocations = allLocations.filter(
      (loc) => loc.userEmail === user?.email || friends.includes(loc.userEmail)
    );
    setPoopLocations(filteredLocations);
  }, [user, friends]);

  const logPoopLocation = async (lat, lng) => {
    if (!user) {
      alert("Please log in to drop a poop!");
      return;
    }
    try {
      await addDoc(collection(db, "poop_locations"), {
        latitude: lat,
        longitude: lng,
        timestamp: new Date(),
        userEmail: user.email,
        userName: user.email[0].toUpperCase(),
      });
      alert("Poop logged successfully! 💩");
      fetchPoopLocations();
    } catch (e) {
      console.error("Error adding document: ", e);
    }
  };

  const addFriend = async () => {
    if (!friendEmail) return;
    try {
      const userDoc = doc(db, "users", user.uid);
      await setDoc(userDoc, { friends: [...friends, friendEmail] }, { merge: true });
      setFriends([...friends, friendEmail]);
      setFriendEmail("");
      fetchPoopLocations();
    } catch (e) {
      console.error("Error adding friend: ", e);
    }
  };

  useEffect(() => {
    if (user) {
      const fetchFriends = async () => {
        const userDoc = await getDocs(collection(db, "users"));
        const userData = userDoc.docs.find((doc) => doc.id === user.uid)?.data();
        setFriends(userData?.friends || []);
      };
      fetchFriends();
      fetchPoopLocations();
    }
  }, [user, fetchPoopLocations]);

  return (
    <LoadScript googleMapsApiKey={process.env.REACT_APP_GOOGLE_MAPS_API_KEY}>
      {!user && <Login setUser={setUser} />}
      {user && (
        <div style={{ position: "absolute", top: 10, left: 10, background: "white", padding: 10, zIndex: 1000 }}>
          <p>Logged in as: {user.email}</p>
          <input
            type="email"
            placeholder="Add friend’s email"
            value={friendEmail}
            onChange={(e) => setFriendEmail(e.target.value)}
          />
          <button onClick={addFriend}>Add Friend</button>
          <p>Friends: {friends.join(", ")}</p>
        </div>
      )}
      <GoogleMap
        mapContainerStyle={containerStyle}
        center={center}
        zoom={15}
        onClick={(e) => {
          const lat = e.latLng.lat();
          const lng = e.latLng.lng();
          logPoopLocation(lat, lng);
        }}
      >
        {poopLocations.map((location, index) => (
          <Marker
            key={index}
            position={{ lat: location.latitude, lng: location.longitude }}
            icon={{
              url: "https://upload.wikimedia.org/wikipedia/commons/c/c6/Twemoji_1f4a9.svg",
              scaledSize: new window.google.maps.Size(32, 32),
              labelOrigin: new window.google.maps.Point(16, -10),
            }}
            label={{
              text: location.userName,
              color: "black",
              fontSize: "16px",
              fontWeight: "bold",
            }}
          />
        ))}
      </GoogleMap>
    </LoadScript>
  );
};

export default App;